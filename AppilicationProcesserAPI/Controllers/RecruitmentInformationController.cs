using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.PersistanceServices;
using Microsoft.AspNetCore.Mvc;

namespace AppilicationProcesserAPI.Controllers
{
    [Route("api/recruitmentInfo")]
    [ApiController]
    public class RecruitmentInformationController : ControllerBase
    {
        private readonly IAggregateReconstructor _aggregateReconstructor;
        private readonly IRecruitmentDataProvider _recruitmentDataProvider;
        private readonly ISystemManagementProvider _systemManagementProvider;
        private readonly ILogger<RecruitmentInformationController> _logger;

        public RecruitmentInformationController(IAggregateReconstructor aggregateReconstructor, IRecruitmentDataProvider recruitmentDataProvider,
            ISystemManagementProvider systemManagementProvider, ILogger<RecruitmentInformationController> logger) 
        {
            _aggregateReconstructor = aggregateReconstructor;
            _recruitmentDataProvider = recruitmentDataProvider;
            _systemManagementProvider = systemManagementProvider;
            _logger = logger;
        }


    }
}
