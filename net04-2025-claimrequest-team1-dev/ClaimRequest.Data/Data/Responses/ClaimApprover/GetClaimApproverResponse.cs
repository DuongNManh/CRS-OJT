using ClaimRequest.DAL.Data.Entities;

namespace ClaimRequest.DAL.Data.Responses.ClaimApprover;

public class GetClaimApproverResponse
{
    public Guid ApproverId { get; set; }
    public string Name { get; set; }
    public ApproverStatus ApproverStatus { get; set; }
    public DateTime? DecisionAt { get; set; }
}