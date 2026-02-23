using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates;

public class ProcessingApplicationState : IApplicationState
{
    private int _numberOfApprovals;
    private readonly Dictionary<Guid, bool> _userDecisionsMap;

    private readonly Guid _aggregateId;
    private readonly int _requiredNumberOfApprovals;

    public ProcessingApplicationState(Guid aggregateId, int requiredNumberOfApprovals)
    {
        _aggregateId = aggregateId;
        _requiredNumberOfApprovals = requiredNumberOfApprovals;
        _numberOfApprovals = 0;
        _userDecisionsMap = new Dictionary<Guid, bool>();
    }

    public void AcceptVisitor(IStateVisitor stateVisitor)
    {
        stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
        stateVisitor.PropertyBag.Set("CurrentNumberOfApprovals", _numberOfApprovals);
        stateVisitor.PropertyBag.Set("RequiredNumberOfApprovals", _requiredNumberOfApprovals);
        stateVisitor.PropertyBag.Set("UserDecisionsMap", _userDecisionsMap);
    }

    public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
    {
        ArgumentNullException.ThrowIfNull(domainEvent);
        if (domainEvent.AggregateId != _aggregateId) throw new InvalidOperationException($"Domain event with AggregateId {domainEvent.AggregateId} does not match the aggregate's ID");
        
        switch (domainEvent)
        {
            case ApplicationApprovedEvent applicationApprovedEvent:
                {
                    _numberOfApprovals++;
                    _userDecisionsMap[applicationApprovedEvent.UserId] = true;
                    if (_numberOfApprovals >= _requiredNumberOfApprovals)
                    {
                        applicationAggregate.TransitionToApprovedState(_aggregateId);
                    }
                }
                break;
            case ApplicationRejectedEvent applicationRejectedEvent:
                {
                    _userDecisionsMap[applicationRejectedEvent.UserId] = false;
                }
                break;
        }
    }
}
