using AppilicationProcesserAPI.DomainEvents;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace AppilicationProcesserAPI.AggregateStates
{
    public interface IEventStore
    {
        Task AppendEventAsync(IDomainEvent domainEvent, CancellationToken cancellationToken);
        Task InsertApplication(Guid applicationId, ApplicationData applicationData, CancellationToken cancellationToken);
        Task<List<IDomainEvent>> GetEventsAsync(Guid aggregateId, CancellationToken cancellationToken);
        Task<List<Guid>> GetApplicationsForUserAsync(Guid userId, CancellationToken cancellationToken);
        Task<List<Guid>> GetAllApplicationsForClub(Guid clubId, CancellationToken cancellationToken);
    }

    public class EventStore : IEventStore
    {
        private static readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions()
        {
            PropertyNameCaseInsensitive = true,
        };

        private readonly string _connectionString;

        public EventStore(ServiceConfiguration configuration)
        {
            _connectionString = configuration.SQLConnectionString;
        }

        public async Task AppendEventAsync(IDomainEvent domainEvent, CancellationToken cancellationToken = default)
        {
            var serializedData = JsonSerializer.Serialize(domainEvent);

            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.InsertEvent, sqlConnection);
            command.Parameters.AddWithValue("@eventId", Guid.NewGuid());
            command.Parameters.AddWithValue("@aggregateId", domainEvent.AggregateId);
            command.Parameters.AddWithValue("@eventType", domainEvent.EventType);
            command.Parameters.AddWithValue("@payload", serializedData);
            command.Parameters.AddWithValue("@timeStamp", domainEvent.Timestamp);
            await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<List<IDomainEvent>> GetEventsAsync(Guid aggregateId, CancellationToken cancellationToken = default)
        {
            var loadedEvents = new List<IDomainEvent>();

            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllEventsForAggregate, sqlConnection);
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

        public async Task<List<Guid>> GetApplicationsForUserAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var applicationIds = new List<Guid>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllApplicationsForUser, sqlConnection);
            command.Parameters.AddWithValue("@userId", userId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var applicationId = reader.GetGuid(0);
                applicationIds.Add(applicationId);
            }

            return applicationIds;
        }

        public async Task InsertApplication(Guid applicationId, ApplicationData applicationData, CancellationToken cancellationToken = default)
        {
            var serializedQuestionaire = JsonSerializer.Serialize(applicationData.Questionnaire);

            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.InsertApplication, sqlConnection);
            command.Parameters.AddWithValue("@aggregateId", applicationId);
            command.Parameters.AddWithValue("@userId", applicationData.UserId);
            command.Parameters.AddWithValue("@departmentId", applicationData.DepartmentId);
            command.Parameters.AddWithValue("@questionnaire", serializedQuestionaire);
            command.Parameters.AddWithValue("@status", applicationData.Status);
            await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        }

        public async Task<List<Guid>> GetAllApplicationsForClub(Guid clubId, CancellationToken cancellationToken = default)
        {
            var applicationIds = new List<Guid>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllApplicationsForUser, sqlConnection);
            command.Parameters.AddWithValue("@clubId", clubId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var applicationId = reader.GetGuid(0);
                applicationIds.Add(applicationId);
            }

            return applicationIds;
        }

        private static Type GetEventType(DomainEventEnum eventEnum)
        {
#warning complete with missing events 
            switch (eventEnum)
            {
                case DomainEventEnum.ApplicationCreated:
                    return typeof(ApplicationSubmittedEvent);
                case DomainEventEnum.ApplicationApprovalIncremented:
                    return typeof(ApplicationApprovedEvent);
                case DomainEventEnum.ApplicationApprovalDecremented:
                    return typeof(ApplicationRejectedEvent);
                case DomainEventEnum.ApplicationInterviewProposed:
                    return typeof(SendInterviewProposalEvent);
                case DomainEventEnum.ApplicationInterviewAccepted:
                    return typeof(InterviewProposalAcceptedEvent);
                case DomainEventEnum.ApplicationInterviewRejected:
                    return typeof(InterviewProposalRejectedEvent);
                default:
                    throw new ArgumentOutOfRangeException(nameof(eventEnum));
            }
        }
    }
}
