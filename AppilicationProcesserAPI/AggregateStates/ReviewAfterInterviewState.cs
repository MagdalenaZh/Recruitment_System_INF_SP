using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates
{
    public class ReviewAfterInterviewState : IApplicationState
    {
        private int _numberOfApprovals;
        private readonly Dictionary<Guid, bool> _userDecisionsMap;

        private readonly Guid _aggregateId;
        private readonly int _requiredNumberOfApprovals;
        private readonly InterviewSlot _interviewSlot;

        public ReviewAfterInterviewState(Guid aggregateId, InterviewSlot interviewSlot, int requiredNumberOfApprovals)
        {
            _aggregateId = aggregateId;
            _interviewSlot = interviewSlot;
            _requiredNumberOfApprovals = requiredNumberOfApprovals;
            _numberOfApprovals = 0;
            _userDecisionsMap = new Dictionary<Guid, bool>();
        }

        public void AcceptVisitor(IStateVisitor stateVisitor)
        {
            stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
            stateVisitor.PropertyBag.Set("CurrentNumberOfPostInterviewApprovals", _numberOfApprovals);
            stateVisitor.PropertyBag.Set("RequiredNumberOfApprovals", _requiredNumberOfApprovals);
            stateVisitor.PropertyBag.Set("UserDecisionsMap", _userDecisionsMap);
            stateVisitor.PropertyBag.Set("ScheduledTime", _interviewSlot);
            stateVisitor.Visit(this);
        }

        public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
        {
            ArgumentNullException.ThrowIfNull(domainEvent);
            if (domainEvent.AggregateId != _aggregateId) throw new InvalidOperationException($"Domain event with AggregateId {domainEvent.AggregateId} does not match the aggregate's ID");

            if (domainEvent.Timestamp > _interviewSlot.EndTime)
            {
                switch (domainEvent)
                {
                    case AfterInterviewApprovedEvent applicationApprovedEvent:
                        {
                            _numberOfApprovals++;
                            _userDecisionsMap[applicationApprovedEvent.UserId] = true;
                            if (_numberOfApprovals >= _requiredNumberOfApprovals)
                            {
                                applicationAggregate.TransitionToWaitForFinalDecisionState(_aggregateId);
                            }
                        }
                        break;
                    case AfterInterviewDisapprovedEvent applicationDisapprovedEvent:
                        {
                            _userDecisionsMap[applicationDisapprovedEvent.UserId] = false;
                        }
                        break;
                    case ApplicationRejectedEvent applicationRejectedEvent:
                        {
                            applicationAggregate.TransitionToRejectedConcludedState(applicationRejectedEvent.AggregateId);
                        }
                        break;
                }
            }
        }
    }
}
