namespace AppilicationProcesserAPI.DomainEvents;

public enum DomainEventEnum
{
    ApplicationCreated = 1,
    ApplicationApprovalIncremented = 2,
    ApplicationApprovalDecremented = 3,
    ApplicationInterviewProposed = 4,
    ApplicationInterviewProposalAmended = 5,
    ApplicationInterviewRejected = 6,
    ApplicationInterviewAccepted = 7,
}
