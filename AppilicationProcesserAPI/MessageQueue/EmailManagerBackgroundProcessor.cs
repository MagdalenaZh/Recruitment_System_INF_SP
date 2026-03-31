using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.PersistanceServices;

namespace AppilicationProcesserAPI.MessageQueue
{
    public class EmailManagerBackgroundProcessor : BackgroundService
    {
        private readonly ISystemManagementProvider _systemManagementProvider;
        private readonly IApplicationStatusManager _applicationStatusManager;
        private readonly ILogger<EmailManagerBackgroundProcessor> _logger;

        public EmailManagerBackgroundProcessor(ISystemManagementProvider systemManagementProvider, IApplicationStatusManager applicationStatusManager, ILogger<EmailManagerBackgroundProcessor> logger)
        {
            _systemManagementProvider = systemManagementProvider;
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
                        await _systemManagementProvider.UpdateApplicationStatusAsync(message, stoppingToken).ConfigureAwait(false);
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
