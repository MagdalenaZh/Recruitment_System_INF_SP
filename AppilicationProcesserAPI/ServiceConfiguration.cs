namespace AppilicationProcesserAPI
{
    public class ServiceConfiguration
    {
        public string SQLConnectionString { get; set; }

        public ServiceConfiguration(IConfiguration configuration)
        {
            SQLConnectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new ArgumentNullException();   
        }
    }
}
