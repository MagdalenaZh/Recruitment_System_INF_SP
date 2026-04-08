using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Representations;
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
        private readonly ICalendarProvider _calendarProvider;
        private readonly ILogger<RecruitmentInformationController> _logger;

        public RecruitmentInformationController(IAggregateReconstructor aggregateReconstructor, IRecruitmentDataProvider recruitmentDataProvider,
            ISystemManagementProvider systemManagementProvider, ICalendarProvider calendarProvider, ILogger<RecruitmentInformationController> logger)
        {
            _aggregateReconstructor = aggregateReconstructor;
            _recruitmentDataProvider = recruitmentDataProvider;
            _systemManagementProvider = systemManagementProvider;
            _calendarProvider = calendarProvider;
            _logger = logger;
        }

        [HttpGet("api/latest-application-states")]
        public async Task<List<IStateRepresentation>> GetLatestApplicationStates([FromBody] List<Guid> applicationIds, CancellationToken cancellationToken)
        {
            try
            {
                var representations = await _aggregateReconstructor.GetLatestAggregateStates(applicationIds, cancellationToken).ConfigureAwait(false);
                return representations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving latest application states for ApplicationIds: {ApplicationIds}", string.Join(", ", applicationIds));
                throw new Exception("An error occurred while retrieving the latest application states.");
            }
        }

        [HttpGet("api/available-interview-slots/{clubId}")]
        public async Task<List<InterviewSlot>> GetAvailableInterviewSlotsForClub([FromRoute] Guid clubId, CancellationToken cancellationToken)
        {
            try
            {
                var slots = await _calendarProvider.GetAvailableInterviewSlotsForClubAsync(clubId, cancellationToken).ConfigureAwait(false);
                return slots;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available interview slots for ClubId: {ClubId}", clubId);
                throw new Exception("An error occurred while retrieving available interview slots for the club.");
            }
        }

        [HttpGet("api/booked-interview-slots/{clubId}")]
        public async Task<List<BookedInterviewSlot>> GetBookedInterviewSlotsForClub([FromRoute] Guid clubId, CancellationToken cancellationToken)
        {
            try
            {
                var slots = await _calendarProvider.GetBookedInterviewSlotsForClubAsync(clubId, cancellationToken).ConfigureAwait(false);
                return slots;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving booked interview slots for ClubId: {ClubId}", clubId);
                throw new Exception("An error occurred while retrieving booked interview slots for the club.");
            }
        }


        [HttpGet("api/applications-user/{userId}")]
        public async Task<List<ApplicationDatabaseModel>> GetAllApplicationsForUser([FromRoute] Guid userId, CancellationToken cancellationToken)
        {
            try
            {
                var applications = await _recruitmentDataProvider.GetAllApplicationsForUserAsync(userId, cancellationToken).ConfigureAwait(false);
                return applications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving applications for UserId: {UserId}", userId);
                throw new Exception("An error occurred while retrieving applications for the user.");
            }
        }

        [HttpGet("api/applications-department/{departmentId}")]
        public async Task<List<ApplicationDatabaseModel>> GetAllApplicationsForDepartment([FromRoute] Guid departmentId, CancellationToken cancellationToken)
        {
            try
            {
                var applications = await _recruitmentDataProvider.GetAllApplicationsForDepartmentAsync(departmentId, cancellationToken).ConfigureAwait(false);
                return applications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving applications for DepartmentId: {DepartmentId}", departmentId);
                throw new Exception("An error occurred while retrieving applications for the department.");
            }
        }

        [HttpGet("api/applications-club/{clubId}")]
        public async Task<List<ApplicationDatabaseModel>> GetAllApplicationsForClub([FromRoute] Guid clubId, CancellationToken cancellationToken)
        {
            try
            {
                var applications = await _recruitmentDataProvider.GetAllApplicationsForClubAsync(clubId, cancellationToken).ConfigureAwait(false);
                return applications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving applications for ClubId: {ClubId}", clubId);
                throw new Exception("An error occurred while retrieving applications for the club.");
            }
        }

        [HttpGet("api/clubs")]
        public async Task<List<ClubDatabaseModel>> GetAllClubsInformation(CancellationToken cancellationToken)
        {
            try
            {
                var clubs = await _recruitmentDataProvider.GetAllClubsInformationAsync(cancellationToken).ConfigureAwait(false);
                return clubs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving clubs information");
                throw new Exception("An error occurred while retrieving clubs information.");
            }
        }

        [HttpGet("api/departments-club/{clubId}")]
        public async Task<List<DepartmentDatabaseModel>> GetDepartmentsForClub([FromRoute] Guid clubId, CancellationToken cancellationToken)
        {
            try
            {
                var departments = await _recruitmentDataProvider.GetDepartmentsForClubAsync(clubId, cancellationToken).ConfigureAwait(false);
                return departments;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving departments for ClubId: {ClubId}", clubId);
                throw new Exception("An error occurred while retrieving departments for the club.");
            }
        }

        [HttpPost("api/create-club")]
        public async Task<IActionResult> CreateClub([FromBody] CreateClubRequest request, CancellationToken cancellationToken)
        {
            try
            {
                await _systemManagementProvider.CreateClubAsync(
                    request.ClubName,
                    request.Category,
                    cancellationToken
                ).ConfigureAwait(false);
                return Ok(new { message = "Club created successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating club with name: {ClubName}", request.ClubName);
                return StatusCode(500, "An error occurred while creating the club.");
            }
        }

        [HttpPost("api/create-department")]
        public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentRequest request, CancellationToken cancellationToken)
        {
            try
            {
                await _systemManagementProvider.CreateDepartmentAsync(request.ClubId, request.DepartmentName, request.NumberOfOpenPositions, request.Description, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Department created successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating department with name: {DepartmentName} for ClubId: {ClubId}", request.DepartmentName, request.ClubId);
                return StatusCode(500, "An error occurred while creating the department.");
            }
        }

        [HttpPost("api/create-interview-slot")]
        public async Task<IActionResult> CreateInterviewSlot([FromBody] CreateInterviewSlotRequest request, CancellationToken cancellationToken)
        {
            try
            {
                await _systemManagementProvider.CreateInterviewSlot(request.ClubId, request.StartTime, request.EndTime, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Interview slot created successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating interview slot for ClubId: {ClubId} with StartTime: {StartTime} and EndTime: {EndTime}", request.ClubId, request.StartTime, request.EndTime);
                return StatusCode(500, "An error occurred while creating the interview slot.");
            }
        }

        [HttpPut("api/update-club-information/{clubId}")]
        public async Task<IActionResult> UpdateAdmissionQuestions([FromRoute] Guid clubId, [FromBody] UpdateClubRequest updateClubRequest, CancellationToken cancellationToken)
        {
            try
            {
                await _systemManagementProvider.UpdateClubInformationAsync(clubId, updateClubRequest.ClubName, updateClubRequest.ApplicationQuestions,
                    updateClubRequest.RequiredApprovals, updateClubRequest.Description, updateClubRequest.Category, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Admission questions updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating admission questions for ClubId: {ClubId}", clubId);
                return StatusCode(500, "An error occurred while updating the admission questions.");
            }
        }

        [HttpPut("api/update-department-information/{departmentId}")]
        public async Task<IActionResult> UpdateOpenPositionsForDepartment([FromRoute] Guid departmentId, [FromBody] UpdateDepartmentRequest updateDepartmentRequest, CancellationToken cancellationToken)
        {
            try
            {
                await _systemManagementProvider.UpdateDepartmentInformationAsync(departmentId, updateDepartmentRequest.DepartmentName, updateDepartmentRequest.NumberOfOpenPositions,
                    updateDepartmentRequest.Description, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Number of open positions updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating number of open positions for DepartmentId: {DepartmentId}", departmentId);
                return StatusCode(500, "An error occurred while updating the number of open positions.");
            }
        }


        [HttpPut("api/update-interview-slot/{slotId}")]
        public async Task<IActionResult> UpdateInterviewSlot([FromRoute] Guid slotId, [FromBody] SlotTimes slotTime, CancellationToken cancellationToken)
        {
            try
            {
                await _systemManagementProvider.UpdateInterviewSlotAsync(slotId, slotTime.StartTime, slotTime.EndTime, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Interview slot updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating interview slot with SlotId: {SlotId} to NewStartTime: {NewStartTime} and NewEndTime: {NewEndTime}", slotId, slotTime.StartTime, slotTime.EndTime);
                return StatusCode(500, "An error occurred while updating the interview slot.");
            }
        }

        [HttpPut("api/update-user-role/{userId}")]
        public async Task<IActionResult> UpdateUserRole([FromRoute] Guid userId, [FromBody] Guid roleId, CancellationToken cancellationToken)
        {
            try
            {
                await _systemManagementProvider.UpdateUserRole(userId, roleId, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "User role updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user role for UserId: {UserId} to RoleId: {RoleId}", userId, roleId);
                return StatusCode(500, "An error occurred while updating the user role.");
            }
        }

        [HttpPut("api/update-user-promote-club-admin/{userId}")]
        public async Task<IActionResult> PromoteUserToClubAdmin([FromRoute] Guid userId, [FromBody] Guid clubId, CancellationToken cancellationToken)
        {
            try
            {
                await _systemManagementProvider.UpdateUserPromoteToClubAdminAsync(userId, clubId, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "User promoted to club admin successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error promoting user with UserId: {UserId} to club admin for ClubId: {ClubId}", userId, clubId);
                return StatusCode(500, "An error occurred while promoting the user to club admin.");
            }
        } 
    }
}

