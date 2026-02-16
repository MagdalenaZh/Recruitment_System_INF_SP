namespace AppilicationProcesserAPI.MessageQueue
{
    public class MessageBackgroundProcessor : BackgroundService
    {
        private readonly IMessageBroker _messageBroker;
        private readonly ILogger<MessageBackgroundProcessor> _logger;

        public MessageBackgroundProcessor(IMessageBroker messageBroker, ILogger<MessageBackgroundProcessor> logger)
        {
            _messageBroker = messageBroker;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
           while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var message = await _messageBroker.ConsumeAsync(stoppingToken);
                    if (message != null)
                    {
                        await message.RunPayload(stoppingToken);
                    }
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Message processor is shutting down.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing message.");
                }
            }
        }
    }
}
