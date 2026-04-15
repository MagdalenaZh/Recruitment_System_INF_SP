using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Representations;

namespace AppilicationProcesserAPI.Tests.TestDoubles;

public class FakeRecruitmentDataProvider : IRecruitmentDataProvider
{
    public List<ApplicationDatabaseModel> ApplicationsForUser { get; } = [];
    public List<ApplicationDatabaseModel> ApplicationsForDepartment { get; } = [];
    public List<ApplicationDatabaseModel> ApplicationsForClub { get; } = [];
    public List<ClubDatabaseModel> Clubs { get; } = [];
    public List<DepartmentDatabaseModel> Departments { get; } = [];
    public UserDatabaseModel UserInfo { get; set; } = new(Guid.NewGuid(), "Test", "User", "test@example.com", "Junior", "CS");
    public int RequiredApprovals { get; set; } = 2;

    public Task<List<ApplicationDatabaseModel>> GetAllApplicationsForUserAsync(Guid userId, CancellationToken cancellationToken) => Task.FromResult(ApplicationsForUser);
    public Task<List<ApplicationDatabaseModel>> GetAllApplicationsForDepartmentAsync(Guid departmentId, CancellationToken cancellationToken) => Task.FromResult(ApplicationsForDepartment);
    public Task<List<ApplicationDatabaseModel>> GetAllApplicationsForClubAsync(Guid clubId, CancellationToken cancellationToken) => Task.FromResult(ApplicationsForClub);
    public Task<int> GetRequiredNumberOfApprovalsForDepartmentAsync(Guid departmentId, CancellationToken cancellationToken) => Task.FromResult(RequiredApprovals);
    public Task<List<ClubDatabaseModel>> GetAllClubsInformationAsync(CancellationToken cancellationToken) => Task.FromResult(Clubs);
    public Task<List<DepartmentDatabaseModel>> GetDepartmentsForClubAsync(Guid clubId, CancellationToken cancellationToken) => Task.FromResult(Departments);
    public Task<UserDatabaseModel> GetApplicantUserInformationAsync(Guid userId, CancellationToken cancellationToken) => Task.FromResult(UserInfo);
}

public class FakeSystemManagementProvider : ISystemManagementProvider
{
    public Task CreateClubAsync(string clubName, ClubCategories category, CancellationToken cancellationToken) => Task.CompletedTask;
    public Task CreateDepartmentAsync(Guid clubId, string departmentName, int numberOfOpenPositions, string description, CancellationToken cancellationToken) => Task.CompletedTask;
    public Task CreateInterviewSlotAsync(Guid clubId, DateTimeOffset startTime, DateTimeOffset endTime, CancellationToken cancellationToken) => Task.CompletedTask;
    public Task UpdateClubInformationAsync(Guid clubId, string clubName, List<string> applicationQuestions, int requiredApprovals, string description, ClubCategories category, CancellationToken cancellationToken) => Task.CompletedTask;
    public Task UpdateDepartmentInformationAsync(Guid departmentId, string departmentName, int numberOfOpenPositions, string description, CancellationToken cancellationToken) => Task.CompletedTask;
    public Task UpdateInterviewSlotAsync(Guid slotId, DateTimeOffset newStartTime, DateTimeOffset newEndTime, CancellationToken cancellationToken) => Task.CompletedTask;
    public Task UpdateUserRoleAsync(Guid userId, Guid roleId, CancellationToken cancellationToken) => Task.CompletedTask;
    public Task UpdateUserPromoteToClubAdminAsync(Guid userId, Guid clubId, CancellationToken cancellationToken) => Task.CompletedTask;
}

public class FakeCalendarProvider : ICalendarProvider
{
    public List<InterviewSlot> AvailableSlots { get; } = [];
    public List<BookedInterviewSlot> BookedSlots { get; } = [];
    public (Guid SlotId, Guid ApplicationId)? LastBooked { get; private set; }

    public Task<List<InterviewSlot>> GetAvailableInterviewSlotsForClubAsync(Guid clubId, CancellationToken cancellationToken) => Task.FromResult(AvailableSlots);
    public Task<List<BookedInterviewSlot>> GetBookedInterviewSlotsForClubAsync(Guid clubId, CancellationToken cancellationToken) => Task.FromResult(BookedSlots);
    public Task BookInterviewSlotAsync(Guid slotId, Guid applicationId, CancellationToken cancellationToken)
    {
        LastBooked = (slotId, applicationId);
        return Task.CompletedTask;
    }
}

public class FakeAggregateReconstructor : IAggregateReconstructor
{
    public List<IStateRepresentation> States { get; } = [];
    public Task<List<IStateRepresentation>> GetLatestAggregateStates(List<Guid> aggregateIds, CancellationToken cancellationToken) => Task.FromResult(States);
}

public class FakeEventStore : IEventStore
{
    public List<IDomainEvent> AppendedEvents { get; } = [];
    public List<(Guid UserId, Guid ApplicationId, ApplicationSubmissionData Data)> CreatedApplications { get; } = [];

    public Task AppendEventAsync(IDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        AppendedEvents.Add(domainEvent);
        return Task.CompletedTask;
    }

    public Task CreateApplication(Guid userId, Guid applicationId, ApplicationSubmissionData applicationData, CancellationToken cancellationToken)
    {
        CreatedApplications.Add((userId, applicationId, applicationData));
        return Task.CompletedTask;
    }

    public Task<List<IDomainEvent>> GetEventsAsync(Guid aggregateId, CancellationToken cancellationToken) => Task.FromResult(new List<IDomainEvent>());
}

public class FakeEventBroker : IEventBroker
{
    public List<EventEnvelope> PublishedMessages { get; } = [];

    public ValueTask<EventEnvelope> ConsumeAsync(CancellationToken cancellationToken) => throw new NotSupportedException();

    public ValueTask PublishAsync(EventEnvelope message, CancellationToken cancellationToken)
    {
        PublishedMessages.Add(message);
        return ValueTask.CompletedTask;
    }
}
