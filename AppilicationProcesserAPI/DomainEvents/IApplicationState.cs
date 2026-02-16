namespace AppilicationProcesserAPI.DomainEvents
{
    public interface IApplicationState
    {
        public void SetContext(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent);
    }

    public class InitialApplicationState : IApplicationState
    {
        public void SetContext(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
        {
            // do nothing, this is the initial state
        }
    }
}
