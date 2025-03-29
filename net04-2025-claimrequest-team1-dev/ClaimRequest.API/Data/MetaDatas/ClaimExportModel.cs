namespace ClaimRequest.API.Models;
public class ClaimExportModel
{
    public int RowNumber { get; set; }
    public string ClaimId { get; set; } = string.Empty;
    public string ClaimName { get; set; } = string.Empty;
    public string ClaimType { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTime? PaidDate { get; set; }
}
