using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates;

public class ApplicationApprovedState : IApplicationState
{
    private readonly Guid _aggregateId;

    public ApplicationApprovedState(Guid aggregateId)
    {
        _aggregateId = aggregateId;
    }

    public void AcceptVisitor(IStateVisitor stateVisitor)
    {
        stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
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
                    applicationAggregate.TransitionToInterviewScheduledState(_aggregateId, interviewProposalAcceptedEvent.BookedSlot);
                }
                break;
            case InterviewProposalRejectedEvent:
                {
                    applicationAggregate.TransitionToRejectedConcludedState(_aggregateId);
                }
                break;
        }
    }
}
