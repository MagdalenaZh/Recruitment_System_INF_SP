namespace AppilicationProcesserAPI.Representations
{
    public interface IStateRepresentation
    {
        public Guid ApplicationId { get; }
    }

    public class InitialRepresentation : IStateRepresentation
    {
        public Guid ApplicationId { get; set; }
        public bool ApplicationProcessed { get; set; }
    }

    public class ProcessingStateRepresentation : IStateRepresentation
    {
        public required Guid ApplicationId { get; set; }

        public required int RequiredNumberOfApprovals { get; set; }

        public required int CurrentNumberOfApprovals { get; set; }

        public required Dictionary<Guid, bool> UserDecisionsMap { get; set; }
    }

    public class HibernatedStateRepresentation : IStateRepresentation
    {
        public required Guid ApplicationId { get; set; }
        public required DateTimeOffset ScheduledTime { get; set; }
    }

    public class ApprovedStateRepresentation : IStateRepresentation
    {
        public required Guid ApplicationId { get; set; }

        public required List<DateTimeOffset> InterviewTimesProposals { get; set; }
    }

    public class ConcludedStateRepresentation : IStateRepresentation
    {
        public required Guid ApplicationId { get; set; }

        public required string ConclusionResult { get; set; }
    }
}
