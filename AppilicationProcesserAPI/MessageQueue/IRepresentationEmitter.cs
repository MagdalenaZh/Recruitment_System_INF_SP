using AppilicationProcesserAPI.Representations;
using System.Runtime.CompilerServices;
using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IRepresentationEmitter
    {
        ValueTask EmmitApplicationStateChanges(IStateRepresentation stateVisitor, CancellationToken cancellationToken = default);

        IAsyncEnumerable<IStateRepresentation> ReadRepresentationStates(CancellationToken cancellationToken = default);
    }

    public class RepresentationEmitter : IRepresentationEmitter
    {
        private readonly Channel<IStateRepresentation> _queue;
        private readonly ILogger<RepresentationEmitter> _logger;
        public RepresentationEmitter(ILogger<RepresentationEmitter> logger)
        {
            _queue = Channel.CreateUnbounded<IStateRepresentation>();
            _logger = logger;
        }
        public async ValueTask EmmitApplicationStateChanges(IStateRepresentation representation, CancellationToken cancellationToken = default)
        {
            if (representation == null) throw new ArgumentNullException(nameof(representation));

            await _queue.Writer.WriteAsync(representation, cancellationToken);

            _logger.LogInformation("Emitted application state: {StateType}", representation.GetType().Name);

            return;
        }
        public async IAsyncEnumerable<IStateRepresentation> ReadRepresentationStates([EnumeratorCancellation]CancellationToken cancellationToken = default)
        {
            var representation = await _queue.Reader.ReadAsync(cancellationToken).ConfigureAwait(false);

            yield return representation;
        }
    }
}
