using AppilicationProcesserAPI.AggregateStates;

namespace AppilicationProcesserAPI.MessageQueue
{
    public class EventBackgroundProcessor : BackgroundService
    {
        private readonly IEventBroker _messageBroker;
        private readonly IAggregateEngine _aggregateEngine;
        private readonly ILogger<EventBackgroundProcessor> _logger;

        public EventBackgroundProcessor(IEventBroker messageBroker, IAggregateEngine aggregateEngine, ILogger<EventBackgroundProcessor> logger)
        {
            _messageBroker = messageBroker;
            _aggregateEngine = aggregateEngine;
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
                       await _aggregateEngine.HandleEvent(message.MessageData, stoppingToken).ConfigureAwait(false);
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
