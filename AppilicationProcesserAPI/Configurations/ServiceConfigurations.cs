using AppilicationProcesserAPI.MessageQueue;

namespace AppilicationProcesserAPI.Configurations
{
    public static class ServiceConfigurations
    {
        public static void ConfigureMessageBus(this IServiceCollection services)
        {
            services.AddSingleton<IMessageBroker, MessageBroker>();

            services.AddHostedService<MessageBackgroundProcessor>();
        }
    }
}
