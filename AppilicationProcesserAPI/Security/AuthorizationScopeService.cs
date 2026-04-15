using Microsoft.Data.SqlClient;
using System.Security.Claims;

namespace AppilicationProcesserAPI.Security
{
    public interface IAuthorizationScopeService
    {
        Guid? GetCurrentUserId(ClaimsPrincipal user);
        Task<bool> CanAccessUserAsync(ClaimsPrincipal user, Guid targetUserId, CancellationToken cancellationToken);
        Task<bool> CanAccessApplicationAsync(ClaimsPrincipal user, Guid applicationId, CancellationToken cancellationToken);
        Task<bool> CanAccessLatestApplicationStatesAsync(ClaimsPrincipal user, IEnumerable<Guid> applicationIds, CancellationToken cancellationToken);
        Task<bool> CanAccessApplicationsForUserAsync(ClaimsPrincipal user, Guid targetUserId, CancellationToken cancellationToken);
        Task<bool> CanAccessApplicationsForDepartmentAsync(ClaimsPrincipal user, Guid departmentId, CancellationToken cancellationToken);
        Task<bool> CanAccessApplicationsForClubAsync(ClaimsPrincipal user, Guid clubId, CancellationToken cancellationToken);
        Task<bool> CanManageClubAsync(ClaimsPrincipal user, Guid clubId, CancellationToken cancellationToken);
        Task<bool> CanManageDepartmentAsync(ClaimsPrincipal user, Guid departmentId, CancellationToken cancellationToken);
        Task<bool> CanManageInterviewSlotAsync(ClaimsPrincipal user, Guid slotId, CancellationToken cancellationToken);
        Task<bool> CanCreateDepartmentAsync(ClaimsPrincipal user, Guid clubId, CancellationToken cancellationToken);
        Task<bool> CanCreateInterviewSlotAsync(ClaimsPrincipal user, Guid clubId, CancellationToken cancellationToken);
        Task<bool> CanSubmitApplicationAsync(ClaimsPrincipal user, Guid departmentId, CancellationToken cancellationToken);
        Task<bool> CanBookInterviewSlotAsync(ClaimsPrincipal user, Guid applicationId, CancellationToken cancellationToken);
        Task<bool> CanReviewApplicationAsync(ClaimsPrincipal user, Guid applicationId, CancellationToken cancellationToken);
        Task<bool> CanConcludeApplicationAsync(ClaimsPrincipal user, Guid applicationId, CancellationToken cancellationToken);
        bool IsSystemAdmin(ClaimsPrincipal user);
    }

    internal sealed class AuthorizationScopeService : IAuthorizationScopeService
    {
        private readonly string _connectionString;

        public AuthorizationScopeService(ServiceConfiguration configuration)
        {
            _connectionString = configuration.SQLConnectionString;
        }

        public Guid? GetCurrentUserId(ClaimsPrincipal user)
        {
            var raw = user.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(raw, out var userId) ? userId : null;
        }

        public bool IsSystemAdmin(ClaimsPrincipal user) => HasRole(user, Roles.SystemAdmin, Roles.AdminAlias);

        public async Task<bool> CanAccessUserAsync(ClaimsPrincipal user, Guid targetUserId, CancellationToken cancellationToken)
        {
            var currentUserId = GetCurrentUserId(user);
            if (!currentUserId.HasValue)
            {
                return false;
            }

            if (IsSystemAdmin(user) || currentUserId.Value == targetUserId)
            {
                return true;
            }

            var clubId = GetEffectiveClubId(user);
            if (!clubId.HasValue || !(IsClubAdmin(user) || HasRole(user, Roles.BoardMember)))
            {
                return false;
            }

            return await UserHasApplicationInClubAsync(targetUserId, clubId.Value, cancellationToken).ConfigureAwait(false);
        }

        public async Task<bool> CanAccessApplicationAsync(ClaimsPrincipal user, Guid applicationId, CancellationToken cancellationToken)
        {
            var scope = await GetApplicationScopeAsync(applicationId, cancellationToken).ConfigureAwait(false);
            if (scope is null)
            {
                return false;
            }

            return CanAccessApplicationScope(user, scope);
        }

        public async Task<bool> CanAccessLatestApplicationStatesAsync(ClaimsPrincipal user, IEnumerable<Guid> applicationIds, CancellationToken cancellationToken)
        {
            foreach (var applicationId in applicationIds.Distinct())
            {
                if (!await CanAccessApplicationAsync(user, applicationId, cancellationToken).ConfigureAwait(false))
                {
                    return false;
                }
            }

            return true;
        }

