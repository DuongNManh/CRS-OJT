using ClaimRequest.API.Controllers;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Claim;
using ClaimRequest.DAL.Data.Responses.Claim;
using ClaimRequest.DAL.Data.Responses.Project;
using ClaimRequest.DAL.Data.Responses.Staff;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using Xunit.Abstractions;

namespace ClaimRequest.UnitTest.Claim
{
    public class ClaimControllerTest
    {
        private readonly ITestOutputHelper _testOutputHelper;
        private readonly Mock<IClaimService> _mockClaimService;
        private readonly Mock<ILogger<ClaimController>> _mockLogger;
        private readonly ClaimController _controller;

        public ClaimControllerTest(ITestOutputHelper testOutputHelper)
        {
            _testOutputHelper = testOutputHelper;
            _mockClaimService = new Mock<IClaimService>();
            _mockLogger = new Mock<ILogger<ClaimController>>();
            _controller = new ClaimController(_mockLogger.Object, _mockClaimService.Object);
        }

        [Fact]
        public async Task CreateNewClaim_ShouldReturnOk()
        {
            // Arrange
            var today = DateOnly.FromDateTime(DateTime.Today);
            var mockClaim = new CreateClaimRequest
            {
                ClaimType = ClaimType.Other,
                Name = "Test Claim",
                Remark = "Test remark",
                Amount = 10,
                TotalWorkingHours = 5,
                StartDate = today,
                EndDate = today.AddDays(7),
                ProjectId = new Guid("3fa85f64-5717-4562-b3fc-2c963f66afa6")
            };

            var response = new CreateClaimResponse
            {
                Remark = "Test remark",
                Name = "Test Claim"
            };

            _mockClaimService.Setup(s => s.CreateClaim(It.IsAny<CreateClaimRequest>()))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.CreateClaim(mockClaim);

            // Assert
            var createdAtActionResult = Assert.IsType<OkObjectResult>(result);
            var returnedApiResponse = Assert.IsType<ApiResponse<CreateClaimResponse>>(createdAtActionResult.Value);
            var returnedClaim = returnedApiResponse.Data;

            Assert.NotNull(returnedClaim);
            Assert.Equal(response.Name, returnedClaim.Name);
            Assert.Equal(response.Remark, returnedClaim.Remark);
        }

        [Fact]
        public async Task CreateNewClaim_ShouldReturnEmptyData_WhenServiceError()
        {
            // Arrange

            // Act
            var result = await _controller.CreateClaim(null!);

            // Assert
            var badRequest = Assert.IsType<OkObjectResult>(result);
            var apiResponse = Assert.IsType<ApiResponse<CreateClaimResponse>>(badRequest.Value);
            Assert.Null(apiResponse.Data);
        }


