using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates
{
    public class ApplicationConcludedState : IApplicationState
    {
        private readonly Guid _aggregateId;
        private readonly string _conclusionResult;

        public ApplicationConcludedState(Guid aggregateId, string conclusionResult)
        {
            _aggregateId = aggregateId;
            _conclusionResult = conclusionResult;
        }

        public void AcceptVisitor(IStateVisitor stateVisitor)
        {
            stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
            stateVisitor.PropertyBag.Set("ConclusionResult", _conclusionResult);
        }

        public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
        {
            throw new ArgumentOutOfRangeException(nameof(domainEvent), "Application has concluded, no more events can be processed");
        }
    }
}
