using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates;

public class ApplicationApprovedState : IApplicationState
{
    private readonly Guid _aggregateId;
    private readonly int _currentNumberOfApprovals;
    private readonly int _requiredNumberOfApprovals;
    private readonly Dictionary<Guid, bool> _userDecisionsMap;

    public ApplicationApprovedState(Guid aggregateId, int currentNumberOfApprovals, int requiredNumberOfApprovals, Dictionary<Guid, bool> userDecisionsMap)
    {
        _aggregateId = aggregateId;
        _currentNumberOfApprovals = currentNumberOfApprovals;
        _requiredNumberOfApprovals = requiredNumberOfApprovals;
        _userDecisionsMap = userDecisionsMap;
    }

    public void AcceptVisitor(IStateVisitor stateVisitor)
    {
        stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
        stateVisitor.PropertyBag.Set("ApplicationApproved", true);
        stateVisitor.PropertyBag.Set("CurrentNumberOfApprovals", _currentNumberOfApprovals);
        stateVisitor.PropertyBag.Set("RequiredNumberOfApprovals", _requiredNumberOfApprovals);
        stateVisitor.PropertyBag.Set("UserDecisionsMap", _userDecisionsMap);
        stateVisitor.Visit(this);
    }

    public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
    {
        ArgumentNullException.ThrowIfNull(domainEvent);
        if (domainEvent.AggregateId != _aggregateId) throw new InvalidOperationException($"Domain event with AggregateId {domainEvent.AggregateId} does not match the aggregate's ID {_aggregateId}.");

        switch (domainEvent)
        {
            case BookInterviewSlotEvent interviewProposalAcceptedEvent:
                {
                    applicationAggregate.TransitionToInterviewScheduledState(_aggregateId, interviewProposalAcceptedEvent.BookedSlot, _requiredNumberOfApprovals);
                }
                break;
            case InterviewProposalRejectedEvent:
                {
                    applicationAggregate.TransitionToRejectedConcludedState(_aggregateId);
                    break;
                }
            case ApplicationRejectedEvent applicationRejectedEvent:
                {
                    applicationAggregate.TransitionToRejectedConcludedState(applicationRejectedEvent.AggregateId);
                }
                break;
        }
    }
}
