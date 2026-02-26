using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates
{
    public interface IApplicationState
    {
        void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent);

        void AcceptVisitor(IStateVisitor stateVisitor);
    }

    public class InitialApplicationState : IApplicationState
    {
        private bool _applicationProcessed;

        public InitialApplicationState()
        {
            _applicationProcessed = false;
        }

        public void AcceptVisitor(IStateVisitor stateVisitor)
        {
            stateVisitor.PropertyBag.Set("ApplicationProcessed", _applicationProcessed);
            stateVisitor.Visit(this);
        }

        public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
        {
            if (domainEvent != null && domainEvent is ApplicationSubmittedEvent applicationSubmittedEvent)
            {
               applicationAggregate.TransitionToProcessingState(applicationSubmittedEvent.AggregateId, applicationSubmittedEvent.RequiredNumberOfApprovals);
                _applicationProcessed = true;
            }
        }
    }
}
