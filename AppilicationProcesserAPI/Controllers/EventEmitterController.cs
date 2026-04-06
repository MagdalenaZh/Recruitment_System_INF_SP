using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Representations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("aplicationUpdates/{clientId}")]
        public ServerSentEventsResult<IStateRepresentation> GetAplicationUpdates([FromRoute] Guid clientId, [FromHeader(Name = "Last-Event-ID")] string? lastEventId, [FromHeader] HashSet<Guid> applicationIds, CancellationToken cancellationToken)
        {
            try
            {
                return TypedResults.ServerSentEvents(_messageEmitter.ReadRepresentationsStates(clientId, applicationIds, lastEventId, cancellationToken), "applicationUpdates");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting application updates");
                throw;
            }
        }
    }
}
