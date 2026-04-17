using System.Security.Claims;
using AppilicationProcesserAPI.Security;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

/// <summary>
/// Tests for AuthorizationScopeService methods that do NOT require a database connection.
/// DB-dependent methods (CanAccessUserAsync when not owner, CanReviewApplicationAsync, etc.)
/// are covered by integration tests.
/// </summary>
public class AuthorizationScopeServiceTests
{
    // AuthorizationScopeService uses internal constructor via ServiceConfiguration (DB connection string).
    // We test the public interface via a custom fake that mirrors the internal logic for non-DB paths.

    // ── FakeAuthorizationScopeService non-DB logic tests ────────────────────

    [Fact]
    public void FakeAuthService_GetCurrentUserId_ReturnsConfiguredId()
    {
        var expectedId = Guid.NewGuid();
        var fake = new TestDoubles.FakeAuthorizationScopeService
        {
            FakeCurrentUserId = expectedId
        };

        var result = fake.GetCurrentUserId(CreateUserPrincipal(expectedId, "User"));

        Assert.Equal(expectedId, result);
    }

    [Fact]
    public void FakeAuthService_IsSystemAdmin_ReflectsConfiguration()
    {
        var fake = new TestDoubles.FakeAuthorizationScopeService { FakeIsSystemAdmin = true };

        Assert.True(fake.IsSystemAdmin(CreateUserPrincipal(Guid.NewGuid(), "User")));
    }

    // ── ClaimsPrincipal helper tests for claim extraction ───────────────────

    [Fact]
    public void ClaimsPrincipal_NameIdentifier_ParsedCorrectly()
    {
        var userId = Guid.NewGuid();
        var principal = CreateUserPrincipal(userId, "User");

        var raw = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var parsed = Guid.Parse(raw!);

        Assert.Equal(userId, parsed);
    }

    [Fact]
    public void ClaimsPrincipal_Role_IsInRoleReturnsTrue()
    {
        var principal = CreateUserPrincipal(Guid.NewGuid(), "ClubAdmin");

        Assert.True(principal.IsInRole("ClubAdmin"));
        Assert.False(principal.IsInRole("SystemAdmin"));
    }

    [Fact]
    public void ClaimsPrincipal_SystemAdminRole_IsRecognized()
    {
        var principal = CreateUserPrincipal(Guid.NewGuid(), "SystemAdmin");

        Assert.True(principal.IsInRole("SystemAdmin"));
    }

    [Fact]
    public void ClaimsPrincipal_AdminAlias_IsRecognized()
    {
        var principal = CreateUserPrincipal(Guid.NewGuid(), "Admin");

        Assert.True(principal.IsInRole("Admin"));
    }

    // ── FakeAuthorizationScopeService AllowAll=false denies all ─────────────

    [Fact]
    public async Task FakeAuthService_AllowAllFalse_DeniesAllAsyncChecks()
    {
        var fake = new TestDoubles.FakeAuthorizationScopeService { AllowAll = false };
        var user = CreateUserPrincipal(Guid.NewGuid(), "User");
        var id = Guid.NewGuid();

        Assert.False(await fake.CanSubmitApplicationAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanReviewApplicationAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanConcludeApplicationAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanBookInterviewSlotAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanAccessUserAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanAccessApplicationsForUserAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanAccessApplicationsForClubAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanAccessApplicationsForDepartmentAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanManageClubAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanManageDepartmentAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanCreateDepartmentAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanCreateInterviewSlotAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanAssignBoardMemberAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanEditNoteAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanAccessNoteAsync(user, id, CancellationToken.None));
        Assert.False(await fake.CanAccessLatestApplicationStatesAsync(user, [id], CancellationToken.None));
    }

    [Fact]
    public async Task FakeAuthService_AllowAllTrue_AllowsAllAsyncChecks()
    {
        var fake = new TestDoubles.FakeAuthorizationScopeService { AllowAll = true };
        var user = CreateUserPrincipal(Guid.NewGuid(), "User");
        var id = Guid.NewGuid();

        Assert.True(await fake.CanSubmitApplicationAsync(user, id, CancellationToken.None));
        Assert.True(await fake.CanReviewApplicationAsync(user, id, CancellationToken.None));
        Assert.True(await fake.CanConcludeApplicationAsync(user, id, CancellationToken.None));
        Assert.True(await fake.CanManageClubAsync(user, id, CancellationToken.None));
        Assert.False(fake.IsSystemAdmin(user)); // AllowAll doesn't affect non-async sync methods
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static ClaimsPrincipal CreateUserPrincipal(Guid userId, string role, Guid? adminClubId = null)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role)
        };

        if (adminClubId.HasValue)
            claims.Add(new Claim(CustomClaimNames.AdminClubId, adminClubId.Value.ToString()));

        return new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
    }
}
