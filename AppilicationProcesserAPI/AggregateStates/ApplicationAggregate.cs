using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates;

public interface IApplicationAggregate
{
    public void ApplyEvent(IDomainEvent domainEvent);

    public void AllowVisitor(IStateVisitor stateVisitor);
}

public class ApplicationAggregate : IApplicationAggregate
{
    private IApplicationState _state;

    public ApplicationAggregate()
    {
        _state = new InitialApplicationState();
    }

    public void ApplyEvent(IDomainEvent domainEvent)
    {
        _state.HandleEvent(this, domainEvent);
    }

    public void AllowVisitor(IStateVisitor stateVisitor)
    {
       _state.AcceptVisitor(stateVisitor);
    }

    public void TransitionToProcessingState(Guid aggregateId, int requiredNumberOfApprovals)
    {
        _state = new ProcessingApplicationState(aggregateId, requiredNumberOfApprovals);
    }

    public void TransitionToInterviewScheduledState(Guid aggregateId, InterviewSlot scheduledInterviewSlot, int requiredNumberOfApprovals)
    {
        _state = new ReviewAfterInterviewState(aggregateId, scheduledInterviewSlot, requiredNumberOfApprovals);
    }   

    public void TransitionToApprovedState(Guid aggregateId, int requiredNumberOfApprovals)
    {
        _state = new ApplicationApprovedState(aggregateId, requiredNumberOfApprovals);
    }

    public void TransitionToWaitForFinalDecisionState(Guid aggregateId)
    {
        _state = new HibernatedApplicationState(aggregateId);
    }

    public void TransitionToAcceptedConcludedState(Guid aggregateId)
    {
        _state = new ApplicationConcludedStateAccepted(aggregateId);
    }

    public void TransitionToRejectedConcludedState(Guid aggregateId)
    {
        _state = new ApplicationConcludedStateRejected(aggregateId);
    }
}
