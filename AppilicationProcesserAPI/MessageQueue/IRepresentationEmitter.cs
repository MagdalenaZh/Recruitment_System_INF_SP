using AppilicationProcesserAPI.Representations;
using System.Collections.Concurrent;
using System.Net.ServerSentEvents;
using System.Runtime.CompilerServices;
using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IRepresentationEmitter
    {
        ValueTask EmmitApplicationStateChanges(IStateRepresentation representation, DateTimeOffset timestamp, CancellationToken cancellationToken = default);

        IAsyncEnumerable<IStateRepresentation> ReadRepresentationsStates(Guid clientId, string? lastEventId, CancellationToken cancellationToken = default);
    }

    public class RepresentationEmitter : IRepresentationEmitter
    {
        private readonly ConcurrentQueue<SseItem<IStateRepresentation>> _buffer;
        private readonly ConcurrentDictionary<Guid, Channel<IStateRepresentation>> _clientQueues;
        private readonly int _capacity;
        private readonly ILogger<RepresentationEmitter> _logger;

        public RepresentationEmitter(ILogger<RepresentationEmitter> logger, int capacity = 500)
        {
            _buffer = new ConcurrentQueue<SseItem<IStateRepresentation>>();
            _clientQueues = new ConcurrentDictionary<Guid, Channel<IStateRepresentation>>();
            _logger = logger;
            _capacity = capacity;
        }

        public async ValueTask EmmitApplicationStateChanges(IStateRepresentation representation, DateTimeOffset timestamp, CancellationToken cancellationToken = default)
        {
            if (representation == null) throw new ArgumentNullException(nameof(representation));

            var sseItem = new SseItem<IStateRepresentation>(representation)
            {
                EventId = timestamp.ToString()
            };

            _buffer.Enqueue(sseItem);

            while (_buffer.Count >= _capacity)
            {
                _buffer.TryDequeue(out _);
            }

            var fanOutTasks = new List<Task>();

            foreach (var clientQueue in _clientQueues)
            {
                fanOutTasks.Add(clientQueue.Value.Writer.WriteAsync(representation, cancellationToken).AsTask());
            }

            await Task.WhenAll(fanOutTasks).ConfigureAwait(false);
        }

        public async IAsyncEnumerable<IStateRepresentation> ReadRepresentationsStates(Guid clientId, string? lastEventId, [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            _clientQueues.TryAdd(clientId, Channel.CreateBounded<IStateRepresentation>(new BoundedChannelOptions(_capacity)
            {
                FullMode = BoundedChannelFullMode.DropOldest
            }));

            try
            {
                if (!string.IsNullOrEmpty(lastEventId))
                {
                    var missedEvents = _buffer.SkipWhile(item => !string.Equals(item.EventId, lastEventId, StringComparison.InvariantCultureIgnoreCase)).Skip(1);
                    foreach (var events in missedEvents)
                        yield return events.Data;
                }

                await foreach(var representation in _clientQueues[clientId].Reader.ReadAllAsync(cancellationToken).ConfigureAwait(false))
                {
                   yield return representation;
                }
            }
            finally
            {
                _clientQueues.TryRemove(clientId, out _);
            }
        }
    }
}
