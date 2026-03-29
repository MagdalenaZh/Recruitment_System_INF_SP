using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IEventBroker
    {
        ValueTask PublishAsync(EventEnvelope message, CancellationToken cancellationToken = default);

        ValueTask<EventEnvelope> ConsumeAsync(CancellationToken cancellationToken = default);
    }

    public class EventBroker : IEventBroker
    {
        private readonly Channel<EventEnvelope> _queue;
        private readonly ILogger<EventBroker> _logger;

        public EventBroker(ILogger<EventBroker> logger)
        {
            _logger = logger;
            _queue = Channel.CreateUnbounded<EventEnvelope>();
        }

        public async ValueTask<EventEnvelope> ConsumeAsync(CancellationToken cancellationToken = default)
        {
            return await _queue.Reader.ReadAsync(cancellationToken) is EventEnvelope message
                ? message
                : throw new InvalidOperationException($"Expected message of type {typeof(EventEnvelope).Name} but received a different type.");
        }

        public async ValueTask PublishAsync(EventEnvelope message, CancellationToken cancellationToken = default)
        {
            if (message == null) throw new ArgumentNullException(nameof(message));

            _logger.LogInformation("Publishing message with AggregateId: {AggregateId} at {Timestamp}", message.MessageData.AggregateId, message.MessageData.Timestamp);

            await _queue.Writer.WriteAsync(message, cancellationToken);

            _logger.LogInformation("Message with AggregateId: {AggregateId} published successfully", message.MessageData.AggregateId);

            return;
        }
    }
}
