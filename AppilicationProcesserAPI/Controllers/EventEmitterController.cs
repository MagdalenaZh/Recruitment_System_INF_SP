using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Representations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace AppilicationProcesserAPI.Controllers
{
    [ApiController]
    public class EventEmitterController : ControllerBase
    {
        private readonly IRepresentationEmitter _messageEmitter;
        private readonly ILogger<EventEmitterController> _logger;

        public EventEmitterController(ILogger<EventEmitterController> logger, IRepresentationEmitter messageEmitter)
        {
            _logger = logger;
            _messageEmitter = messageEmitter;
        }

        [HttpGet("AplicationUpdates")]
        public ServerSentEventsResult<IStateRepresentation> GetAplicationUpdates([FromHeader(Name = "Last-Event-ID")] string? lastEventId, CancellationToken cancellationToken)
        {
            var client = Guid.NewGuid();

            try
            {
                return TypedResults.ServerSentEvents(_messageEmitter.ReadRepresentationsStates(client, lastEventId, cancellationToken), "applicationUpdates");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting application updates");
                throw;
            }
        }
    }
}
