using AppilicationProcesserAPI.DomainEvents;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace AppilicationProcesserAPI.AggregateStates
{
    public interface IEventStore
    {
        Task AppendEventAsync(IDomainEvent domainEvent, CancellationToken cancellationToken = default);
        Task<IEnumerable<IDomainEvent>> GetEventsAsync(Guid aggregateId, CancellationToken cancellationToken = default);
    }

    public class EventStore : IEventStore
    {
        private static readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions()
        {
            PropertyNameCaseInsensitive = true,
        };

        private readonly string _connectionString;

        private static readonly string GetAllEventsForAggregate = "SELECT [EventType], [PayLoad] FROM [Events] WHERE [AggregateId] = @aggregateId ORDER BY [TimeStamp]";
        private static readonly string InsertEvent = "INSERT INTO [Events] ([AggregateId], [EventType], [PayLoad], [TimeStamp]) VALUES (@aggregateId, @eventType, @payload, @timeStamp)";

        public EventStore(string connectionString = "default")
        {
            _connectionString = connectionString;
        }

        public async Task AppendEventAsync(IDomainEvent domainEvent, CancellationToken cancellationToken = default)
        {
            var serializedData = JsonSerializer.Serialize(domainEvent);

            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(InsertEvent, sqlConnection);
            command.Parameters.AddWithValue("@aggregateId", domainEvent.AggregateId);
            command.Parameters.AddWithValue("@eventType", domainEvent.EventType);
            command.Parameters.AddWithValue("@payload", serializedData);
            command.Parameters.AddWithValue("@timeStamp", domainEvent.Timestamp);
            await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<IEnumerable<IDomainEvent>> GetEventsAsync(Guid aggregateId, CancellationToken cancellationToken = default)
        {
            var loadedEvents = new List<IDomainEvent>();

            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(GetAllEventsForAggregate, sqlConnection);
            command.Parameters.AddWithValue("@aggregateId", aggregateId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var eventType = (DomainEventEnum)reader.GetInt32(0);

                var payLoad = reader.GetString(1);

                if (JsonSerializer.Deserialize(payLoad, GetEventType(eventType), _serializerOptions) is IDomainEvent data)
                {
                    loadedEvents.Add(data);
                }
            }

            return loadedEvents;
        }

        private static Type GetEventType(DomainEventEnum eventEnum)
        {
            switch (eventEnum)
            {
                case DomainEventEnum.ApplicationCreated:
                    return typeof(ApplicationSubmittedEvent);
                case DomainEventEnum.ApplicationApprovalIncremented:
                    return typeof(ApplicationApprovedEvent);
                default:
                    throw new ArgumentOutOfRangeException(nameof(eventEnum));
            }
        }
    }
}
