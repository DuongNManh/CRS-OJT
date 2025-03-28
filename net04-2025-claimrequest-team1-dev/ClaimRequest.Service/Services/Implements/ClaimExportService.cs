using AutoMapper;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.Requests.Claim;
using ClaimRequest.DAL.Data.Responses.Claim;
using ClaimRequest.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClaimRequest.BLL.Services.Implements;

public class ClaimExportService : BaseService<ClaimExportService>, IClaimExportService
{
    private readonly IExcelConstants _excelConstants;

    public ClaimExportService(
        IUnitOfWork<ClaimRequestDbContext> unitOfWork,
        IExcelConstants excelConstants,
        IMapper mapper,
        ILogger<ClaimExportService> logger,
        IHttpContextAccessor httpContextAccessor)
        : base(unitOfWork, logger, mapper, httpContextAccessor)
    {
        _excelConstants = excelConstants;
    }

    public async Task<ClaimExportResponse> ExportClaimsToExcel(ClaimExportRequest request)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            // Check if specific claim IDs are provided
            bool hasSpecificClaimIds = request.SelectedClaimIds != null && request.SelectedClaimIds.Count > 0;

            // If no specific IDs provided, log a message
            if (!hasSpecificClaimIds)
            {
                _logger.LogInformation("No specific claim IDs provided. Exporting default claims (most recent 100).");
            }

            // Get data using UnitOfWork
            var claims = await _unitOfWork.GetRepository<Claim>()
                .GetListAsync(
                    predicate: c => hasSpecificClaimIds
                        ? request.SelectedClaimIds.Contains(c.Id)
                        : (c.FinanceId == currentUserId && c.Status == ClaimStatus.Paid),
                    include: query => query
                        .Include(c => c.Project)
                        .Include(c => c.Claimer),
                    orderBy: q => q.OrderByDescending(c => c.UpdateAt),
                    take: hasSpecificClaimIds ? null : 100
                );

            if (!claims.Any())
            {
                _logger.LogInformation("No claims found for export.");
                throw new NotFoundException("No claims found to export.");
            }

            // Map claims to export DTOs
            var exportModels = _mapper.Map<IEnumerable<ClaimExportDto>>(claims);
            int rowNumber = 1;
            foreach (var exportModel in exportModels)
            {
                exportModel.RowNumber = rowNumber++;
            }

            var fileContent = _excelConstants.GenerateClaimExport(exportModels);
            var fileName = $"Claims_Export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";

            _logger.LogInformation("Export successful. File created: {FileName}", fileName);

            return new ClaimExportResponse
            {
                FileName = fileName,
                FileContent = fileContent,
                FileContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during the export process.");
            throw;
        }
    }

    public async Task<ClaimExportResponse> ExportClaimsToExcelByRange(DateTime? startDate, DateTime? endDate)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            var startDateUtc = startDate.HasValue
                ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
                : (DateTime?)null;
            var endDateUtc = endDate.HasValue
                ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
                : (DateTime?)null;

            var claims = await _unitOfWork.GetRepository<Claim>()
                .GetListAsync(
                    predicate: c =>
                        (!startDateUtc.HasValue || c.CreateAt >= startDateUtc) &&
                        (!endDateUtc.HasValue || c.CreateAt <= endDateUtc) && c.FinanceId == currentUserId
                        && (c.Status == ClaimStatus.Approved || c.Status == ClaimStatus.Paid),

        include: query => query
                        .Include(c => c.Project)
                        .Include(c => c.Claimer),
                    orderBy: q => q.OrderByDescending(c => c.UpdateAt)
                );

            if (!claims.Any())
            {
                _logger.LogInformation("No claims found for export in the specified date range.");
                throw new NotFoundException("No claims found to export for the specified date range.");
            }

            var exportModels = _mapper.Map<IEnumerable<ClaimExportDto>>(claims);
            int rowNumber = 1;
            foreach (var exportModel in exportModels)
            {
                exportModel.RowNumber = rowNumber++;
            }

            var fileContent = _excelConstants.GenerateClaimExport(exportModels);
            var fileName = $"Claims_Export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";

            _logger.LogInformation("Export successful. File created: {FileName}", fileName);

            return new ClaimExportResponse
            {
                FileName = fileName,
                FileContent = fileContent,
                FileContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during the export process.");
            throw;
        }
    }
}
