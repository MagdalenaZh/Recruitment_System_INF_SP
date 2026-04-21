using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Representations;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

/// <summary>
/// Tests for model and representation constructors / properties.
/// Pure-object tests — no DB or infrastructure dependency.
/// </summary>
public class ModelAndRepresentationTests
{
    // ── DbModels ─────────────────────────────────────────────────────────────

    [Fact]
    public void ClubDatabaseModel_StoresAllProperties()
    {
        var id = Guid.NewGuid();
        var questions = new List<string> { "Why?" };
        var model = new ClubDatabaseModel(id, "Tech Club", questions, "Builds stuff", ClubCategories.Technology);

        Assert.Equal(id, model.ClubId);
        Assert.Equal("Tech Club", model.ClubName);
        Assert.Same(questions, model.AdmissionQuestions);
        Assert.Equal("Builds stuff", model.Description);
        Assert.Equal(ClubCategories.Technology, model.Category);
    }

    [Fact]
    public void DepartmentDatabaseModel_StoresAllProperties()
    {
        var deptId = Guid.NewGuid();
        var clubId = Guid.NewGuid();
        var model = new DepartmentDatabaseModel(deptId, clubId, "Dev", 5, "Does dev");

        Assert.Equal(deptId, model.DepartmentId);
        Assert.Equal(clubId, model.ClubId);
        Assert.Equal("Dev", model.DepartmentName);
        Assert.Equal(5, model.NumberOfOpenPositions);
        Assert.Equal("Does dev", model.Description);
    }

    [Fact]
    public void ApplicationDatabaseModel_StoresAllProperties()
    {
        var appId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var deptId = Guid.NewGuid();
        var questionnaire = new Dictionary<string, string> { ["q1"] = "a1" };
        var model = new ApplicationDatabaseModel(appId, userId, deptId, questionnaire, ApplicationStatus.InProgress, new CVFile("test", "test", new byte[0]));

        Assert.Equal(appId, model.ApplicationId);
        Assert.Equal(userId, model.UserId);
        Assert.Equal(deptId, model.DepartmentId);
        Assert.Same(questionnaire, model.Questionnaire);
        Assert.Equal(ApplicationStatus.InProgress, model.ApplicationStatus);
    }

    [Fact]
    public void InterviewSlot_StoresAllProperties()
    {
        var slotId = Guid.NewGuid();
        var start = DateTimeOffset.UtcNow.AddDays(1);
        var end = start.AddHours(1);
        var slot = new InterviewSlot(slotId, start, end);

        Assert.Equal(slotId, slot.SlotId);
        Assert.Equal(start, slot.StartTime);
        Assert.Equal(end, slot.EndTime);
    }

    [Fact]
    public void BookedInterviewSlot_StoresAllProperties()
    {
        var appId = Guid.NewGuid();
        var start = DateTimeOffset.UtcNow;
        var end = start.AddHours(1);
        var booked = new BookedInterviewSlot(appId, start, end);

        Assert.Equal(appId, booked.ApplicationId);
        Assert.Equal(start, booked.StartTime);
        Assert.Equal(end, booked.EndTime);
    }

    [Fact]
    public void UserDatabaseModel_StoresAllProperties()
    {
        var userId = Guid.NewGuid();
        var model = new UserDatabaseModel(userId, "Alice", "Smith", "alice@example.com", "3rd Year", "CS", new CVFile("test", "test", new byte[0]));

        Assert.Equal(userId, model.UserId);
        Assert.Equal("Alice", model.FirstName);
        Assert.Equal("Smith", model.LastName);
        Assert.Equal("alice@example.com", model.Email);
        Assert.Equal("3rd Year", model.AcademicYear);
        Assert.Equal("CS", model.StudyMajor);
    }

    [Fact]
    public void UserRightsDatabaseModel_StoresAllProperties()
    {
        var userId = Guid.NewGuid();
        var deptId = Guid.NewGuid();
        var clubAdminId = Guid.NewGuid();
        var model = new UserRightsDatabaseModel(userId, deptId, "ClubAdmin", clubAdminId);

        Assert.Equal(userId, model.UserId);
        Assert.Equal(deptId, model.DepartmentId);
        Assert.Equal("ClubAdmin", model.Role);
        Assert.Equal(clubAdminId, model.ClubAdminId);
    }

