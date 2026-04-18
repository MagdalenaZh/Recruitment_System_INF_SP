namespace AppilicationProcesserAPI.Models
{
    public class ApplicationSubmissionData
    {
        public Guid DepartmentId { get; }
        public Dictionary<string, string> Questionnaire { get; }

        public byte[] CVFile { get; }

        public ApplicationSubmissionData(Guid departmentId, Dictionary<string, string> questionnaire, byte[] cvFile)
        {
            DepartmentId = departmentId;
            Questionnaire = questionnaire;
            CVFile = cvFile;
        }
    }
}
