using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.MessageQueue;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class EventBrokerTests
{
    [Fact]
    public async Task PublishAsync_NullMessage_ThrowsArgumentNullException()
    {
        var broker = new EventBroker(NullLogger<EventBroker>.Instance);

        await Assert.ThrowsAsync<ArgumentNullException>(() =>
            broker.PublishAsync(null!, CancellationToken.None).AsTask());
    }

    [Fact]
    public async Task PublishAsync_ValidMessage_CanBeConsumed()
    {
        var broker = new EventBroker(NullLogger<EventBroker>.Instance);
        var aggregateId = Guid.NewGuid();
        var domainEvent = new ApplicationSubmittedEvent(aggregateId, 2);
        var envelope = new EventEnvelope(domainEvent);

        await broker.PublishAsync(envelope, CancellationToken.None);
        var consumed = await broker.ConsumeAsync(CancellationToken.None);

        Assert.Same(envelope, consumed);
        Assert.Equal(aggregateId, consumed.MessageData.AggregateId);
    }

    [Fact]
    public async Task PublishAsync_MultipleMessages_ConsumedInOrder()
    {
        var broker = new EventBroker(NullLogger<EventBroker>.Instance);
        var id1 = Guid.NewGuid();
        var id2 = Guid.NewGuid();
        var e1 = new EventEnvelope(new ApplicationSubmittedEvent(id1, 1));
        var e2 = new EventEnvelope(new ApplicationSubmittedEvent(id2, 2));

        await broker.PublishAsync(e1, CancellationToken.None);
        await broker.PublishAsync(e2, CancellationToken.None);

        var c1 = await broker.ConsumeAsync(CancellationToken.None);
        var c2 = await broker.ConsumeAsync(CancellationToken.None);

        Assert.Equal(id1, c1.MessageData.AggregateId);
        Assert.Equal(id2, c2.MessageData.AggregateId);
    }

    [Fact]
    public async Task ConsumeAsync_WhenCancelled_ThrowsOperationCancelledException()
    {
        var broker = new EventBroker(NullLogger<EventBroker>.Instance);
        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(30));

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            broker.ConsumeAsync(cts.Token).AsTask());
    }
}
