namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageEnvelope
    {
        Guid AggregateId { get; }
        DateTimeOffset Timestamp { get; }
    }

    public class MessageEnvelope : IMessageEnvelope
    {
        public Guid AggregateId { get; }
        public DateTimeOffset Timestamp { get; }
        public MessageEnvelope(Guid aggregateId)
        {
            AggregateId = aggregateId;
            Timestamp = DateTimeOffset.UtcNow;
        }
    }
}
