using ClaimRequest.API.Constants;
using ClaimRequest.API.Extensions;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Staff;
using ClaimRequest.DAL.Data.Responses.Staff;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClaimRequest.API.Controllers
{
    [ApiController]
    public class StaffsController : BaseController<StaffsController>
    {
        private readonly IStaffService _staffService; // inject staff service vao staff controller

        public StaffsController(ILogger<StaffsController> logger, IStaffService staffService) : base(logger)
        {
            _staffService = staffService;
        }

        // B1: tao cac endpoint cho CRUD staff
        [HttpGet(ApiEndPointConstant.Staff.StaffsEndpoint)] // get all staffs
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<CreateStaffResponse>>), StatusCodes.Status200OK)] // tra ve response 200 OK
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)] // tra ve response 500 neu co loi
        [Authorize(Roles = "Admin, Approver, Finance")] // chi co Admin, ProjectManager, Finance moi co quyen truy cap
        public async Task<IActionResult> GetStaffs()
        {
            // Add this debugging code
            var userClaims = User.Claims.Select(c => new { c.Type, c.Value });
            _logger.LogInformation("User claims: {@Claims}", userClaims);

            var staffs = await _staffService.GetStaffs();
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Staff list retrieved successfully",
                staffs
            ));
        }

        [HttpGet(ApiEndPointConstant.Staff.StaffsPagingEndpoint)] // get all staffs
        [ProducesResponseType(typeof(ApiResponse<PagingResponse<GetStaffResponse>>), StatusCodes.Status200OK)] // tra ve response 200 OK
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)] // tra ve response 500 neu co loi
        [Authorize(Roles = "Admin, Approver, Finance")] // chi co Admin, ProjectManager, Finance moi co quyen truy cap
        public async Task<IActionResult> GetStaffsPaging([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? role = null, [FromQuery] string? department = null)
        {
            // Add this debugging code
            var userClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            _logger.LogInformation("User claims: {@Claims}", userClaims);

            var staffs = await _staffService.GetStaffsPaging(pageNumber, pageSize, role, department);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Staff list retrieved successfully",
                staffs
            ));
        }

        [HttpGet(ApiEndPointConstant.Staff.GetStaffEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<CreateStaffResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetStaffById([FromRoute] Guid id)
        {
            var staff = await _staffService.GetStaffById(id);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Staff retrieved successfully",
                staff
            ));
        }

        [HttpPut(ApiEndPointConstant.Staff.UpdateStaffEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<UpdateStaffResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStaff([FromQuery] Guid id, [FromBody] UpdateStaffRequest request)
        {
            var updatedStaff = await _staffService.UpdateStaff(id, request);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Staff updated successfully",
                updatedStaff
            ));
        }

        [HttpDelete(ApiEndPointConstant.Staff.DeleteStaffEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStaff([FromQuery] Guid id)
        {
            await _staffService.DeleteStaff(id);
            return Ok(ApiResponseBuilder.BuildResponse<object>(
                StatusCodes.Status200OK,
                "Staff deleted successfully",
                null
            ));
        }

        [HttpPost(ApiEndPointConstant.Staff.CreateStaffEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<CreateStaffResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffRequest request)
        {
            var response = await _staffService.CreateStaff(request);

            return CreatedAtAction(
                nameof(GetStaffById),
                new { id = response.Id },
                ApiResponseBuilder.BuildResponse(
                    StatusCodes.Status201Created,
                    "Staff created successfully",
                    response
                )
            );
        }

        [HttpPost(ApiEndPointConstant.Staff.UploadAvatarEndpoint)]
        public async Task<IActionResult> UpdateAvatar(IFormFile avatarFile)
        {
            try
            {
                // Extract staffId from the JWT token (or any other authentication method)
                var staffId = GetCurrentStaffIdFromToken();

                var result = await _staffService.UpdateAvatar(staffId, avatarFile);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating avatar: {Message}", ex.Message);
                return BadRequest("Failed to update avatar.");
            }
        }

        [HttpGet(ApiEndPointConstant.Staff.ProfileEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<CreateStaffResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Profile()
        {
            var response = await _staffService.Profile();
            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Profile get successfully",
                data: response,
                statusCode: StatusCodes.Status201Created)
            );
        }

        private Guid GetCurrentStaffIdFromToken()
        {
            var userClaims = HttpContext.User?.Claims;


            foreach (var claim in userClaims)
            {
                _logger.LogInformation($"Claim Type: {claim.Type}, Claim Value: {claim.Value}");
            }

            // Look for the correct claim type: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            var staffIdClaim = userClaims?.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");

            if (staffIdClaim != null)
            {
                return Guid.Parse(staffIdClaim.Value);
            }

            throw new UnauthorizedAccessException("Staff ID not found in token");
        }
    }
}
