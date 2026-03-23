namespace AppilicationProcesserAPI.Data
{
    public class InterviewSlot
    {
        public DateTimeOffset StartTime { get; }
        public DateTimeOffset EndTime { get; }

        public InterviewSlot(DateTimeOffset start, DateTimeOffset end)
        {
            StartTime = start;
            EndTime = end;
        }
    }
}
