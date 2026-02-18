namespace AppilicationProcesserAPI.DomainEvents;

public interface IDomainEvent
{
    public Guid AggregateId { get; }

    public DateTimeOffset Timestamp { get; }

    public int Version { get; }

    public DomainEventEnum EventType { get; }
}

public abstract class DomainEvent : IDomainEvent
{
    public Guid AggregateId { get; }
    public DateTimeOffset Timestamp { get; }
    public int Version { get; }

    protected DomainEvent(Guid aggregateId, int version)
    {
        AggregateId = aggregateId;
        Timestamp = DateTimeOffset.UtcNow;
        Version = version;
    }

    public abstract DomainEventEnum EventType { get; }
}

public class ApplicationSubmittedEvent : DomainEvent
{
    public int RequiredNumberOfApprovals { get; }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationCreated;
    public ApplicationSubmittedEvent(int requiredNumberOfApprovals)
        : base(Guid.NewGuid(), 1)
    {
        RequiredNumberOfApprovals = requiredNumberOfApprovals;
    }
}

public class ApplicationApprovedEvent : DomainEvent
{
    public Guid UserId { get; }

    public ApplicationApprovedEvent(Guid aggregateId, int version, Guid userId) : base(aggregateId, version)
    {
        UserId = userId;
    }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationApprovalIncremented;
}

public class ApplicationRejectedEvent : DomainEvent
{
    public Guid UserId { get; }

    public ApplicationRejectedEvent(Guid aggregateId, int version, Guid userId) : base(aggregateId, version)
    {
        UserId = userId;
    }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationApprovalDecremented;
}

public class SendInterviewProposalEvent : DomainEvent
{
    public string InterviewLocation { get; }
    public DateTimeOffset ProposedInterviewDateTime { get; }

    public SendInterviewProposalEvent(Guid aggregateId, int version, string interviewLocation, DateTimeOffset proposedTime) : base(aggregateId, version)
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
    public RemoveInterviewProposalEvent(Guid aggregateId, int version, string interviewLocation, DateTimeOffset removeDateTime) : base(aggregateId, version)
    {
        InterviewLocation = interviewLocation;
        RemovedInterviewDateTime = removeDateTime;
    }
    public override DomainEventEnum EventType => DomainEventEnum.ApplicationInterviewProposalAmended;
}

public class InterviewProposalAcceptedEvent : DomainEvent
{
    public DateTimeOffset AcceptedDateTime { get; }
    public InterviewProposalAcceptedEvent(Guid aggregateId, int version, DateTimeOffset acceptedDateTime) : base(aggregateId, version)
    {
       AcceptedDateTime = acceptedDateTime;
    }
    public override DomainEventEnum EventType => DomainEventEnum.ApplicationInterviewAccepted;
}

public class InterviewProposalRejectedEvent : DomainEvent
{
    public InterviewProposalRejectedEvent(Guid aggregateId, int version) : base(aggregateId, version)
    {
    }
    public override DomainEventEnum EventType => DomainEventEnum.ApplicationInterviewRejected;
}   


