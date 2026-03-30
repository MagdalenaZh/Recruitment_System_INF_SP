using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Visitors;
using Microsoft.Extensions.Caching.Memory;

namespace AppilicationProcesserAPI.Configurations
{
    public static class ServiceConfigurations
    {
        public static void ConfigureMessageBus(this IServiceCollection services)
        {
            services.AddSingleton<IEventBroker, EventBroker>();
            services.AddSingleton<IRepresentationEmitter, RepresentationEmitter>();
            services.AddSingleton<IApplicationStatusManager, ApplicationStatusManager>();

            services.AddHostedService<EventBackgroundProcessor>();
            services.AddHostedService<EmailManagerBackgroundProcessor>();
        }

        public static void ConfigureAggregateManagment(this IServiceCollection services)
        {
            services.AddSingleton<IStateVisitorFactory, StateVisitorFactory>();
            services.AddSingleton<IAggregateEngine, AggregateEngine>();
            services.AddScoped<IAggregateReconstructor, AggregateReconstructor>();
        }

        public static void ConfigureCalendarProvider(this IServiceCollection services)
        {
            services.AddSingleton<ICalendarProvider, CalendarProviderCacheDecorator>(sp =>
            {
                return new CalendarProviderCacheDecorator(
                     new CalendarProvider(sp.GetRequiredService<ServiceConfiguration>(), sp.GetRequiredService<ILogger<CalendarProvider>>()),
                     sp.GetRequiredService<IMemoryCache>()
                     );
            });
        }

        public static void ConfigurePersistance(this IServiceCollection services)
        {
            services.AddSingleton<IEventStore, EventStore>();
            services.AddSingleton<ISystemManagementProvider, SystemManagementProvider>();
            services.AddSingleton<IRecruitmentDataProvider, RecruitmentDataProvider>();
        }
    }
}
