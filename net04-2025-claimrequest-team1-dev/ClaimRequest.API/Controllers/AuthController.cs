using ClaimRequest.API.Constants;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Auth;
using ClaimRequest.DAL.Data.Responses.Auth;
using Microsoft.AspNetCore.Mvc;

namespace ClaimRequest.API.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly IPasswordRecoveryService _passwordRecoveryService;

        public AuthController(ILogger<AuthController> logger, IAuthService authService, IPasswordRecoveryService passwordRecoveryService)
        {
            _logger = logger;
            _authService = authService;
            _passwordRecoveryService = passwordRecoveryService;
        }

        [HttpPost(ApiEndPointConstant.Auth.LoginEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            {
                var response = await _authService.Login(request);
                return Ok(ApiResponseBuilder.BuildResponse(
                    StatusCodes.Status200OK,
                    "Login successful",
                    response
                ));
            }
        }

        [HttpPost(ApiEndPointConstant.Auth.RequestRevCodeEndpoint)]
        public async Task<IActionResult> RequestRecoveryCode([FromBody] RecoveryCodeRequest request)
        {
            try
            {
                await _passwordRecoveryService.RequestRecoveryCode(request.email);
                return Ok("Recovery code sent.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost(ApiEndPointConstant.Auth.VerifyRevCodeEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<VerifyRecoveryCodeResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]

        public async Task<IActionResult> VerifyRecoveryCode([FromBody] VerifyRecoveryCodeRequest request)
        {
            var isValid = await _passwordRecoveryService.VerifyRecoveryCode(request.email, request.OtpCode);
            if (!isValid)
            {
                return BadRequest("Invalid or expired recovery code.");
            }

            return Ok("Recovery code verified.");
        }

        [HttpPost(ApiEndPointConstant.Auth.ChangePasswordEndpoint)]
        [ProducesResponseType(typeof(ApiResponse<VerifyRecoveryCodeResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]

        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var response = await _passwordRecoveryService.ChangePassword(request.email, request.otpCode, request.NewPassword);
                return Ok(ApiResponseBuilder.BuildResponse(
             StatusCodes.Status200OK,
             "Recovery code verification result",
             response
         ));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
