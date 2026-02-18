using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.AggregateStates
{
    public class ApplicationConcludedState : IApplicationState
    {
        private readonly Guid _aggregateId;

        public ApplicationConcludedState(Guid aggregateId)
        {
            _aggregateId = aggregateId;
        }

        public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
        {
            
        }
    }
}
