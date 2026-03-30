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
            Task<IStateRepresentation>[] reconstructionTasks = [];

            for (int i = 0; i < aggregateIds.Count; i++)
            {
                var events = await _eventStore.GetEventsAsync(aggregateIds[i], cancellationToken);
                reconstructionTasks[i] = PopulateAggregate(events);
            }

            var representations = await Task.WhenAll(reconstructionTasks).ConfigureAwait(false);
            return [.. representations];
        }

        private Task<IStateRepresentation> PopulateAggregate(IEnumerable<IDomainEvent> events)
        {
            var aggregate = new ApplicationAggregate();

            foreach (var domainEvent in events)
            {
                aggregate.ApplyEvent(domainEvent);
            }

            var visitor = _stateVisitorFactory.CreateStateVisitor();

            aggregate.AllowVisitor(visitor);

            return Task.FromResult(visitor.GetStateRepresentation());
        }
    }
}
