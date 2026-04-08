using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates;

public class HibernatedApplicationState : IApplicationState
{
    private readonly Guid _aggregateId;

    public HibernatedApplicationState(Guid aggregateId)
    {
        _aggregateId = aggregateId;
    }

    public void AcceptVisitor(IStateVisitor stateVisitor)
    {
        stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
        stateVisitor.PropertyBag.Set("WaitingFinalDecision", true);
        stateVisitor.Visit(this);
    }

    public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
    {
        switch (domainEvent)
        {
            case ApplicationRejectedEvent applicationRejectedEvent:
                applicationAggregate.TransitionToRejectedConcludedState(applicationRejectedEvent.AggregateId);
                break;
            case ApplicationAcceptedEvent applicationAcceptedEvent:
                applicationAggregate.TransitionToAcceptedConcludedState(applicationAcceptedEvent.AggregateId);
                break;
        }
    }
}
