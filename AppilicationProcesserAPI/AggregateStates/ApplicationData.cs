namespace AppilicationProcesserAPI.AggregateStates
{
    public class ApplicationData
    {
        public Guid UserId { get; }
        public Guid DepartmentId { get; }
        public Dictionary<string, string> Questionnaire { get; }
        public int Status { get; }

        public ApplicationData(Guid userId, Guid departmentId, Dictionary<string, string> questionnaire, int status)
        {
            UserId = userId;
            DepartmentId = departmentId;
            Questionnaire = questionnaire;
            Status = status;
        }
    }
}
