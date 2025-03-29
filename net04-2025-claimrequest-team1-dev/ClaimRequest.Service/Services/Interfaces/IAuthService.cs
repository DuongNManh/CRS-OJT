using ClaimRequest.DAL.Data.Requests.Auth;
using ClaimRequest.DAL.Data.Responses.Auth;

namespace ClaimRequest.BLL.Services.Interfaces
{
    public interface IAuthService
    {
        // Login method
        Task<LoginResponse> Login(LoginRequest loginRequest);
    }
}
