using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Representations;

namespace AppilicationProcesserAPI.MessageQueue
{
    public interface IMessageEnvelope<T> where T : class
    {
        public T MessageData { get; }
    }

    public abstract class MessageEnvelope<T> : IMessageEnvelope<T> where T : class
    {
        public T MessageData { get; }
        protected MessageEnvelope(T messageData)
        {
            MessageData = messageData;
        }
    }   

    public class EventEnvelope : MessageEnvelope<IDomainEvent>
    {
        public EventEnvelope(IDomainEvent domainEvent) : base(domainEvent)
        {}
    }

    public class StatusUpdateEnvelope : MessageEnvelope<IStatusRepresentation>
    {
        public StatusUpdateEnvelope(IStatusRepresentation statusUpdate) : base(statusUpdate)
        { }
    }
}
