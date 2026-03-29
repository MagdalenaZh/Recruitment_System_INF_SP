using AppilicationProcesserAPI.AggregateStates;

namespace AppilicationProcesserAPI.MessageQueue
{
    public class EmailManagerBackgroundProcessor : BackgroundService
    {
        private readonly IApplicationStatusManager _applicationStatusManager;
        private readonly ILogger<EmailManagerBackgroundProcessor> _logger;

        public EmailManagerBackgroundProcessor(IApplicationStatusManager applicationStatusManager, ILogger<EmailManagerBackgroundProcessor> logger)
        {
            _applicationStatusManager = applicationStatusManager;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var message = await _applicationStatusManager.GetApplicationStatus(stoppingToken);
                    if (message != null)
                    {
#warning Implement email sending logic here based on the application status in the message
                        _logger.LogInformation("Received application status update for ApplicationId: {ApplicationId}", message.MessageData.ApplicationId);
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
