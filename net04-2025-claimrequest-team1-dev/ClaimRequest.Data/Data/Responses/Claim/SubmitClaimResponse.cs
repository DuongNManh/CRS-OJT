namespace ClaimRequest.DAL.Data.Responses.Claim
{
    public class SubmitClaimResponse
    {
        public Guid ClaimId { get; set; }
        public string Status { get; set; }
        public DateTime SubmittedDate { get; set; }
    }
} 