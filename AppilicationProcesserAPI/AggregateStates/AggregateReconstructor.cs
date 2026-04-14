using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Representations;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates
{
    public interface IAggregateReconstructor
    {
        Task<List<IStateRepresentation>> GetLatestAggregateStates(List<Guid> aggregateIds, CancellationToken cancellationToken);
    }

    public class AggregateReconstructor : IAggregateReconstructor
    {
        private readonly IEventStore _eventStore;
        private readonly IStateVisitorFactory _stateVisitorFactory;

        public AggregateReconstructor(IEventStore eventStore, IStateVisitorFactory stateVisitorFactory)
        {
            _eventStore = eventStore;
            _stateVisitorFactory = stateVisitorFactory;
        }

        public async Task<List<IStateRepresentation>> GetLatestAggregateStates(List<Guid> aggregateIds, CancellationToken cancellationToken)
        {
            var reconstructionTasks = aggregateIds.Select(async aggregateId =>
            {
                var events = await _eventStore.GetEventsAsync(aggregateId, cancellationToken);
                return await PopulateAggregate(aggregateId, events);
            });

            var representations = await Task.WhenAll(reconstructionTasks).ConfigureAwait(false);
            return [.. representations];
        }

        private Task<IStateRepresentation> PopulateAggregate(Guid aggregateId, IEnumerable<IDomainEvent> events)
        {
            var domainEvents = events.ToList();
            if (domainEvents.Count == 0)
            {
                return Task.FromResult<IStateRepresentation>(new InitialRepresentation
                {
                    ApplicationId = aggregateId,
                    ApplicationProcessed = false
                });
            }

            var aggregate = new ApplicationAggregate();

            foreach (var domainEvent in domainEvents)
            {
                aggregate.ApplyEvent(domainEvent);
            }

            var visitor = _stateVisitorFactory.CreateStateVisitor();

            aggregate.AllowVisitor(visitor);

            return Task.FromResult(visitor.GetStateRepresentation());
        }
    }
}
