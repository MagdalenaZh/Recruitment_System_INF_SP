using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageEnvelope
    {
        public IDomainEvent EventData { get; }
        Task RunPayload(CancellationToken cancellationToken);
    }

    public class MessageEnvelope : IMessageEnvelope
    {
        public  IDomainEvent EventData { get; }

        public MessageEnvelope(IDomainEvent domainEvent)
        {
           EventData = domainEvent;
        }

        public Task RunPayload(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
