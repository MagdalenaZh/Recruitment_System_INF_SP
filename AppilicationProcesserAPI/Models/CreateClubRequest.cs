namespace AppilicationProcesserAPI.Models
{
    public class CreateClubRequest
    {
        public string ClubName { get; }
        public List<string> AdmissionQuestions { get; }

        public CreateClubRequest(string clubName, List<string> admissionQuestions)
        {
            ClubName = clubName;
            AdmissionQuestions = admissionQuestions;
        }
    }

    public class CreateDepartmentRequest
    {
        public Guid ClubId { get; }
        public string DepartmentName { get; }
        public int NumberOfOpenPositions { get; }
        public CreateDepartmentRequest(Guid clubId, string departmentName, int numberOfOpenPositions)
        {
            ClubId = clubId;
            DepartmentName = departmentName;
            NumberOfOpenPositions = numberOfOpenPositions;
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
}