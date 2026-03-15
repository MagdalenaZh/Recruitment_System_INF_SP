using AppilicationProcesserAPI.DomainEvents;
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

    public void TransitionToInterviewScheduledState(Guid aggregateId, DateTimeOffset scheduledInterviewDateTime)
    {
        _state = new HibernatedApplicationState(aggregateId, scheduledInterviewDateTime);
    }   

    public void TransitionToApprovedState(Guid aggregateId)
    {
        _state = new ApplicationApprovedState(aggregateId);
    }

    public void TransitionToConcludedState(Guid aggregateId, string conclusionResult)
    {
        _state = new ApplicationConcludedState(aggregateId, conclusionResult);
    }
}
