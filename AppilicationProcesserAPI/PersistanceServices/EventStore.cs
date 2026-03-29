using AppilicationProcesserAPI.Data;
using AppilicationProcesserAPI.DomainEvents;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace AppilicationProcesserAPI.PersistanceServices
{
    public interface IEventStore
    {
        Task AppendEventAsync(IDomainEvent domainEvent, CancellationToken cancellationToken);
        Task CreateApplication(Guid applicationId, ApplicationData applicationData, CancellationToken cancellationToken);
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
        private readonly ILogger<EventStore> _logger;

        public EventStore(ServiceConfiguration configuration, ILogger<EventStore> logger)
        {
            _connectionString = configuration.SQLConnectionString;
            _logger = logger;
        }

        public async Task AppendEventAsync(IDomainEvent domainEvent, CancellationToken cancellationToken)
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

            try
            {
                await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Filed Insert in Events table");
                throw new Exception("Event not registered");
            }
        }

        public async Task<List<IDomainEvent>> GetEventsAsync(Guid aggregateId, CancellationToken cancellationToken)
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

        public async Task<List<Guid>> GetApplicationsForUserAsync(Guid userId, CancellationToken cancellationToken)
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

        public async Task CreateApplication(Guid applicationId, ApplicationData applicationData, CancellationToken cancellationToken)
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

            try
            {
                await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Filed Insert in Applications table");
                throw new Exception("Application not registered");
            }
        }

        public async Task<List<Guid>> GetAllApplicationsForClub(Guid clubId, CancellationToken cancellationToken)
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
            switch (eventEnum)
            {
                case DomainEventEnum.ApplicationCreated:
                    return typeof(ApplicationSubmittedEvent);
                case DomainEventEnum.ApplicationApprovalIncremented:
                    return typeof(ApplicationApprovedEvent);
                case DomainEventEnum.ApplicationApprovalDecremented:
                    return typeof(ApplicationDisapprovedEvent);
                case DomainEventEnum.BookInterviewSlot:
                    return typeof(BookInterviewSlotEvent);
                case DomainEventEnum.ApplicationInterviewRejected:
                    return typeof(InterviewProposalRejectedEvent);
                case DomainEventEnum.ApplicationAccepted:
                    return typeof(ApplicationAcceptedEvent);
                case DomainEventEnum.ApplicationRejected:
                    return typeof(ApplicationRejectedEvent);
                default:
                    throw new ArgumentOutOfRangeException(nameof(eventEnum));
            }
        }
    }
}
