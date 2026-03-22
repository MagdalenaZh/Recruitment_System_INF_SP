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

public class ApplicationRejectedEvent : DomainEvent
{
    public Guid UserId { get; }

    public ApplicationRejectedEvent(Guid aggregateId, Guid userId) : base(aggregateId)
    {
        UserId = userId;
    }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationApprovalDecremented;
}

public class SendInterviewProposalEvent : DomainEvent
{
    public string InterviewLocation { get; }
    public DateTimeOffset ProposedInterviewDateTime { get; }

    public SendInterviewProposalEvent(Guid aggregateId, string interviewLocation, DateTimeOffset proposedTime) : base(aggregateId)
    {
        InterviewLocation = interviewLocation;
        ProposedInterviewDateTime = proposedTime;
    }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationInterviewProposed;
}

public class RemoveInterviewProposalEvent : DomainEvent
{
    public string InterviewLocation { get; }
    public DateTimeOffset RemovedInterviewDateTime { get; }
    public RemoveInterviewProposalEvent(Guid aggregateId, string interviewLocation, DateTimeOffset removeDateTime) : base(aggregateId)
    {
        InterviewLocation = interviewLocation;
        RemovedInterviewDateTime = removeDateTime;
    }
    public override DomainEventEnum EventType => DomainEventEnum.ApplicationInterviewProposalAmended;
}

public class InterviewProposalAcceptedEvent : DomainEvent
{
    public DateTimeOffset AcceptedDateTime { get; }
    public InterviewProposalAcceptedEvent(Guid aggregateId, DateTimeOffset acceptedDateTime) : base(aggregateId)
    {
       AcceptedDateTime = acceptedDateTime;
    }
    public override DomainEventEnum EventType => DomainEventEnum.ApplicationInterviewAccepted;
}

public class InterviewProposalRejectedEvent : DomainEvent
{
    public InterviewProposalRejectedEvent(Guid aggregateId) : base(aggregateId)
    {
    }
    public override DomainEventEnum EventType => DomainEventEnum.ApplicationInterviewRejected;
}   


