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
    AfterInterviewApprovedIncremented = 8,
    AfterInterviewDisapprovedDecremented = 9
}

public enum ApplicationStatus
{
    ApplicationSubmited = 1,
    InProgress = 2,
    InterviewScheduled = 3,
    Rejected = 4,
    Accepted = 5,
    InReview = 6,
}
