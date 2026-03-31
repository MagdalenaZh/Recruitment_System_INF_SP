using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates
{
    public class ApplicationConcludedStateRejected : IApplicationState
    {
        private readonly Guid _aggregateId;
        private readonly ApplicationStatus _conclusionResult;

        public ApplicationConcludedStateRejected(Guid aggregateId)
        {
            _aggregateId = aggregateId;
            _conclusionResult = ApplicationStatus.Rejected;
        }

        public void AcceptVisitor(IStateVisitor stateVisitor)
        {
            stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
            stateVisitor.PropertyBag.Set("ConclusionResult", _conclusionResult);
            stateVisitor.Visit(this);
        }

        public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
        {
            throw new ArgumentOutOfRangeException(nameof(domainEvent), "Application has concluded, no more events can be processed");
        }
    }
}
