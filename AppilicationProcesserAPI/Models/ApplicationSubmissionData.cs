using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.Models
{
    public class ApplicationSubmissionData
    {
        public Guid DepartmentId { get; }
        public Dictionary<string, string> Questionnaire { get; }

        public ApplicationSubmissionData(Guid departmentId, Dictionary<string, string> questionnaire)
        {
            DepartmentId = departmentId;
            Questionnaire = questionnaire;
        }
    }
}
