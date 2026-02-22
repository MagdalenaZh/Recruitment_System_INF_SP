using AppilicationProcesserAPI.DomainEvents;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageEnvelope
    {
        public IDomainEvent EventData { get; }
    }

    public class MessageEnvelope : IMessageEnvelope
    {
        public  IDomainEvent EventData { get; }

        public MessageEnvelope(IDomainEvent domainEvent)
        {
           EventData = domainEvent;
        }
    }
}