    [Fact]
    public void UserRightsDatabaseModel_NullableFields_CanBeNull()
    {
        var model = new UserRightsDatabaseModel(Guid.NewGuid(), null, "User", null);

        Assert.Null(model.DepartmentId);
        Assert.Null(model.ClubAdminId);
    }

    [Fact]
    public void NoteDatabaseModel_StoresAllProperties()
    {
        var noteId = Guid.NewGuid();
        var appId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var model = new NoteDatabaseModel(noteId, appId, userId, "Great candidate", "Jane Doe");

        Assert.Equal(noteId, model.NoteId);
        Assert.Equal(appId, model.ApplicationId);
        Assert.Equal(userId, model.UserId);
        Assert.Equal("Great candidate", model.Content);
        Assert.Equal("Jane Doe", model.AuthorName);
    }

    [Fact]
    public void RolesDatabaseModel_StoresAllProperties()
    {
        var roleId = Guid.NewGuid();
        var model = new RolesDatabaseModel(roleId, "ClubAdmin");

        Assert.Equal(roleId, model.RoleId);
        Assert.Equal("ClubAdmin", model.RoleName);
    }

    // ── DbRequestModels ──────────────────────────────────────────────────────

    [Fact]
    public void DbRequestModels_StoresClubNameAndCategory()
    {
        var model = new DbRequestModels("Chess Club", ClubCategories.Sports);

        Assert.Equal("Chess Club", model.ClubName);
        Assert.Equal(ClubCategories.Sports, model.Category);
    }

    [Fact]
    public void UpdateClubRequest_StoresAllProperties()
    {
        var questions = new List<string> { "q1", "q2" };
        var req = new UpdateClubRequest("New Name", questions, 4, "desc", ClubCategories.Technology);

        Assert.Equal("New Name", req.ClubName);
        Assert.Same(questions, req.ApplicationQuestions);
        Assert.Equal(4, req.RequiredApprovals);
        Assert.Equal("desc", req.Description);
        Assert.Equal(ClubCategories.Technology, req.Category);
    }

    [Fact]
    public void CreateDepartmentRequest_StoresAllProperties()
    {
        var clubId = Guid.NewGuid();
        var req = new CreateDepartmentRequest(clubId, "Engineering", 3, "Builds things");

        Assert.Equal(clubId, req.ClubId);
        Assert.Equal("Engineering", req.DepartmentName);
        Assert.Equal(3, req.NumberOfOpenPositions);
        Assert.Equal("Builds things", req.Description);
    }

    [Fact]
    public void UpdateDepartmentRequest_StoresAllProperties()
    {
        var req = new UpdateDepartmentRequest("Updated Dept", 10, "new desc");

        Assert.Equal("Updated Dept", req.DepartmentName);
        Assert.Equal(10, req.NumberOfOpenPositions);
        Assert.Equal("new desc", req.Description);
    }

    [Fact]
    public void CreateInterviewSlotRequest_StoresAllProperties()
    {
        var clubId = Guid.NewGuid();
        var start = DateTimeOffset.UtcNow.AddDays(1);
        var end = start.AddHours(1);
        var req = new CreateInterviewSlotRequest(clubId, start, end);

        Assert.Equal(clubId, req.ClubId);
        Assert.Equal(start, req.StartTime);
        Assert.Equal(end, req.EndTime);
    }

    [Fact]
    public void UpdateUserInformationRequest_StoresAllProperties()
    {
        var req = new UpdateUserInformationRequest("Alice", "Smith", "2nd Year", "CS", new byte[0]);

        Assert.Equal("Alice", req.FirstName);
        Assert.Equal("Smith", req.LastName);
        Assert.Equal("2nd Year", req.AcademicYear);
        Assert.Equal("CS", req.StudyMajor);
    }

    [Fact]
    public void AssignClubAdminRequest_StoresAllProperties()
    {
        var clubId = Guid.NewGuid();
        var roleId = Guid.NewGuid();
        var req = new AssignClubAdminRequest(clubId, roleId);

        Assert.Equal(clubId, req.ClubId);
        Assert.Equal(roleId, req.RoleId);
    }

