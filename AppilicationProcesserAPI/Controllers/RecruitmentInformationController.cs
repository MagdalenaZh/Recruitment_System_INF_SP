using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.PersistanceServices;
using AppilicationProcesserAPI.Representations;
using AppilicationProcesserAPI.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
        private readonly IAuthorizationScopeService _authorizationScopeService;
        private readonly ILogger<RecruitmentInformationController> _logger;

        public RecruitmentInformationController(
            IAggregateReconstructor aggregateReconstructor,
            IRecruitmentDataProvider recruitmentDataProvider,
            ISystemManagementProvider systemManagementProvider,
            ICalendarProvider calendarProvider,
            IAuthorizationScopeService authorizationScopeService,
            ILogger<RecruitmentInformationController> logger)
        {
            _aggregateReconstructor = aggregateReconstructor;
            _recruitmentDataProvider = recruitmentDataProvider;
            _systemManagementProvider = systemManagementProvider;
            _calendarProvider = calendarProvider;
            _authorizationScopeService = authorizationScopeService;
            _logger = logger;
        }

        [Authorize]
        [HttpGet("api/user-information/{userId}")]
        public async Task<ActionResult<UserDatabaseModel>> GetUserInformation([FromRoute] Guid userId, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanAccessUserAsync(User, userId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                var userInfo = await _recruitmentDataProvider.GetApplicantUserInformationAsync(userId, cancellationToken).ConfigureAwait(false);
                if (userInfo is null)
                {
                    _logger.LogWarning("User not found for UserId: {UserId}", userId);
                    return NotFound(new { message = $"User with id {userId} not found" });
                }

                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user information for UserId: {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while retrieving user information." });
            }
        }

        [Authorize]
        [HttpGet("api/latest-application-states")]
        public async Task<ActionResult<List<IStateRepresentation>>> GetLatestApplicationStates([FromQuery] List<Guid> applicationIds, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanAccessLatestApplicationStatesAsync(User, applicationIds, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                var representations = await _aggregateReconstructor.GetLatestAggregateStates(applicationIds, cancellationToken).ConfigureAwait(false);
                return Ok(representations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving latest application states");
                return BadRequest();
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

        [Authorize]
        [HttpGet("api/booked-interview-slots/{clubId}")]
        public async Task<ActionResult<List<BookedInterviewSlot>>> GetBookedInterviewSlotsForClub([FromRoute] Guid clubId, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanAccessApplicationsForClubAsync(User, clubId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                var slots = await _calendarProvider.GetBookedInterviewSlotsForClubAsync(clubId, cancellationToken).ConfigureAwait(false);
                return Ok(slots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving booked interview slots for ClubId: {ClubId}", clubId);
                return StatusCode(500, new { message = "An error occurred while retrieving booked interview slots for the club." });
            }
        }

        [Authorize]
        [HttpGet("api/applications-user/{userId}")]
        public async Task<ActionResult<List<ApplicationDatabaseModel>>> GetAllApplicationsForUser([FromRoute] Guid userId, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanAccessApplicationsForUserAsync(User, userId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                var applications = await _recruitmentDataProvider.GetAllApplicationsForUserAsync(userId, cancellationToken).ConfigureAwait(false);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving applications for UserId: {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while retrieving applications for the user." });
            }
        }

        [Authorize]
        [HttpGet("api/user-rights/{userId}")]
        public async Task<ActionResult<UserRightsDatabaseModel>> GetUserRights([FromRoute] Guid userId, CancellationToken cancellationToken)
        {
            var currentUserId = _authorizationScopeService.GetCurrentUserId(User);
            if (!_authorizationScopeService.IsSystemAdmin(User) && currentUserId != userId)
            {
                return Forbid();
            }

            try
            {
                var userRights = await _recruitmentDataProvider.GetUserRightsAsync(userId, cancellationToken).ConfigureAwait(false);
                return Ok(userRights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user rights for UserId: {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred while retrieving user rights." });
            }
        }

        [Authorize]
        [HttpGet("api/applications-department/{departmentId}")]
        public async Task<ActionResult<List<ApplicationDatabaseModel>>> GetAllApplicationsForDepartment([FromRoute] Guid departmentId, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanAccessApplicationsForDepartmentAsync(User, departmentId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                var applications = await _recruitmentDataProvider.GetAllApplicationsForDepartmentAsync(departmentId, cancellationToken).ConfigureAwait(false);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving applications for DepartmentId: {DepartmentId}", departmentId);
                return StatusCode(500, new { message = "An error occurred while retrieving applications for the department." });
            }
        }

        [Authorize]
        [HttpGet("api/applications-club/{clubId}")]
        public async Task<ActionResult<List<ApplicationDatabaseModel>>> GetAllApplicationsForClub([FromRoute] Guid clubId, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanAccessApplicationsForClubAsync(User, clubId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                var applications = await _recruitmentDataProvider.GetAllApplicationsForClubAsync(clubId, cancellationToken).ConfigureAwait(false);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving applications for ClubId: {ClubId}", clubId);
                return StatusCode(500, new { message = "An error occurred while retrieving applications for the club." });
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

        [Authorize]
        [HttpPost("api/create-club")]
        public async Task<IActionResult> CreateClub([FromBody] DbRequestModels request, CancellationToken cancellationToken)
        {
            if (!_authorizationScopeService.IsSystemAdmin(User))
            {
                return Forbid();
            }

            try
            {
                await _systemManagementProvider.CreateClubAsync(request.ClubName, request.Category, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Club created successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating club with name: {ClubName}", request.ClubName);
                return StatusCode(500, "An error occurred while creating the club.");
            }
        }

        [Authorize]
        [HttpPost("api/create-department")]
        public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentRequest request, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanCreateDepartmentAsync(User, request.ClubId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

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

        [Authorize]
        [HttpPost("api/create-interview-slot")]
        public async Task<IActionResult> CreateInterviewSlot([FromBody] CreateInterviewSlotRequest request, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanCreateInterviewSlotAsync(User, request.ClubId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                await _systemManagementProvider.CreateInterviewSlotAsync(request.ClubId, request.StartTime, request.EndTime, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Interview slot created successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating interview slot for ClubId: {ClubId} with StartTime: {StartTime} and EndTime: {EndTime}", request.ClubId, request.StartTime, request.EndTime);
                return StatusCode(500, "An error occurred while creating the interview slot.");
            }
        }

        [Authorize]
        [HttpPut("api/update-club-information/{clubId}")]
        public async Task<IActionResult> UpdateAdmissionQuestions([FromRoute] Guid clubId, [FromBody] UpdateClubRequest updateClubRequest, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanManageClubAsync(User, clubId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                await _systemManagementProvider.UpdateClubInformationAsync(
                    clubId,
                    updateClubRequest.ClubName,
                    updateClubRequest.ApplicationQuestions,
                    updateClubRequest.RequiredApprovals,
                    updateClubRequest.Description,
                    updateClubRequest.Category,
                    cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Admission questions updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating admission questions for ClubId: {ClubId}", clubId);
                return StatusCode(500, "An error occurred while updating the admission questions.");
            }
        }

        [Authorize]
        [HttpPut("api/update-department-information/{departmentId}")]
        public async Task<IActionResult> UpdateOpenPositionsForDepartment([FromRoute] Guid departmentId, [FromBody] UpdateDepartmentRequest updateDepartmentRequest, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanManageDepartmentAsync(User, departmentId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                await _systemManagementProvider.UpdateDepartmentInformationAsync(
                    departmentId,
                    updateDepartmentRequest.DepartmentName,
                    updateDepartmentRequest.NumberOfOpenPositions,
                    updateDepartmentRequest.Description,
                    cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Number of open positions updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating number of open positions for DepartmentId: {DepartmentId}", departmentId);
                return StatusCode(500, "An error occurred while updating the number of open positions.");
            }
        }

        [Authorize]
        [HttpPut("api/update-interview-slot/{slotId}")]
        public async Task<IActionResult> UpdateInterviewSlot([FromRoute] Guid slotId, [FromBody] SlotTimes slotTime, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanManageInterviewSlotAsync(User, slotId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

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

        [Authorize]
        [HttpPut("api/update-user-role/{userId}")]
        public async Task<IActionResult> UpdateUserRole([FromRoute] Guid userId, [FromBody] Guid roleId, CancellationToken cancellationToken)
        {
            if (!_authorizationScopeService.IsSystemAdmin(User))
            {
                return Forbid();
            }

            try
            {
                await _systemManagementProvider.UpdateUserRoleAsync(userId, roleId, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "User role updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user role for UserId: {UserId} to RoleId: {RoleId}", userId, roleId);
                return StatusCode(500, "An error occurred while updating the user role.");
            }
        }

        [Authorize]
        [HttpPut("api/update-user-promote-club-admin/{userId}")]
        public async Task<IActionResult> PromoteUserToClubAdmin([FromRoute] Guid userId, [FromBody] Guid clubId, CancellationToken cancellationToken)
        {
            if (!_authorizationScopeService.IsSystemAdmin(User))
            {
                return Forbid();
            }

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

        [Authorize]
        [HttpPut("api/assign-club-admin/{userId}")]
        public async Task<IActionResult> AssignClubAdmin([FromRoute] Guid userId, [FromBody] AssignClubAdminRequest request, CancellationToken cancellationToken)
        {
            if (!_authorizationScopeService.IsSystemAdmin(User))
            {
                return Forbid();
            }

            try
            {
                await _systemManagementProvider.AssignClubAdminAsync(userId, request.ClubId, request.RoleId, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Club admin assigned successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning club admin for UserId: {UserId}, ClubId: {ClubId}, RoleId: {RoleId}", userId, request.ClubId, request.RoleId);
                return StatusCode(500, "An error occurred while assigning the club admin.");
            }
        }

        [Authorize]
        [HttpPut("api/assign-board-member/{userId}")]
        public async Task<IActionResult> AssignBoardMember([FromRoute] Guid userId, [FromBody] AssignBoardMemberRequest request, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanAssignBoardMemberAsync(User, request.DepartmentId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                await _systemManagementProvider.AssignBoardMemberAsync(userId, request.DepartmentId, request.RoleId, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Board member assigned successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning board member for UserId: {UserId}, DepartmentId: {DepartmentId}, RoleId: {RoleId}", userId, request.DepartmentId, request.RoleId);
                return StatusCode(500, "An error occurred while assigning the board member.");
            }
        }

        [Authorize]
        [HttpPost("api/create-note/{applicationId}")]
        public async Task<IActionResult> CreateNoteForApplication([FromRoute] Guid applicationId, [FromBody] string noteData, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanReviewApplicationAsync(User, applicationId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            try
            {
                await _systemManagementProvider.CreateApplicationNoteAsync(applicationId, userId, noteData, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Note created successfully for the application." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating note for ApplicationId: {ApplicationId}", applicationId);
                return StatusCode(500, "An error occurred while creating the note for the application.");
            }
        }

        [Authorize]
        [HttpGet("api/notes-application/{applicationId}")]
        public async Task<ActionResult<List<NoteDatabaseModel>>> GetAllNotesForApplication([FromRoute] Guid applicationId, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanAccessNoteAsync(User, applicationId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                var notes = await _recruitmentDataProvider.GetAllNotesForApplicationAsync(applicationId, cancellationToken).ConfigureAwait(false);
                return Ok(notes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notes for ApplicationId: {ApplicationId}", applicationId);
                return StatusCode(500, "An error occurred while retrieving notes for the application.");
            }
        }

        [Authorize]
        [HttpPut("api/update-note/{noteId}")]
        public async Task<IActionResult> UpdateNote([FromRoute] Guid noteId, [FromBody] string noteData, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanEditNoteAsync(User, noteId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                await _systemManagementProvider.UpdateApplicationNoteAsync(noteId, noteData, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "Note updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating note with NoteId: {NoteId}", noteId);
                return StatusCode(500, "An error occurred while updating the note.");
            }
        }

        [Authorize]
        [HttpPut("api/update-user-information")]
        public async Task<IActionResult> UpdateUserInformation([FromBody] UpdateUserInformationRequest updateModel, CancellationToken cancellationToken)
        {
            if (User == null)
                return Unauthorized();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            try
            {
                await _systemManagementProvider.UpdateUserInformationAsync(userId, updateModel.FirstName, updateModel.LastName, updateModel.AcademicYear, updateModel.StudyMajor, updateModel.CVContent, cancellationToken).ConfigureAwait(false);
                return Ok(new { message = "User information updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user information for UserId: {UserId}", userId);
                return StatusCode(500, "An error occurred while updating the user information.");
            }
        }

        [Authorize]
        [HttpGet("api/roles")]
        public async Task<ActionResult<List<RolesDatabaseModel>>> GetAllRoles(CancellationToken cancellationToken)
        {
            if (!_authorizationScopeService.IsSystemAdmin(User) && !User.IsInRole("ClubAdmin"))
            {
                return Forbid();
            }

            try
            {
                var roles = await _recruitmentDataProvider.GetAllRolesAsync(cancellationToken).ConfigureAwait(false);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving roles");
                return StatusCode(500, "An error occurred while retrieving roles.");
            }
        }

        [Authorize]
        [HttpGet("api/club-boardmembers/{clubId}")]
        public async Task<ActionResult<List<BoardMemberDatabaseModel>>> GetClubBoardMembers([FromRoute] Guid clubId, CancellationToken cancellationToken)
        {
            if (!await _authorizationScopeService.CanManageClubAsync(User, clubId, cancellationToken).ConfigureAwait(false))
            {
                return Forbid();
            }

            try
            {
                var boardMembers = await _recruitmentDataProvider.GetClubBoardMembersAsync(clubId, cancellationToken).ConfigureAwait(false);
                return Ok(boardMembers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving board members for ClubId: {ClubId}", clubId);
                return StatusCode(500, "An error occurred while retrieving board members for the club.");
            }
        }
    }
}