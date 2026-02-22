using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.AggregateStates
{
    public interface IEventStore
    {
        Task AppendEventAsync(IDomainEvent domainEvent, CancellationToken cancellationToken = default);
        Task<IEnumerable<IDomainEvent>> GetEventsAsync(Guid aggregateId, CancellationToken cancellationToken = default);
    }

    public class EventStore : IEventStore
    {
        public EventStore()
        {
        }

        public Task AppendEventAsync(IDomainEvent domainEvent, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<IDomainEvent>> GetEventsAsync(Guid aggregateId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Enumerable.Empty<IDomainEvent>());
        }
    }
}
