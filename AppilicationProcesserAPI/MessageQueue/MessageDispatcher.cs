using System;

namespace AppilicationProcesserAPI.MessageQueue
{
    public class MessageDispatcher
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MessageDispatcher> _logger;

        public MessageDispatcher(IServiceProvider serviceProvider, ILogger<MessageDispatcher> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task DispatchAsync<TMessage>(TMessage message, CancellationToken cancellationToken = default) where TMessage : IMessageEnvelope
        {
            var eventType = message.GetType();
            var handlerType = typeof(IMessageHandler<>).MakeGenericType(eventType);
            using var scope = _serviceProvider.CreateScope();
            var handlers = scope.ServiceProvider.GetServices(handlerType);
            foreach (var handler in handlers)
            {
                var method = typeof(IMessageHandler<>).MakeGenericType(eventType).GetMethod(nameof(IMessageHandler<>.HandleAsync));
                if (method != null)
                {
                    try
                    {
                        await (Task)method.Invoke(handler, [message, cancellationToken])!;
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e, "Error handling message with AggregateId: {AggregateId} at {Timestamp}", message.AggregateId, message.Timestamp);
                    }
                }
            }
        }
    }
}
