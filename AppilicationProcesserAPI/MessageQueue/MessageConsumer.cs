
using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public class MessageConsumer : BackgroundService
    {
        private readonly ChannelReader<IMessageEnvelope> _reader;
        private readonly MessageDispatcher _dispatcher;
        private readonly ILogger<MessageConsumer> _logger;

        public MessageConsumer(IMessageBroker messageBroker, MessageDispatcher messageDispatcher, ILogger<MessageConsumer> logger)
        {
            _reader = messageBroker.GetReader();
            _dispatcher = messageDispatcher;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await foreach (var messageEnvelope in _reader.ReadAllAsync(stoppingToken))
            {
                try
                {
                   _logger.LogInformation("Dispatching message with AggregateId: {AggregateId} at {Timestamp}", messageEnvelope.AggregateId, messageEnvelope.Timestamp);

                    await _dispatcher.DispatchAsync(messageEnvelope, stoppingToken);

                    _logger.LogInformation("Message with AggregateId: {AggregateId} dispatched successfully", messageEnvelope.AggregateId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error dispatching message with AggregateId: {AggregateId} at {Timestamp}", messageEnvelope.AggregateId, messageEnvelope.Timestamp);
                }
            }
        }
    }
}
