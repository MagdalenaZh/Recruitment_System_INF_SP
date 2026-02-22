using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.MessageQueue;

namespace AppilicationProcesserAPI.Configurations
{
    public static class ServiceConfigurations
    {
        public static void ConfigureMessageBus(this IServiceCollection services)
        {
            services.AddSingleton<IMessageBroker, MessageBroker>();
            services.AddSingleton<IMessageEmitter, MessageEmitter>();

            services.AddSingleton<IAggregateManager, AggregateManager>();
            services.AddSingleton<IEventStore, EventStore>();

            services.AddHostedService<MessageBackgroundProcessor>();
        }
    }
}
