using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.Representations;
using AppilicationProcesserAPI.Visitors;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class StateVisitorTests
{
    [Fact]
    public void GetStateRepresentation_BeforeAnyVisit_ThrowsInvalidOperation()
    {
        var visitor = new StateVisitor();

        Assert.Throws<InvalidOperationException>(() => visitor.GetStateRepresentation());
    }

    [Fact]
    public void Visit_ProcessingState_ReturnsProcessingRepresentation()
    {
        var aggregateId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var decisionMap = new Dictionary<Guid, bool> { [userId] = true };

        var visitor = new StateVisitor();
        visitor.PropertyBag.Set("ApplicationId", aggregateId);
        visitor.PropertyBag.Set("CurrentNumberOfApprovals", 1);
        visitor.PropertyBag.Set("RequiredNumberOfApprovals", 2);
        visitor.PropertyBag.Set("UserDecisionsMap", decisionMap);

        // Trigger via actual aggregate to ensure all properties are set correctly
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 2));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, userId));

        var realVisitor = new StateVisitor();
        aggregate.AllowVisitor(realVisitor);
        var rep = Assert.IsType<ProcessingStateRepresentation>(realVisitor.GetStateRepresentation());

        Assert.Equal(aggregateId, rep.ApplicationId);
        Assert.Equal(1, rep.CurrentNumberOfApprovals);
        Assert.Equal(2, rep.RequiredNumberOfApprovals);
        Assert.Contains(userId, rep.UserDecisionsMap.Keys);
    }

    [Fact]
    public void Visit_ApprovedState_ReturnsApprovedRepresentation()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ApprovedStateRepresentation>(visitor.GetStateRepresentation());

        Assert.Equal(aggregateId, rep.ApplicationId);
        Assert.True(rep.ApplicationApproved);
    }

    [Fact]
    public void Visit_HibernatedState_ReturnsHibernatedRepresentation()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));
        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-2), DateTimeOffset.UtcNow.AddHours(-1));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));
        aggregate.ApplyEvent(new AfterInterviewApprovedEvent(aggregateId, Guid.NewGuid()));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<HibernatedStateRepresentation>(visitor.GetStateRepresentation());

        Assert.Equal(aggregateId, rep.ApplicationId);
        Assert.True(rep.WaitingFinalDecision);
    }

    [Fact]
    public void Visit_AfterInterviewReviewState_ReturnsAfterInterviewRepresentation()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()));
        var slotStart = DateTimeOffset.UtcNow.AddHours(-2);
        var slot = new InterviewSlot(Guid.NewGuid(), slotStart, slotStart.AddHours(1));
        aggregate.ApplyEvent(new BookInterviewSlotEvent(aggregateId, slot));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<AfterInterviewReviewStateRepresentation>(visitor.GetStateRepresentation());

        Assert.Equal(aggregateId, rep.ApplicationId);
        Assert.Equal(0, rep.CurrentNumberOfPostInterviewApprovals);
        Assert.Equal(1, rep.RequiredNumberOfApprovals);
    }

    [Fact]
    public void Visit_ConcludedAcceptedState_ReturnsConcludedRepresentationWithAccepted()
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

        Assert.Equal(aggregateId, rep.ApplicationId);
        Assert.Equal(ApplicationStatus.Accepted, rep.ConclusionResult);
    }

    [Fact]
    public void Visit_ConcludedRejectedState_ReturnsConcludedRepresentationWithRejected()
    {
        var aggregateId = Guid.NewGuid();
        var aggregate = new ApplicationAggregate();
        aggregate.ApplyEvent(new ApplicationSubmittedEvent(aggregateId, 1));
        aggregate.ApplyEvent(new ApplicationRejectedEvent(aggregateId));

        var visitor = new StateVisitor();
        aggregate.AllowVisitor(visitor);
        var rep = Assert.IsType<ConcludedStateRepresentation>(visitor.GetStateRepresentation());

        Assert.Equal(aggregateId, rep.ApplicationId);
        Assert.Equal(ApplicationStatus.Rejected, rep.ConclusionResult);
    }

    [Fact]
    public void StateVisitorFactory_Creates_NewInstanceEachTime()
    {
        var factory = new StateVisitorFactory();

        var v1 = factory.CreateStateVisitor();
        var v2 = factory.CreateStateVisitor();

        Assert.NotSame(v1, v2);
        Assert.IsType<StateVisitor>(v1);
        Assert.IsType<StateVisitor>(v2);
    }
}
