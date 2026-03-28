using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.Data
{
    public class ApplicationData
    {
        public Guid UserId { get; }
        public Guid DepartmentId { get; }
        public Dictionary<string, string> Questionnaire { get; }
        public ApplicationStatus Status { get; }

        public ApplicationData(Guid userId, Guid departmentId, Dictionary<string, string> questionnaire)
        {
            UserId = userId;
            DepartmentId = departmentId;
            Questionnaire = questionnaire;
            Status = ApplicationStatus.ApplicationSubmited;
        }
    }
}
