using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Visitors;

namespace AppilicationProcesserAPI.Configurations
{
    public static class ServiceConfigurations
    {
        public static void ConfigureMessageBus(this IServiceCollection services)
        {
            services.AddSingleton<IMessageBroker, MessageBroker>();
            services.AddSingleton<IRepresentationEmitter, RepresentationEmitter>();

            services.AddHostedService<MessageBackgroundProcessor>();
        }

        public static void ConfigureAggregateManagment(this IServiceCollection services)
        {
            services.AddSingleton<IStateVisitorFactory, StateVisitorFactory>();
            services.AddSingleton<IEventStore, EventStore>();
            services.AddSingleton<IAggregateManager, AggregateManager>();
        }
    }
}
