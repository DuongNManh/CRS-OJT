using ClaimRequest.API.Controllers;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Project;
using ClaimRequest.DAL.Data.Responses.Project;
using ClaimRequest.DAL.Data.Responses.Staff;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using Xunit.Abstractions;

namespace ClaimRequest.UnitTest.Project
{
    public class ProjectsControllerTests
    {
        private readonly Mock<IProjectService> _mockProjectService;
        private readonly ProjectsController _controller;
        private readonly ITestOutputHelper _output;

        public ProjectsControllerTests(ITestOutputHelper output)
        {
            var mockLogger = new Mock<ILogger<ProjectsController>>();
            _mockProjectService = new Mock<IProjectService>();
            _controller = new ProjectsController(mockLogger.Object, _mockProjectService.Object);
            _output = output;
        }

        [Fact]
        public async Task GetProjects_ReturnsOkResult_WithListOfProjects()
        {
            // Arrange
            var projects = new List<CreateProjectResponse> { new CreateProjectResponse() };
            _mockProjectService.Setup(service => service.GetProjects()).ReturnsAsync(projects);

            // Act
            var result = await _controller.GetProjects();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<IEnumerable<CreateProjectResponse>>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }

        [Fact]
        public async Task GetProjectById_ReturnsOkResult_WithProject()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var project = new CreateProjectResponse();
            _mockProjectService.Setup(service => service.GetProjectById(projectId)).ReturnsAsync(project);

            // Act
            var result = await _controller.GetProjectById(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<CreateProjectResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }

        [Fact]
        public async Task CreateProject_ReturnsCreatedAtActionResult_WithNewProject()
        {
            // Arrange
            var request = new CreateProjectRequest();
            var response = new CreateProjectResponse { Id = Guid.NewGuid() };
            _mockProjectService.Setup(service => service.CreateProject(request)).ReturnsAsync(response);

            // Act
            var result = await _controller.CreateProject(request);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            var apiResponse = Assert.IsType<ApiResponse<CreateProjectResponse>>(createdAtActionResult.Value);
            Assert.Equal(StatusCodes.Status201Created, apiResponse.StatusCode);
        }

        [Fact]
        public async Task UpdateProject_ReturnsOkResult_WithUpdatedProject()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var request = new UpdateProjectRequest();
            var updatedProject = new CreateProjectResponse();
            _mockProjectService.Setup(service => service.UpdateProject(projectId, request))
                .ReturnsAsync(updatedProject);

            // Act
            var result = await _controller.UpdateProject(projectId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<CreateProjectResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }

        [Fact]
        public async Task DeleteProject_ReturnsOkResult_WithCorrectResponse()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var deleteResponse = new DeleteProjectResponse(projectId, true, "Project successfully deleted.");
            _mockProjectService.Setup(service => service.DeleteProject(projectId)).ReturnsAsync(deleteResponse);

            // Act
            var result = await _controller.DeleteProject(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<DeleteProjectResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            Assert.Equal(projectId, response.Data.ProjectId);
            Assert.True(response.Data.IsDeleted);
            Assert.Equal("Project successfully deleted.", response.Data.Message);
        }

        [Fact]
        public async Task AssignStaffToProject_ReturnsOkResult_WithCorrectResponse()
        {
            // Arrange 
            var projectId = Guid.NewGuid();
            var request = new AssignStaffRequest();
            var updatedRequest = new AssignStaffResponse();
            _mockProjectService.Setup(service => service.AssignStaffToProject(projectId, request))
                .ReturnsAsync(updatedRequest);

            // Act
            var result = await _controller.AssignStaffToProject(projectId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<AssignStaffResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);

        }

