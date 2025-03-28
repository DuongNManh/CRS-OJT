using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Claim;
using ClaimRequest.DAL.Data.Responses.Claim;

namespace ClaimRequest.BLL.Services.Interfaces
{
    public interface IClaimService
    {
        // CRUD operations for Claim
        Task<CreateClaimResponse> CreateClaim(CreateClaimRequest createClaimRequest);

        Task<PagingResponse<GetClaimResponse>> GetClaims(
            int pageNumber = 1, int pageSize = 20, string? claimStatus = null,
            string? viewMode = null, DateTime? startDate = null, DateTime? endDate = null);
        Task<GetDetailClaimResponse> GetClaim(Guid claimId);
        Task<bool> DeleteClaim(Guid claimId);
        Task<CreateClaimResponse> UpdateClaim(Guid claimId, UpdateClaimRequest request);
        Task<bool> CancelClaim(Guid claimId, string remark);
        Task<bool> PaidClaim(Guid claimId);
        Task<bool> ApproveClaim(Guid claimId);
        Task<bool> RejectClaim(Guid claimId);
        Task<Claim> GetClaimByIdAsync(Guid claimId);
        Task<ReturnClaimResponse> ReturnClaim(ReturnClaimRequest request);
        Task<SubmitClaimResponse> SubmitClaim(Guid claimId);
        Task<ClaimStatusCountResponse> GetClaimStatusCount(string viewMode, DateTime? startDate, DateTime? endDate);
        Task<SubmitClaimResponse> SubmitV2(CreateClaimRequest createClaimRequest);
    }
}
