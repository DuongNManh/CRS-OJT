using ClaimRequest.DAL.Data.Entities;

namespace ClaimRequest.DAL.Data.Responses.Claim
{
    public class ReturnClaimResponse
    {
        public Guid ClaimId { get; set; }

        public ClaimStatus Status { get; set; }

        public string Remark { get; set; }

        public DateTime UpdatedAt { get; set; }

        //public Guid ClaimerId { get; set; }


    }
}
