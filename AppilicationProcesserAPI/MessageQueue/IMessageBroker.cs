using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageBroker
    {
        ValueTask PublishAsync(IMessageEnvelope message, CancellationToken cancellationToken = default);

        ValueTask<IMessageEnvelope> ConsumeAsync(CancellationToken cancellationToken = default);
    }

    public class MessageBroker : IMessageBroker
    {
        private readonly Channel<IMessageEnvelope> _queue;
        private readonly ILogger<MessageBroker> _logger;

        public MessageBroker(ILogger<MessageBroker> logger)
        {
            _logger = logger;
            _queue = Channel.CreateUnbounded<IMessageEnvelope>();
        }

        public async ValueTask<IMessageEnvelope> ConsumeAsync(CancellationToken cancellationToken = default)
        {
            return await _queue.Reader.ReadAsync(cancellationToken) is IMessageEnvelope message
                ? message
                : throw new InvalidOperationException($"Expected message of type {typeof(IMessageEnvelope).Name} but received a different type.");
        }

        public async ValueTask PublishAsync(IMessageEnvelope message, CancellationToken cancellationToken = default)
        {
            if (message == null) throw new ArgumentNullException(nameof(message));

            _logger.LogInformation("Publishing message with AggregateId: {AggregateId} at {Timestamp}", message.EventData.AggregateId, message.EventData.Timestamp);

            await _queue.Writer.WriteAsync(message, cancellationToken);

            _logger.LogInformation("Message with AggregateId: {AggregateId} published successfully", message.EventData.AggregateId);

            return;
        }
    }
}
