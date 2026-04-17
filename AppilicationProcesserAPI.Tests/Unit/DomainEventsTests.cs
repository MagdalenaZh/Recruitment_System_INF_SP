using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

/// <summary>
/// Tests for domain event construction and properties.
/// These are pure-object tests with no DB or infrastructure dependency.
/// </summary>
public class DomainEventsTests
{
    // ── ApplicationSubmittedEvent ────────────────────────────────────────────

    [Fact]
    public void ApplicationSubmittedEvent_StoresAggregateIdAndApprovals()
    {
        var id = Guid.NewGuid();
        var evt = new ApplicationSubmittedEvent(id, 3);

        Assert.Equal(id, evt.AggregateId);
        Assert.Equal(3, evt.RequiredNumberOfApprovals);
        Assert.Equal(DomainEventEnum.ApplicationCreated, evt.EventType);
    }

    [Fact]
    public void ApplicationSubmittedEvent_TimestampIsRecent()
    {
        var before = DateTimeOffset.UtcNow;
        var evt = new ApplicationSubmittedEvent(Guid.NewGuid(), 1);
        var after = DateTimeOffset.UtcNow;

        Assert.True(evt.Timestamp >= before && evt.Timestamp <= after);
    }

    // ── ApplicationApprovedEvent ─────────────────────────────────────────────

    [Fact]
    public void ApplicationApprovedEvent_StoresAggregateIdAndUserId()
    {
        var aggId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var evt = new ApplicationApprovedEvent(aggId, userId);

        Assert.Equal(aggId, evt.AggregateId);
        Assert.Equal(userId, evt.UserId);
        Assert.Equal(DomainEventEnum.ApplicationApprovalIncremented, evt.EventType);
    }

    // ── ApplicationDisapprovedEvent ──────────────────────────────────────────

    [Fact]
    public void ApplicationDisapprovedEvent_StoresAggregateIdAndUserId()
    {
        var aggId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var evt = new ApplicationDisapprovedEvent(aggId, userId);

        Assert.Equal(aggId, evt.AggregateId);
        Assert.Equal(userId, evt.UserId);
        Assert.Equal(DomainEventEnum.ApplicationApprovalDecremented, evt.EventType);
    }

    // ── AfterInterviewApprovedEvent ──────────────────────────────────────────

    [Fact]
    public void AfterInterviewApprovedEvent_StoresAggregateIdAndUserId()
    {
        var aggId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var evt = new AfterInterviewApprovedEvent(aggId, userId);

        Assert.Equal(aggId, evt.AggregateId);
        Assert.Equal(userId, evt.UserId);
        Assert.Equal(DomainEventEnum.AfterInterviewApprovedIncremented, evt.EventType);
    }

    // ── AfterInterviewDisapprovedEvent ───────────────────────────────────────

    [Fact]
    public void AfterInterviewDisapprovedEvent_StoresAggregateIdAndUserId()
    {
        var aggId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var evt = new AfterInterviewDisapprovedEvent(aggId, userId);

        Assert.Equal(aggId, evt.AggregateId);
        Assert.Equal(userId, evt.UserId);
        Assert.Equal(DomainEventEnum.AfterInterviewDisapprovedDecremented, evt.EventType);
    }

    // ── BookInterviewSlotEvent ───────────────────────────────────────────────

    [Fact]
    public void BookInterviewSlotEvent_StoresAggregateIdAndSlot()
    {
        var aggId = Guid.NewGuid();
        var slotId = Guid.NewGuid();
        var start = DateTimeOffset.UtcNow.AddDays(1);
        var end = start.AddHours(1);
        var slot = new InterviewSlot(slotId, start, end);

        var evt = new BookInterviewSlotEvent(aggId, slot);

        Assert.Equal(aggId, evt.AggregateId);
        Assert.Equal(slotId, evt.BookedSlot.SlotId);
        Assert.Equal(start, evt.BookedSlot.StartTime);
        Assert.Equal(end, evt.BookedSlot.EndTime);
        Assert.Equal(DomainEventEnum.BookInterviewSlot, evt.EventType);
    }

    // ── InterviewProposalRejectedEvent ───────────────────────────────────────

    [Fact]
    public void InterviewProposalRejectedEvent_StoresAggregateId()
    {
        var aggId = Guid.NewGuid();
        var evt = new InterviewProposalRejectedEvent(aggId);

        Assert.Equal(aggId, evt.AggregateId);
        Assert.Equal(DomainEventEnum.ApplicationInterviewRejected, evt.EventType);
    }

    // ── ApplicationAcceptedEvent ─────────────────────────────────────────────

    [Fact]
    public void ApplicationAcceptedEvent_StoresAggregateId()
    {
        var aggId = Guid.NewGuid();
        var evt = new ApplicationAcceptedEvent(aggId);

        Assert.Equal(aggId, evt.AggregateId);
        Assert.Equal(DomainEventEnum.ApplicationAccepted, evt.EventType);
    }

    // ── ApplicationRejectedEvent ─────────────────────────────────────────────

    [Fact]
    public void ApplicationRejectedEvent_StoresAggregateId()
    {
        var aggId = Guid.NewGuid();
        var evt = new ApplicationRejectedEvent(aggId);

        Assert.Equal(aggId, evt.AggregateId);
        Assert.Equal(DomainEventEnum.ApplicationRejected, evt.EventType);
    }

    // ── Enum values sanity ───────────────────────────────────────────────────

    [Fact]
    public void DomainEventEnum_HasExpectedValues()
    {
        Assert.Equal(1, (int)DomainEventEnum.ApplicationCreated);
        Assert.Equal(2, (int)DomainEventEnum.ApplicationApprovalIncremented);
        Assert.Equal(3, (int)DomainEventEnum.ApplicationApprovalDecremented);
        Assert.Equal(5, (int)DomainEventEnum.BookInterviewSlot);
        Assert.Equal(6, (int)DomainEventEnum.ApplicationAccepted);
        Assert.Equal(7, (int)DomainEventEnum.ApplicationRejected);
    }

    [Fact]
    public void ApplicationStatus_HasExpectedValues()
    {
        Assert.Equal(2, (int)ApplicationStatus.InProgress);
        Assert.Equal(3, (int)ApplicationStatus.InterviewScheduled);
        Assert.Equal(4, (int)ApplicationStatus.Rejected);
        Assert.Equal(5, (int)ApplicationStatus.Accepted);
    }
}