        [Fact]
        public async Task ReturnPendingClaim_ShouldReturnOk_WhenServiceReturnsResponse()
        {
            // Arrange
            var request = new ReturnClaimRequest
            {
                ClaimId = Guid.NewGuid(),
                Remark = "Valid return request"
            };

            var expectedResponse = new ReturnClaimResponse
            {
                ClaimId = request.ClaimId,
                Status = ClaimStatus.Draft,
                Remark = request.Remark,
                UpdatedAt = DateTime.UtcNow
            };

            _mockClaimService
                .Setup(service => service.ReturnClaim(request))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.ReturnPendingClaim(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var apiResponse = Assert.IsType<ApiResponse<ReturnClaimResponse>>(okResult.Value);
            var actualResponse = apiResponse.Data;
            Assert.Equal(expectedResponse.ClaimId, actualResponse.ClaimId);
        }

        [Fact]
        public async Task ReturnPendingClaim_ShouldReturnProblem_WhenServiceFails()
        {
            // Arrange
            var request = new ReturnClaimRequest
            {
                ClaimId = Guid.NewGuid(),
                Remark = "Invalid request"
            };

            _mockClaimService
                .Setup(service => service.ReturnClaim(request))
                .ThrowsAsync(new Exception("Test exception"));

            // Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.ReturnPendingClaim(request));
        }

        [Fact]
        public async Task GetClaim_ShouldReturnOk_WhenClaimExists()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var expectedResponse = new GetDetailClaimResponse
            {
                Id = claimId,
                Name = "Test Claim",
                Amount = 1000,
                Remark = "Test Remark",
                CreateAt = DateTime.UtcNow,
                TotalWorkingHours = 40,
                StartDate = DateOnly.FromDateTime(DateTime.Today),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
                Status = "Pending",
                ClaimType = "Overtime",
                Project = new GetProjectResponse
                {
                    Name = "Test Project",
                    StartDate = DateOnly.FromDateTime(DateTime.Today),
                    EndDate = DateOnly.FromDateTime(DateTime.Today.AddMonths(1))
                }
            };

            _mockClaimService
                .Setup(service => service.GetClaim(claimId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetClaim(claimId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<GetDetailClaimResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal("Get claim successfully", response.Message);
            Assert.Equal(expectedResponse.Id, response.Data.Id);
            Assert.Equal(expectedResponse.Name, response.Data.Name);
        }

        // Service throw NotFoundException, se do Middleware xu ly
        // nen ta se ko test return type cho response cua controller
        // nen ta se khong kiem tra response cua controller
        // ma ta kiem tra middleware handle dung exception hay ko
        // => Assert.ThrowsAsync<NotFoundException>...
        [Fact]
        public async Task GetClaim_ShouldThrowNotFoundException_WhenClaimDoesNotExist()
        {
            // Arrange
            var claimId = Guid.NewGuid();

            _mockClaimService
                .Setup(service => service.GetClaim(claimId))
                .ThrowsAsync(new NotFoundException($"Claim with ID {claimId} not found"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(
                () => _controller.GetClaim(claimId));

            Assert.Contains(claimId.ToString(), exception.Message);
        }

        // voi truong hop service tra ve exception
        // controller se khong handle exception, tat ca see do Middleware xu ly 
        // nen ta se ko test return type cho response cua controller
        // ma chi test xem controller co throw exception hay ko
        [Fact]
        public async Task GetClaim_ShouldReturnProblem_WhenServiceThrowsException()
        {
            // Arrange
            var claimId = Guid.NewGuid();

            _mockClaimService
                .Setup(service => service.GetClaim(claimId))
                .ThrowsAsync(new Exception("Test exception"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetClaim(claimId));
        }
        [Fact]
        public async Task GetClaims_ShouldReturnOk_WhenClaimsExist()
        {
            // Arrange
            var claimList = new List<GetClaimResponse>
            {
                new GetClaimResponse
                {
                    Id = Guid.NewGuid(),
                    Name = "Claim 1",
                    Project = new GetProjectResponse { Id = Guid.NewGuid(), Name = "Project 1" },
                    Claimer = new GetStaffResponse { Id = Guid.NewGuid(), Name = "Claimer 1" },
                    TotalWorkingHours = 10,
                    Status = ClaimStatus.Pending.ToString()
                },
                new GetClaimResponse
                {
                    Id = Guid.NewGuid(),
                    Name = "Claim 2",
                    Project = new GetProjectResponse { Id = Guid.NewGuid(), Name = "Project 2" },
                    Claimer = new GetStaffResponse { Id = Guid.NewGuid(), Name = "Claimer 2" },
                    TotalWorkingHours = 20,
                    Status = ClaimStatus.Approved.ToString()
                }
            };

            var pagingResponse = new PagingResponse<GetClaimResponse>
            {
                Items = claimList,
                Meta = new PaginationMeta { CurrentPage = 1, PageSize = 20, TotalItems = 2, TotalPages = 1 }
            };

            _mockClaimService
                .Setup(service => service.GetClaims(It.IsAny<int>(), It.IsAny<int>(), It.Is<string>(s => s == null), It.IsAny<string>(), null, null))
                .ReturnsAsync(pagingResponse);

            // Act
            var result = await _controller.GetClaims(null, null, 1, 20);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PagingResponse<GetClaimResponse>>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal(2, response.Data.Items.Count());
        }

        [Fact]
        public async Task GetClaims_ShouldReturnNoClaims_WhenClaimsDoNotExist()
        {
            // Arrange
            var pagingResponse = new PagingResponse<GetClaimResponse>
            {
                Items = new List<GetClaimResponse>(),
                Meta = new PaginationMeta { CurrentPage = 1, PageSize = 20, TotalItems = 0, TotalPages = 0 }
            };

            _mockClaimService
                .Setup(service => service.GetClaims(It.IsAny<int>(), It.IsAny<int>(), It.Is<string>(s => s == null), It.IsAny<string>(), null, null))
                .ReturnsAsync(pagingResponse);

            // Act
            var result = await _controller.GetClaims(null, null, 1, 20);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PagingResponse<GetClaimResponse>>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Empty(response.Data.Items);
        }

        [Fact]
        public async Task GetClaims_ShouldThrowException_WhenServiceThrowsException()
        {
            // Arrange
            _mockClaimService
                .Setup(service => service.GetClaims(It.IsAny<int>(), It.IsAny<int>(), It.Is<string>(s => s == null), It.IsAny<string>(), null, null))
                .ThrowsAsync(new Exception("Test exception"));
            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetClaims(null, null, 1, 20));
        }
        [Fact]
        public async Task CancelClaim_ShouldReturnOk_WhenClaimIsCancelledSuccessfully()
        {
            var claimId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var remark = "Cancellation reason";
            var claim = new ClaimRequest.DAL.Data.Entities.Claim { Id = claimId, ClaimerId = userId, Status = ClaimStatus.Draft };

            _mockClaimService.Setup(s => s.GetClaimByIdAsync(claimId)).ReturnsAsync(claim);
            _mockClaimService.Setup(s => s.CancelClaim(claimId, remark)).ReturnsAsync(true);

            var result = await _controller.CancelClaim(claimId, remark);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
        }

        [Fact]
        public async Task CancelClaim_ShouldReturnNotFound_WhenClaimDoesNotExist()
        {
            var claimId = Guid.NewGuid();
            var remark = "Cancellation reason";

            _mockClaimService.Setup(s => s.CancelClaim(claimId, remark))
                .ThrowsAsync(new NotFoundException($"Claim with ID {claimId} not found"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(
                () => _controller.CancelClaim(claimId, remark));
            Assert.Contains(claimId.ToString(), exception.Message);
        }

        [Fact]
        public async Task CancelClaim_ShouldReturnUnauthorized_WhenUserIsNotOwner()
        {
            var claimId = Guid.NewGuid();
            var remark = "Cancellation reason";
            var claim = new ClaimRequest.DAL.Data.Entities.Claim
            {
                Id = claimId,
                ClaimerId = Guid.NewGuid(),
                Status = ClaimStatus.Draft,
            };
            _mockClaimService.Setup(s => s.GetClaimByIdAsync(claimId)).ReturnsAsync(claim);
            _mockClaimService.Setup(s => s.CancelClaim(claimId, remark)).ThrowsAsync(new UnauthorizedException("You do not have permission to cancel this claim"));

            var exception = await Assert.ThrowsAsync<UnauthorizedException>(
                () => _controller.CancelClaim(claimId, remark));
            Assert.Equal("You do not have permission to cancel this claim", exception.Message);
        }

        [Fact]
        public async Task CancelClaim_ShouldThrowBadRequestException_WhenClaimIsNotInDraftStatus()
        {
            var claimId = Guid.NewGuid();
            var remark = "Cancellation reason";
            var claim = new ClaimRequest.DAL.Data.Entities.Claim
            {
                Id = claimId,
                ClaimerId = Guid.NewGuid(),
                Status = ClaimStatus.Pending,
            };

            _mockClaimService.Setup(s => s.CancelClaim(claimId, remark))
                .ThrowsAsync(new BadRequestException("Only claims in Pending status can be cancelled"));

            var exception = await Assert.ThrowsAsync<BadRequestException>(
                () => _controller.CancelClaim(claimId, remark));

            Assert.Equal("Only claims in Pending status can be cancelled", exception.Message);
        }

        [Fact]
        public async Task ApproveClaim_ShouldReturnOk_WhenClaimIsApprovedSuccessfully()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.ApproveClaim(claimId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.ApproveClaim(claimId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<bool>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal("Claim approved successfully", response.Message);
            Assert.True(response.Data);
        }

        [Fact]
        public async Task ApproveClaim_ShouldThrowNotFoundException_WhenClaimDoesNotExist()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.ApproveClaim(claimId))
                .ThrowsAsync(new NotFoundException($"Claim with ID {claimId} not found"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(
                () => _controller.ApproveClaim(claimId));
            Assert.Contains(claimId.ToString(), exception.Message);
        }

        [Fact]
        public async Task ApproveClaim_ShouldThrowUnauthorizedException_WhenUserIsNotAuthorized()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.ApproveClaim(claimId))
                .ThrowsAsync(new UnauthorizedException("User is not authorized to approve this claim"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(
                () => _controller.ApproveClaim(claimId));
            Assert.Equal("User is not authorized to approve this claim", exception.Message);
        }

        [Fact]
        public async Task ApproveClaim_ShouldThrowBadRequestException_WhenClaimIsNotInPendingStatus()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.ApproveClaim(claimId))
                .ThrowsAsync(new BadRequestException("Claim must be in Pending status to be approved"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(
                () => _controller.ApproveClaim(claimId));
            Assert.Equal("Claim must be in Pending status to be approved", exception.Message);
        }

        [Fact]
        public async Task RejectClaim_ShouldReturnOk_WhenClaimIsRejectedSuccessfully()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.RejectClaim(claimId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.RejectClaim(claimId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<bool>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal("Claim rejected successfully", response.Message);
            Assert.True(response.Data);
        }

        [Fact]
        public async Task RejectClaim_ShouldThrowNotFoundException_WhenClaimDoesNotExist()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.RejectClaim(claimId))
                .ThrowsAsync(new NotFoundException($"Claim with ID {claimId} not found"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(
                () => _controller.RejectClaim(claimId));
            Assert.Contains(claimId.ToString(), exception.Message);
        }

        [Fact]
        public async Task RejectClaim_ShouldThrowUnauthorizedException_WhenUserIsNotApprover()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.RejectClaim(claimId))
                .ThrowsAsync(new UnauthorizedException("User is not an approver for this claim"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(
                () => _controller.RejectClaim(claimId));
            Assert.Equal("User is not an approver for this claim", exception.Message);
        }

        [Fact]
        public async Task RejectClaim_ShouldThrowBadRequestException_WhenClaimIsNotInPendingStatus()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.RejectClaim(claimId))
                .ThrowsAsync(new BadRequestException("Claim must be in Pending status to be rejected"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadRequestException>(
                () => _controller.RejectClaim(claimId));
            Assert.Equal("Claim must be in Pending status to be rejected", exception.Message);
        }

        [Fact]
        public async Task GetClaimStatusCount_ShouldReturnOk_WhenValidRequest()
        {
            // Arrange
            var viewMode = "ClaimerMode";
            var expectedResponse = new ClaimStatusCountResponse
            {
                Draft = 1,
                Pending = 2,
                Approved = 3,
                Rejected = 0,
                Paid = 0,
                Cancelled = 0,
                Total = 6
            };

            _mockClaimService
                .Setup(service => service.GetClaimStatusCount(viewMode, null, null))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.GetClaimStatusCount(viewMode, null, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var apiResponse = Assert.IsType<ApiResponse<ClaimStatusCountResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal(expectedResponse.Draft, apiResponse.Data.Draft);
            Assert.Equal(expectedResponse.Pending, apiResponse.Data.Pending);
        }

        [Fact]
        public async Task GetClaimStatusCount_ShouldReturnProblem_WhenServiceThrowsException()
        {
            // Arrange
            var viewMode = "FinanceMode";

            _mockClaimService
                .Setup(service => service.GetClaimStatusCount(viewMode, null, null))
                .ThrowsAsync(new Exception("Test exception"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.GetClaimStatusCount(viewMode, null, null));
        }

        [Fact]
        public async Task UpdateClaim_ShouldReturnOk_WhenClaimIsUpdatedSuccessfully()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var updateRequest = new UpdateClaimRequest
            {
                ClaimType = ClaimType.Other,
                Name = "Updated Claim",
                Remark = "Updated remark",
                Amount = 100,
                TotalWorkingHours = 10,
                StartDate = DateOnly.FromDateTime(DateTime.Today),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
                ProjectId = Guid.NewGuid()
            };

            var expectedResponse = new CreateClaimResponse
            {
                Name = updateRequest.Name,
                Remark = updateRequest.Remark
            };

            _mockClaimService.Setup(s => s.UpdateClaim(claimId, updateRequest))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.UpdateClaim(claimId, updateRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var apiResponse = Assert.IsType<ApiResponse<CreateClaimResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal(expectedResponse.Name, apiResponse.Data.Name);
            Assert.Equal(expectedResponse.Remark, apiResponse.Data.Remark);
        }

        [Fact]
        public async Task UpdateClaim_ShouldReturnNotFound_WhenClaimDoesNotExist()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var updateRequest = new UpdateClaimRequest();

            _mockClaimService.Setup(s => s.UpdateClaim(claimId, updateRequest))
                .ThrowsAsync(new NotFoundException($"Claim with ID {claimId} not found"));

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _controller.UpdateClaim(claimId, updateRequest));
        }


        [Fact]
        public async Task UpdateClaim_ShouldReturnProblem_WhenServiceThrowsException()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var updateRequest = new UpdateClaimRequest();

            _mockClaimService.Setup(s => s.UpdateClaim(claimId, updateRequest))
                .ThrowsAsync(new Exception("Test exception"));

            // Assert 
            await Assert.ThrowsAsync<Exception>(() => _controller.UpdateClaim(claimId, updateRequest));
        }

        [Fact]
        public async Task SubmitClaim_ShouldReturnOk_WhenClaimIsSubmittedSuccessfully()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var expectedResponse = new SubmitClaimResponse

            {
                ClaimId = claimId,
                Status = ClaimStatus.Pending.ToString(),
                SubmittedDate = DateTime.UtcNow
            };

            _mockClaimService
                .Setup(service => service.SubmitClaim(claimId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.SubmitClaim(claimId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<SubmitClaimResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal("Claims submitted successfully", response.Message);
            Assert.Equal(expectedResponse.ClaimId, response.Data.ClaimId);
            Assert.Equal(expectedResponse.Status, response.Data.Status);
        }

        [Fact]
        public async Task SubmitClaim_ShouldThrowNotFoundException_WhenClaimDoesNotExist()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.SubmitClaim(claimId))
                .ThrowsAsync(new NotFoundException($"Claim with ID {claimId} not found"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<NotFoundException>(
                () => _controller.SubmitClaim(claimId));
            Assert.Contains(claimId.ToString(), exception.Message);
        }

        [Fact]
        public async Task SubmitClaim_ShouldThrowUnauthorizedException_WhenUserIsNotClaimer()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.SubmitClaim(claimId))
                .ThrowsAsync(new UnauthorizedException("You are not the claimer of this claim."));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(
                () => _controller.SubmitClaim(claimId));
            Assert.Equal("You are not the claimer of this claim.", exception.Message);
        }

        [Fact]
        public async Task SubmitClaim_ShouldThrowBusinessException_WhenClaimIsNotInDraftStatus()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.SubmitClaim(claimId))
                .ThrowsAsync(new BusinessException("Only claims in Draft status can be submitted"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BusinessException>(
                () => _controller.SubmitClaim(claimId));
            Assert.Equal("Only claims in Draft status can be submitted", exception.Message);
        }

        [Fact]
        public async Task SubmitClaim_WithProjectBasedClaim_ShouldReturnOkWithPendingStatus()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var expectedResponse = new SubmitClaimResponse
            {
                ClaimId = claimId,
                Status = ClaimStatus.Pending.ToString(),
                SubmittedDate = DateTime.UtcNow
            };

            _mockClaimService
                .Setup(service => service.SubmitClaim(claimId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.SubmitClaim(claimId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<SubmitClaimResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal(ClaimStatus.Pending.ToString(), response.Data.Status);
        }

        [Fact]
        public async Task SubmitClaim_WithNonProjectClaim_ShouldReturnOkWithApprovedStatus()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var expectedResponse = new SubmitClaimResponse
            {
                ClaimId = claimId,
                Status = ClaimStatus.Approved.ToString(),
                SubmittedDate = DateTime.UtcNow
            };

            _mockClaimService
                .Setup(service => service.SubmitClaim(claimId))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.SubmitClaim(claimId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<SubmitClaimResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal(ClaimStatus.Approved.ToString(), response.Data.Status);
        }

        [Fact]
        public async Task SubmitClaim_ShouldThrowException_WhenServiceThrowsUnexpectedException()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.SubmitClaim(claimId))
                .ThrowsAsync(new Exception("Unexpected error occurred"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.SubmitClaim(claimId));
        }

        [Fact]
        public async Task SubmitV2_ShouldReturnOk_WhenClaimIsSubmittedSuccessfully()
        {
            // Arrange
            var createClaimRequest = new CreateClaimRequest
            {
                ClaimType = ClaimType.Other,
                Name = "Test Claim",
                Remark = "Test remark",
                Amount = 100,
                TotalWorkingHours = 8,
                StartDate = DateOnly.FromDateTime(DateTime.Today),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                ProjectId = Guid.NewGuid()
            };

            var expectedResponse = new SubmitClaimResponse
            {
                ClaimId = Guid.NewGuid(),
                Status = ClaimStatus.Pending.ToString(),
                SubmittedDate = DateTime.UtcNow
            };

            _mockClaimService
                .Setup(service => service.SubmitV2(It.IsAny<CreateClaimRequest>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.SubmitV2(createClaimRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<SubmitClaimResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal("Claim submitted successfully", response.Message);
            Assert.Equal(expectedResponse.Status, response.Data.Status);
        }

        [Fact]
        public async Task SubmitV2_WithProjectBasedClaim_ShouldReturnOkWithPendingStatus()
        {
            // Arrange
            var createClaimRequest = new CreateClaimRequest
            {
                ProjectId = Guid.NewGuid(),
                Name = "Project Based Claim",
                ClaimType = ClaimType.Other,
                Amount = 100,
                StartDate = DateOnly.FromDateTime(DateTime.Today),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1))
            };

            var expectedResponse = new SubmitClaimResponse
            {
                ClaimId = Guid.NewGuid(),
                Status = ClaimStatus.Pending.ToString(),
            };

            _mockClaimService
                .Setup(service => service.SubmitV2(It.IsAny<CreateClaimRequest>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.SubmitV2(createClaimRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<SubmitClaimResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal(ClaimStatus.Pending.ToString(), response.Data.Status);
        }

        [Fact]
        public async Task SubmitV2_WithNonProjectClaim_ShouldReturnOkWithApprovedStatus()
        {
            // Arrange
            var createClaimRequest = new CreateClaimRequest
            {
                ProjectId = Guid.NewGuid(),
                Name = "Non-Project Claim",
                ClaimType = ClaimType.Other,
                Amount = 100,
                StartDate = DateOnly.FromDateTime(DateTime.Today),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1))
            };

            var expectedResponse = new SubmitClaimResponse
            {
                ClaimId = Guid.NewGuid(),
                Status = ClaimStatus.Approved.ToString(),

            };

            _mockClaimService
                .Setup(service => service.SubmitV2(It.IsAny<CreateClaimRequest>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.SubmitV2(createClaimRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<SubmitClaimResponse>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal(ClaimStatus.Approved.ToString(), response.Data.Status);
        }

        [Fact]
        public async Task SubmitV2_ShouldThrowBusinessException_WhenProjectNotFound()
        {
            // Arrange
            var createClaimRequest = new CreateClaimRequest
            {
                ProjectId = Guid.NewGuid(),
                Name = "Test Claim"
            };

            _mockClaimService
                .Setup(service => service.SubmitV2(It.IsAny<CreateClaimRequest>()))
                .ThrowsAsync(new BusinessException($"Project with ID {createClaimRequest.ProjectId} not found"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BusinessException>(
                () => _controller.SubmitV2(createClaimRequest));
            Assert.Contains(createClaimRequest.ProjectId.ToString(), exception.Message);
        }

        [Fact]
        public async Task SubmitV2_ShouldThrowBusinessException_WhenUserNotInProject()
        {
            // Arrange
            var createClaimRequest = new CreateClaimRequest
            {
                ProjectId = Guid.NewGuid(),
                Name = "Test Claim"
            };

            _mockClaimService
                .Setup(service => service.SubmitV2(It.IsAny<CreateClaimRequest>()))
                .ThrowsAsync(new BusinessException("You must be a member of this project to create a claim."));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BusinessException>(
                () => _controller.SubmitV2(createClaimRequest));
            Assert.Equal("You must be a member of this project to create a claim.", exception.Message);
        }

        [Fact]
        public async Task SubmitV2_ShouldThrowException_WhenServiceThrowsUnexpectedException()
        {
            // Arrange
            var createClaimRequest = new CreateClaimRequest
            {
                Name = "Test Claim"
            };

            _mockClaimService
                .Setup(service => service.SubmitV2(It.IsAny<CreateClaimRequest>()))
                .ThrowsAsync(new Exception("Unexpected error occurred"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.SubmitV2(createClaimRequest));
        }

        [Fact]
        public async Task PaidClaim_ShouldReturnOk_WhenClaimIsPaidSuccessfully()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.PaidClaim(claimId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.PayClaim(claimId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var apiResponse = Assert.IsType<ApiResponse<bool>>(okResult.Value);
            Assert.Equal(StatusCodes.Status200OK, okResult.StatusCode);
            Assert.Equal("Claim paid successfully.", apiResponse.Message);
        }

        [Fact]
        public async Task PayClaim_ShouldReturnUnauthorized_UserDoNotHavePermission()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            _mockClaimService
                .Setup(service => service.PaidClaim(claimId))
                .ThrowsAsync(new UnauthorizedException("You do not have permission to pay this claim."));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedException>(
                () => _controller.PayClaim(claimId));
            Assert.Equal("You do not have permission to pay this claim.", exception.Message);
        }

        [Fact]
        public async Task PayClaim_ShouldReturnNotFound_WhenClaimDoesNotExist()
        {
            // Arrange
            var claimId = Guid.NewGuid();

            _mockClaimService
                .Setup(service => service.PaidClaim(claimId))
                .ThrowsAsync(new NotFoundException($"Claim with ID {claimId} not found"));
            // Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _controller.PayClaim(claimId));
        }
    }
}
