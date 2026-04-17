using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.Representations;
using AppilicationProcesserAPI.Visitors;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

/// <summary>
/// Tests for the full application aggregate state machine and individual states.
/// </summary>
public class ApplicationAggregateAndStatesTests
{
    // ── ApplicationAggregate full flow ───────────────────────────────────────

    [Fact]
    public void ApplicationAggregate_SubmittedEvent_TransitionsToProcessingState()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();

        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 2));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ProcessingStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(aggregateId, rep.ApplicationId);
        Assert.Equal(2, rep.RequiredNumberOfApprovals);
        Assert.Equal(0, rep.CurrentNumberOfApprovals);
    }

    [Fact]
    public void ApplicationAggregate_EnoughApprovals_TransitionsToApprovedState()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 2));

        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        Assert.IsType<ApprovedStateRepresentation>(visitor.GetStateRepresentation());
    }

    [Fact]
    public void ApplicationAggregate_RejectBeforeEnoughApprovals_TransitionsToRejected()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 3));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        aggregate.ApplyEvent(new ApplicationRejectedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(ApplicationStatus.Rejected, rep.ConclusionResult);
    }

    [Fact]
    public void ApplicationAggregate_BookInterviewSlot_TransitionsToReviewAfterInterviewState()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-2), DateTimeOffset.UtcNow.AddHours(-1));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<AfterInterviewReviewStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(aggregateId, rep.ApplicationId);
    }

    [Fact]
    public void ApplicationAggregate_InterviewProposalRejected_TransitionsToRejected()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        aggregate.ApplyEvent(new InterviewProposalRejectedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(ApplicationStatus.Rejected, rep.ConclusionResult);
    }

    [Fact]
    public void ApplicationAggregate_FullFlow_AcceptedConclusion()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-2), DateTimeOffset.UtcNow.AddHours(-1));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));
        aggregate.ApplyEvent(new AfterInterviewApprovedEvent(aggregateId, Guid.NewGuid()));

        aggregate.ApplyEvent(new ApplicationAcceptedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(ApplicationStatus.Accepted, rep.ConclusionResult);
    }

    [Fact]
    public void ApplicationAggregate_FullFlow_RejectedConclusion()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-2), DateTimeOffset.UtcNow.AddHours(-1));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));
        aggregate.ApplyEvent(new AfterInterviewApprovedEvent(aggregateId, Guid.NewGuid()));

        aggregate.ApplyEvent(new ApplicationRejectedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(ApplicationStatus.Rejected, rep.ConclusionResult);
    }

    // ── ProcessingApplicationState ───────────────────────────────────────────

    [Fact]
    public void ProcessingState_Disapprove_DecrementsApprovalWhenPreviouslyApproved()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 3));
        var userId = Guid.NewGuid();
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, userId));

        // Now disapprove same user — should decrement
        aggregate.ApplyEvent(new ApplicationDisapprovedEvent(aggregateId, userId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ProcessingStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(0, rep.CurrentNumberOfApprovals);
    }

    [Fact]
    public void ProcessingState_DisapproveWithoutPriorApproval_DoesNotDecrementBelowZero()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 3));
        var userId = Guid.NewGuid();

        // Disapprove without prior approval
        aggregate.ApplyEvent(new ApplicationDisapprovedEvent(aggregateId, userId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ProcessingStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(0, rep.CurrentNumberOfApprovals);
    }

    [Fact]
    public void ProcessingState_ApproveByMultipleUsers_CountsEach()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 5));

        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ProcessingStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(2, rep.CurrentNumberOfApprovals);
    }

    [Fact]
    public void ProcessingState_WrongAggregateId_ThrowsInvalidOperation()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 2));

        var wrongEvent = new ApplicationApprovedEvent(Guid.NewGuid(), Guid.NewGuid());
        Assert.Throws<InvalidOperationException>(() => aggregate.ApplyEvent(wrongEvent));
    }

    [Fact]
    public void ProcessingState_NullEvent_ThrowsArgumentNullException()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 2));

        Assert.Throws<ArgumentNullException>(() => aggregate.ApplyEvent(null!));
    }

    // ── ApplicationApprovedState ─────────────────────────────────────────────

    [Fact]
    public void ApprovedState_RejectApplication_TransitionsToRejected()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        aggregate.ApplyEvent(new ApplicationRejectedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(ApplicationStatus.Rejected, rep.ConclusionResult);
    }

    [Fact]
    public void ApprovedState_WrongAggregateId_ThrowsInvalidOperation()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var wrongEvent = new ApplicationRejectedEvent(Guid.NewGuid());
        Assert.Throws<InvalidOperationException>(() => aggregate.ApplyEvent(wrongEvent));
    }

    // ── ReviewAfterInterviewState ────────────────────────────────────────────

    [Fact]
    public void ReviewAfterInterviewState_EventBeforeInterviewTime_IsIgnored()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        // Slot in the FUTURE - events have Timestamp=UtcNow which is before slot start
        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(2), DateTimeOffset.UtcNow.AddHours(3));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));

        // This AfterInterviewApprovedEvent timestamp < slot.StartTime => ignored
        aggregate.ApplyEvent(new AfterInterviewApprovedEvent(aggregateId, Guid.NewGuid()));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<AfterInterviewReviewStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(0, rep.CurrentNumberOfPostInterviewApprovals);
    }

    [Fact]
    public void ReviewAfterInterviewState_DisapproveAfterApprove_DecrementsCount()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-2), DateTimeOffset.UtcNow.AddHours(-1));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));

        var userId = Guid.NewGuid();
        aggregate.ApplyEvent(new AfterInterviewApprovedEvent(aggregateId, userId));

        // Put state back below threshold by disapproving
        var aggregateId2 = Guid.NewGuid();
        var aggregate2 = new ApplicationAggregate();
        aggregate2.ApplyEvent(new ApplicationSubmittedEvent(aggregateId2, 3));
        aggregate2.ApplyEvent(new ApplicationApprovedEvent(aggregateId2, Guid.NewGuid()));
        aggregate2.ApplyEvent(new ApplicationApprovedEvent(aggregateId2, Guid.NewGuid()));
        aggregate2.ApplyEvent(new ApplicationApprovedEvent(aggregateId2, Guid.NewGuid()));

        var slot2 = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-2), DateTimeOffset.UtcNow.AddHours(-1));
        aggregate2.ApplyEvent(new BookInterviewSlotEvent(aggregateId2, slot2));

        var userId2 = Guid.NewGuid();
        aggregate2.ApplyEvent(new AfterInterviewApprovedEvent(aggregateId2, userId2));
        aggregate2.ApplyEvent(new AfterInterviewDisapprovedEvent(aggregateId2, userId2));

        var visitor2 = new StateVisitor();
        aggregate2.AllowVisitor(visitor2);
        var rep2 = Assert.IsType<AfterInterviewReviewStateRepresentation>(visitor2.GetStateRepresentation());
        Assert.Equal(0, rep2.CurrentNumberOfPostInterviewApprovals);
    }

    [Fact]
    public void ReviewAfterInterviewState_RejectApplication_TransitionsToRejected()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-2), DateTimeOffset.UtcNow.AddHours(-1));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));

        aggregate.ApplyEvent(new ApplicationRejectedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
    }

    [Fact]
    public void ReviewAfterInterviewState_WrongAggregateId_ThrowsInvalidOperation()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-2), DateTimeOffset.UtcNow.AddHours(-1));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));

        var wrongEvent = new AfterInterviewApprovedEvent(Guid.NewGuid(), Guid.NewGuid());
        Assert.Throws<InvalidOperationException>(() => aggregate.ApplyEvent(wrongEvent));
    }

    // ── HibernatedApplicationState ───────────────────────────────────────────

    [Fact]
    public void HibernatedState_AcceptEvent_TransitionsToAcceptedConclusion()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = BuildAggregateInHibernatedState(aggregateId);

        aggregate.ApplyEvent(new ApplicationAcceptedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(ApplicationStatus.Accepted, rep.ConclusionResult);
    }

    [Fact]
    public void HibernatedState_RejectEvent_TransitionsToRejectedConclusion()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = BuildAggregateInHibernatedState(aggregateId);

        aggregate.ApplyEvent(new ApplicationRejectedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(ApplicationStatus.Rejected, rep.ConclusionResult);
    }

    // ── Concluded states ─────────────────────────────────────────────────────

    [Fact]
    public void ConcludedAcceptedState_AdditionalEvents_AreIgnored()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = BuildAggregateInHibernatedState(aggregateId);
        aggregate.ApplyEvent(new ApplicationAcceptedEvent(aggregateId));

        // further events should be silently ignored
        aggregate.ApplyEvent(new ApplicationRejectedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(ApplicationStatus.Accepted, rep.ConclusionResult);
    }

    [Fact]
    public void ConcludedRejectedState_AdditionalEvents_AreIgnored()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationRejectedEvent(aggregateId));

        // further events should be silently ignored
        aggregate.ApplyEvent(new ApplicationAcceptedEvent(aggregateId));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());
        Assert.Equal(ApplicationStatus.Rejected, rep.ConclusionResult);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static ApplicationAggregate BuildAggregateInHibernatedState(Guid aggregateId)
    {
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));
        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-2), DateTimeOffset.UtcNow.AddHours(-1));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));
        aggregate.ApplyEvent(new AfterInterviewApprovedEvent(aggregateId, Guid.NewGuid()));
        // Now in HibernatedApplicationState
        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        Assert.IsType<HibernatedStateRepresentation>(visitor.GetStateRepresentation());
        return aggregate;
    }
}
