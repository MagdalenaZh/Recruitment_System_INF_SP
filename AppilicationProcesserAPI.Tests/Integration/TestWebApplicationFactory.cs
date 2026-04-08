using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Tests.TestDoubles;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace AppilicationProcesserAPI.Tests.Integration;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    public FakeRecruitmentDataProvider RecruitmentDataProvider { get; } = new();
    public FakeSystemManagementProvider SystemManagementProvider { get; } = new();
    public FakeCalendarProvider CalendarProvider { get; } = new();
    public FakeAggregateReconstructor AggregateReconstructor { get; } = new();
    public FakeEventStore EventStore { get; } = new();
    public FakeEventBroker EventBroker { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            var values = new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=(localdb)\\mssqllocaldb;Database=FakeDb;Trusted_Connection=True;",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience",
                ["Jwt:Key"] = "this-is-a-long-enough-test-key-for-jwt"
            };

            configBuilder.AddInMemoryCollection(values);
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IRecruitmentDataProvider>();
            services.RemoveAll<ISystemManagementProvider>();
            services.RemoveAll<ICalendarProvider>();
            services.RemoveAll<IAggregateReconstructor>();
            services.RemoveAll<IEventStore>();
            services.RemoveAll<IEventBroker>();

            services.AddSingleton<IRecruitmentDataProvider>(RecruitmentDataProvider);
            services.AddSingleton<ISystemManagementProvider>(SystemManagementProvider);
            services.AddSingleton<ICalendarProvider>(CalendarProvider);
            services.AddSingleton<IAggregateReconstructor>(AggregateReconstructor);
            services.AddSingleton<IEventStore>(EventStore);
            services.AddSingleton<IEventBroker>(EventBroker);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                options.DefaultScheme = TestAuthHandler.SchemeName;
            }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
        });
    }
}
