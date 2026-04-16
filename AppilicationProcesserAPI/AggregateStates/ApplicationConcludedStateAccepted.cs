using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates
{
    public class ApplicationConcludedStateAccepted : IApplicationState
    {
        private readonly Guid _aggregateId;
        private readonly ApplicationStatus _conclusionResult;

        public ApplicationConcludedStateAccepted(Guid aggregateId)
        {
            _aggregateId = aggregateId;
            _conclusionResult = ApplicationStatus.Accepted;
        }

        public void AcceptVisitor(IStateVisitor stateVisitor)
        {
            stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
            stateVisitor.PropertyBag.Set("ConclusionResult", _conclusionResult);
            stateVisitor.Visit(this);
        }

        public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
        {
            //just ignore events for concluded applications
            return;
        }
    }
}
