using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.AggregateStates;

public class HibernatedApplicationState : IApplicationState
{
    private readonly Guid _aggregateId;

    private readonly InterviewSlot _scheduledTime;

    public HibernatedApplicationState(Guid aggregateId, InterviewSlot scheduledInterviewTime)
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
        //skip all events before the scheduled interview slot
        if(domainEvent.Timestamp > _scheduledTime.EndTime)
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
}
