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
}
