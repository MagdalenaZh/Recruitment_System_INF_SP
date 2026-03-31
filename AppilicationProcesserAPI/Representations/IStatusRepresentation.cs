using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.Representations
{
    public interface IStatusRepresentation
    {
        Guid ApplicationId { get; }
        ApplicationStatus ApplicationStatus { get; }
    }

    public class AcceptedStatusRepresentation : IStatusRepresentation
    {
        public AcceptedStatusRepresentation(Guid applicationId)
        {
            ApplicationId = applicationId;
        }

        public Guid ApplicationId { get; }

        public ApplicationStatus ApplicationStatus => ApplicationStatus.Accepted;
    }

    public class RejectedStatusRepresentation : IStatusRepresentation
    {
        public RejectedStatusRepresentation(Guid applicationId)
        {
            ApplicationId = applicationId;
        }
        public Guid ApplicationId { get; }
        public ApplicationStatus ApplicationStatus => ApplicationStatus.Rejected;
    }

    public class PendingStatusRepresentation : IStatusRepresentation
    {
        public PendingStatusRepresentation(Guid applicationId)
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
