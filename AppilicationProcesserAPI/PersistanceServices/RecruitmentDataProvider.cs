using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using Microsoft.Data.SqlClient;
using System.Text.Json;
using static System.Net.Mime.MediaTypeNames;

namespace AppilicationProcesserAPI.PersistanceServices
{
    public interface IRecruitmentDataProvider
    {
        Task<List<ApplicationDatabaseModel>> GetAllApplicationsForUserAsync(Guid userId, CancellationToken cancellationToken);

        Task<List<ApplicationDatabaseModel>> GetAllApplicationsForDepartmentAsync(Guid departmentId, CancellationToken cancellationToken);

        Task<List<ApplicationDatabaseModel>> GetAllApplicationsForClubAsync(Guid clubId, CancellationToken cancellationToken);

        Task<int> GetRequiredNumberOfApprovalsForDepartmentAsync(Guid departmentId, CancellationToken cancellationToken);

        Task GetUserInformation(Guid userId, CancellationToken cancellationToken);

        Task<List<ClubDatabaseModel>> GetAllClubsInformationAsync(CancellationToken cancellationToken);

        Task<List<DepartmentDatabaseModel>> GetDepartmentsForClubAsync(Guid clubId, CancellationToken cancellationToken);
    }

    public class RecruitmentDataProvider : IRecruitmentDataProvider
    {
        private static readonly JsonSerializerOptions _serializerOptions = new JsonSerializerOptions()
        {
            PropertyNameCaseInsensitive = true,
        };
        private readonly string _connectionString;
        private readonly ILogger<RecruitmentDataProvider> _logger;

        public RecruitmentDataProvider(ILogger<RecruitmentDataProvider> logger, ServiceConfiguration configuration)
        {
            _connectionString = configuration.SQLConnectionString;
            _logger = logger;
        }

        public async Task<List<ApplicationDatabaseModel>> GetAllApplicationsForClubAsync(Guid clubId, CancellationToken cancellationToken)
        {
            var applications = new List<ApplicationDatabaseModel>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllApplicationsForClub, sqlConnection);
            command.Parameters.AddWithValue("@clubId", clubId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var applicationId = reader.GetGuid(0);
                var userId = reader.GetGuid(1);
                var departmentId = reader.GetGuid(2);
                var questionaire = reader.GetString(3);
                var status = (ApplicationStatus)reader.GetInt32(4);
                var seriaizedQuestionaire = JsonSerializer.Deserialize<Dictionary<string, string>>(questionaire, _serializerOptions);

                if (seriaizedQuestionaire is null)
                {
                    throw new Exception($"Failed to deserialize questionaire for application {applicationId}");
                }

                applications.Add(new ApplicationDatabaseModel(applicationId, userId, departmentId, seriaizedQuestionaire, status));
            }

            return applications;
        }

        public async Task<List<ApplicationDatabaseModel>> GetAllApplicationsForDepartmentAsync(Guid departmentId, CancellationToken cancellationToken)
        {
            var applications = new List<ApplicationDatabaseModel>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllApplicationsForDepartment, sqlConnection);
            command.Parameters.AddWithValue("@departmentId", departmentId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var applicationId = reader.GetGuid(0);
                var userId = reader.GetGuid(1);
                var questionaire = reader.GetString(2);
                var status = (ApplicationStatus)reader.GetInt32(3);
                var seriaizedQuestionaire = JsonSerializer.Deserialize<Dictionary<string, string>>(questionaire, _serializerOptions);

                if (seriaizedQuestionaire is null)
                {
                    throw new Exception($"Failed to deserialize questionaire for application {applicationId}");
                }

                applications.Add(new ApplicationDatabaseModel(applicationId, userId, departmentId, seriaizedQuestionaire, status));
            }

            return applications;
        }

        public async Task<List<ApplicationDatabaseModel>> GetAllApplicationsForUserAsync(Guid userId, CancellationToken cancellationToken)
        {
            var applications = new List<ApplicationDatabaseModel>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllApplicationsForUser, sqlConnection);
            command.Parameters.AddWithValue("@userId", userId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var applicationId = reader.GetGuid(0);
                var departmentId = reader.GetGuid(1);
                var questionaire = reader.GetString(2);
                var status = (ApplicationStatus)reader.GetInt32(3);
                var seriaizedQuestionaire = JsonSerializer.Deserialize<Dictionary<string, string>>(questionaire, _serializerOptions);

                if (seriaizedQuestionaire is null)
                {
                    throw new Exception($"Failed to deserialize questionaire for application {applicationId}");
                }

                applications.Add(new ApplicationDatabaseModel(applicationId, userId, departmentId, seriaizedQuestionaire, status));
            }

            return applications;
        }

        public async Task<List<ClubDatabaseModel>> GetAllClubsInformationAsync(CancellationToken cancellationToken)
        {
            var clubs = new List<ClubDatabaseModel>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllClubsDetails, sqlConnection);

            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var clubId = reader.GetGuid(0);
                var clubmentName = reader.GetString(1);
                var applicationQuestions = reader.GetString(2);
                var description = reader.GetString(3);
                var category = reader.IsDBNull(4) ? string.Empty : reader.GetString(4);

                var seriaizedQuestionaire = JsonSerializer.Deserialize<List<string>>(applicationQuestions, _serializerOptions);

                if (seriaizedQuestionaire is null)
                {
                    throw new Exception($"Failed to deserialize admissionQuestions for club {clubId}");
                }

                clubs.Add(new ClubDatabaseModel(clubId, clubmentName, seriaizedQuestionaire, description, category));
            }

            return clubs;
        }

        public async Task<List<DepartmentDatabaseModel>> GetDepartmentsForClubAsync(Guid clubId, CancellationToken cancellationToken)
        {
            var departments = new List<DepartmentDatabaseModel>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetDepartmentsForClub, sqlConnection);
            command.Parameters.AddWithValue("@clubId", clubId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var departmentId = reader.GetGuid(0);
                var departmentName = reader.GetString(1);
                var numberOfOpenPositions = reader.GetInt32(2);
                var desription = reader.GetString(3);

                departments.Add(new DepartmentDatabaseModel(departmentId, clubId, departmentName, numberOfOpenPositions, desription));
            }

            return departments;
        }

        public async Task<int> GetRequiredNumberOfApprovalsForDepartmentAsync(Guid departmentId, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetRequiredApprovalsForDepartment, sqlConnection);
            command.Parameters.AddWithValue("@departmentId", departmentId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            if (reader.Read()) {
                var requiredNumberOfApprovals = reader.GetInt32(0);
                return requiredNumberOfApprovals;
            }

            throw new Exception($"Department with id {departmentId} not found");
        }

        public Task GetUserInformation(Guid userId, CancellationToken cancellationToken)
        {
#warning Implement later
            throw new NotImplementedException();
        }
    }
}
