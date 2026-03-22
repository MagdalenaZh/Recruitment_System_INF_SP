using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using Microsoft.AspNetCore.Mvc;

namespace AppilicationProcesserAPI.Controllers
{
    [ApiController]
    public class AplicationProcessingController : ControllerBase
    {
        private readonly IEventStore _eventStore;
        private readonly IMessageBroker _messageBroker;
        private readonly ILogger<AplicationProcessingController> _logger;

        public AplicationProcessingController(IEventStore eventStore, IMessageBroker messageBroker, ILogger<AplicationProcessingController> logger)
        {
            _eventStore = eventStore;
            _messageBroker = messageBroker;
            _logger = logger;
        }

        [HttpPost("api/submit-application")]
        public async Task<IActionResult> ProcessApplication(ApplicationData applicationData, CancellationToken cancellationToken)
        {
            var applicationId = Guid.NewGuid();

            await _eventStore.InsertApplication(applicationId, applicationData, cancellationToken).ConfigureAwait(false);

            var domainEvent = new ApplicationSubmittedEvent(applicationId, 3);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new MessageEnvelope(domainEvent);

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

        [HttpPost("api/approve-application/{aggregateId}")]
        public async Task<IActionResult> ApproveApplication([FromRoute]Guid aggregateId, CancellationToken cancellationToken)
        {
            var domainEvent = new ApplicationApprovedEvent(aggregateId, Guid.NewGuid());

            await _eventStore.AppendEventAsync(domainEvent).ConfigureAwait(false);

            var message = new MessageEnvelope(domainEvent);

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
