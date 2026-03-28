namespace AppilicationProcesserAPI.DomainEvents
{
    public interface IDomainEventFactory
    {
        IDomainEvent CreateDomainEvent(Guid aggregateId);
    }

    public class DomainEventFactory : IDomainEventFactory
    {
        public IDomainEvent CreateDomainEvent(Guid aggregateId)
        {
            throw new NotImplementedException();
        }
    }
}
