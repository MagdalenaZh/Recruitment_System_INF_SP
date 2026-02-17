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

public class ApplicationApproved : DomainEvent
{
    public Guid UserId { get; }

    public ApplicationApproved(Guid aggregateId, int version, Guid userId) : base(aggregateId, version)
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


