using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