        public async Task<bool> CanAccessApplicationsForUserAsync(ClaimsPrincipal user, Guid targetUserId, CancellationToken cancellationToken)
        {
            var currentUserId = GetCurrentUserId(user);
            if (!currentUserId.HasValue)
            {
                return false;
            }

            if (IsSystemAdmin(user))
            {
                return true;
            }

            return currentUserId.Value == targetUserId;
        }

        public async Task<bool> CanAccessApplicationsForDepartmentAsync(ClaimsPrincipal user, Guid departmentId, CancellationToken cancellationToken)
        {
            var clubId = await GetDepartmentClubIdAsync(departmentId, cancellationToken).ConfigureAwait(false);
            if (!clubId.HasValue)
            {
                return false;
            }

            if (IsSystemAdmin(user))
            {
                return true;
            }

            return HasRole(user, Roles.ClubAdmin, Roles.BoardMember) && GetEffectiveClubId(user) == clubId.Value;
        }

        public Task<bool> CanAccessApplicationsForClubAsync(ClaimsPrincipal user, Guid clubId, CancellationToken cancellationToken)
        {
            if (IsSystemAdmin(user))
            {
                return Task.FromResult(true);
            }

            var allowed = (IsClubAdmin(user) || HasRole(user, Roles.BoardMember)) && GetEffectiveClubId(user) == clubId;
            return Task.FromResult(allowed);
        }

        public Task<bool> CanManageClubAsync(ClaimsPrincipal user, Guid clubId, CancellationToken cancellationToken)
        {
            if (IsSystemAdmin(user))
            {
                return Task.FromResult(true);
            }

            var allowed = IsClubAdmin(user) && GetAdminClubId(user) == clubId;
            return Task.FromResult(allowed);
        }

        public async Task<bool> CanManageDepartmentAsync(ClaimsPrincipal user, Guid departmentId, CancellationToken cancellationToken)
        {
            var clubId = await GetDepartmentClubIdAsync(departmentId, cancellationToken).ConfigureAwait(false);
            if (!clubId.HasValue)
            {
                return false;
            }

            return await CanManageClubAsync(user, clubId.Value, cancellationToken).ConfigureAwait(false);
        }

        public async Task<bool> CanManageInterviewSlotAsync(ClaimsPrincipal user, Guid slotId, CancellationToken cancellationToken)
        {
            var clubId = await GetInterviewSlotClubIdAsync(slotId, cancellationToken).ConfigureAwait(false);
            if (!clubId.HasValue)
            {
                return false;
            }

            return await CanManageClubAsync(user, clubId.Value, cancellationToken).ConfigureAwait(false);
        }

        public Task<bool> CanCreateDepartmentAsync(ClaimsPrincipal user, Guid clubId, CancellationToken cancellationToken) =>
            CanManageClubAsync(user, clubId, cancellationToken);

        public Task<bool> CanCreateInterviewSlotAsync(ClaimsPrincipal user, Guid clubId, CancellationToken cancellationToken) =>
            CanManageClubAsync(user, clubId, cancellationToken);

        public async Task<bool> CanSubmitApplicationAsync(ClaimsPrincipal user, Guid departmentId, CancellationToken cancellationToken)
        {
            var currentUserId = GetCurrentUserId(user);
            if (!currentUserId.HasValue)
            {
                return false;
            }

            var clubId = await GetDepartmentClubIdAsync(departmentId, cancellationToken).ConfigureAwait(false);
            return clubId.HasValue;
        }

        public async Task<bool> CanBookInterviewSlotAsync(ClaimsPrincipal user, Guid applicationId, CancellationToken cancellationToken)
        {
            var scope = await GetApplicationScopeAsync(applicationId, cancellationToken).ConfigureAwait(false);
            if (scope is null)
            {
                return false;
            }

            var currentUserId = GetCurrentUserId(user);
            if (!currentUserId.HasValue)
            {
                return false;
            }

            if (IsSystemAdmin(user))
            {
                return true;
            }

            return scope.UserId == currentUserId.Value;
        }

        public async Task<bool> CanReviewApplicationAsync(ClaimsPrincipal user, Guid applicationId, CancellationToken cancellationToken)
        {
            var scope = await GetApplicationScopeAsync(applicationId, cancellationToken).ConfigureAwait(false);
            if (scope is null)
            {
                return false;
            }

            if (IsSystemAdmin(user))
            {
                return true;
            }

            if (IsClubAdmin(user) && GetAdminClubId(user) == scope.ClubId)
            {
                return true;
            }

            return HasRole(user, Roles.BoardMember) && GetEffectiveClubId(user) == scope.ClubId;
        }

