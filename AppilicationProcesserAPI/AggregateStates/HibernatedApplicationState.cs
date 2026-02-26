using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates;

public class HibernatedApplicationState : IApplicationState
{
    private readonly Guid _aggregateId;

    private readonly DateTimeOffset _scheduledTime;

    public HibernatedApplicationState(Guid aggregateId, DateTimeOffset scheduledInterviewTime)
    {
        _aggregateId = aggregateId;
        _scheduledTime = scheduledInterviewTime;
    }

    public void AcceptVisitor(IStateVisitor stateVisitor)
    {
        stateVisitor.PropertyBag.Set("ApplicationId", _aggregateId);
        stateVisitor.PropertyBag.Set("ScheduledTime", _scheduledTime);
        stateVisitor.Visit(this);
    }

    public void HandleEvent(ApplicationAggregate applicationAggregate, IDomainEvent domainEvent)
    {
        //wait for the scheduled time to transition to the next state
    }
}
