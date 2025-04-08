using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Responses.Staff;

namespace ClaimRequest.DAL.Data.Responses.ClaimApprover;

public class GetClaimApproverResponse
{
    public Guid ApproverId { get; set; }
    public GetStaffResponse Approver { get; set; }
    public ApproverStatus ApproverStatus { get; set; }
    public DateTime? DecisionAt { get; set; }
}