using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageBroker
    {
        ValueTask PublishAsync(IMessageEnvelope message, CancellationToken cancellationToken = default);

        ValueTask<IMessageEnvelope> ConsumeAsync(CancellationToken cancellationToken = default);
    }
}
