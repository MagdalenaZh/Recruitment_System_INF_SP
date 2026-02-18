using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.AggregateStates;

public interface IApplicationAggregate
{
    public IApplicationState State { get; }
    public void ApplyEvent(IDomainEvent domainEvent);
}

public class ApplicationAggregate : IApplicationAggregate
{
    private IApplicationState _state;

    public ApplicationAggregate()
    {
        _state = new InitialApplicationState();
    }

    public IApplicationState State => _state;

    public void ApplyEvent(IDomainEvent domainEvent)
    {
        _state.HandleEvent(this, domainEvent);
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

    public void TransitionToConcludedState(Guid aggregateId)
    {
        _state = new ApplicationConcludedState(aggregateId);
    }
}
