namespace ClaimRequest.DAL.Data.Responses.Claim;

public interface IExcelConstants
{
    byte[] GenerateClaimExport(IEnumerable<ClaimExportDto> exportModels);
}