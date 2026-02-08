namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageEnvelope
    {
        Guid AggregateId { get; }
        DateTimeOffset Timestamp { get; }
    }
}
