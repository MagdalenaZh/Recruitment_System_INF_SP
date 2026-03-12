using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Visitors;
using System.Collections.Concurrent;

namespace AppilicationProcesserAPI.AggregateStates
{
    public interface IAggregateEngine
    {
        Task HandleEvent(IDomainEvent domainEvent, CancellationToken cancellationToken = default);
    }

    public class AggregateEngine : IAggregateEngine
    {
        private readonly IRepresentationEmitter _messageEmitter;
        private readonly IEventStore _eventStore;
        private readonly IStateVisitorFactory _stateVisitorFactory;
        private readonly ConcurrentDictionary<Guid, IApplicationAggregate> _aggregates;
        private readonly ILogger<AggregateEngine> _logger;

        public AggregateEngine(IRepresentationEmitter messageEmitter, IEventStore eventStore,
            IStateVisitorFactory stateVisitorFactory, ILogger<AggregateEngine> logger)
        {
            _aggregates = new ConcurrentDictionary<Guid, IApplicationAggregate>();
            _eventStore = eventStore;
            _messageEmitter = messageEmitter;
            _logger = logger;
            _stateVisitorFactory = stateVisitorFactory;
        }

        public async Task HandleEvent(IDomainEvent domainEvent, CancellationToken cancellationToken = default)
        {
            var aggregateId = domainEvent.AggregateId;

            var stateVisitor = _stateVisitorFactory.CreateStateVisitor();

            if (_aggregates.TryGetValue(aggregateId, out var existingAggregate))
            {
                existingAggregate.ApplyEvent(domainEvent);
                existingAggregate.AllowVisitor(stateVisitor);
            }
            else
            {
#warning Revert after proper db connection established
                //var events = await _eventStore.GetEventsAsync(aggregateId, cancellationToken).ConfigureAwait(false);
                var events = new List<IDomainEvent>();
                var aggregate = new ApplicationAggregate();
                foreach (var evt in events)
                {
                    aggregate.ApplyEvent(evt);
                }
                // Apply the new event after replaying past events to ensure the aggregate is up-to-date
                aggregate.ApplyEvent(domainEvent);

                _aggregates.TryAdd(aggregateId, aggregate);
                aggregate.AllowVisitor(stateVisitor);
            }

            await _messageEmitter.EmmitApplicationStateChanges(stateVisitor.GetStateRepresentation(), DateTimeOffset.UtcNow, cancellationToken).ConfigureAwait(false);
        }
    }
}
