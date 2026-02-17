namespace AppilicationProcesserAPI.DomainEvents
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
                applicationAggregate = new ApplicationAggregate(domainEvent.AggregateId, applicationSubmittedEvent.RequiredNumberOfApprovals);
                return;
            }
            applicationAggregate.TransitionToHibernatedState();
        }
    }

    public class HibernatedApplicationState : IApplicationState
    {
        private int _numberOfApprovals;
        private readonly Dictionary<Guid, bool> _userDecisionsMap;

        public HibernatedApplicationState() 
        {
            _numberOfApprovals = 0;
            _userDecisionsMap = new Dictionary<Guid, bool>();
        }

        public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
        {
            switch (domainEvent)
            {
                case ApplicationApproved applicationApprovedEvent:
                    {
                        _numberOfApprovals++;
                        _userDecisionsMap[applicationApprovedEvent.UserId] = true;
                        if(applicationAggregate.RequiredNumberOfApprovals <= _numberOfApprovals)
                        {
                           //
                        }
                    }break;
            }
        }
    }
}
