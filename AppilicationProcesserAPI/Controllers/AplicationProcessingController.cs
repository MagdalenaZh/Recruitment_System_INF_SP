using AppilicationProcesserAPI.Data;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.PersistanceServices;
using Microsoft.AspNetCore.Mvc;

namespace AppilicationProcesserAPI.Controllers
{
    [ApiController]
    public class AplicationProcessingController : ControllerBase
    {
        private readonly IEventStore _eventStore;
        private readonly ICalendarProvider _calendarProvider;
        private readonly IMessageBroker _messageBroker;
        private readonly ILogger<AplicationProcessingController> _logger;

        public AplicationProcessingController(IEventStore eventStore, ICalendarProvider calendarProvider, IMessageBroker messageBroker, ILogger<AplicationProcessingController> logger)
        {
            _eventStore = eventStore;
            _calendarProvider = calendarProvider;
            _messageBroker = messageBroker;
            _logger = logger;
        }

        [HttpPost("api/submit-application")]
        public async Task<IActionResult> SubmitApplication([FromBody] ApplicationData applicationData, CancellationToken cancellationToken)
        {
            var applicationId = Guid.NewGuid();

            await _eventStore.InsertApplication(applicationId, applicationData, cancellationToken).ConfigureAwait(false);

            //get number of approvals from Clubs table
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

        [HttpPost("api/approve-application/{applicationId}")]
        public async Task<IActionResult> ApproveApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            //get userId from claims
            var domainEvent = new ApplicationApprovedEvent(applicationId, Guid.NewGuid());

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new MessageEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application processing message published for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.EventData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [HttpPut("api/book-interview-slot/{applicationId}/{slotId}")]
        public async Task<IActionResult> BookInterviewSlot([FromRoute] Guid applicationId, [FromRoute] Guid slotId, CancellationToken cancellationToken)
        {
            if (!await _calendarProvider.IsSlotAvailableAsync(slotId, cancellationToken).ConfigureAwait(false))
            {
                return BadRequest("Slot already booked");
            }

            var interviewSlot = await _calendarProvider.BookInterviewSlotAsync(slotId, applicationId, cancellationToken).ConfigureAwait(false);

            var domainEvent = new BookInterviewSlotEvent(applicationId, interviewSlot);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new MessageEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Interview Slot booked for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.EventData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [HttpPut("api/conclude-reject-application/{applicationId}")]
        public async Task<IActionResult> ConcludeRejectedApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
           var domainEvent = new ApplicationRejectedEvent(applicationId);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new MessageEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application Ended for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.EventData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [HttpPut("api/conclude-accept-application/{applicationId}")]
        public async Task<IActionResult> ConcludeAcceptedApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            var domainEvent = new ApplicationAcceptedEvent(applicationId);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new MessageEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application Ended for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.EventData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }
    }
}
