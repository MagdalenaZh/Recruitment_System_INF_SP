namespace AppilicationProcesserAPI.DomainEvents;

public interface IApplicationAggregate
{
    public void ApplyEvent(IDomainEvent domainEvent);
}

public class ApplicationAggregate : IApplicationAggregate
{
    public Guid AggregateId { get; }

    public int RequiredNumberOfApprovals { get; }

    private IApplicationState _state;

    public ApplicationAggregate()
    {
       _state = new InitialApplicationState();
    }

    public ApplicationAggregate(Guid aggregateId, int requiredNumberOfApprovals)
    {
        AggregateId = aggregateId;
        RequiredNumberOfApprovals = requiredNumberOfApprovals;
        _state = new InitialApplicationState();
    }

    public void ApplyEvent(IDomainEvent domainEvent)
    {
        if (domainEvent == null) throw new ArgumentNullException(nameof(domainEvent));
        //if (domainEvent.AggregateId != AggregateId) throw new InvalidOperationException($"Domain event with AggregateId {domainEvent.AggregateId} does not match the aggregate's ID {AggregateId}.");
        _state.HandleEvent(this, domainEvent);
    }

    public void TransitionToHibernatedState()
    {
        _state = new HibernatedApplicationState();
    }
}
