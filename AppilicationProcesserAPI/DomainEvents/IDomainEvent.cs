namespace AppilicationProcesserAPI.DomainEvents;

public interface IDomainEvent
{
    public Guid AggregateId { get; }

    public DateTimeOffset Timestamp { get; }

    public int Version { get; }

    public DomainEventEnum EventType { get; }

    public IApplicationState ApplicationState { get; }
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
    public abstract IApplicationState ApplicationState { get; }
}

public class ApplicationSubmittedEvent : DomainEvent
{
    public string ApplicantName { get; }
    public string ApplicantEmail { get; }
    public ApplicationSubmittedEvent(Guid aggregateId, int version, string applicantName, string applicantEmail)
        : base(aggregateId, version)
    {
        ApplicantName = applicantName;
        ApplicantEmail = applicantEmail;
    }

    public override DomainEventEnum EventType => DomainEventEnum.ApplicationCreated;

    public override IApplicationState ApplicationState => new InitialApplicationState();
}


