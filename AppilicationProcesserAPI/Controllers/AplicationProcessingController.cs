using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using Microsoft.AspNetCore.Mvc;

namespace AppilicationProcesserAPI.Controllers
{
    [ApiController]
    public class AplicationProcessingController : ControllerBase
    {
        private readonly IMessageBroker _messageBroker;
        private readonly ILogger<AplicationProcessingController> _logger;

        public AplicationProcessingController(IMessageBroker messageBroker, ILogger<AplicationProcessingController> logger)
        {
            _messageBroker = messageBroker;
            _logger = logger;
        }


        [HttpPost("api/process-application")]
        public async Task<IActionResult> ProcessApplication(CancellationToken cancellationToken)
        {
            var message = new MessageEnvelope(
                new ApplicationSubmittedEvent(Guid.NewGuid(), version: 1, "user", "user@email.test"));

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application processing message published for ApplicationId: {ApplicationId}", message.EventData.AggregateId);
                return Accepted(new { message = "Application processing started.", applicationId = message.EventData.AggregateId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.EventData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }
    }
}
