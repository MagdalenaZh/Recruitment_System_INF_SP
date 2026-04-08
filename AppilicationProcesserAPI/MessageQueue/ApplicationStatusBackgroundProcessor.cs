using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.PersistanceServices;

namespace AppilicationProcesserAPI.MessageQueue
{
    public class ApplicationStatusBackgroundProcessor : BackgroundService
    {
        private readonly IApplicationFinalizer _applicationFinalizer;
        private readonly IApplicationStatusManager _applicationStatusManager;
        private readonly ILogger<ApplicationStatusBackgroundProcessor> _logger;

        public ApplicationStatusBackgroundProcessor(IApplicationFinalizer applicationFinalizer, IApplicationStatusManager applicationStatusManager, ILogger<ApplicationStatusBackgroundProcessor> logger)
        {
            _applicationFinalizer = applicationFinalizer;
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
                        await _applicationFinalizer.UpdateApplicationStatusAsync(message, stoppingToken).ConfigureAwait(false);
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
