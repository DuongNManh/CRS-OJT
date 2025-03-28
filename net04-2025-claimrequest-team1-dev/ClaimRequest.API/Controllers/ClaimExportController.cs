using ClaimRequest.API.Constants;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Requests.Claim;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClaimRequest.API.Controllers;

[ApiController]
public class ClaimExportController : ControllerBase
{
    private readonly IClaimExportService _claimExportService;
    private readonly ILogger<ClaimExportController> _logger;

    public ClaimExportController(IClaimExportService claimExportService, ILogger<ClaimExportController> logger)
    {
        _claimExportService = claimExportService;
        _logger = logger;
    }

    [Authorize(Roles = "Finance")]
    [HttpPost(ApiEndPointConstant.ClaimExport.ExportClaimsEndpoint)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportClaims([FromBody] ClaimExportRequest request)
    {
        try
        {
            var result = await _claimExportService.ExportClaimsToExcel(request);

            if (result.FileContent == null || result.FileContent.Length == 0)
            {
                _logger.LogWarning("Export failed: No data to export.");
                return NotFound(new { message = "No claims found to export." });
            }

            return File(
                result.FileContent,
                result.FileContentType,
                result.FileName
            );
        }
        catch (Exception ex)
        {
            // Log exception with detailed information
            _logger.LogError(ex, "Error occurred during claim export.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An internal error occurred while processing the request." });
        }
    }

    [Authorize(Roles = "Finance")]
    [HttpPost(ApiEndPointConstant.ClaimExport.ExportClaimsByRangeEndpoint)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportClaimsByRange([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var result = await _claimExportService.ExportClaimsToExcelByRange(startDate, endDate);

            if (result.FileContent == null || result.FileContent.Length == 0)
            {
                _logger.LogWarning("Export failed: No data to export.");
                return NotFound(new { message = "No claims found to export." });
            }

            return File(
                result.FileContent,
                result.FileContentType,
                result.FileName
            );
        }
        catch (Exception ex)
        {
            // Log exception with detailed information
            _logger.LogError(ex, "Error occurred during claim export.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An internal error occurred while processing the request." });
        }
    }
}
