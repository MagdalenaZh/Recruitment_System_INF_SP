using Microsoft.EntityFrameworkCore;

namespace AppilicationProcesserAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
    }

}