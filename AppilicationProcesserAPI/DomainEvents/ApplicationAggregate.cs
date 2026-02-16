namespace AppilicationProcesserAPI.DomainEvents;

public interface IApplicationAggregate
{
    public Guid AggregateId { get; }

    public void ApplyEvent(IDomainEvent domainEvent);
}

public class ApplicationAggregate : IApplicationAggregate
{
    public Guid AggregateId { get; }

    private IApplicationState _state;

    public ApplicationAggregate()
    {
       _state = new InitialApplicationState();
    }

    public void ApplyEvent(IDomainEvent domainEvent)
    {
        if (domainEvent == null) throw new ArgumentNullException(nameof(domainEvent));
        if (domainEvent.AggregateId != AggregateId) throw new InvalidOperationException($"Domain event with AggregateId {domainEvent.AggregateId} does not match the aggregate's ID {AggregateId}.");
        _state.SetContext(this, domainEvent);
    }
}
