using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.Models
{
    public class ApplicationSubmissionData
    {
        public Guid UserId { get; }
        public Guid DepartmentId { get; }
        public Dictionary<string, string> Questionnaire { get; }

        public ApplicationSubmissionData(Guid userId, Guid departmentId, Dictionary<string, string> questionnaire)
        {
            UserId = userId;
            DepartmentId = departmentId;
            Questionnaire = questionnaire;
        }
    }
}
