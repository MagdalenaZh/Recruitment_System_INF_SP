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

    [Fact]
    public async Task DisapproveApplication_ReturnsOk_AndAppendsDisapprovalEvent()
    {
        _factory.EventStore.AppendedEvents.Clear();
        _factory.EventBroker.PublishedMessages.Clear();
        var applicationId = Guid.NewGuid();

        var response = await _client.PostAsync($"/api/disapprove-application/{applicationId}", content: null);

        response.EnsureSuccessStatusCode();
        var appended = Assert.IsType<ApplicationDisapprovedEvent>(_factory.EventStore.AppendedEvents.Single());
        Assert.Equal(applicationId, appended.AggregateId);
    }

    [Fact]
    public async Task AfterInterviewApproveApplication_ReturnsOk_AndAppendsAfterInterviewApprovedEvent()
    {
        _factory.EventStore.AppendedEvents.Clear();
        _factory.EventBroker.PublishedMessages.Clear();
        var applicationId = Guid.NewGuid();

        var response = await _client.PostAsync($"/api/after-interview-approve-application/{applicationId}", content: null);

        response.EnsureSuccessStatusCode();
        var appended = Assert.IsType<AfterInterviewApprovedEvent>(_factory.EventStore.AppendedEvents.Single());
        Assert.Equal(applicationId, appended.AggregateId);
    }

    [Fact]
    public async Task AfterInterviewDisapproveApplication_ReturnsOk_AndAppendsEvent()
    {
        _factory.EventStore.AppendedEvents.Clear();
        _factory.EventBroker.PublishedMessages.Clear();
        var applicationId = Guid.NewGuid();

        var response = await _client.PostAsync($"/api/after-interview-disapprove-application/{applicationId}", content: null);

        response.EnsureSuccessStatusCode();
        var appended = Assert.IsType<AfterInterviewDisapprovedEvent>(_factory.EventStore.AppendedEvents.Single());
        Assert.Equal(applicationId, appended.AggregateId);
    }

    [Fact]
    public async Task RejectInterviewProposal_ReturnsOk_AndAppendsEvent()
    {
        _factory.EventStore.AppendedEvents.Clear();
        _factory.EventBroker.PublishedMessages.Clear();
        var applicationId = Guid.NewGuid();

        var response = await _client.PostAsync($"/api/reject-interview-proposal/{applicationId}", content: null);

        response.EnsureSuccessStatusCode();
        var appended = Assert.IsType<InterviewProposalRejectedEvent>(_factory.EventStore.AppendedEvents.Single());
        Assert.Equal(applicationId, appended.AggregateId);
    }

    [Fact]
    public async Task BookInterviewSlot_ReturnsOk_AndBooksSlot()
    {
        _factory.EventStore.AppendedEvents.Clear();
        _factory.EventBroker.PublishedMessages.Clear();
        var applicationId = Guid.NewGuid();
        var slotId = Guid.NewGuid();
        var slot = new InterviewSlot(slotId, DateTimeOffset.UtcNow.AddHours(1), DateTimeOffset.UtcNow.AddHours(2));

        var response = await _client.PutAsJsonAsync($"/api/book-interview-slot/{applicationId}", slot);

        response.EnsureSuccessStatusCode();
        Assert.NotNull(_factory.CalendarProvider.LastBooked);
        Assert.Equal(slotId, _factory.CalendarProvider.LastBooked!.Value.SlotId);
        Assert.Equal(applicationId, _factory.CalendarProvider.LastBooked!.Value.ApplicationId);
        var appended = Assert.IsType<BookInterviewSlotEvent>(_factory.EventStore.AppendedEvents.Single());
        Assert.Equal(applicationId, appended.AggregateId);
    }

    [Fact]
    public async Task ConcludeRejectApplication_ReturnsOk_AndAppendsRejectedEvent()
    {
        _factory.EventStore.AppendedEvents.Clear();
        _factory.EventBroker.PublishedMessages.Clear();
        var applicationId = Guid.NewGuid();

        var response = await _client.PutAsync($"/api/conclude-reject-application/{applicationId}", content: null);

        response.EnsureSuccessStatusCode();
        var appended = Assert.IsType<ApplicationRejectedEvent>(_factory.EventStore.AppendedEvents.Single());
        Assert.Equal(applicationId, appended.AggregateId);
    }

    [Fact]
    public async Task ConcludeAcceptApplication_ReturnsOk_AndAppendsAcceptedEvent()
    {
        _factory.EventStore.AppendedEvents.Clear();
        _factory.EventBroker.PublishedMessages.Clear();
        var applicationId = Guid.NewGuid();

        var response = await _client.PutAsync($"/api/conclude-accept-application/{applicationId}", content: null);

        response.EnsureSuccessStatusCode();
        var appended = Assert.IsType<ApplicationAcceptedEvent>(_factory.EventStore.AppendedEvents.Single());
        Assert.Equal(applicationId, appended.AggregateId);
    }

    [Fact]
    public async Task SubmitApplication_WhenForbidden_ReturnsForbidden()
    {
        _factory.AuthorizationScopeService.AllowAll = false;

        var request = new ApplicationSubmissionData(
            Guid.NewGuid(),
            new Dictionary<string, string>());

        var response = await _client.PostAsJsonAsync("/api/submit-application", request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        _factory.AuthorizationScopeService.AllowAll = true;
    }

    [Fact]
    public async Task ApproveApplication_WhenForbidden_ReturnsForbidden()
    {
        _factory.AuthorizationScopeService.AllowAll = false;

        var response = await _client.PostAsync($"/api/approve-application/{Guid.NewGuid()}", content: null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        _factory.AuthorizationScopeService.AllowAll = true;
    }
}
