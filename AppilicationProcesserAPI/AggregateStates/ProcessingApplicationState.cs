using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates;

public class ProcessingApplicationState : IApplicationState
{

    private readonly Dictionary<Guid, bool> _userDecisionsMap;
    private int _numberOfApprovals;
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
        stateVisitor.Visit(this);
    }

    public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
    {
        ArgumentNullException.ThrowIfNull(domainEvent);
        if (domainEvent.AggregateId != _aggregateId) throw new InvalidOperationException($"Domain event with AggregateId {domainEvent.AggregateId} does not match the aggregate's ID");

        switch (domainEvent)
        {
            case ApplicationApprovedEvent applicationApprovedEvent:
                {
                    _userDecisionsMap[applicationApprovedEvent.UserId] = true;
                    _numberOfApprovals++;

                    if (_numberOfApprovals >= _requiredNumberOfApprovals)
                    {
                        applicationAggregate.TransitionToApprovedState(_aggregateId, _requiredNumberOfApprovals);
                    }
                }
                break;
            case ApplicationDisapprovedEvent applicationRejectedEvent:
                {
                    if (_userDecisionsMap.TryGetValue(applicationRejectedEvent.UserId, out var previousDecision))
                    {
                        if (previousDecision)
                        {
                            _numberOfApprovals--;
                        }
                    }

                    _userDecisionsMap[applicationRejectedEvent.UserId] = false;
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
