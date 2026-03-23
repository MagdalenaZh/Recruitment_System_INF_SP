using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.Data;

namespace AppilicationProcesserAPI.DomainEvents;

public interface IDomainEvent
{
    public Guid AggregateId { get; }

    public DateTimeOffset Timestamp { get; }

    public DomainEventEnum EventType { get; }
}

public abstract class DomainEvent : IDomainEvent
{
    public Guid AggregateId { get; }
    public DateTimeOffset Timestamp { get; }

    protected DomainEvent(Guid aggregateId)
    {
        AggregateId = aggregateId;
        Timestamp = DateTimeOffset.UtcNow;
    }

    public abstract DomainEventEnum EventType { get; }
}

public class ApplicationSubmittedEvent : DomainEvent
{
    public int RequiredNumberOfApprovals { get; }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationCreated;
    public ApplicationSubmittedEvent(Guid aggregateId, int requiredNumberOfApprovals)
        : base(aggregateId)
    {
        RequiredNumberOfApprovals = requiredNumberOfApprovals;
    }
}

public class ApplicationApprovedEvent : DomainEvent
{
    public Guid UserId { get; }

    public ApplicationApprovedEvent(Guid aggregateId, Guid userId) : base(aggregateId)
    {
        UserId = userId;
    }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationApprovalIncremented;
}

public class ApplicationDisapprovedEvent : DomainEvent
{
    public Guid UserId { get; }

    public ApplicationDisapprovedEvent(Guid aggregateId, Guid userId) : base(aggregateId)
    {
        UserId = userId;
    }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationApprovalDecremented;
}

public class BookInterviewSlotEvent : DomainEvent
{
    public InterviewSlot BookedSlot { get; }
    public BookInterviewSlotEvent(Guid aggregateId, InterviewSlot interviewSlot) : base(aggregateId)
    {
        BookedSlot = interviewSlot;
    }
    public override DomainEventEnum EventType => DomainEventEnum.BookInterviewSlot;
}

public class InterviewProposalRejectedEvent : DomainEvent
{
    public InterviewProposalRejectedEvent(Guid aggregateId) : base(aggregateId)
    {
    }
    public override DomainEventEnum EventType => DomainEventEnum.ApplicationInterviewRejected;
}

public class ApplicationAcceptedEvent : DomainEvent
{
    public ApplicationAcceptedEvent(Guid aggregateId) : base(aggregateId)
    {
    }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationAccepted;
}

public class ApplicationRejectedEvent : DomainEvent
{
    public ApplicationRejectedEvent(Guid aggregateId) : base(aggregateId)
    {
    }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationRejected;
} 


