using System.Security.Claims;
using AppilicationProcesserAPI.Controllers;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class AplicationProcessingControllerTests
{
    [Fact]
    public async Task SubmitApplication_WithoutUserClaim_ReturnsUnauthorized()
    {
        var controller = CreateController();

        var result = await controller.SubmitApplication(
            new ApplicationSubmissionData(Guid.NewGuid(), new Dictionary<string, string>()),
            CancellationToken.None);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task SubmitApplication_WithUserClaim_CreatesAndPublishesEvent()
    {
        var eventStore = new Mock<IEventStore>();
        var calendarProvider = new Mock<ICalendarProvider>();
        var broker = new Mock<IEventBroker>();
        var recruitmentProvider = new Mock<IRecruitmentDataProvider>();
        recruitmentProvider
            .Setup(x => x.GetRequiredNumberOfApprovalsForDepartmentAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        var controller = new AplicationProcessingController(
            eventStore.Object,
            calendarProvider.Object,
            broker.Object,
            recruitmentProvider.Object,
            NullLogger<AplicationProcessingController>.Instance);

        var userId = Guid.NewGuid();
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString())
                ], "Test"))
            }
        };

        var request = new ApplicationSubmissionData(Guid.NewGuid(), new Dictionary<string, string>
        {
            ["why"] = "because"
        });

        var result = await controller.SubmitApplication(request, CancellationToken.None);

        var accepted = Assert.IsType<AcceptedResult>(result);
        eventStore.Verify(x => x.CreateApplication(userId, It.IsAny<Guid>(), request, It.IsAny<CancellationToken>()), Times.Once);
        eventStore.Verify(x => x.AppendEventAsync(It.Is<ApplicationSubmittedEvent>(e => e.RequiredNumberOfApprovals == 2), It.IsAny<CancellationToken>()), Times.Once);
        broker.Verify(x => x.PublishAsync(It.IsAny<EventEnvelope>(), It.IsAny<CancellationToken>()), Times.Once);
        Assert.NotNull(accepted.Value);
    }

    [Fact]
    public async Task ApproveApplication_WhenBrokerThrows_Returns500()
    {
        var applicationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        var calendarProvider = new Mock<ICalendarProvider>();
        var broker = new Mock<IEventBroker>();
        broker.Setup(x => x.PublishAsync(It.IsAny<EventEnvelope>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("boom"));
        var recruitmentProvider = new Mock<IRecruitmentDataProvider>();

        var controller = new AplicationProcessingController(
            eventStore.Object,
            calendarProvider.Object,
            broker.Object,
            recruitmentProvider.Object,
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

    private static AplicationProcessingController CreateController()
    {
        return new AplicationProcessingController(
            Mock.Of<IEventStore>(),
            Mock.Of<ICalendarProvider>(),
            Mock.Of<IEventBroker>(),
            Mock.Of<IRecruitmentDataProvider>(),
            NullLogger<AplicationProcessingController>.Instance);
    }
}
