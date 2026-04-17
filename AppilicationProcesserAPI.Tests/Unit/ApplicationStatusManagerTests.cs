using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Representations;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class ApplicationStatusManagerTests
{
    [Fact]
    public async Task UpdateApplicationStatus_InitialRepresentation_QueuesInProgressStatus()
    {
        var manager = new ApplicationStatusManager(NullLogger<ApplicationStatusManager>.Instance);
        var applicationId = Guid.NewGuid();

        await manager.UpdateApplicationStatus(new InitialRepresentation
        {
            ApplicationId = applicationId,
            ApplicationProcessed = true
        }, CancellationToken.None);

        var message = await manager.GetApplicationStatus(CancellationToken.None);

        Assert.Equal(applicationId, message.MessageData.ApplicationId);
        Assert.Equal(ApplicationStatus.InProgress, message.MessageData.ApplicationStatus);
    }

    [Fact]
    public async Task UpdateApplicationStatus_HibernatedRepresentation_QueuesInReviewStatus()
    {
        var manager = new ApplicationStatusManager(NullLogger<ApplicationStatusManager>.Instance);
        var applicationId = Guid.NewGuid();

        await manager.UpdateApplicationStatus(new HibernatedStateRepresentation
        {
            ApplicationId = applicationId,
            WaitingFinalDecision = true
        }, CancellationToken.None);

        var message = await manager.GetApplicationStatus(CancellationToken.None);

        Assert.Equal(ApplicationStatus.InReview, message.MessageData.ApplicationStatus);
    }

    [Fact]
    public async Task UpdateApplicationStatus_ConcludedRepresentation_QueuesFinalStatus()
    {
        var manager = new ApplicationStatusManager(NullLogger<ApplicationStatusManager>.Instance);
        var applicationId = Guid.NewGuid();

        await manager.UpdateApplicationStatus(new ConcludedStateRepresentation
        {
            ApplicationId = applicationId,
            ConclusionResult = ApplicationStatus.Accepted
        }, CancellationToken.None);

        var message = await manager.GetApplicationStatus(CancellationToken.None);

        Assert.Equal(ApplicationStatus.Accepted, message.MessageData.ApplicationStatus);
        Assert.Equal(applicationId, message.MessageData.ApplicationId);
    }

    [Fact]
    public async Task UpdateApplicationStatus_AfterInterviewRepresentation_DoesNotQueueUnsupportedStatus()
    {
        var manager = new ApplicationStatusManager(NullLogger<ApplicationStatusManager>.Instance);

        await manager.UpdateApplicationStatus(new AfterInterviewReviewStateRepresentation
        {
            ApplicationId = Guid.NewGuid(),
            RequiredNumberOfApprovals = 2,
            CurrentNumberOfPostInterviewApprovals = 1,
            UserDecisionsMap = new Dictionary<Guid, bool>(),
            ScheduledTime = new Models.InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1))
        }, CancellationToken.None);

        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(50));
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => manager.GetApplicationStatus(cts.Token).AsTask());
    }

    [Fact]
    public async Task UpdateApplicationStatus_ApprovedStateRepresentation_QueuesInterviewScheduledStatus()
    {
        var manager = new ApplicationStatusManager(NullLogger<ApplicationStatusManager>.Instance);
        var applicationId = Guid.NewGuid();

        await manager.UpdateApplicationStatus(new ApprovedStateRepresentation
        {
            ApplicationId = applicationId,
            ApplicationApproved = true
        }, CancellationToken.None);

        var message = await manager.GetApplicationStatus(CancellationToken.None);

        Assert.Equal(applicationId, message.MessageData.ApplicationId);
        Assert.Equal(ApplicationStatus.InterviewScheduled, message.MessageData.ApplicationStatus);
    }

    [Fact]
    public async Task UpdateApplicationStatus_ProcessingStateRepresentation_DoesNotQueue()
    {
        var manager = new ApplicationStatusManager(NullLogger<ApplicationStatusManager>.Instance);

        await manager.UpdateApplicationStatus(new ProcessingStateRepresentation
        {
            ApplicationId = Guid.NewGuid(),
            CurrentNumberOfApprovals = 1,
            RequiredNumberOfApprovals = 2,
            UserDecisionsMap = new Dictionary<Guid, bool>()
        }, CancellationToken.None);

        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(50));
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => manager.GetApplicationStatus(cts.Token).AsTask());
    }

    [Fact]
    public async Task UpdateApplicationStatus_NullRepresentation_ThrowsArgumentNullException()
    {
        var manager = new ApplicationStatusManager(NullLogger<ApplicationStatusManager>.Instance);

        await Assert.ThrowsAsync<ArgumentNullException>(() =>
            manager.UpdateApplicationStatus(null!, CancellationToken.None).AsTask());
    }

    [Fact]
    public async Task UpdateApplicationStatus_ConcludedRejected_QueuesRejectedStatus()
    {
        var manager = new ApplicationStatusManager(NullLogger<ApplicationStatusManager>.Instance);
        var applicationId = Guid.NewGuid();

        await manager.UpdateApplicationStatus(new ConcludedStateRepresentation
        {
            ApplicationId = applicationId,
            ConclusionResult = ApplicationStatus.Rejected
        }, CancellationToken.None);

        var message = await manager.GetApplicationStatus(CancellationToken.None);

        Assert.Equal(applicationId, message.MessageData.ApplicationId);
        Assert.Equal(ApplicationStatus.Rejected, message.MessageData.ApplicationStatus);
    }
}
