using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.AggregateStates
{
    public interface IApplicationState
    {
        void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent);
    }

    public class InitialApplicationState : IApplicationState
    {
        public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
        {
            if (domainEvent != null && domainEvent is ApplicationSubmittedEvent applicationSubmittedEvent)
            {
               applicationAggregate.TransitionToProcessingState(applicationSubmittedEvent.AggregateId, applicationSubmittedEvent.RequiredNumberOfApprovals);
            }
        }
    }
}
