using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.Representations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AppilicationProcesserAPI.Controllers
{
    [ApiController]
    public class AplicationProcessingController : ControllerBase
    {
        private readonly IEventStore _eventStore;
        private readonly ICalendarProvider _calendarProvider;
        private readonly IEventBroker _messageBroker;
        private readonly IRecruitmentDataProvider _recruitmentDataProvider;
        private readonly ILogger<AplicationProcessingController> _logger;

        public AplicationProcessingController(IEventStore eventStore, ICalendarProvider calendarProvider,
            IEventBroker messageBroker, IRecruitmentDataProvider recruitmentDataProvider, ILogger<AplicationProcessingController> logger)
        {
            _eventStore = eventStore;
            _calendarProvider = calendarProvider;
            _messageBroker = messageBroker;
            _recruitmentDataProvider = recruitmentDataProvider;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("api/submit-application")]
        public async Task<IActionResult> SubmitApplication([FromBody] ApplicationSubmissionData applicationData, CancellationToken cancellationToken)
        {
            if(User == null)
                return Unauthorized();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            var applicationId = Guid.NewGuid();

            await _eventStore.CreateApplication(userId, applicationId, applicationData, cancellationToken).ConfigureAwait(false);

            var requiredNumberOfApprovals = await _recruitmentDataProvider.GetRequiredNumberOfApprovalsForDepartmentAsync(applicationData.DepartmentId, cancellationToken).ConfigureAwait(false);

            var domainEvent = new ApplicationSubmittedEvent(applicationId, requiredNumberOfApprovals);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new EventEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application processing message published for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return Accepted(new { message = "Application processing started.", applicationId = message.MessageData.AggregateId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [Authorize]
        [HttpPost("api/approve-application/{applicationId}")]
        public async Task<IActionResult> ApproveApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            if (User == null)
                return Unauthorized();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            var domainEvent = new ApplicationApprovedEvent(applicationId, userId);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new EventEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application processing message published for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [Authorize]
        [HttpPost("api/after-interview-approve-application/{applicationId}")]
        public async Task<IActionResult> AfterInterviewApproveApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            if (User == null)
                return Unauthorized();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            var domainEvent = new AfterInterviewApprovedEvent(applicationId, userId);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new EventEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application processing message published for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [Authorize]
        [HttpPost("api/after-interview-disapprove-application/{applicationId}")]
        public async Task<IActionResult> AfterInterviewDisapproveApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            if (User == null)
                return Unauthorized();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);
            var domainEvent = new AfterInterviewDisapprovedEvent(applicationId, userId);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new EventEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application processing message published for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [Authorize]
        [HttpPost("api/disapprove-application/{applicationId}")]
        public async Task<IActionResult> DisapproveApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            if (User == null)
                return Unauthorized();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);
            var domainEvent = new ApplicationDisapprovedEvent(applicationId, userId);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new EventEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application processing message published for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [Authorize]
        [HttpPost("api/reject-interview-proposal/{applicationId}")]
        public async Task<IActionResult> RejectInterviewProposal([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            if (User == null)
                return Unauthorized();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);
            var domainEvent = new InterviewProposalRejectedEvent(applicationId);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new EventEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application processing message published for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [Authorize]
        [HttpPut("api/book-interview-slot/{applicationId}")]
        public async Task<IActionResult> BookInterviewSlot([FromRoute] Guid applicationId, [FromBody] InterviewSlot interviewSlot, CancellationToken cancellationToken)
        {
            if (User == null)
                return Unauthorized();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var userId = Guid.Parse(userIdClaim.Value);

            await _calendarProvider.BookInterviewSlotAsync(interviewSlot.SlotId, applicationId, cancellationToken).ConfigureAwait(false);

            var domainEvent = new BookInterviewSlotEvent(applicationId, interviewSlot);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new EventEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Interview Slot booked for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [Authorize]
        [HttpPut("api/conclude-reject-application/{applicationId}")]
        public async Task<IActionResult> ConcludeRejectedApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            if (User == null)
                return Unauthorized();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var domainEvent = new ApplicationRejectedEvent(applicationId);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new EventEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application Ended for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }

        [Authorize]
        [HttpPut("api/conclude-accept-application/{applicationId}")]
        public async Task<IActionResult> ConcludeAcceptedApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            if (User == null)
                return Unauthorized();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();
            var domainEvent = new ApplicationAcceptedEvent(applicationId);

            await _eventStore.AppendEventAsync(domainEvent, cancellationToken).ConfigureAwait(false);

            var message = new EventEnvelope(domainEvent);

            try
            {
                await _messageBroker.PublishAsync(message, cancellationToken);
                _logger.LogInformation("Application Ended for ApplicationId: {ApplicationId}", applicationId);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing application processing message for ApplicationId: {ApplicationId}", message.MessageData.AggregateId);
                return StatusCode(500, "An error occurred while processing the application.");
            }
        }
    }
}
