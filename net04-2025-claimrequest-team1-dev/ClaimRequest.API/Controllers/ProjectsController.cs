using ClaimRequest.API.Constants;
using ClaimRequest.API.Extensions;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Project;
using ClaimRequest.DAL.Data.Responses.Project;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClaimRequest.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : BaseController<ProjectsController>
    {
        private readonly IProjectService _projectService;

        public ProjectsController(ILogger<ProjectsController> logger, IProjectService projectService)
            : base(logger)
        {
            _projectService = projectService;
        }

        [HttpGet(ApiEndPointConstant.Project.ProjectsEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<GetProjectResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await _projectService.GetProjects();
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Project list retrieved successfully",
                projects
            ));
        }

        [HttpGet(ApiEndPointConstant.Project.GetProjectEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<GetProjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetProjectById([FromRoute] Guid id)
        {
            var project = await _projectService.GetProjectById(id);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Project retrieved successfully",
                project
            ));
        }

        [HttpGet(ApiEndPointConstant.Project.GetProjectsThroughMemeberIdEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<GetProjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Staff, Approver, Finance, Admin")]
        public async Task<IActionResult> GetProjectByMemberId([FromRoute] Guid memberId)
        {
            var project = await _projectService.GetProjectsByMemberId(memberId);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Project retrieved successfully",
                project
            ));
        }

        [HttpGet(ApiEndPointConstant.Project.GetProjectDetailsEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<GetProjectDetailsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Staff, Approver, Finance, Admin")]
        public async Task<IActionResult> GetProjectDetails(Guid id)
        {
            var project = await _projectService.GetProjectDetails(id);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Project retrieved successfully",
                project
            ));
        }

        [HttpGet(ApiEndPointConstant.Project.GetProjectsWithPaginationEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<GetProjectDetailsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Staff, Approver, Finance, Admin")]
        public async Task<IActionResult> GetProjectsByPage(int pageNumber, int pageSize)
        {
            var projects = await _projectService.GetProjectsWithPagination(pageNumber, pageSize);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Project retrieved successfully",
                projects
            ));
        }

        [HttpGet(ApiEndPointConstant.Project.GetProjectsByFilterEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<CreateProjectResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Staff, Approver, Finance, Admin")]
        public async Task<IActionResult> GetProjectsByFilter(
            [FromQuery] string? name,
            [FromQuery] string? description,
            [FromQuery] DateOnly? startDateFrom,
            [FromQuery] DateOnly? startDateTo,
            [FromQuery] DateOnly? endDateFrom,
            [FromQuery] DateOnly? endDateTo,
            [FromQuery] Guid? projectManagerId,
            [FromQuery] Guid? businessUnitLeaderId)
        {
            var filter = new ProjectFilterRequest
            {
                Name = name,
                Description = description,
                StartDateFrom = startDateFrom,
                StartDateTo = startDateTo,
                EndDateFrom = endDateFrom,
                EndDateTo = endDateTo,
                ProjectManagerId = projectManagerId,
                BusinessUnitLeaderId = businessUnitLeaderId
            };

            var projects = await _projectService.GetProjectsByFilter(filter);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Projects retrieved successfully",
                projects
            ));
        }



        [HttpPost(ApiEndPointConstant.Project.CreateProjectEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<GetProjectResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        [Authorize(Roles = "Approver, Admin")]
        public async Task<IActionResult> CreateProject(CreateProjectRequest request)
        {
            var response = await _projectService.CreateProject(request);

            return CreatedAtAction(
                nameof(GetProjectById),
                new { id = response.Id },
                ApiResponseBuilder.BuildResponse(
                    StatusCodes.Status201Created,
                    "Project created successfully",
                    response
                )
            );
        }

        [HttpPut(ApiEndPointConstant.Project.UpdateProjectEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<GetProjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        [Authorize(Roles = "Approver, Admin")]
        public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request)
        {
            var updatedProject = await _projectService.UpdateProject(id, request);
            var apiResponse = new ApiResponse<CreateProjectResponse>
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Project updated successfully",
                IsSuccess = true,
                Data = updatedProject
            };

            return Ok(apiResponse);
        }

        [HttpDelete(ApiEndPointConstant.Project.DeleteProjectEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<GetProjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            var response = await _projectService.DeleteProject(id);
            var apiResponse = new ApiResponse<DeleteProjectResponse>
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Project deleted successfully",
                IsSuccess = true,
                Data = response
            };

            return Ok(apiResponse);
        }

        [HttpDelete(ApiEndPointConstant.Project.DeleteProjectsEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<DeleteProjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProjects([FromBody] IEnumerable<Guid> ids)
        {
            var results = await _projectService.DeleteProjectsBulk(ids);

            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Project deleted successfully",
                results
        ));
        }


        [HttpPost(ApiEndPointConstant.Project.AssignStaffToProjectEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<AssignStaffResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        [Authorize(Roles = "Approver, Admin")]
        public async Task<IActionResult> AssignStaffToProject([FromQuery] Guid id, [FromBody] AssignStaffRequest request)
        {
            var result = await _projectService.AssignStaffToProject(id, request);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Staff assigned to project successfully",
                result
            ));
        }

        [HttpDelete(ApiEndPointConstant.Project.RemoveStaffFromProjectEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<AssignStaffResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        [Authorize(Roles = "Approver, Admin")]
        public async Task<IActionResult> RemoveStaffFromProject([FromQuery] Guid projectId, [FromQuery] Guid staffId)
        {
            var result = await _projectService.RemoveStaffFromProject(projectId, staffId);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Staff removed from project successfully",
                result
            ));
        }

        [HttpPut(ApiEndPointConstant.Project.UpdateStaffFromProjectEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<AssignStaffResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        [Authorize(Roles = "Approver, Admin")]
        public async Task<IActionResult> UpdateStaffFromProject([FromQuery] Guid id, [FromBody] AssignStaffRequest request)
        {
            var result = await _projectService.UpdateStaffFromProject(id, request);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Project staff updated successfully",
                result
            ));
        }
    }
}
