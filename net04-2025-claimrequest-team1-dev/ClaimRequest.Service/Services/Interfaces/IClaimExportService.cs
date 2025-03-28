using ClaimRequest.DAL.Data.Requests.Claim;
using ClaimRequest.DAL.Data.Responses.Claim;

namespace ClaimRequest.BLL.Services.Interfaces;

public interface IClaimExportService
{
    Task<ClaimExportResponse> ExportClaimsToExcel(ClaimExportRequest request);
    Task<ClaimExportResponse> ExportClaimsToExcelByRange(DateTime? startDate, DateTime? endDate);

}