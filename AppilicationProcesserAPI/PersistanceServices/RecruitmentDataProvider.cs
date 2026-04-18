using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace AppilicationProcesserAPI.PersistanceServices
{
    public interface IRecruitmentDataProvider
    {
        Task<List<ApplicationDatabaseModel>> GetAllApplicationsForUserAsync(Guid userId, CancellationToken cancellationToken);

        Task<List<ApplicationDatabaseModel>> GetAllApplicationsForDepartmentAsync(Guid departmentId, CancellationToken cancellationToken);

        Task<List<ApplicationDatabaseModel>> GetAllApplicationsForClubAsync(Guid clubId, CancellationToken cancellationToken);

        Task<int> GetRequiredNumberOfApprovalsForDepartmentAsync(Guid departmentId, CancellationToken cancellationToken);

        Task<List<ClubDatabaseModel>> GetAllClubsInformationAsync(CancellationToken cancellationToken);

        Task<List<DepartmentDatabaseModel>> GetDepartmentsForClubAsync(Guid clubId, CancellationToken cancellationToken);

        Task<UserDatabaseModel?> GetApplicantUserInformationAsync(Guid userId, CancellationToken cancellationToken);

        Task<UserRightsDatabaseModel> GetUserRightsAsync(Guid userId, CancellationToken cancellationToken);

        Task<List<NoteDatabaseModel>> GetAllNotesForApplicationAsync(Guid applicationId, CancellationToken cancellationToken);

        Task<List<RolesDatabaseModel>> GetAllRolesAsync(CancellationToken cancellationToken);

        Task<List<BoardMemberDatabaseModel>> GetClubBoardMembersAsync(Guid clubId, CancellationToken cancellationToken);
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
                var cvContent = reader.IsDBNull(5) ? Array.Empty<byte>() : (byte[])reader[5];

                var cv = new CVFile($"applicant_CV.pdf", "application/pdf", cvContent);

                if (seriaizedQuestionaire is null)
                {
                    throw new Exception($"Failed to deserialize questionaire for application {applicationId}");
                }

                applications.Add(new ApplicationDatabaseModel(applicationId, userId, departmentId, seriaizedQuestionaire, status, cv));
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

                var cvContent = reader.IsDBNull(4) ? Array.Empty<byte>() : (byte[])reader[4];
                var cv = new CVFile($"applicant_CV.pdf", "application/pdf", cvContent);

                if (seriaizedQuestionaire is null)
                {
                    throw new Exception($"Failed to deserialize questionaire for application {applicationId}");
                }

                applications.Add(new ApplicationDatabaseModel(applicationId, userId, departmentId, seriaizedQuestionaire, status, cv));
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
                var cvContent = reader.IsDBNull(4) ? Array.Empty<byte>() : (byte[])reader[4];
                var cv = new CVFile($"applicant_CV.pdf", "application/pdf", cvContent);

                if (seriaizedQuestionaire is null)
                {
                    throw new Exception($"Failed to deserialize questionaire for application {applicationId}");
                }

                applications.Add(new ApplicationDatabaseModel(applicationId, userId, departmentId, seriaizedQuestionaire, status, cv));
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
                var applicationQuestions = reader.IsDBNull(2) ? "[]" : reader.GetString(2);
                var description = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
                var category = reader.IsDBNull(4) ? ClubCategories.Other : (ClubCategories)reader.GetInt32(4);

                var seriaizedQuestionaire = JsonSerializer.Deserialize<List<string>>(applicationQuestions, _serializerOptions);

                if (seriaizedQuestionaire is null)
                {
                    seriaizedQuestionaire = new List<string>();
                }

                clubs.Add(new ClubDatabaseModel(clubId, clubmentName, seriaizedQuestionaire, description, category));
            }

            return clubs;
        }

        public async Task<List<NoteDatabaseModel>> GetAllNotesForApplicationAsync(Guid applicationId, CancellationToken cancellationToken)
        {
            var notes = new List<NoteDatabaseModel>();

            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllNotesForApplication, sqlConnection);
            command.Parameters.AddWithValue("@applicationId", applicationId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var noteId = reader.GetGuid(0);
                var userId = reader.GetGuid(1);
                var content = reader.GetString(2);
                var firstName = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
                var lastName = reader.IsDBNull(4) ? string.Empty : reader.GetString(4);
                var authorName = $"{firstName} {lastName}".Trim();
                notes.Add(new NoteDatabaseModel(noteId, applicationId, userId, content, string.IsNullOrWhiteSpace(authorName) ? userId.ToString() : authorName));
            }
            return notes;
        }

        public async Task<List<RolesDatabaseModel>> GetAllRolesAsync(CancellationToken cancellationToken)
        {
            var roles = new List<RolesDatabaseModel>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetAllRoles, sqlConnection);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var roleId = reader.GetGuid(0);
                var roleName = reader.GetString(1);
                roles.Add(new RolesDatabaseModel(roleId, roleName));
            }

            return roles;
        }

        public async Task<UserDatabaseModel?> GetApplicantUserInformationAsync(Guid userId, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetUserInformation, sqlConnection);
            command.Parameters.AddWithValue("@userId", userId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var id = reader.GetGuid(0);
                var firstName = reader.GetString(1);
                var lastName = reader.GetString(2);
                var email = reader.IsDBNull(3) ? string.Empty : reader.GetString(3);
                var academicYear = reader.IsDBNull(4) ? string.Empty : reader.GetString(4);
                var studyMajor = reader.IsDBNull(5) ? string.Empty : reader.GetString(5);
                var cvContent = reader.IsDBNull(6) ? Array.Empty<byte>() : (byte[])reader[6];
                var cv = new CVFile($"{firstName}_{lastName}_CV.pdf", "application/pdf", cvContent);
                return new UserDatabaseModel(id, firstName, lastName, email, academicYear, studyMajor, cv);
            }
            return null;
        }

        public async Task<List<BoardMemberDatabaseModel>> GetClubBoardMembersAsync(Guid clubId, CancellationToken cancellationToken)
        {
            var clubBoardMembers = new List<BoardMemberDatabaseModel>();
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetBoardMembersForClub, sqlConnection);
            command.Parameters.AddWithValue("@clubId", clubId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            while (reader.Read())
            {
                var userId = reader.GetGuid(0); 
                var firstName = reader.GetString(1);
                var lastName = reader.GetString(2);
                var departmentId = reader.GetGuid(3);
               
                clubBoardMembers.Add(new BoardMemberDatabaseModel(userId, departmentId, firstName, lastName));
            }

            return clubBoardMembers;
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

            if (reader.Read())
            {
                var requiredNumberOfApprovals = reader.GetInt32(0);
                return requiredNumberOfApprovals;
            }

            throw new Exception($"Department with id {departmentId} not found");
        }

        public async Task<UserRightsDatabaseModel> GetUserRightsAsync(Guid userId, CancellationToken cancellationToken)
        {
            using var sqlConnection = new SqlConnection(_connectionString);
            await sqlConnection.OpenAsync(cancellationToken).ConfigureAwait(false);

            using var command = new SqlCommand(DbQueries.GetUserRights, sqlConnection);
            command.Parameters.AddWithValue("@userId", userId);
            using var reader = await command.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);

            if (reader.Read())
            {
                var roleName = reader.GetString(0);
                var adminClubId = reader.IsDBNull(1) ? (Guid?)null : reader.GetGuid(1);
                var departmentId = reader.IsDBNull(2) ? (Guid?)null : reader.GetGuid(2);
                return new UserRightsDatabaseModel(userId, departmentId, roleName, adminClubId);
            }

            throw new Exception($"User with id {userId} not found");
        }
    }
}
