using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using Microsoft.Data.SqlClient;

namespace AppilicationProcesserAPI.PersistanceServices
{
    public interface IApplicationFinalizer
    {
        Task UpdateApplicationStatusAsync(StatusUpdateEnvelope statusUpdateEnvelope, CancellationToken cancellationToken);
    }

    public class ApplicationFinalizer : IApplicationFinalizer
    {
        private readonly string _connectionString;
        private readonly ILogger<ApplicationFinalizer> _logger;

        public ApplicationFinalizer(ServiceConfiguration configuration, ILogger<ApplicationFinalizer> logger)
        {
            _connectionString = configuration.SQLConnectionString;
            _logger = logger;
        }

        public async Task UpdateApplicationStatusAsync(StatusUpdateEnvelope statusUpdateEnvelope, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            if(statusUpdateEnvelope.MessageData.ApplicationStatus == ApplicationStatus.Accepted)
            {
                using var departmentFromApplicationCommand = new SqlCommand(DbQueries.GetDepartmentIdForApplication, sqlConnection);
                departmentFromApplicationCommand.Parameters.AddWithValue("@aggregateId", statusUpdateEnvelope.MessageData.ApplicationId);

                using var reader = await departmentFromApplicationCommand.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

                if(reader.Read())
                {
                    var departmentId = reader.GetGuid(0);
                    var userId = reader.GetGuid(1);

                    using var departmentCommand = new SqlCommand(DbQueries.UpdateUserDepartment, sqlConnection);
                    departmentCommand.Parameters.AddWithValue("@userId", userId);
                    departmentCommand.Parameters.AddWithValue("@departmentId", departmentId);

                    try
                    {
                        await departmentCommand.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
                    }
                    catch (SqlException ex)
                    {
                        _logger.LogError(ex, "Failed to set new Department");
                        throw new Exception("Event not registered");
                    }
                }
            }

            using var command = new SqlCommand(DbQueries.UpdateApplicationStatus, sqlConnection);
            command.Parameters.AddWithValue("@status", statusUpdateEnvelope.MessageData.ApplicationStatus);
            command.Parameters.AddWithValue("@aggregateId", statusUpdateEnvelope.MessageData.ApplicationId);

            try
            {
                var rowsAffected = await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
                if (rowsAffected == 0)
                {
                    throw new Exception("Update failed");
                }
            }
            catch (SqlException ex)
            {
                _logger.LogError(ex, "Failed Update in InterviewSlots table");
                throw new Exception("Event not registered");
            }
        }
    }
}
