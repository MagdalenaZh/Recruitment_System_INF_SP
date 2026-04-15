using AppilicationProcesserAPI.MessageQueue;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace AppilicationProcesserAPI.PersistanceServices
{
    public interface ISystemManagementProvider
    {
        Task CreateClubAsync(string clubName, ClubCategories category, CancellationToken cancellationToken);
        Task CreateDepartmentAsync(Guid clubId, string departmentName, int numberOfOpenPositions, string description, CancellationToken cancellationToken);
        Task CreateInterviewSlot(Guid clubId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken cancellationToken);

        Task UpdateClubInformationAsync(Guid clubId, string clubName, List<string> applicationQuestions, int requiredApprovals, string description, ClubCategories category, CancellationToken cancellationToken);
        Task UpdateDepartmentInformationAsync(Guid departmentId, string departmentName, int numberOfOpenPositions, string description, CancellationToken cancellationToken);
        Task UpdateInterviewSlotAsync(Guid slotId, DateTimeOffset newStartTime, DateTimeOffset newEndTime, CancellationToken cancellationToken);

        Task UpdateUserRole(Guid userId, Guid roleId, CancellationToken cancellationToken);
        Task UpdateUserPromoteToClubAdminAsync(Guid userId, Guid clubId, CancellationToken cancellationToken);
    }

    public class SystemManagementProvider : ISystemManagementProvider
    {
        private const string UserRoleName = "User";
        private const string ClubAdminRoleName = "ClubAdmin";
        private static readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions()
        {
            PropertyNameCaseInsensitive = true,
        };

        private readonly string _connectionString;
        private readonly ILogger<SystemManagementProvider> _logger;

        public SystemManagementProvider(ServiceConfiguration configuration, ILogger<SystemManagementProvider> logger)
        {
            _connectionString = configuration.SQLConnectionString;
            _logger = logger;
        }

        public async Task CreateClubAsync(string clubName, ClubCategories category, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.InsertClub, sqlConnection);
            command.Parameters.AddWithValue("@clubId", Guid.NewGuid());
            command.Parameters.AddWithValue("@clubName", clubName);
            command.Parameters.AddWithValue("@category", category);

            try
            {
                await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Insert in Clubs table");
                throw new Exception("Event not registered");
            }
        }

        public async Task CreateDepartmentAsync(Guid clubId, string departmentName, int numberOfOpenPositions, string description, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.InsertDepartment, sqlConnection);
            command.Parameters.AddWithValue("@departmentId", Guid.NewGuid());
            command.Parameters.AddWithValue("@clubId", clubId);
            command.Parameters.AddWithValue("@departmentName", departmentName);
            command.Parameters.AddWithValue("@openPositions", numberOfOpenPositions);
            command.Parameters.AddWithValue("@description", description);

            try
            {
                await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Insert in Departments table");
                throw new Exception("Event not registered");
            }
        }

        public async Task CreateInterviewSlot(Guid clubId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.InsertInterviewSlot, sqlConnection);
            command.Parameters.AddWithValue("@slotId", Guid.NewGuid());
            command.Parameters.AddWithValue("@clubId", clubId);
            command.Parameters.AddWithValue("@startTime", startTime);
            command.Parameters.AddWithValue("@endTime", endTime);

            try
            {
                await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Insert in InterviewSlots table");
                throw new Exception("Event not registered");
            }
        }

        public async Task UpdateClubInformationAsync(Guid clubId, string clubName, List<string> applicationQuestions, int requiredApprovals, string description, ClubCategories category, CancellationToken cancellationToken)
        {
            var serializedData = JsonSerializer.Serialize(applicationQuestions, _serializerOptions);

            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.UpdateClubAdmissionQuestions, sqlConnection);
            command.Parameters.AddWithValue("@clubId", clubId);
            command.Parameters.AddWithValue("@clubName", clubName);
            command.Parameters.AddWithValue("@applicationQuestions", serializedData);
            command.Parameters.AddWithValue("@requiredApprovals", requiredApprovals);
            command.Parameters.AddWithValue("@description", description);
            command.Parameters.AddWithValue("@category", category);

            try
            {
               var rowsAffected = await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
                if (rowsAffected == 0) 
                {
                    throw new Exception("Update failed");
                }
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Update in Clubs table");
                throw new Exception("Event not registered");
            }
        }

        public async Task UpdateInterviewSlotAsync(Guid slotId, DateTimeOffset newStartTime, DateTimeOffset newEndTime, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.UpdateInterviewSlot, sqlConnection);
            command.Parameters.AddWithValue("@slotId", slotId);
            command.Parameters.AddWithValue("@startTime", newStartTime);
            command.Parameters.AddWithValue("@endTime", newEndTime);

            try
            {
                var rowsAffected = await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
                if (rowsAffected == 0)
                {
                    throw new Exception("Update failed");
                }
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Update in InterviewSlots table");
                throw new Exception("Event not registered");
            }
        }

        public async Task UpdateDepartmentInformationAsync(Guid departmentId, string departmentName, int numberOfOpenPositions, string description, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.UpdateDepartmentOpenPositions, sqlConnection);
            command.Parameters.AddWithValue("@departmentId", departmentId);
            command.Parameters.AddWithValue("@departmentName", departmentName);
            command.Parameters.AddWithValue("@openPositions", numberOfOpenPositions);
            command.Parameters.AddWithValue("@description", description);

            try
            {
                var rowsAffected = await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
                if (rowsAffected == 0)
                {
                    throw new Exception("Update failed");
                }
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Update in Department table");
                throw new Exception("Event not registered");
            }
        }

        public async Task UpdateUserRole(Guid userId, Guid roleId, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.UpdateUserRole, sqlConnection);
            command.Parameters.AddWithValue("@userId", userId);
            command.Parameters.AddWithValue("@roleId", roleId);

            try
            {
                var rowsAffected = await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
                if (rowsAffected == 0)
                {
                    throw new Exception("Update failed");
                }
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Update in Users table");
                throw new Exception("Event not registered");
            }
        }

        public async Task UpdateUserPromoteToClubAdminAsync(Guid userId, Guid clubId, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            var userRoleId = await GetRoleIdByNameAsync(sqlConnection, UserRoleName, cancellationToken).ConfigureAwait(false);
            var clubAdminRoleId = await GetRoleIdByNameAsync(sqlConnection, ClubAdminRoleName, cancellationToken).ConfigureAwait(false);

            using var demoteCommand = new SqlCommand(DbQueries.UpdateDemoteClubAdminToUser, sqlConnection);
            demoteCommand.Parameters.AddWithValue("@clubId", clubId);
            demoteCommand.Parameters.AddWithValue("@roleId", userRoleId);
            await demoteCommand.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.UpdatePromoteUserToClubAdmin, sqlConnection);
            command.Parameters.AddWithValue("@userId", userId);
            command.Parameters.AddWithValue("@clubId", clubId);
            command.Parameters.AddWithValue("@roleId", clubAdminRoleId);

            try
            {
                var rowsAffected = await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
                if (rowsAffected == 0)
                {
                    throw new Exception("Update failed");
                }
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Update in Users table");
                throw new Exception("Event not registered");
            }
        }

        private static async Task<Guid> GetRoleIdByNameAsync(SqlConnection sqlConnection, string roleName, CancellationToken cancellationToken)
        {
            using var command = new SqlCommand("SELECT TOP 1 [RoleId] FROM [Roles] WHERE [Name] = @roleName", sqlConnection);
            command.Parameters.AddWithValue("@roleName", roleName);

            var result = await command.ExecuteScalarAsync(cancellationToken).ConfigureAwait(false);
            if (result is Guid roleId)
            {
                return roleId;
            }

            throw new Exception($"Role '{roleName}' not found.");
        }
    }
}
