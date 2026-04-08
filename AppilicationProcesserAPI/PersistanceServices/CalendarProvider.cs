using AppilicationProcesserAPI.Models;
using Microsoft.Data.SqlClient;

namespace AppilicationProcesserAPI.PersistanceServices
{
    public interface ICalendarProvider
    {
        Task<List<InterviewSlot>> GetAvailableInterviewSlotsForClubAsync(Guid clubId, CancellationToken cancellationToken);

        Task<List<BookedInterviewSlot>> GetBookedInterviewSlotsForClubAsync(Guid clubId, CancellationToken cancellationToken);

        Task BookInterviewSlotAsync(Guid slotId, Guid applicationId, CancellationToken cancellationToken);
    }

    public class CalendarProvider : ICalendarProvider
    {
        private readonly string _connectionString;
        private readonly ILogger<CalendarProvider> _logger;

        public CalendarProvider(ServiceConfiguration serviceConfiguration, ILogger<CalendarProvider> logger)
        {
            _connectionString = serviceConfiguration.SQLConnectionString;
            _logger = logger;
        }

        public async Task BookInterviewSlotAsync(Guid slotId, Guid applicationId, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.InsertBookedInterviewSlot, sqlConnection);
            command.Parameters.AddWithValue("@slotId", slotId);
            command.Parameters.AddWithValue("@aggregateId", applicationId);

            try
            {
                await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Insert in Events table");
                throw new Exception("Event not registered");
            }
        }

        public async Task<List<InterviewSlot>> GetAvailableInterviewSlotsForClubAsync(Guid clubId, CancellationToken cancellationToken)
        {
            var availableSlots = new List<InterviewSlot>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllOpenInterviewSlotsForClub, sqlConnection);
            command.Parameters.AddWithValue("@clubId", clubId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var slotId = reader.GetGuid(0);
                var startTime = reader.GetDateTimeOffset(1);
                var endTime = reader.GetDateTimeOffset(2);
                availableSlots.Add(new InterviewSlot(slotId, startTime, endTime));
            }

            return availableSlots;
        }

        public async Task<List<BookedInterviewSlot>> GetBookedInterviewSlotsForClubAsync(Guid clubId, CancellationToken cancellationToken)
        {
            var bookedSlots = new List<BookedInterviewSlot>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);
            using var command = new SqlCommand(DbQueries.GetAllBookedInterviewSlotsForClub, sqlConnection);
            command.Parameters.AddWithValue("@clubId", clubId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
            while (reader.Read())
            {
                var applicationId = reader.GetGuid(0);
                var startTime = reader.GetDateTimeOffset(1);
                var endTime = reader.GetDateTimeOffset(2);
                bookedSlots.Add(new BookedInterviewSlot(applicationId, startTime, endTime));
            }
            return bookedSlots;
        }
    }
}
