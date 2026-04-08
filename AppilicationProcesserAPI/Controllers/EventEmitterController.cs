using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Representations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AppilicationProcesserAPI.Controllers
{
    [ApiController]
    [Route("api/eventEmmitter")]
    public class EventEmitterController : ControllerBase
    {
        private readonly IRepresentationEmitter _messageEmitter;
        private readonly ILogger<EventEmitterController> _logger;

        public EventEmitterController(ILogger<EventEmitterController> logger, IRepresentationEmitter messageEmitter)
        {
            _logger = logger;
            _messageEmitter = messageEmitter;
        }

        [Authorize]
        [HttpGet("aplicationUpdates")]
        public ServerSentEventsResult<IStateRepresentation> GetAplicationUpdates([FromHeader(Name = "Last-Event-ID")] string? lastEventId, [FromHeader] HashSet<Guid> applicationIds, CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            var userId = Guid.Parse(userIdClaim.Value);

            try
            {
                return TypedResults.ServerSentEvents(_messageEmitter.ReadRepresentationsStates(userId, applicationIds, lastEventId, cancellationToken), "applicationUpdates");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting application updates");
                throw;
            }
        }
    }
}
