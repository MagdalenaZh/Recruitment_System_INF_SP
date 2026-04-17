using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Representations;
using AppilicationProcesserAPI.Visitors;
using Moq;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class AggregateReconstructorTests
{
    [Fact]
    public async Task GetLatestAggregateStates_EmptyEventList_ReturnsEmptyResults()
    {
        var eventStore = new Mock<IEventStore>();
        var reconstructor = new AggregateReconstructor(eventStore.Object, new StateVisitorFactory());

        var result = await reconstructor.GetLatestAggregateStates([], CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetLatestAggregateStates_SingleAggregate_ReturnsCorrectState()
    {
        var aggregateId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        eventStore.Setup(x => x.GetEventsAsync(aggregateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IDomainEvent>
            {
                new ApplicationSubmittedEvent(aggregateId, 2),
                new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()),
            });

        var reconstructor = new AggregateReconstructor(eventStore.Object, new StateVisitorFactory());

        var result = await reconstructor.GetLatestAggregateStates([aggregateId], CancellationToken.None);

        Assert.Single(result);
        var rep = Assert.IsType<ProcessingStateRepresentation>(result[0]);
        Assert.Equal(aggregateId, rep.ApplicationId);
        Assert.Equal(1, rep.CurrentNumberOfApprovals);
        Assert.Equal(2, rep.RequiredNumberOfApprovals);
    }

    [Fact]
    public async Task GetLatestAggregateStates_MultipleAggregates_ReturnsOnePerAggregate()
    {
        var id1 = Guid.NewGuid();
        var id2 = Guid.NewGuid();

        var eventStore = new Mock<IEventStore>();
        eventStore.Setup(x => x.GetEventsAsync(id1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IDomainEvent> { new ApplicationSubmittedEvent(id1, 1) });
        eventStore.Setup(x => x.GetEventsAsync(id2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IDomainEvent>
            {
                new ApplicationSubmittedEvent(id2, 1),
                new ApplicationApprovedEvent(id2, Guid.NewGuid())
            });

        var reconstructor = new AggregateReconstructor(eventStore.Object, new StateVisitorFactory());

        var result = await reconstructor.GetLatestAggregateStates([id1, id2], CancellationToken.None);

        Assert.Equal(2, result.Count);

        var rep1 = result.First(r => r.ApplicationId == id1);
        var rep2 = result.First(r => r.ApplicationId == id2);

        Assert.IsType<ProcessingStateRepresentation>(rep1);
        Assert.IsType<ApprovedStateRepresentation>(rep2);
    }

    [Fact]
    public async Task GetLatestAggregateStates_FullyAcceptedAggregate_ReturnsConcludedAccepted()
    {
        var aggregateId = Guid.NewGuid();
        var slot = new InterviewSlot(Guid.NewGuid(), DateTimeOffset.UtcNow.AddHours(-3), DateTimeOffset.UtcNow.AddHours(-2));

        var eventStore = new Mock<IEventStore>();
        eventStore.Setup(x => x.GetEventsAsync(aggregateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IDomainEvent>
            {
                new ApplicationSubmittedEvent(aggregateId, 1),
                new ApplicationApprovedEvent(aggregateId, Guid.NewGuid()),
                new BookInterviewSlotEvent(aggregateId, slot),
                new AfterInterviewApprovedEvent(aggregateId, Guid.NewGuid()),
                new ApplicationAcceptedEvent(aggregateId)
            });

        var reconstructor = new AggregateReconstructor(eventStore.Object, new StateVisitorFactory());

        var result = await reconstructor.GetLatestAggregateStates([aggregateId], CancellationToken.None);

        var rep = Assert.IsType<ConcludedStateRepresentation>(result[0]);
        Assert.Equal(ApplicationStatus.Accepted, rep.ConclusionResult);
    }

    [Fact]
    public async Task GetLatestAggregateStates_DuplicateIds_QueryStoreForEachId()
    {
        var aggregateId = Guid.NewGuid();
        var eventStore = new Mock<IEventStore>();
        eventStore.Setup(x => x.GetEventsAsync(aggregateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IDomainEvent> { new ApplicationSubmittedEvent(aggregateId, 1) });

        var reconstructor = new AggregateReconstructor(eventStore.Object, new StateVisitorFactory());

        var result = await reconstructor.GetLatestAggregateStates([aggregateId, aggregateId], CancellationToken.None);

        // Both results should exist (one per requested id, even if duplicate)
        Assert.Equal(2, result.Count);
    }
}
