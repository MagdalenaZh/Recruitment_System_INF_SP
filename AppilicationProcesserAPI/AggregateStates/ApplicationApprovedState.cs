using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates;

public class ApplicationApprovedState : IApplicationState
{
    private readonly HashSet<DateTimeOffset> _interviewTimesProposals;

    private readonly Guid _aggregateId;

    public ApplicationApprovedState(Guid aggregateId)
    {
        _aggregateId = aggregateId;
        _interviewTimesProposals = new HashSet<DateTimeOffset>();
    }

    public void AcceptVisitor(IStateVisitor stateVisitor)
    {
        stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
        stateVisitor.PropertyBag.Set("InterviewTimesProposals", _interviewTimesProposals.ToList()); 
    }

    public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
    {
        ArgumentNullException.ThrowIfNull(domainEvent);
        if (domainEvent.AggregateId != _aggregateId) throw new InvalidOperationException($"Domain event with AggregateId {domainEvent.AggregateId} does not match the aggregate's ID {_aggregateId}.");

        switch (domainEvent)
        {
            case SendInterviewProposalEvent sendInterviewProposalEvent:
                {
                    _interviewTimesProposals.Add(sendInterviewProposalEvent.ProposedInterviewDateTime);
                }
                break;
            case RemoveInterviewProposalEvent removeInterviewProposalEvent:
                {
                    _interviewTimesProposals.Remove(removeInterviewProposalEvent.RemovedInterviewDateTime);
                }
                break;
            case InterviewProposalAcceptedEvent interviewProposalAcceptedEvent:
                {
                    applicationAggregate.TransitionToInterviewScheduledState(_aggregateId, interviewProposalAcceptedEvent.AcceptedDateTime);
                }
                break;
            case InterviewProposalRejectedEvent:
                {
                    applicationAggregate.TransitionToConcludedState(_aggregateId, "Rejected");
                }
                break;
        }
    }
}
