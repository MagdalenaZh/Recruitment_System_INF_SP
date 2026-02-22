using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.Representations;
using System.Runtime.CompilerServices;
using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageEmitter
    {
        ValueTask EmmitApplicationState(IApplicationState state, CancellationToken cancellationToken = default);

        IAsyncEnumerable<IStateRepresentation> TransformToRepresentationState(CancellationToken cancellationToken = default);
    }

    public class MessageEmitter : IMessageEmitter
    {
        private readonly Channel<IApplicationState> _queue;
        private readonly ILogger<MessageEmitter> _logger;
        public MessageEmitter(IMessageBroker messageEmitter, ILogger<MessageEmitter> logger)
        {
            _queue = Channel.CreateUnbounded<IApplicationState>();
            _logger = logger;
        }
        public async ValueTask EmmitApplicationState(IApplicationState state, CancellationToken cancellationToken = default)
        {
            if (state == null) throw new ArgumentNullException(nameof(state));

            await _queue.Writer.WriteAsync(state, cancellationToken);

            _logger.LogInformation("Emitted application state: {StateType}", state.GetType().Name);

            return;
        }
        public async IAsyncEnumerable<IStateRepresentation> TransformToRepresentationState([EnumeratorCancellation]CancellationToken cancellationToken = default)
        {
            var state = await _queue.Reader.ReadAsync(cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("Transformed application state to representation: {StateType}", state.GetType().Name);

            // switch (state)

            yield return new StateRepresentation(Guid.NewGuid(), state);
        }
    }
}
