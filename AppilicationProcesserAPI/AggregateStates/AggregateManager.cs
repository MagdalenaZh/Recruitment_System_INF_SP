using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using System.Collections.Concurrent;

namespace AppilicationProcesserAPI.AggregateStates
{
    public interface IAggregateManager
    {
        Task AcceptEvent(IDomainEvent domainEvent, CancellationToken cancellationToken = default);
    }

    public class AggregateManager : IAggregateManager
    {
        private readonly IMessageEmitter _messageEmitter;
        private readonly IEventStore _eventStore;
        private readonly ConcurrentDictionary<Guid, IApplicationAggregate> _aggregates;

        public AggregateManager(IMessageEmitter messageEmitter, IEventStore eventStore)
        {
            _aggregates = new ConcurrentDictionary<Guid, IApplicationAggregate>();
            _eventStore = eventStore;
            _messageEmitter = messageEmitter;
        }

        public async Task AcceptEvent(IDomainEvent domainEvent, CancellationToken cancellationToken = default)
        {
            var aggregateId = domainEvent.AggregateId;

            if (_aggregates.TryGetValue(aggregateId, out var existingAggregate))
            {
                existingAggregate.ApplyEvent(domainEvent);
                await _messageEmitter.EmmitApplicationState(existingAggregate.State, cancellationToken).ConfigureAwait(false);
            }
            else
            {
                var events = await _eventStore.GetEventsAsync(aggregateId, cancellationToken).ConfigureAwait(false);
                var aggregate = new ApplicationAggregate();
                foreach (var evt in events)
                {
                    aggregate.ApplyEvent(evt);
                }
                // Apply the new event after replaying past events to ensure the aggregate is up-to-date
                aggregate.ApplyEvent(domainEvent);

                _aggregates.TryAdd(aggregateId, aggregate);

                await _messageEmitter.EmmitApplicationState(aggregate.State, cancellationToken).ConfigureAwait(false);
            }
        }
    }
}