    [Fact]
    public void AssignBoardMemberRequest_StoresAllProperties()
    {
        var deptId = Guid.NewGuid();
        var roleId = Guid.NewGuid();
        var req = new AssignBoardMemberRequest(deptId, roleId);

        Assert.Equal(deptId, req.DepartmentId);
        Assert.Equal(roleId, req.RoleId);
    }

    // ── Status Representations ───────────────────────────────────────────────

    [Fact]
    public void ConcludedStatusRepresentation_StoresApplicationIdAndStatus()
    {
        var appId = Guid.NewGuid();
        var rep = new ConcludedStatusRepresentation(appId, ApplicationStatus.Accepted);

        Assert.Equal(appId, rep.ApplicationId);
        Assert.Equal(ApplicationStatus.Accepted, rep.ApplicationStatus);
    }

    [Fact]
    public void PendingInterviewStatusRepresentation_HasInterviewScheduledStatus()
    {
        var appId = Guid.NewGuid();
        var rep = new PendingInterviewStatusRepresentation(appId);

        Assert.Equal(appId, rep.ApplicationId);
        Assert.Equal(ApplicationStatus.InterviewScheduled, rep.ApplicationStatus);
    }

    [Fact]
    public void InProgressStatusRepresentation_HasInProgressStatus()
    {
        var appId = Guid.NewGuid();
        var rep = new InProgressStatusRepresentation(appId);

        Assert.Equal(appId, rep.ApplicationId);
        Assert.Equal(ApplicationStatus.InProgress, rep.ApplicationStatus);
    }

    [Fact]
    public void InReviewStatusRepresentation_HasInReviewStatus()
    {
        var appId = Guid.NewGuid();
        var rep = new InReviewStatusRepresentation(appId);

        Assert.Equal(appId, rep.ApplicationId);
        Assert.Equal(ApplicationStatus.InReview, rep.ApplicationStatus);
    }

    // ── State Representations ────────────────────────────────────────────────

    [Fact]
    public void ProcessingStateRepresentation_StoresAllProperties()
    {
        var appId = Guid.NewGuid();
        var map = new Dictionary<Guid, bool> { [Guid.NewGuid()] = true };
        var rep = new ProcessingStateRepresentation
        {
            ApplicationId = appId,
            RequiredNumberOfApprovals = 3,
            CurrentNumberOfApprovals = 1,
            UserDecisionsMap = map
        };

        Assert.Equal(appId, rep.ApplicationId);
        Assert.Equal(3, rep.RequiredNumberOfApprovals);
        Assert.Equal(1, rep.CurrentNumberOfApprovals);
        Assert.Same(map, rep.UserDecisionsMap);
    }

    [Fact]
    public void HibernatedStateRepresentation_StoresAllProperties()
    {
        var appId = Guid.NewGuid();
        var rep = new HibernatedStateRepresentation { ApplicationId = appId, WaitingFinalDecision = true };

        Assert.Equal(appId, rep.ApplicationId);
        Assert.True(rep.WaitingFinalDecision);
    }

    [Fact]
    public void ConcludedStateRepresentation_StoresAllProperties()
    {
        var appId = Guid.NewGuid();
        var rep = new ConcludedStateRepresentation
        {
            ApplicationId = appId,
            ConclusionResult = ApplicationStatus.Rejected
        };

        Assert.Equal(appId, rep.ApplicationId);
        Assert.Equal(ApplicationStatus.Rejected, rep.ConclusionResult);
    }

    [Fact]
    public void ApprovedStateRepresentation_StoresAllProperties()
    {
        var appId = Guid.NewGuid();
        var rep = new ApprovedStateRepresentation { ApplicationId = appId, ApplicationApproved = true };

        Assert.Equal(appId, rep.ApplicationId);
        Assert.True(rep.ApplicationApproved);
    }

    [Fact]
    public void InitialRepresentation_StoresAllProperties()
    {
        var appId = Guid.NewGuid();
        var rep = new InitialRepresentation { ApplicationId = appId, ApplicationProcessed = false };

        Assert.Equal(appId, rep.ApplicationId);
        Assert.False(rep.ApplicationProcessed);
    }
}