        [Fact]
        public async Task GetProjectByMemberId_ReturnsOkResult_WithProjects()
        {
            // Arrange
            var memberId = Guid.NewGuid();
            var projects = new List<CreateProjectResponse> { new CreateProjectResponse() };
            _mockProjectService.Setup(service => service.GetProjectsByMemberId(memberId)).ReturnsAsync(projects);

            // Act
            var result = await _controller.GetProjectByMemberId(memberId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<IEnumerable<CreateProjectResponse>>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }

        [Fact]
        public async Task GetProjectDetails_ReturnsOkResult_WithProjectDetails()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var projectDetails = new GetProjectDetailsResponse();
            _mockProjectService.Setup(service => service.GetProjectDetails(projectId)).ReturnsAsync(projectDetails);

            // Act
            var result = await _controller.GetProjectDetails(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<GetProjectDetailsResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }

        [Fact]
        public async Task GetProjectsByPage_ReturnsOkResult_WithPaginatedProjects()
        {
            // Arrange
            int pageNumber = 1;
            int pageSize = 10;
            var paginatedProjects = new List<CreateProjectResponse> { new CreateProjectResponse() };
            _mockProjectService.Setup(service => service.GetProjectsWithPagination(pageNumber, pageSize))
                .ReturnsAsync(paginatedProjects);

            // Act
            var result = await _controller.GetProjectsByPage(pageNumber, pageSize);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<IEnumerable<CreateProjectResponse>>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }

        [Fact]
        public async Task GetProjectsByFilter_ReturnsOkResult_WithFilteredProjects()
        {
            // Arrange
            var filter = new ProjectFilterRequest
            {
                Name = "Test Project",
                StartDateFrom = new DateOnly(2024, 1, 1),
                EndDateTo = new DateOnly(2024, 12, 31)
            };
            var filteredProjects = new List<CreateProjectResponse> { new CreateProjectResponse() };
            _mockProjectService.Setup(service => service.GetProjectsByFilter(It.IsAny<ProjectFilterRequest>()))
                .ReturnsAsync(filteredProjects);

            // Act
            var result = await _controller.GetProjectsByFilter(
                filter.Name,
                filter.Description,
                filter.Status,
                filter.StartDateFrom,
                filter.StartDateTo,
                filter.EndDateFrom,
                filter.EndDateTo,
                filter.BudgetFrom,
                filter.BudgetTo,
                filter.ProjectManagerId,
                filter.BusinessUnitLeaderId
            );

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<IEnumerable<CreateProjectResponse>>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }

        [Fact]
        public async Task DeleteProjects_ReturnsOkResult_WithDeletedProjects()
        {
            // Arrange
            var projectIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            var deleteResponses = projectIds.Select(id =>
                new DeleteProjectResponse(id, true, "Project successfully deleted.")).ToList();
            _mockProjectService.Setup(service => service.DeleteProjectsBulk(projectIds))
                .ReturnsAsync(deleteResponses);

            // Act
            var result = await _controller.DeleteProjects(projectIds);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<IEnumerable<DeleteProjectResponse>>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }

        [Fact]
        public async Task RemoveStaffFromProject_ReturnsOkResult_WithCorrectResponse()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var staffId = Guid.NewGuid();
            var response = new RemoveStaffResponse(staffId, true, "Staff removed from project successfully.");
            _mockProjectService.Setup(service => service.RemoveStaffFromProject(projectId, staffId))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.RemoveStaffFromProject(projectId, staffId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var apiResponse = Assert.IsType<ApiResponse<RemoveStaffResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, apiResponse.StatusCode);
        }

        [Fact]
        public async Task UpdateStaffFromProject_ReturnsOkResult_WithCorrectResponse()
        {
            // Arrange
            var projectId = Guid.NewGuid();
            var request = new AssignStaffRequest();
            var response = new AssignStaffResponse();
            _mockProjectService.Setup(service => service.UpdateStaffFromProject(projectId, request))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.UpdateStaffFromProject(projectId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var apiResponse = Assert.IsType<ApiResponse<AssignStaffResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, apiResponse.StatusCode);
        }
    }
}
