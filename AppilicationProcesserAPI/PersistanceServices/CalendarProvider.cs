using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.Data;
using Microsoft.Extensions.Caching.Memory;

namespace AppilicationProcesserAPI.PersistanceServices
{
    public interface ICalendarProvider
    {
        Task<bool> IsSlotAvailableAsync(Guid slotId, CancellationToken cancellationToken);

        Task<List<InterviewSlot>> GetAvailableSlotsAsync(Guid applicationId, CancellationToken cancellationToken);

        Task<InterviewSlot> BookInterviewSlotAsync(Guid slotId, Guid applicationId, CancellationToken cancellationToken);
    }

    public class CalendarProvider : ICalendarProvider
    {
        private readonly string _connectionString;

        public CalendarProvider(ServiceConfiguration serviceConfiguration) 
        {
            _connectionString = serviceConfiguration.SQLConnectionString;
        }

        public Task<InterviewSlot> BookInterviewSlotAsync(Guid slotId, Guid applicationId, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<List<InterviewSlot>> GetAvailableSlotsAsync(Guid applicationId, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<bool> IsSlotAvailableAsync(Guid slotId, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }

    public class CalendarProviderCacheDecorator : ICalendarProvider
    {
#warning implement caching logic with memory cache
        private readonly ICalendarProvider _wrappedCalendarprovider;
        private readonly IMemoryCache _memoryCache;

        public CalendarProviderCacheDecorator(ICalendarProvider calendarProvider, IMemoryCache memoryCache)
        {
            _wrappedCalendarprovider = calendarProvider;
            _memoryCache = memoryCache;
        }

        public Task<InterviewSlot> BookInterviewSlotAsync(Guid slotId, Guid applicationId, CancellationToken cancellationToken)
        {
           return _wrappedCalendarprovider.BookInterviewSlotAsync(slotId, applicationId, cancellationToken);
        }

        public Task<List<InterviewSlot>> GetAvailableSlotsAsync(Guid applicationId, CancellationToken cancellationToken)
        {
            return _wrappedCalendarprovider.GetAvailableSlotsAsync(applicationId, cancellationToken);
        }

        public Task<bool> IsSlotAvailableAsync(Guid slotId, CancellationToken cancellationToken)
        {
            return _wrappedCalendarprovider.IsSlotAvailableAsync(slotId, cancellationToken);
        }
    }
}
