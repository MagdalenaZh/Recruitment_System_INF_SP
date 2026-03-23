namespace AppilicationProcesserAPI.DomainEvents;

public enum DomainEventEnum
{
    ApplicationCreated = 1,
    ApplicationApprovalIncremented = 2,
    ApplicationApprovalDecremented = 3,
    ApplicationInterviewRejected = 4,
    BookInterviewSlot = 5,
    ApplicationAccepted = 6,
    ApplicationRejected = 7,
}

public enum ApplicationStatus
{
    ApplicationSubmited = 1,
    InProgress = 2,
    Rejected = 3,
    Accepted = 4,
}
