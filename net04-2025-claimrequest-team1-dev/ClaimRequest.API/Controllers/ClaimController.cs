using ClaimRequest.API.Constants;
using ClaimRequest.API.Extensions;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Claim;
using ClaimRequest.DAL.Data.Responses.Claim;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClaimRequest.API.Controllers
{
    [ApiController]
    public class ClaimController : BaseController<ClaimController>
    {
        #region Create Class Referrence
        private readonly IClaimService _claimService;
        #endregion


        #region Contructor
        public ClaimController(ILogger<ClaimController> logger, IClaimService claimService) : base(logger)
        {
            _claimService = claimService;
        }
        #endregion


        [HttpPost(ApiEndPointConstant.Claim.ClaimsEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<CreateClaimResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        [Authorize(Roles = "Staff, Approver, Finance, Admin")]
        public async Task<IActionResult> CreateClaim([FromBody] CreateClaimRequest createClaimRequest)
        {
            var response = await _claimService.CreateClaim(createClaimRequest);
            return
                Ok(ApiResponseBuilder.BuildResponse(
                    message: "Create claims successfully",
                    data: response,
                    statusCode: StatusCodes.Status201Created)
                );
        }

        [HttpGet(ApiEndPointConstant.Claim.ClaimsEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<PagingResponse<GetClaimResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [Authorize(Roles = "Staff, Approver, Finance, Admin")]
        public async Task<IActionResult> GetClaims(
           [FromQuery] string? claimStatus, [FromQuery] string? viewMode,
           [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20,
           [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            var response = await _claimService.GetClaims(pageNumber, pageSize, claimStatus, viewMode, startDate, endDate);
            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Get claims successfully",
                data: response,
                statusCode: StatusCodes.Status200OK));
        }

        [HttpGet(ApiEndPointConstant.Claim.GetClaimEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<GetDetailClaimResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetClaim([FromRoute] Guid id)
        {
            var response = await _claimService.GetClaim(id);
            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Get claim successfully",
                data: response,
                statusCode: StatusCodes.Status200OK));
        }

        [HttpPut(ApiEndPointConstant.Claim.CancelClaimEndoint)]
        [Authorize(Roles = "Staff")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CancelClaim([FromQuery] Guid id, string remark)
        {
            try
            {
                var result = await _claimService.CancelClaim(id, remark);
                return Ok(ApiResponseBuilder.BuildResponse(
                    StatusCodes.Status200OK,
                    "Claim Request Cancel Successfully",
                    result
                ));
            }
            catch (NotFoundException)
            {
                return NotFound();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        [HttpPut(ApiEndPointConstant.Claim.RejectClaimEndpoint)]
        [Authorize(Roles = "Approver")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ValidateModelAttributes]
        public async Task<IActionResult> RejectClaim([FromQuery] Guid claimId)
        {
            var response = await _claimService.RejectClaim(claimId);
            return Ok(ApiResponseBuilder.BuildResponse(
                statusCode: StatusCodes.Status200OK,
                message: "Claim rejected successfully",
                data: response));
        }

        [HttpPut(ApiEndPointConstant.Claim.ApproveClaimEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Approver")]
        public async Task<IActionResult> ApproveClaim(
            [FromQuery] Guid claimId)
        {

            var result = await _claimService.ApproveClaim(claimId);
            return Ok(ApiResponseBuilder.BuildResponse(
                StatusCodes.Status200OK,
                "Claim approved successfully",
                result
            ));
        }

        [HttpPut(ApiEndPointConstant.Claim.UpdateClaimEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<CreateClaimResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        [Authorize(Roles = "Staff, Approver, Finance")]
        public async Task<IActionResult> UpdateClaim([FromQuery] Guid id, [FromBody] UpdateClaimRequest request)
        {
            var response = await _claimService.UpdateClaim(id, request);
            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Claim updated successfully",
                data: response,
                statusCode: StatusCodes.Status200OK));
        }

        [HttpPost(ApiEndPointConstant.Claim.ReturnClaimEndpoint)]
        [Authorize(Roles = "Approver, Finance")]
        [ProducesResponseType(typeof(ApiResponse<ReturnClaimResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        public async Task<IActionResult> ReturnPendingClaim([FromBody] ReturnClaimRequest request)
        {
            var response = await _claimService.ReturnClaim(request);
            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Claim returned successfully",
                data: response,
                statusCode: StatusCodes.Status200OK));
        }

        [HttpPut(ApiEndPointConstant.Claim.PaidClaimEndpoint)]
        [Authorize(Roles = "Finance")]
        [ProducesResponseType(typeof(ApiResponse<CreateClaimResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ValidateModelAttributes]
        public async Task<IActionResult> PayClaim([FromQuery] Guid id)
        {
            var response = await _claimService.PaidClaim(id);

            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Claim paid successfully.",
                data: response,
                statusCode: StatusCodes.Status200OK
            ));
        }

        [HttpPost(ApiEndPointConstant.Claim.SubmitClaimsEndpoint)]
        [Authorize(Roles = "Staff, Approver, Finance, Admin")]
        [ProducesResponseType(typeof(ApiResponse<List<SubmitClaimResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ValidateModelAttributes]
        public async Task<IActionResult> SubmitClaim([FromQuery] Guid id)
        {
            var response = await _claimService.SubmitClaim(id);
            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Claims submitted successfully",
                data: response,
                statusCode: StatusCodes.Status200OK));
        }

        [HttpGet(ApiEndPointConstant.Claim.ClaimsEndpoint + "/types")]
        [ProducesResponseType(typeof(ApiResponse<PagingResponse<GetClaimResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public IActionResult GetClaimType()
        {
            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Get claims type successfully",
                data: Enum.GetValues(typeof(ClaimType)),
                statusCode: StatusCodes.Status200OK));
        }

        [HttpGet(ApiEndPointConstant.Claim.GetClaimStatusCountEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<ClaimStatusCountResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        [Authorize(Roles = "Staff, Approver, Finance, Admin")]
        public async Task<IActionResult> GetClaimStatusCount([FromQuery] string viewMode, DateTime? startDate, DateTime? endDate)
        {
            var response = await _claimService.GetClaimStatusCount(viewMode, startDate, endDate);
            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Get claims successfully",
                data: response,
                statusCode: StatusCodes.Status200OK));
        }

        [HttpPost(ApiEndPointConstant.Claim.SubmitV2Endpoint)]
        [Authorize(Roles = "Staff, Approver, Finance, Admin")]
        [ProducesResponseType(typeof(ApiResponse<SubmitClaimResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ValidateModelAttributes]
        public async Task<IActionResult> SubmitV2([FromBody] CreateClaimRequest createClaimRequest)
        {
            var response = await _claimService.SubmitV2(createClaimRequest);
            return Ok(ApiResponseBuilder.BuildResponse(
                message: "Claim submitted successfully",
                data: response,
                statusCode: StatusCodes.Status200OK));
        }
    }
}
