using AppilicationProcesserAPI.Representations;
using System.Collections.Concurrent;
using System.Net.ServerSentEvents;
using System.Runtime.CompilerServices;
using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IRepresentationEmitter
    {
        ValueTask EmmitApplicationStateChanges(IStateRepresentation representation, DateTimeOffset timestamp, CancellationToken cancellationToken);

        IAsyncEnumerable<IStateRepresentation> ReadRepresentationsStates(Guid clientId, HashSet<Guid> applicationIds, string? lastEventId, CancellationToken cancellationToken);
    }

    public class RepresentationEmitter : IRepresentationEmitter
    {
        private readonly ConcurrentDictionary<Guid, ConcurrentQueue<SseItem<IStateRepresentation>>> _buffer;
        private readonly ConcurrentDictionary<Guid, HashSet<Guid>> _applicationsToUsersMap;
        private readonly ConcurrentDictionary<Guid, Channel<IStateRepresentation>> _clientQueues;
        private readonly int _capacity;
        private readonly ILogger<RepresentationEmitter> _logger;

        public RepresentationEmitter(ILogger<RepresentationEmitter> logger, int capacity = 500)
        {
            _buffer = new ConcurrentDictionary<Guid, ConcurrentQueue<SseItem<IStateRepresentation>>>();
            _clientQueues = new ConcurrentDictionary<Guid, Channel<IStateRepresentation>>();
            _applicationsToUsersMap = new ConcurrentDictionary<Guid, HashSet<Guid>>();
            _logger = logger;
            _capacity = capacity;
        }

        public async ValueTask EmmitApplicationStateChanges(IStateRepresentation representation, DateTimeOffset timestamp, CancellationToken cancellationToken)
        {
            if (representation == null) throw new ArgumentNullException(nameof(representation));

            var sseItem = new SseItem<IStateRepresentation>(representation)
            {
                EventId = timestamp.ToString(),
                ReconnectionInterval = TimeSpan.FromSeconds(30)
            };

            if (_buffer.TryGetValue(representation.ApplicationId, out var queue))
            {
                queue.Enqueue(sseItem);

                while (_buffer.Count >= _capacity)
                {
                    queue.TryDequeue(out _);
                }
            }
            else
            {
                var newQueue = new ConcurrentQueue<SseItem<IStateRepresentation>>();
                newQueue.Enqueue(sseItem);
                _buffer.TryAdd(representation.ApplicationId, newQueue);
            }

            var fanOutTasks = new List<Task>();

            foreach (var client in _applicationsToUsersMap[representation.ApplicationId])
            {
                fanOutTasks.Add(_clientQueues[client].Writer.WriteAsync(representation, cancellationToken).AsTask());
            }

            await Task.WhenAll(fanOutTasks).ConfigureAwait(false);
        }

        public async IAsyncEnumerable<IStateRepresentation> ReadRepresentationsStates(Guid clientId, HashSet<Guid> applicationIds, string? lastEventId, [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            foreach (var applicationId in applicationIds)
            {
                if (_applicationsToUsersMap.TryGetValue(applicationId, out var subscribedUsers))
                {
                    subscribedUsers.Add(clientId);
                }
                else
                {
                    var newSet = new HashSet<Guid> { clientId };
                    _applicationsToUsersMap.TryAdd(applicationId, newSet);
                }
            }

            _clientQueues.TryAdd(clientId, Channel.CreateBounded<IStateRepresentation>(new BoundedChannelOptions(_capacity)
            {
                FullMode = BoundedChannelFullMode.DropOldest
            }));

            try
            {
                if (!string.IsNullOrEmpty(lastEventId))
                {
                    foreach (var applicationId in applicationIds)
                    {
                        if (_buffer.TryGetValue(applicationId, out var queue))
                        {
                            var missedEvents = queue.SkipWhile(item => !string.Equals(item.EventId, lastEventId, StringComparison.InvariantCultureIgnoreCase)).Skip(1);
                            foreach (var events in missedEvents)
                                yield return events.Data;
                        }
                    }
                }

                await foreach (var representation in _clientQueues[clientId].Reader.ReadAllAsync(cancellationToken).ConfigureAwait(false))
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
