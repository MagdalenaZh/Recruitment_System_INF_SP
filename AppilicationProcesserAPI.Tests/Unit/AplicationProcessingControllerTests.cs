using System.Security.Claims;
using AppilicationProcesserAPI.Controllers;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class AplicationProcessingControllerTests
{
    // ── SubmitApplication ────────────────────────────────────────────────────

    [Fact]
    public async Task SubmitApplication_WhenNotAuthorized_ReturnsForbid()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanSubmitApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var controller = CreateController(authScope.Object);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.SubmitApplication(
            new ApplicationSubmissionData(Guid.NewGuid(), new Dictionary<string, string>(), new byte[0]),
            CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task SubmitApplication_WithoutUserClaim_ReturnsUnauthorized()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanSubmitApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = CreateController(authScope.Object);
        SetUserWithNoIdentifierClaim(controller);

        var result = await controller.SubmitApplication(
            new ApplicationSubmissionData(Guid.NewGuid(), new Dictionary<string, string>(), new byte[0]),
            CancellationToken.None);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task SubmitApplication_WithUserClaim_CreatesAndPublishesEvent()
    {
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        var recruitmentProvider = new Mock<IRecruitmentDataProvider>();
        recruitmentProvider
            .Setup(x => x.GetRequiredNumberOfApprovalsForDepartmentAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanSubmitApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object,
            Mock.Of<ICalendarProvider>(),
            broker.Object,
            recruitmentProvider.Object,
            authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);

        var userId = Guid.NewGuid();
        SetUser(controller, userId);

        var request = new ApplicationSubmissionData(Guid.NewGuid(), new Dictionary<string, string> { ["why"] = "because" }, new byte[0]);

        var result = await controller.SubmitApplication(request, CancellationToken.None);

        var accepted = Assert.IsType<AcceptedResult>(result);
        eventStore.Verify(x => x.CreateApplication(userId, It.IsAny<Guid>(), request, It.IsAny<CancellationToken>()), Times.Once);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<ApplicationSubmittedEvent>(e => e.RequiredNumberOfApprovals == 2), It.IsAny<CancellationToken>()), Times.Once);
        broker.Verify(x => x.PublishAsync(It.IsAny<EventEnvelope>(), It.IsAny<CancellationToken>()), Times.Once);
        Assert.NotNull(accepted.Value);
    }

    [Fact]
    public async Task SubmitApplication_WhenBrokerThrows_Returns500()
    {
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        broker.Setup(x => x.PublishAsync(It.IsAny<EventEnvelope>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("fail"));
        var recruitmentProvider = new Mock<IRecruitmentDataProvider>();
        recruitmentProvider
            .Setup(x => x.GetRequiredNumberOfApprovalsForDepartmentAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanSubmitApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, Mock.Of<ICalendarProvider>(), broker.Object,
            recruitmentProvider.Object, authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.SubmitApplication(
            new ApplicationSubmissionData(Guid.NewGuid(), new Dictionary<string, string>(), new byte[0]),
            CancellationToken.None);

        var status = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, status.StatusCode);
    }

    // ── ApproveApplication ───────────────────────────────────────────────────

    [Fact]
    public async Task ApproveApplication_WhenNotAuthorized_ReturnsForbid()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var controller = CreateController(authScope.Object);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.ApproveApplication(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task ApproveApplication_WithoutUserClaim_ReturnsUnauthorized()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = CreateController(authScope.Object);
        SetUserWithNoIdentifierClaim(controller);

        var result = await controller.ApproveApplication(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task ApproveApplication_Success_ReturnsOkAndAppendsEvent()
    {
        var applicationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), applicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, Mock.Of<ICalendarProvider>(), broker.Object,
            Mock.Of<IRecruitmentDataProvider>(), authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);
        SetUser(controller, userId);

        var result = await controller.ApproveApplication(applicationId, CancellationToken.None);

        Assert.IsType<OkResult>(result);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<ApplicationApprovedEvent>(e => e.AggregateId == applicationId && e.UserId == userId), It.IsAny<CancellationToken>()), Times.Once);
        broker.Verify(x => x.PublishAsync(It.IsAny<EventEnvelope>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ApproveApplication_WhenBrokerThrows_Returns500()
    {
        var applicationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        broker.Setup(x => x.PublishAsync(It.IsAny<EventEnvelope>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("boom"));
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, Mock.Of<ICalendarProvider>(), broker.Object,
            Mock.Of<IRecruitmentDataProvider>(), authScope.Object,
            NullLogger<AplicationProcessingController>.Instance)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.NameIdentifier, userId.ToString())], "Test"))
                }
            }
        };

        var result = await controller.ApproveApplication(applicationId, CancellationToken.None);

        var status = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, status.StatusCode);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<ApplicationApprovedEvent>(e => e.AggregateId == applicationId && e.UserId == userId), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── DisapproveApplication ────────────────────────────────────────────────

    [Fact]
    public async Task DisapproveApplication_WhenNotAuthorized_ReturnsForbid()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var controller = CreateController(authScope.Object);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.DisapproveApplication(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task DisapproveApplication_Success_ReturnsOk()
    {
        var applicationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), applicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, Mock.Of<ICalendarProvider>(), broker.Object,
            Mock.Of<IRecruitmentDataProvider>(), authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);
        SetUser(controller, userId);

        var result = await controller.DisapproveApplication(applicationId, CancellationToken.None);

        Assert.IsType<OkResult>(result);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<ApplicationDisapprovedEvent>(e => e.AggregateId == applicationId && e.UserId == userId), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── AfterInterviewApproveApplication ────────────────────────────────────

    [Fact]
    public async Task AfterInterviewApproveApplication_WhenNotAuthorized_ReturnsForbid()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var controller = CreateController(authScope.Object);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.AfterInterviewApproveApplication(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task AfterInterviewApproveApplication_Success_AppendsAfterInterviewEvent()
    {
        var applicationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), applicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, Mock.Of<ICalendarProvider>(), broker.Object,
            Mock.Of<IRecruitmentDataProvider>(), authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);
        SetUser(controller, userId);

        var result = await controller.AfterInterviewApproveApplication(applicationId, CancellationToken.None);

        Assert.IsType<OkResult>(result);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<AfterInterviewApprovedEvent>(e => e.AggregateId == applicationId && e.UserId == userId), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── AfterInterviewDisapproveApplication ─────────────────────────────────

    [Fact]
    public async Task AfterInterviewDisapproveApplication_WhenNotAuthorized_ReturnsForbid()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var controller = CreateController(authScope.Object);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.AfterInterviewDisapproveApplication(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task AfterInterviewDisapproveApplication_Success_AppendsEvent()
    {
        var applicationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanReviewApplicationAsync(It.IsAny<ClaimsPrincipal>(), applicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, Mock.Of<ICalendarProvider>(), broker.Object,
            Mock.Of<IRecruitmentDataProvider>(), authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);
        SetUser(controller, userId);

        var result = await controller.AfterInterviewDisapproveApplication(applicationId, CancellationToken.None);

        Assert.IsType<OkResult>(result);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<AfterInterviewDisapprovedEvent>(e => e.AggregateId == applicationId && e.UserId == userId), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── RejectInterviewProposal ──────────────────────────────────────────────

    [Fact]
    public async Task RejectInterviewProposal_WhenNotAuthorized_ReturnsForbid()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanBookInterviewSlotAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var controller = CreateController(authScope.Object);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.RejectInterviewProposal(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task RejectInterviewProposal_Success_AppendsAndPublishesEvent()
    {
        var applicationId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanBookInterviewSlotAsync(It.IsAny<ClaimsPrincipal>(), applicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, Mock.Of<ICalendarProvider>(), broker.Object,
            Mock.Of<IRecruitmentDataProvider>(), authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.RejectInterviewProposal(applicationId, CancellationToken.None);

        Assert.IsType<OkResult>(result);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<InterviewProposalRejectedEvent>(e => e.AggregateId == applicationId), It.IsAny<CancellationToken>()), Times.Once);
        broker.Verify(x => x.PublishAsync(It.IsAny<EventEnvelope>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── BookInterviewSlot ────────────────────────────────────────────────────

    [Fact]
    public async Task BookInterviewSlot_WhenNotAuthorized_ReturnsForbid()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanBookInterviewSlotAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var controller = CreateController(authScope.Object);
        SetUser(controller, Guid.NewGuid());
        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1));

        var result = await controller.BookInterviewSlot(Guid.NewGuid(), slot, CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task BookInterviewSlot_Success_BooksSlotAndAppendsEvent()
    {
        var applicationId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        var calendar = new Mock<ICalendarProvider>();
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanBookInterviewSlotAsync(It.IsAny<ClaimsPrincipal>(), applicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, calendar.Object, broker.Object,
            Mock.Of<IRecruitmentDataProvider>(), authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);
        SetUser(controller, Guid.NewGuid());

        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1));
        var result = await controller.BookInterviewSlot(applicationId, slot, CancellationToken.None);

        Assert.IsType<OkResult>(result);
        calendar.Verify(x => x.BookInterviewSlotAsync(slot.SlotId, applicationId, It.IsAny<CancellationToken>()), Times.Once);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<BookInterviewSlotEvent>(e => e.AggregateId == applicationId), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── ConcludeRejectedApplication ──────────────────────────────────────────

    [Fact]
    public async Task ConcludeRejectedApplication_WhenNotAuthorized_ReturnsForbid()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanConcludeApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var controller = CreateController(authScope.Object);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.ConcludeRejectedApplication(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task ConcludeRejectedApplication_Success_AppendsRejectedEvent()
    {
        var applicationId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanConcludeApplicationAsync(It.IsAny<ClaimsPrincipal>(), applicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, Mock.Of<ICalendarProvider>(), broker.Object,
            Mock.Of<IRecruitmentDataProvider>(), authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.ConcludeRejectedApplication(applicationId, CancellationToken.None);

        Assert.IsType<OkResult>(result);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<ApplicationRejectedEvent>(e => e.AggregateId == applicationId), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── ConcludeAcceptedApplication ──────────────────────────────────────────

    [Fact]
    public async Task ConcludeAcceptedApplication_WhenNotAuthorized_ReturnsForbid()
    {
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanConcludeApplicationAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var controller = CreateController(authScope.Object);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.ConcludeAcceptedApplication(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task ConcludeAcceptedApplication_Success_AppendsAcceptedEvent()
    {
        var applicationId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var broker = new Mock<IEventBroker>();
        var authScope = new Mock<IAuthorizationScopeService>();
        authScope.Setup(x => x.CanConcludeApplicationAsync(It.IsAny<ClaimsPrincipal>(), applicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var controller = new AplicationProcessingController(
            eventStore.Object, Mock.Of<ICalendarProvider>(), broker.Object,
            Mock.Of<IRecruitmentDataProvider>(), authScope.Object,
            NullLogger<AplicationProcessingController>.Instance);
        SetUser(controller, Guid.NewGuid());

        var result = await controller.ConcludeAcceptedApplication(applicationId, CancellationToken.None);

        Assert.IsType<OkResult>(result);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<ApplicationAcceptedEvent>(e => e.AggregateId == applicationId), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static AplicationProcessingController CreateController(IAuthorizationScopeService? authScope = null)
    {
        return new AplicationProcessingController(
            Mock.Of<IEventStore>(),
            Mock.Of<ICalendarProvider>(),
            Mock.Of<IEventBroker>(),
            Mock.Of<IRecruitmentDataProvider>(),
            authScope ?? Mock.Of<IAuthorizationScopeService>(),
            NullLogger<AplicationProcessingController>.Instance);
    }

    private static void SetUser(ControllerBase controller, Guid userId)
    {
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.NameIdentifier, userId.ToString())], "Test"))
            }
        };
    }

    private static void SetUserWithNoIdentifierClaim(ControllerBase controller)
    {
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.Email, "noid@example.com")], "Test"))
            }
        };
    }
}
