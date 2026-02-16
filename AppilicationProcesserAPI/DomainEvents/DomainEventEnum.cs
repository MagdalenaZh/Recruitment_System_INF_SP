namespace AppilicationProcesserAPI.DomainEvents;

public enum DomainEventEnum
{
    ApplicationCreated = 1,
    ApplicationApprovalIncremented = 2,
    ApplicationApprovalDecremented = 3,
    ApplicationApproved = 4,
    ApplicationRejected = 5,
    ApplicationInterviewProposed = 6,
    ApplicationInterviewRejected = 7,
    ApplicationInterviewAccepted = 8,
}
