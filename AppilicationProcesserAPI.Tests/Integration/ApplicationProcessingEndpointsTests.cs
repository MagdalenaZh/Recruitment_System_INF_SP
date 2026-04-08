using System.Net;
using System.Net.Http.Json;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Integration;

public class ApplicationProcessingEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public ApplicationProcessingEndpointsTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task SubmitApplication_ReturnsAccepted_AndPublishesSubmissionEvent()
    {
        _factory.EventStore.CreatedApplications.Clear();
        _factory.EventStore.AppendedEvents.Clear();
        _factory.EventBroker.PublishedMessages.Clear();
        _factory.RecruitmentDataProvider.RequiredApprovals = 3;

        var request = new ApplicationSubmissionData(
            Guid.Parse("33333333-3333-3333-3333-333333333333"),
            new Dictionary<string, string> { ["motivation"] = "I care" });

        var response = await _client.PostAsJsonAsync("/api/submit-application", request);

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        Assert.Single(_factory.EventStore.CreatedApplications);
        Assert.Single(_factory.EventStore.AppendedEvents);
        Assert.Single(_factory.EventBroker.PublishedMessages);
        var appended = Assert.IsType<ApplicationSubmittedEvent>(_factory.EventStore.AppendedEvents[0]);
        Assert.Equal(3, appended.RequiredNumberOfApprovals);
    }

    [Fact]
    public async Task ApproveApplication_ReturnsOk_AndAppendsApprovalEvent()
    {
        _factory.EventStore.AppendedEvents.Clear();
        _factory.EventBroker.PublishedMessages.Clear();
        var applicationId = Guid.Parse("44444444-4444-4444-4444-444444444444");

        var response = await _client.PostAsync($"/api/approve-application/{applicationId}", content: null);

        response.EnsureSuccessStatusCode();
        var appended = Assert.IsType<ApplicationApprovedEvent>(_factory.EventStore.AppendedEvents.Single());
        Assert.Equal(applicationId, appended.AggregateId);
        Assert.Single(_factory.EventBroker.PublishedMessages);
    }
}
