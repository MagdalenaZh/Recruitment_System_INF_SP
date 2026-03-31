using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.Representations
{
    public interface IStatusRepresentation
    {
        Guid ApplicationId { get; }
        ApplicationStatus ApplicationStatus { get; }
    }

    public class ConcludedStatusRepresentation : IStatusRepresentation
    {
        public ConcludedStatusRepresentation(Guid applicationId, ApplicationStatus applicationStatus)
        {
            ApplicationId = applicationId;
            ApplicationStatus = applicationStatus;
        }
        public Guid ApplicationId { get; }
        public ApplicationStatus ApplicationStatus { get; }
    }

    public class PendingInterviewStatusRepresentation : IStatusRepresentation
    {
        public PendingInterviewStatusRepresentation(Guid applicationId)
        {
            ApplicationId = applicationId;
        }
        public Guid ApplicationId { get; }
        public ApplicationStatus ApplicationStatus => ApplicationStatus.InterviewScheduled;
    }

    public class InProgressStatusRepresentation : IStatusRepresentation
    {
        public InProgressStatusRepresentation(Guid applicationId)
        {
            ApplicationId = applicationId;
        }
        public Guid ApplicationId { get; }
        public ApplicationStatus ApplicationStatus => ApplicationStatus.InProgress;
    }
}
