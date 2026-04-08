using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;

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
        public required bool WaitingFinalDecision { get; set; }
    }

    public class AfterInterviewReviewStateRepresentation : IStateRepresentation
    {
        public required Guid ApplicationId { get; set; }
        public required int RequiredNumberOfApprovals { get; set; }

        public required int CurrentNumberOfPostInterviewApprovals { get; set; }

        public required Dictionary<Guid, bool> UserDecisionsMap { get; set; }

        public required InterviewSlot ScheduledTime { get; set; }
    }

    public class ApprovedStateRepresentation : IStateRepresentation
    {
        public required Guid ApplicationId { get; set; }
        public required bool ApplicationApproved { get; set; }
    }

    public class ConcludedStateRepresentation : IStateRepresentation
    {
        public required Guid ApplicationId { get; set; }

        public required ApplicationStatus ConclusionResult { get; set; }
    }
}
