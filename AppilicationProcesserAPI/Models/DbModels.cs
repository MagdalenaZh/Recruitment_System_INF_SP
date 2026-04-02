using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.Models
{
    public class ClubDatabaseModel
    {
        public Guid ClubId { get; }
        public string ClubName { get; }
        public List<string> AdmissionQuestions { get; }
        public string Description { get; }
        public string Category { get; }

        public ClubDatabaseModel(Guid clubId, string clubName, List<string> admissionQuestions, string description, string category)
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
        public ApplicationDatabaseModel(Guid applicationId, Guid userId, Guid departmentId, Dictionary<string, string> questionnaire, ApplicationStatus applicationStatus)
        {
            ApplicationId = applicationId;
            UserId = userId;
            DepartmentId = departmentId;
            Questionnaire = questionnaire;
            ApplicationStatus = applicationStatus;
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
}
