using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Representations;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class BackgroundProcessorTests
{
    // ── EventBackgroundProcessor ─────────────────────────────────────────────

    [Fact]
    public async Task EventBackgroundProcessor_ConsumesMessageAndForwardsToAggregateEngine()
    {
        var aggregateId = Guid.NewGuid();
        var domainEvent = new ApplicationSubmittedEvent(aggregateId, 2);
        var envelope = new EventEnvelope(domainEvent);

        using var cts = new CancellationTokenSource();

        var broker = new Mock<IEventBroker>();
        broker.SetupSequence(x => x.ConsumeAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(envelope)
            .ThrowsAsync(new OperationCanceledException());

        var aggregateEngine = new Mock<IAggregateEngine>();
        aggregateEngine.Setup(x => x.HandleEvent(It.IsAny<IDomainEvent>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var processor = new EventBackgroundProcessor(
            broker.Object, aggregateEngine.Object,
            NullLogger<EventBackgroundProcessor>.Instance);

        cts.CancelAfter(TimeSpan.FromSeconds(2));
        await processor.StartAsync(CancellationToken.None);

        // Give the background task time to process the message
        await Task.Delay(200, CancellationToken.None);
        await processor.StopAsync(CancellationToken.None);

        aggregateEngine.Verify(x => x.HandleEvent(domainEvent, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task EventBackgroundProcessor_NonCancellationException_LogsAndContinues()
    {
        using var cts = new CancellationTokenSource();
        var callCount = 0;

        var broker = new Mock<IEventBroker>();
        broker.Setup(x => x.ConsumeAsync(It.IsAny<CancellationToken>()))
            .Returns(() =>
            {
                callCount++;
                if (callCount == 1)
                    throw new InvalidOperationException("transient error");
                throw new OperationCanceledException();
            });

        var aggregateEngine = new Mock<IAggregateEngine>();

        var processor = new EventBackgroundProcessor(
            broker.Object, aggregateEngine.Object,
            NullLogger<EventBackgroundProcessor>.Instance);

        await processor.StartAsync(CancellationToken.None);
        await Task.Delay(200, CancellationToken.None);
        await processor.StopAsync(CancellationToken.None);

        // Was called at least twice (once for the exception, once for OperationCancelledException)
        Assert.True(callCount >= 2);
    }

    [Fact]
    public async Task EventBackgroundProcessor_OperationCanceledException_StopsGracefully()
    {
        var broker = new Mock<IEventBroker>();
        broker.Setup(x => x.ConsumeAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new OperationCanceledException());

        var aggregateEngine = new Mock<IAggregateEngine>();

        var processor = new EventBackgroundProcessor(
            broker.Object, aggregateEngine.Object,
            NullLogger<EventBackgroundProcessor>.Instance);

        await processor.StartAsync(CancellationToken.None);
        await Task.Delay(100, CancellationToken.None);

        // Should not throw
        await processor.StopAsync(CancellationToken.None);
    }

    // ── ApplicationStatusBackgroundProcessor ────────────────────────────────

    [Fact]
    public async Task ApplicationStatusBackgroundProcessor_ProcessesStatusUpdate()
    {
        var applicationId = Guid.NewGuid();
        var statusRep = new InProgressStatusRepresentation(applicationId);
        var envelope = new StatusUpdateEnvelope(statusRep);

        var statusManager = new Mock<IApplicationStatusManager>();
        statusManager.SetupSequence(x => x.GetApplicationStatus(It.IsAny<CancellationToken>()))
            .ReturnsAsync(envelope)
            .ThrowsAsync(new OperationCanceledException());

        var finalizer = new Mock<IApplicationFinalizer>();
        finalizer.Setup(x => x.UpdateApplicationStatusAsync(It.IsAny<StatusUpdateEnvelope>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var processor = new ApplicationStatusBackgroundProcessor(
            finalizer.Object, statusManager.Object,
            NullLogger<ApplicationStatusBackgroundProcessor>.Instance);

        await processor.StartAsync(CancellationToken.None);
        await Task.Delay(200, CancellationToken.None);
        await processor.StopAsync(CancellationToken.None);

        finalizer.Verify(x => x.UpdateApplicationStatusAsync(envelope, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ApplicationStatusBackgroundProcessor_OperationCancelledException_StopsGracefully()
    {
        var statusManager = new Mock<IApplicationStatusManager>();
        statusManager.Setup(x => x.GetApplicationStatus(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new OperationCanceledException());

        var finalizer = new Mock<IApplicationFinalizer>();

        var processor = new ApplicationStatusBackgroundProcessor(
            finalizer.Object, statusManager.Object,
            NullLogger<ApplicationStatusBackgroundProcessor>.Instance);

        await processor.StartAsync(CancellationToken.None);
        await Task.Delay(100, CancellationToken.None);
        await processor.StopAsync(CancellationToken.None);
    }

    [Fact]
    public async Task ApplicationStatusBackgroundProcessor_NonCancellationException_ContinuesLoop()
    {
        var callCount = 0;

        var statusManager = new Mock<IApplicationStatusManager>();
        statusManager.Setup(x => x.GetApplicationStatus(It.IsAny<CancellationToken>()))
            .Returns(() =>
            {
                callCount++;
                if (callCount == 1)
                    throw new InvalidOperationException("db failure");
                throw new OperationCanceledException();
            });

        var finalizer = new Mock<IApplicationFinalizer>();

        var processor = new ApplicationStatusBackgroundProcessor(
            finalizer.Object, statusManager.Object,
            NullLogger<ApplicationStatusBackgroundProcessor>.Instance);

        await processor.StartAsync(CancellationToken.None);
        await Task.Delay(200, CancellationToken.None);
        await processor.StopAsync(CancellationToken.None);

        Assert.True(callCount >= 2);
    }
}
