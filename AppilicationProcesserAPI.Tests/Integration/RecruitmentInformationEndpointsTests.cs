using System.Net;
using System.Net.Http.Json;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
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
}
