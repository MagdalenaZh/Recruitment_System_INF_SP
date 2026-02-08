namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageEnvelope
    {
        Guid AggregateId { get; }
        DateTimeOffset Timestamp { get; }

        Task RunPayload();
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

        public Task RunPayload()
        {
            return Task.CompletedTask;
            // Implement the logic to execute the payload of the message here.
            // This method can be overridden in derived classes to provide specific behavior for different message types.
        }
    }
}
