using AppilicationProcesserAPI.PersistanceServices;

namespace AppilicationProcesserAPI.Models
{
    public class DbRequestModels
    {
        public string ClubName { get; }

        public ClubCategories Category { get; }

        public DbRequestModels(string clubName, ClubCategories category)
        {
            ClubName = clubName;
            Category = category;
        }
    }

    public class UpdateClubRequest
    {
        public string ClubName { get; }
        public List<string> ApplicationQuestions { get; }
        public int RequiredApprovals { get; }
        public string Description { get; }
        public ClubCategories Category { get; }

        public UpdateClubRequest(string clubName, List<string> applicationQuestions, int requiredApprovals, string description, ClubCategories category)
        {
            ClubName = clubName;
            ApplicationQuestions = applicationQuestions;
            RequiredApprovals = requiredApprovals;
            Description = description;
            Category = category;
        }
    }

    public class CreateDepartmentRequest
    {
        public Guid ClubId { get; }
        public string DepartmentName { get; }
        public int NumberOfOpenPositions { get; }
        public string Description { get; }

        public CreateDepartmentRequest(Guid clubId, string departmentName, int numberOfOpenPositions, string description)
        {
            ClubId = clubId;
            DepartmentName = departmentName;
            NumberOfOpenPositions = numberOfOpenPositions;
            Description = description;
        }
    }

    public class UpdateDepartmentRequest
    {
        public string DepartmentName { get; }
        public int NumberOfOpenPositions { get; }
        public string Description { get; }
        public UpdateDepartmentRequest(string departmentName, int numberOfOpenPositions, string description)
        {
            DepartmentName = departmentName;
            NumberOfOpenPositions = numberOfOpenPositions;
            Description = description;
        }
    }

    public class CreateInterviewSlotRequest
    {
        public Guid ClubId { get; }
        public DateTimeOffset StartTime { get; }
        public DateTimeOffset EndTime { get; }
        public CreateInterviewSlotRequest(Guid clubId, DateTimeOffset startTime, DateTimeOffset endTime)
        {
            ClubId = clubId;
            StartTime = startTime;
            EndTime = endTime;
        }
    }

    public class SlotTimes
    {
        public DateTimeOffset StartTime { get; }
        public DateTimeOffset EndTime { get; }

        public SlotTimes(DateTimeOffset startTime, DateTimeOffset endTime)
        {
            StartTime = startTime;
            EndTime = endTime;
        }
    }

    public class UpdateUserInformationRequest
    {
        public string FirstName { get; }
        public string LastName { get; }
        public string AcademicYear { get; }
        public string StudyMajor { get; }
        public UpdateUserInformationRequest(string firstName, string lastName, string academicYear, string studyMajor)
        {
            FirstName = firstName;
            LastName = lastName;
            AcademicYear = academicYear;
            StudyMajor = studyMajor;
        }
    }
}