        public async Task<bool> CanConcludeApplicationAsync(ClaimsPrincipal user, Guid applicationId, CancellationToken cancellationToken)
        {
            var scope = await GetApplicationScopeAsync(applicationId, cancellationToken).ConfigureAwait(false);
            if (scope is null)
            {
                return false;
            }

            if (IsSystemAdmin(user))
            {
                return true;
            }

            return IsClubAdmin(user) && GetAdminClubId(user) == scope.ClubId;
        }

        private bool CanAccessApplicationScope(ClaimsPrincipal user, ApplicationScope scope)
        {
            var currentUserId = GetCurrentUserId(user);
            if (!currentUserId.HasValue)
            {
                return false;
            }

            if (IsSystemAdmin(user))
            {
                return true;
            }

            if (scope.UserId == currentUserId.Value)
            {
                return true;
            }

            if (IsClubAdmin(user) && GetAdminClubId(user) == scope.ClubId)
            {
                return true;
            }

            return HasRole(user, Roles.BoardMember) && GetEffectiveClubId(user) == scope.ClubId;
        }

        private static bool HasRole(ClaimsPrincipal user, params string[] roles)
        {
            return roles.Any(role => user.IsInRole(role));
        }

        private Guid? GetAdminClubId(ClaimsPrincipal user)
        {
            var raw = user.FindFirstValue(CustomClaimNames.AdminClubId);
            return Guid.TryParse(raw, out var clubId) ? clubId : null;
        }

        private Guid? GetClubId(ClaimsPrincipal user)
        {
            var raw = user.FindFirstValue(CustomClaimNames.ClubId);
            return Guid.TryParse(raw, out var clubId) ? clubId : null;
        }

        private Guid? GetEffectiveClubId(ClaimsPrincipal user)
        {
            return GetAdminClubId(user) ?? GetClubId(user);
        }

        private bool IsClubAdmin(ClaimsPrincipal user)
        {
            return HasRole(user, Roles.ClubAdmin) || GetAdminClubId(user).HasValue;
        }

        private async Task<bool> UserHasApplicationInClubAsync(Guid userId, Guid clubId, CancellationToken cancellationToken)
        {
            const string sql = """
                SELECT TOP 1 1
                FROM [Applications] AS appl
                INNER JOIN [Departments] AS dept ON dept.[DepartmentId] = appl.[DepartmentId]
                WHERE appl.[UserId] = @userId AND dept.[ClubId] = @clubId
                """;

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@userId", userId);
            command.Parameters.AddWithValue("@clubId", clubId);

            var result = await command.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
            return result is not null;
        }

        private async Task<Guid?> GetDepartmentClubIdAsync(Guid departmentId, CancellationToken cancellationToken)
        {
            const string sql = "SELECT TOP 1 [ClubId] FROM [Departments] WHERE [DepartmentId] = @departmentId";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@departmentId", departmentId);

            var result = await command.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
            return result is Guid clubId ? clubId : null;
        }

        private async Task<Guid?> GetInterviewSlotClubIdAsync(Guid slotId, CancellationToken cancellationToken)
        {
            const string sql = "SELECT TOP 1 [ClubId] FROM [InterviewSlots] WHERE [SlotId] = @slotId";

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@slotId", slotId);

            var result = await command.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
            return result is Guid clubId ? clubId : null;
        }

        private async Task<ApplicationScope?> GetApplicationScopeAsync(Guid applicationId, CancellationToken cancellationToken)
        {
            const string sql = """
                SELECT TOP 1 appl.[UserId], appl.[DepartmentId], dept.[ClubId]
                FROM [Applications] AS appl
                INNER JOIN [Departments] AS dept ON dept.[DepartmentId] = appl.[DepartmentId]
                WHERE appl.[AggregateId] = @applicationId
                """;

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@applicationId", applicationId);

            await using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
            if (!await reader.ReadAsync(cancellationToken).ConfigureAwait(false))
            {
                return null;
            }

            return new ApplicationScope(
                reader.GetGuid(0),
                reader.GetGuid(1),
                reader.GetGuid(2));
        }

        private sealed record ApplicationScope(Guid UserId, Guid DepartmentId, Guid ClubId);

        private static class Roles
        {
            public const string AdminAlias = "Admin";
            public const string SystemAdmin = "SystemAdmin";
            public const string ClubAdmin = "ClubAdmin";
            public const string BoardMember = "BoardMember";
        }
    }
}
