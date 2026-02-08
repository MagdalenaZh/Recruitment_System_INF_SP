using System.Threading.Channels;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageBroker
    {
        ValueTask PublishAsync<TMessage>(TMessage message, CancellationToken cancellationToken = default) where TMessage : IMessageEnvelope;

        ChannelReader<IMessageEnvelope> GetReader();
    }

    public interface IMessageHandler<in TMessage> where TMessage : IMessageEnvelope
    {
        ValueTask HandleAsync(TMessage message, CancellationToken cancellationToken = default);
    }
}
