using System.Net;
using System.Net.Http.Json;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Representations;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Integration;

public class RecruitmentInformationEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public RecruitmentInformationEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllClubsInformation_ReturnsConfiguredFakeData()
    {
        _factory.RecruitmentDataProvider.Clubs.Clear();
        _factory.RecruitmentDataProvider.Clubs.Add(new ClubDatabaseModel(
            Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            "Robotics Club",
            ["Why do you want to join?"],
            "Builds robots",
            ClubCategories.Technology));

        var response = await _client.GetAsync("/api/recruitmentInfo/api/clubs");

        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadFromJsonAsync<List<ClubResponseDto>>();

        Assert.NotNull(data);
        Assert.Single(data!);
        Assert.Equal("Robotics Club", data[0].ClubName);
    }

    [Fact]
    public async Task GetUserInformation_ReturnsConfiguredFakeUser()
    {
        var userId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        _factory.RecruitmentDataProvider.UserInfo = new UserDatabaseModel(userId, "Magi", "Pro", "magi@example.com", "Senior", "CS");

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/user-information/{userId}");

        response.EnsureSuccessStatusCode();
        var user = await response.Content.ReadFromJsonAsync<UserResponseDto>();

        Assert.NotNull(user);
        Assert.Equal("Magi", user!.FirstName);
        Assert.Equal("CS", user.StudyMajor);
    }

    [Fact]
    public async Task GetUserInformation_WhenForbidden_ReturnsForbidden()
    {
        _factory.AuthorizationScopeService.AllowAll = false;

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/user-information/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        _factory.AuthorizationScopeService.AllowAll = true;
    }

    [Fact]
    public async Task GetUserInformation_WhenUserNotFound_ReturnsNotFound()
    {
        _factory.RecruitmentDataProvider.UserInfo = null;
        var userId = Guid.NewGuid();

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/user-information/{userId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        _factory.RecruitmentDataProvider.UserInfo = new UserDatabaseModel(Guid.NewGuid(), "Test", "User", "test@example.com", "Junior", "CS");
    }

    [Fact]
    public async Task GetDepartmentsForClub_ReturnsConfiguredDepartments()
    {
        var clubId = Guid.NewGuid();
        var deptId = Guid.NewGuid();
        _factory.RecruitmentDataProvider.Departments.Clear();
        _factory.RecruitmentDataProvider.Departments.Add(
            new DepartmentDatabaseModel(deptId, clubId, "Engineering", 5, "Build things"));

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/departments-club/{clubId}");

        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadFromJsonAsync<List<DepartmentResponseDto>>();

        Assert.NotNull(data);
        Assert.Single(data!);
        Assert.Equal("Engineering", data[0].DepartmentName);
    }

    [Fact]
    public async Task GetAllApplicationsForUser_ReturnsApplications()
    {
        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var appId = Guid.NewGuid();
        _factory.RecruitmentDataProvider.ApplicationsForUser.Clear();
        _factory.RecruitmentDataProvider.ApplicationsForUser.Add(
            new ApplicationDatabaseModel(appId, userId, Guid.NewGuid(),
                new Dictionary<string, string> { ["q"] = "a" }, DomainEvents.ApplicationStatus.InProgress));

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/applications-user/{userId}");

        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadFromJsonAsync<List<ApplicationResponseDto>>();

        Assert.NotNull(data);
        Assert.Single(data!);
    }

    [Fact]
    public async Task GetAllApplicationsForUser_WhenForbidden_ReturnsForbidden()
    {
        _factory.AuthorizationScopeService.AllowAll = false;

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/applications-user/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        _factory.AuthorizationScopeService.AllowAll = true;
    }

    [Fact]
    public async Task GetAvailableInterviewSlots_ReturnsSlots()
    {
        var clubId = Guid.NewGuid();
        var slotId = Guid.NewGuid();
        _factory.CalendarProvider.AvailableSlots.Clear();
        _factory.CalendarProvider.AvailableSlots.Add(
            new InterviewSlot(slotId, DateTimeOffset.UtcNow.AddDays(1), DateTimeOffset.UtcNow.AddDays(1).AddHours(1)));

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/available-interview-slots/{clubId}");

        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadFromJsonAsync<List<InterviewSlotDto>>();

        Assert.NotNull(data);
        Assert.Single(data!);
        Assert.Equal(slotId, data[0].SlotId);
    }

    [Fact]
    public async Task GetBookedInterviewSlots_ReturnsSlots()
    {
        var clubId = Guid.NewGuid();
        _factory.CalendarProvider.BookedSlots.Clear();
        _factory.CalendarProvider.BookedSlots.Add(
            new BookedInterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1)));

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/booked-interview-slots/{clubId}");

        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadFromJsonAsync<List<BookedInterviewSlotDto>>();

        Assert.NotNull(data);
        Assert.Single(data!);
    }

    [Fact]
    public async Task GetLatestApplicationStates_ReturnsConfiguredStates()
    {
        var appId = Guid.NewGuid();
        _factory.AggregateReconstructor.States.Clear();
        _factory.AggregateReconstructor.States.Add(new ProcessingStateRepresentation
        {
            ApplicationId = appId,
            CurrentNumberOfApprovals = 1,
            RequiredNumberOfApprovals = 2,
            UserDecisionsMap = new Dictionary<Guid, bool>()
        });

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/latest-application-states?applicationIds={appId}");

        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateClub_WhenNotSystemAdmin_ReturnsForbidden()
    {
        _factory.AuthorizationScopeService.FakeIsSystemAdmin = false;

        var request = new DbRequestModels("Test Club", ClubCategories.Technology);
        var response = await _client.PostAsJsonAsync("/api/recruitmentInfo/api/create-club", request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CreateClub_WhenSystemAdmin_ReturnsOk()
    {
        _factory.AuthorizationScopeService.FakeIsSystemAdmin = true;

        var request = new DbRequestModels("New Club", ClubCategories.Technology);
        var response = await _client.PostAsJsonAsync("/api/recruitmentInfo/api/create-club", request);

        response.EnsureSuccessStatusCode();

        _factory.AuthorizationScopeService.FakeIsSystemAdmin = false;
    }

    [Fact]
    public async Task CreateDepartment_WhenAuthorized_ReturnsOk()
    {
        _factory.AuthorizationScopeService.AllowAll = true;

        var request = new CreateDepartmentRequest(Guid.NewGuid(), "Dev Team", 3, "Does dev");
        var response = await _client.PostAsJsonAsync("/api/recruitmentInfo/api/create-department", request);

        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task CreateDepartment_WhenForbidden_ReturnsForbidden()
    {
        _factory.AuthorizationScopeService.AllowAll = false;

        var request = new CreateDepartmentRequest(Guid.NewGuid(), "Dev Team", 3, "Does dev");
        var response = await _client.PostAsJsonAsync("/api/recruitmentInfo/api/create-department", request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        _factory.AuthorizationScopeService.AllowAll = true;
    }

    [Fact]
    public async Task UpdateClubInformation_WhenAuthorized_ReturnsOk()
    {
        _factory.AuthorizationScopeService.AllowAll = true;
        var clubId = Guid.NewGuid();

        var request = new UpdateClubRequest("Updated", new List<string> { "q1" }, 2, "desc", ClubCategories.Technology);
        var response = await _client.PutAsJsonAsync($"/api/recruitmentInfo/api/update-club-information/{clubId}", request);

        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task UpdateUserRole_WhenNotSystemAdmin_ReturnsForbidden()
    {
        _factory.AuthorizationScopeService.FakeIsSystemAdmin = false;
        var roleId = Guid.NewGuid();

        var response = await _client.PutAsJsonAsync($"/api/recruitmentInfo/api/update-user-role/{Guid.NewGuid()}", roleId);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUserRole_WhenSystemAdmin_ReturnsOk()
    {
        _factory.AuthorizationScopeService.FakeIsSystemAdmin = true;
        var roleId = Guid.NewGuid();

        var response = await _client.PutAsJsonAsync($"/api/recruitmentInfo/api/update-user-role/{Guid.NewGuid()}", roleId);

        response.EnsureSuccessStatusCode();

        _factory.AuthorizationScopeService.FakeIsSystemAdmin = false;
    }

    [Fact]
    public async Task GetAllNotes_WhenAuthorized_ReturnsNotes()
    {
        _factory.AuthorizationScopeService.AllowAll = true;
        var appId = Guid.NewGuid();
        _factory.RecruitmentDataProvider.Notes.Clear();
        _factory.RecruitmentDataProvider.Notes.Add(
            new NoteDatabaseModel(Guid.NewGuid(), appId, Guid.NewGuid(), "Good candidate", "Reviewer Name"));

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/notes-application/{appId}");

        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadFromJsonAsync<List<NoteResponseDto>>();
        Assert.NotNull(data);
        Assert.Single(data!);
        Assert.Equal("Good candidate", data[0].Content);
    }

    [Fact]
    public async Task GetAllNotes_WhenForbidden_ReturnsForbidden()
    {
        _factory.AuthorizationScopeService.AllowAll = false;

        var response = await _client.GetAsync($"/api/recruitmentInfo/api/notes-application/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        _factory.AuthorizationScopeService.AllowAll = true;
    }

    [Fact]
    public async Task CreateNote_WhenAuthorized_ReturnsOk()
    {
        _factory.AuthorizationScopeService.AllowAll = true;
        var appId = Guid.NewGuid();

        var response = await _client.PostAsJsonAsync($"/api/recruitmentInfo/api/create-note/{appId}", "Great candidate!");

        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task AssignClubAdmin_WhenNotSystemAdmin_ReturnsForbidden()
    {
        _factory.AuthorizationScopeService.FakeIsSystemAdmin = false;

        var request = new AssignClubAdminRequest(Guid.NewGuid(), Guid.NewGuid());
        var response = await _client.PutAsJsonAsync($"/api/recruitmentInfo/api/assign-club-admin/{Guid.NewGuid()}", request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task AssignClubAdmin_WhenSystemAdmin_ReturnsOk()
    {
        _factory.AuthorizationScopeService.FakeIsSystemAdmin = true;

        var request = new AssignClubAdminRequest(Guid.NewGuid(), Guid.NewGuid());
        var response = await _client.PutAsJsonAsync($"/api/recruitmentInfo/api/assign-club-admin/{Guid.NewGuid()}", request);

        response.EnsureSuccessStatusCode();

        _factory.AuthorizationScopeService.FakeIsSystemAdmin = false;
    }

    [Fact]
    public async Task AssignBoardMember_WhenAuthorized_ReturnsOk()
    {
        _factory.AuthorizationScopeService.AllowAll = true;

        var request = new AssignBoardMemberRequest(Guid.NewGuid(), Guid.NewGuid());
        var response = await _client.PutAsJsonAsync($"/api/recruitmentInfo/api/assign-board-member/{Guid.NewGuid()}", request);

        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task UpdateUserInformation_WhenAuthenticated_ReturnsOk()
    {
        var request = new UpdateUserInformationRequest("Alice", "Smith", "2nd Year", "CS");
        var response = await _client.PutAsJsonAsync("/api/recruitmentInfo/api/update-user-information", request);

        response.EnsureSuccessStatusCode();
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    private sealed class ClubResponseDto
    {
        public Guid ClubId { get; set; }
        public string ClubName { get; set; } = string.Empty;
        public List<string> AdmissionQuestions { get; set; } = [];
        public string Description { get; set; } = string.Empty;
        public int Category { get; set; }
    }

    private sealed class UserResponseDto
    {
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public string StudyMajor { get; set; } = string.Empty;
    }

    private sealed class DepartmentResponseDto
    {
        public Guid DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int NumberOfOpenPositions { get; set; }
    }

    private sealed class ApplicationResponseDto
    {
        public Guid ApplicationId { get; set; }
        public Guid UserId { get; set; }
        public Guid DepartmentId { get; set; }
    }

    private sealed class InterviewSlotDto
    {
        public Guid SlotId { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset EndTime { get; set; }
    }

    private sealed class BookedInterviewSlotDto
    {
        public Guid ApplicationId { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset EndTime { get; set; }
    }

    private sealed class NoteResponseDto
    {
        public Guid NoteId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
    }
}
