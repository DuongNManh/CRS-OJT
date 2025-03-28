namespace ClaimRequest.DAL.Data.Responses.Claim;

public class ClaimExportDto
{
    public int RowNumber { get; set; }
    public string ClaimId { get; set; }
    public string ClaimName { get; set; }
    public string ClaimType { get; set; }
    public string ClaimDescription { get; set; }
    public string ProjectName { get; set; } 
    public decimal Amount { get; set; }
    public decimal TotalWorkingHours { get; set; }
    public DateTime? PaidDate { get; set; }
    
}