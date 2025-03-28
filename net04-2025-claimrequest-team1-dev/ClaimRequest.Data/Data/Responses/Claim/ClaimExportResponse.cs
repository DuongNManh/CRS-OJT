namespace ClaimRequest.DAL.Data.Responses.Claim;

public class ClaimExportResponse
{
    public string FileName { get; set; }
    public byte[] FileContent { get; set; }
    public string FileContentType { get; set; } = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

}