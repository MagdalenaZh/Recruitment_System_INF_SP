using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Representations;
using AppilicationProcesserAPI.Visitors;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class AggregateEngineTests
{
    [Fact]
    public async Task HandleEvent_NewAggregate_CreatesAggregateFromEventStore_AndEmitsState()
    {
        var aggregateId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        eventStore.Setup(x => x.GetEventsAsync(aggregateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IDomainEvent>());

        var emitter = new Mock<IRepresentationEmitter>();
        var statusManager = new Mock<IApplicationStatusManager>();

        var engine = new AggregateEngine(
            emitter.Object,
            eventStore.Object,
            new StateVisitorFactory(),
            statusManager.Object,
            NullLogger<AggregateEngine>.Instance);

        var domainEvent = new ApplicationSubmittedEvent(aggregateId, 2);
        await engine.HandleEvent(domainEvent, CancellationToken.None);

        eventStore.Verify(x => x.GetEventsAsync(aggregateId, It.IsAny<CancellationToken>()), Times.Once);
        emitter.Verify(x => x.EmmitApplicationStateChanges(It.IsAny<IStateRepresentation>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()), Times.Once);
        statusManager.Verify(x => x.UpdateApplicationStatus(It.IsAny<IStateRepresentation>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleEvent_ExistingAggregateInCache_SkipsEventStoreLoad()
    {
        var aggregateId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        eventStore.Setup(x => x.GetEventsAsync(aggregateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IDomainEvent>());

        var emitter = new Mock<IRepresentationEmitter>();
        var statusManager = new Mock<IApplicationStatusManager>();

        var engine = new AggregateEngine(
            emitter.Object,
            eventStore.Object,
            new StateVisitorFactory(),
            statusManager.Object,
            NullLogger<AggregateEngine>.Instance);

        // First event loads from store and caches
        await engine.HandleEvent(new ApplicationSubmittedEvent(aggregateId, 2), CancellationToken.None);
        // Second event should use cached aggregate
        await engine.HandleEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()), CancellationToken.None);

        // GetEventsAsync should only be called once (on first event)
        eventStore.Verify(x => x.GetEventsAsync(aggregateId, It.IsAny<CancellationToken>()), Times.Once);
        emitter.Verify(x => x.EmmitApplicationStateChanges(It.IsAny<IStateRepresentation>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
    }

    [Fact]
    public async Task HandleEvent_WithPriorEventsInStore_ReplaysThenAppliesNew()
    {
        var aggregateId = Guid.NewGuid();
        var priorEvent = new ApplicationSubmittedEvent(aggregateId, 1);
        var eventStore = new Mock<IEventStore>();
        eventStore.Setup(x => x.GetEventsAsync(aggregateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IDomainEvent> { priorEvent });

        var emitter = new Mock<IRepresentationEmitter>();
        IStateRepresentation? capturedRepresentation = null;
        emitter.Setup(x => x.EmmitApplicationStateChanges(It.IsAny<IStateRepresentation>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .Callback<IStateRepresentation, DateTimeOffset, CancellationToken>((rep, _, _) => capturedRepresentation = rep)
            .Returns(ValueTask.CompletedTask);

        var statusManager = new Mock<IApplicationStatusManager>();

        var engine = new AggregateEngine(
            emitter.Object,
            eventStore.Object,
            new StateVisitorFactory(),
            statusManager.Object,
            NullLogger<AggregateEngine>.Instance);

        // Applying approval event — prior submitted event is replayed from store
        await engine.HandleEvent(new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()), CancellationToken.None);

        // After submitting (required=1) + 1 approval → should be in ApprovedState
        Assert.NotNull(capturedRepresentation);
        Assert.IsType<ApprovedStateRepresentation>(capturedRepresentation);
    }

    [Fact]
    public async Task HandleEvent_EmittedRepresentationContainsCorrectApplicationId()
    {
        var aggregateId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        eventStore.Setup(x => x.GetEventsAsync(aggregateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IDomainEvent>());

        IStateRepresentation? capturedRepresentation = null;
        var emitter = new Mock<IRepresentationEmitter>();
        emitter.Setup(x => x.EmmitApplicationStateChanges(It.IsAny<IStateRepresentation>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .Callback<IStateRepresentation, DateTimeOffset, CancellationToken>((rep, _, _) => capturedRepresentation = rep)
            .Returns(ValueTask.CompletedTask);

        var statusManager = new Mock<IApplicationStatusManager>();

        var engine = new AggregateEngine(
            emitter.Object,
            eventStore.Object,
            new StateVisitorFactory(),
            statusManager.Object,
            NullLogger<AggregateEngine>.Instance);

        await engine.HandleEvent(new ApplicationSubmittedEvent(aggregateId, 2), CancellationToken.None);

        Assert.NotNull(capturedRepresentation);
        Assert.Equal(aggregateId, capturedRepresentation!.ApplicationId);
    }
}
