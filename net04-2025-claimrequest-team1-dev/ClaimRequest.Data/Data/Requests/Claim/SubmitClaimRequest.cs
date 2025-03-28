using System.ComponentModel.DataAnnotations;

namespace ClaimRequest.DAL.Data.Requests.Claim
{
    public class SubmitClaimRequest
    {
        [Required]
        public Guid ClaimId { get; set; }
    }
} 