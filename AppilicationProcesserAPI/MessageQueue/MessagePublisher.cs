
using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public class MessagePublisher : IMessageBroker
    {
        private readonly Channel<IMessageEnvelope> _queue;
        private readonly ILogger<MessagePublisher> _logger;

        public MessagePublisher(ILogger<MessagePublisher> logger)
        {
            _logger = logger;
            _queue = Channel.CreateUnbounded<IMessageEnvelope>();
        }

        public ChannelReader<IMessageEnvelope> GetReader()
        {
            return _queue.Reader;
        }

        public async ValueTask PublishAsync(IMessageEnvelope message, CancellationToken cancellationToken = default)
        {
            if (message == null) throw new ArgumentNullException(nameof(message));

            _logger.LogInformation("Publishing message with AggregateId: {AggregateId} at {Timestamp}", message.AggregateId, message.Timestamp);

            await _queue.Writer.WriteAsync(message, cancellationToken);

            _logger.LogInformation("Message with AggregateId: {AggregateId} published successfully", message.AggregateId);

            return;
        }

        public async ValueTask PublishAsync<TMessage>(TMessage message, CancellationToken cancellationToken = default) where TMessage : IMessageEnvelope
        {
            if (message == null) throw new ArgumentNullException(nameof(message));

            _logger.LogInformation("Publishing message with AggregateId: {AggregateId} at {Timestamp}", message.AggregateId, message.Timestamp);

            await _queue.Writer.WriteAsync(message, cancellationToken);

            _logger.LogInformation("Message with AggregateId: {AggregateId} published successfully", message.AggregateId);

            return;
        }
    }
}
