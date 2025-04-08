using ClaimRequest.API.Controllers;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.Requests.Claim;
using ClaimRequest.DAL.Data.Responses.Claim;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using Xunit.Abstractions;

namespace ClaimRequest.UnitTest.Claim;

public class ClaimExportControllerTest
{
    private readonly ITestOutputHelper _testOutputHelper;
    private readonly Mock<IClaimExportService> _mockExportService;
    private readonly Mock<ILogger<ClaimExportController>> _mockLogger;
    private readonly ClaimExportController _controller;

    public ClaimExportControllerTest(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;
        _mockExportService = new Mock<IClaimExportService>();
        _mockLogger = new Mock<ILogger<ClaimExportController>>();
        _controller = new ClaimExportController(_mockExportService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task ExportClaims_ShouldReturnFile_WhenDataExists()
    {
        // Arrange
        var request = new ClaimExportRequest
        {
            SelectedClaimIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() }
        };

        var expectedResponse = new ClaimExportResponse
        {
            FileName = "Claims_Export_20240315_123456.xlsx",
            FileContent = new byte[] { 1, 2, 3, 4, 5 },
            FileContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        _mockExportService
            .Setup(service => service.ExportClaimsToExcel(request))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.ExportClaims(request);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal(expectedResponse.FileName, fileResult.FileDownloadName);
        Assert.Equal(expectedResponse.FileContentType, fileResult.ContentType);
        Assert.Equal(expectedResponse.FileContent, fileResult.FileContents);
    }

    [Fact]
    public async Task ExportClaims_ShouldReturnNotFound_WhenNoData()
    {
        // Arrange
        var request = new ClaimExportRequest
        {
            SelectedClaimIds = new List<Guid> { Guid.NewGuid() }
        };

        _mockExportService
            .Setup(service => service.ExportClaimsToExcel(request))
            .ThrowsAsync(new NotFoundException("No claims found to export."));

        // Act
        var result = await _controller.ExportClaims(request);

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    [Fact]
    public async Task ExportClaimsByRange_ShouldReturnFile_WhenDataExists()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddDays(-7);
        var endDate = DateTime.UtcNow;

        var expectedResponse = new ClaimExportResponse
        {
            FileName = "Claims_Export_20240315_123456.xlsx",
            FileContent = new byte[] { 1, 2, 3, 4, 5 },
            FileContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        _mockExportService
            .Setup(service => service.ExportClaimsToExcelByRange(startDate, endDate))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.ExportClaimsByRange(startDate, endDate);

        // Assert
        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal(expectedResponse.FileName, fileResult.FileDownloadName);
        Assert.Equal(expectedResponse.FileContentType, fileResult.ContentType);
        Assert.Equal(expectedResponse.FileContent, fileResult.FileContents);
    }

    [Fact]
    public async Task ExportClaimsByRange_ShouldReturnInternalServerError_WhenNoData()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddDays(-7);
        var endDate = DateTime.UtcNow;

        _mockExportService
            .Setup(service => service.ExportClaimsToExcelByRange(startDate, endDate))
            .ThrowsAsync(new NotFoundException("No claims found to export for the specified date range."));

        // Act
        var result = await _controller.ExportClaimsByRange(startDate, endDate);

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
    }

    [Fact]
    public async Task ExportClaims_ShouldReturnInternalServerError_WhenServiceThrowsException()
    {
        // Arrange
        var request = new ClaimExportRequest
        {
            SelectedClaimIds = new List<Guid> { Guid.NewGuid() }
        };

        _mockExportService
            .Setup(service => service.ExportClaimsToExcel(request))
            .ThrowsAsync(new Exception("Internal server error"));

        // Act
        var result = await _controller.ExportClaims(request);

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status500InternalServerError, statusCodeResult.StatusCode);
    }
}