using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.PersistanceServices;

namespace AppilicationProcesserAPI.Models
{
    public class ClubDatabaseModel
    {
        public Guid ClubId { get; }
        public string ClubName { get; }
        public List<string> AdmissionQuestions { get; }
        public string Description { get; }
        public ClubCategories Category { get; }

        public ClubDatabaseModel(Guid clubId, string clubName, List<string> admissionQuestions, string description, ClubCategories category)
        {
            ClubId = clubId;
            ClubName = clubName;
            AdmissionQuestions = admissionQuestions;
            Description = description;
            Category = category;
        }
    }

    public class DepartmentDatabaseModel
    {
        public Guid DepartmentId { get; }
        public Guid ClubId { get; }
        public string DepartmentName { get; }
        public int NumberOfOpenPositions { get; }
        public string Description { get; }
        public DepartmentDatabaseModel(Guid departmentId, Guid clubId, string departmentName, int numberOfOpenPositions, string description)
        {
            DepartmentId = departmentId;
            ClubId = clubId;
            DepartmentName = departmentName;
            NumberOfOpenPositions = numberOfOpenPositions;
            Description = description;
        }
    }

    public class ApplicationDatabaseModel
    {
        public Guid ApplicationId { get; }
        public Guid UserId { get; }
        public Guid DepartmentId { get; }
        public Dictionary<string, string> Questionnaire { get; }
        public ApplicationStatus ApplicationStatus { get; }
        public CVFile Cv { get; }

        public ApplicationDatabaseModel(Guid applicationId, Guid userId, Guid departmentId, Dictionary<string, string> questionnaire, ApplicationStatus applicationStatus, CVFile cvFile)
        {
            ApplicationId = applicationId;
            UserId = userId;
            DepartmentId = departmentId;
            Questionnaire = questionnaire;
            ApplicationStatus = applicationStatus;
            Cv = cvFile;
        }
    }

    public class InterviewSlot
    {
        public Guid SlotId { get; }
        public DateTimeOffset StartTime { get; }
        public DateTimeOffset EndTime { get; }

        public InterviewSlot(Guid slotId, DateTimeOffset startTime, DateTimeOffset endTime)
        {
            SlotId = slotId;
            StartTime = startTime;
            EndTime = endTime;
        }
    }

    public class BookedInterviewSlot
    {
        public Guid ApplicationId { get; }
        public DateTimeOffset StartTime { get; }
        public DateTimeOffset EndTime { get; }

        public BookedInterviewSlot(Guid applicationId, DateTimeOffset startTime, DateTimeOffset endTime)
        {
            ApplicationId = applicationId;
            StartTime = startTime;
            EndTime = endTime;
        }
    }

    public class UserDatabaseModel
    {
        public Guid UserId { get; }
        public string FirstName { get; }
        public string LastName { get; }
        public string Email { get; }
        public string AcademicYear { get; }
        public string StudyMajor { get; }
        public CVFile Cv { get; }

        public UserDatabaseModel(Guid userId, string firstName, string lastName, string email, string academicYear, string studyMajor, CVFile cv)
        {
            UserId = userId;
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            AcademicYear = academicYear;
            StudyMajor = studyMajor;
            Cv = cv;
        }
    }

    public class CVFile
    {
        public string FileName { get; }
        public string ContentType { get; }
        public byte[] Content { get; }

        public CVFile(string fileName, string contentType, byte[] content)
        {
            FileName = fileName;
            ContentType = contentType;
            Content = content;
        }
    }

    public class UserRightsDatabaseModel
    {
        public Guid UserId { get; }
        public Guid? DepartmentId { get; }
        public string Role { get; }

        public Guid? ClubAdminId { get; }

        public UserRightsDatabaseModel(Guid userId, Guid? departmentId, string role, Guid? clubAdminId)
        {
            UserId = userId;
            DepartmentId = departmentId;
            Role = role;
            ClubAdminId = clubAdminId;
        }
    }

    public class BoardMemberDatabaseModel
    {
        public Guid UserId { get; }
        public Guid DepartmentId { get; }
        public string FirstName { get; }
        public string LastName { get; }
        public BoardMemberDatabaseModel(Guid userId, Guid departmentId, string firstName, string lastName)
        {
            UserId = userId;
            DepartmentId = departmentId;
            FirstName = firstName;
            LastName = lastName;
        }
    }

    public class NoteDatabaseModel
    {
        public Guid NoteId { get; }
        public Guid ApplicationId { get; }
        public Guid UserId { get; }
        public string Content { get; }
        public string AuthorName { get; }
        public NoteDatabaseModel(Guid noteId, Guid applicationId, Guid userId, string content, string authorName)
        {
            NoteId = noteId;
            ApplicationId = applicationId;
            UserId = userId;
            Content = content;
            AuthorName = authorName;
        }
    }

    public class RolesDatabaseModel
    {
        public Guid RoleId { get; }
        public string RoleName { get; }

        public RolesDatabaseModel(Guid roleId, string roleName)
        {
            RoleId = roleId;
            RoleName = roleName;
        }
    }
}
