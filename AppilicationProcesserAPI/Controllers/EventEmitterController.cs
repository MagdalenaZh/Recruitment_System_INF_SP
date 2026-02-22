using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Representations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace AppilicationProcesserAPI.Controllers
{
    [ApiController]
    public class EventEmitterController : ControllerBase
    {
        private readonly IMessageEmitter _messageEmitter;
        private readonly ILogger<EventEmitterController> _logger;

        public EventEmitterController(ILogger<EventEmitterController> logger, IMessageEmitter messageEmitter)
        {
            _logger = logger;
            _messageEmitter = messageEmitter;
        }

        [HttpGet("AplicationUpdates")]
        public ServerSentEventsResult<IStateRepresentation> GetAplicationUpdates([FromHeader(Name = "Last-Event-ID")] string? lastEventId, CancellationToken cancellationToken)
        {
            try
            {
                return TypedResults.ServerSentEvents(_messageEmitter.TransformToRepresentationState(cancellationToken), "applicationUpdates");
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "Error while getting application updates");
                return TypedResults.ServerSentEvents<IStateRepresentation>(null, "applicationUpdates");
            }   
        }
    }
}
