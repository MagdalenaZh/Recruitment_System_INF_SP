namespace AppilicationProcesserAPI.Data
{
    public class InterviewSlot
    {
        public Guid SlotId { get; }
        public DateTimeOffset StartTime { get; }
        public DateTimeOffset EndTime { get; }

        public InterviewSlot(Guid slotId, DateTimeOffset start, DateTimeOffset end)
        {
            SlotId = slotId;
            StartTime = start;
            EndTime = end;
        }
    }
}
