using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Representations;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class RepresentationEmitterTests
{
    [Fact]
    public async Task ReadRepresentationsStates_ReplaysBufferedEventsAfterLastEventId()
    {
        var emitter = new RepresentationEmitter(NullLogger<RepresentationEmitter>.Instance);
        var applicationId = Guid.NewGuid();
        var clientId = Guid.NewGuid();

        var firstTs = DateTimeOffset.Parse("2026-04-08T10:00:00+00:00");
        var secondTs = DateTimeOffset.Parse("2026-04-08T10:01:00+00:00");

        var first = new InitialRepresentation { ApplicationId = applicationId, ApplicationProcessed = true };
        var second = new ApprovedStateRepresentation { ApplicationId = applicationId, ApplicationApproved = true };

        await emitter.EmmitApplicationStateChanges(first, firstTs, CancellationToken.None);
        await emitter.EmmitApplicationStateChanges(second, secondTs, CancellationToken.None);

        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(200));
        var results = new List<IStateRepresentation>();

        await foreach (var item in emitter.ReadRepresentationsStates(clientId, [applicationId], firstTs.ToString(), cts.Token))
        {
            results.Add(item);
            break;
        }

        Assert.Single(results);
        Assert.IsType<ApprovedStateRepresentation>(results[0]);
    }

    [Fact]
    public async Task ReadRepresentationsStates_PushesLiveEventsToSubscribedClient()
    {
        var emitter = new RepresentationEmitter(NullLogger<RepresentationEmitter>.Instance);
        var applicationId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var representation = new HibernatedStateRepresentation
        {
            ApplicationId = applicationId,
            WaitingFinalDecision = true
        };

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(1));

        var readTask = Task.Run(async () =>
        {
            await foreach (var item in emitter.ReadRepresentationsStates(clientId, [applicationId], null, cts.Token))
            {
                return item;
            }

            throw new InvalidOperationException("No item was received.");
        }, cts.Token);

        await Task.Delay(50, cts.Token);
        await emitter.EmmitApplicationStateChanges(representation, DateTimeOffset.UtcNow, cts.Token);

        var received = await readTask;

        Assert.IsType<HibernatedStateRepresentation>(received);
        Assert.Equal(applicationId, received.ApplicationId);
    }

    [Fact]
    public async Task EmmitApplicationStateChanges_NullRepresentation_ThrowsArgumentNullException()
    {
        var emitter = new RepresentationEmitter(NullLogger<RepresentationEmitter>.Instance);

        await Assert.ThrowsAsync<ArgumentNullException>(() =>
            emitter.EmmitApplicationStateChanges(null!, DateTimeOffset.UtcNow, CancellationToken.None).AsTask());
    }

    [Fact]
    public async Task ReadRepresentationsStates_NoLastEventId_DoesNotReplayBuffer()
    {
        var emitter = new RepresentationEmitter(NullLogger<RepresentationEmitter>.Instance);
        var applicationId = Guid.NewGuid();

        var buffered = new ProcessingStateRepresentation
        {
            ApplicationId = applicationId,
            RequiredNumberOfApprovals = 2,
            CurrentNumberOfApprovals = 0,
            UserDecisionsMap = new Dictionary<Guid, bool>()
        };

        await emitter.EmmitApplicationStateChanges(buffered, DateTimeOffset.UtcNow.AddMinutes(-5), CancellationToken.None);

        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(150));
        var results = new List<IStateRepresentation>();

        try
        {
            await foreach (var item in emitter.ReadRepresentationsStates(Guid.NewGuid(), [applicationId], null, cts.Token))
                results.Add(item);
        }
        catch (OperationCanceledException) { }

        // No lastEventId → only live events replayed, buffer not yielded
        Assert.Empty(results);
    }

    [Fact]
    public async Task EmmitApplicationStateChanges_MultipleClients_ReceiveSameEvent()
    {
        var emitter = new RepresentationEmitter(NullLogger<RepresentationEmitter>.Instance);
        var applicationId = Guid.NewGuid();

        var representation = new ConcludedStateRepresentation
        {
            ApplicationId = applicationId,
            ConclusionResult = AppilicationProcesserAPI.DomainEvents.ApplicationStatus.Accepted
        };

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));

        var readTask1 = Task.Run(async () =>
        {
            await foreach (var item in emitter.ReadRepresentationsStates(Guid.NewGuid(), [applicationId], null, cts.Token))
                return item;
            throw new InvalidOperationException("No item received by client 1.");
        });

        var readTask2 = Task.Run(async () =>
        {
            await foreach (var item in emitter.ReadRepresentationsStates(Guid.NewGuid(), [applicationId], null, cts.Token))
                return item;
            throw new InvalidOperationException("No item received by client 2.");
        });

        await Task.Delay(80, CancellationToken.None);
        await emitter.EmmitApplicationStateChanges(representation, DateTimeOffset.UtcNow, cts.Token);

        var r1 = await readTask1;
        var r2 = await readTask2;

        Assert.Equal(applicationId, r1.ApplicationId);
        Assert.Equal(applicationId, r2.ApplicationId);
    }

    [Fact]
    public async Task ReadRepresentationsStates_UnknownLastEventId_YieldsNothingFromBuffer()
    {
        var emitter = new RepresentationEmitter(NullLogger<RepresentationEmitter>.Instance);
        var applicationId = Guid.NewGuid();

        var rep = new ApprovedStateRepresentation { ApplicationId = applicationId, ApplicationApproved = true };
        await emitter.EmmitApplicationStateChanges(rep, DateTimeOffset.UtcNow.AddMinutes(-1), CancellationToken.None);

        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(150));
        var results = new List<IStateRepresentation>();

        try
        {
            await foreach (var item in emitter.ReadRepresentationsStates(Guid.NewGuid(), [applicationId], "nonexistent-event-id", cts.Token))
                results.Add(item);
        }
        catch (OperationCanceledException) { }

        // The buffer item's EventId doesn't match → SkipWhile never stops → nothing yielded
        Assert.Empty(results);
    }
}
