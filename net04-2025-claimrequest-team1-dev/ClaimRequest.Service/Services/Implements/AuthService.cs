using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.Requests.Auth;
using ClaimRequest.DAL.Data.Responses.Auth;
using ClaimRequest.DAL.Data.Responses.Staff;
using ClaimRequest.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Claim = System.Security.Claims.Claim;

namespace ClaimRequest.BLL.Services.Implements
{
    public class AuthService : BaseService<AuthService>, IAuthService
    {
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork<ClaimRequestDbContext> unitOfWork, ILogger<AuthService> logger, IMapper mapper, IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(unitOfWork, logger, mapper, httpContextAccessor)
        {
            _configuration = configuration;
        }

        public async Task<LoginResponse> Login(LoginRequest loginRequest)
        {
            try
            {
                var staff = await _unitOfWork.GetRepository<Staff>()
                .FirstOrDefaultAsync(s => s.Email == loginRequest.Email && s.IsActive, null, null);

                if (staff == null || !VerifyPassword(loginRequest.Password, staff.Password))
                {
                    throw new UnauthorizedException("Invalid email or password");
                }

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, staff.Id.ToString()),
                        new Claim(ClaimTypes.Email, staff.Email),
                        new Claim(ClaimTypes.Role, staff.SystemRole.ToString()), 
                    }),
                    Expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:TokenValidityInMinutes"])),
                    Issuer = _configuration["Jwt:ValidIssuers:0"],
                    Audience = _configuration["Jwt:ValidAudiences:0"],
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                return new LoginResponse
                {
                    Token = tokenString,
                    User = _mapper.Map<Staff, GetStaffResponse>(staff),
                    Expiration = tokenDescriptor.Expires.Value
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error at Login Function in AuthService");
                throw;
            }
        }

        

        private bool VerifyPassword(string enteredPassword, string storedPassword)
        {
            // Implement your password verification logic here
            // For example, if you are using a hashing algorithm:
            // return BCrypt.Net.BCrypt.Verify(enteredPassword, storedPassword);
            return enteredPassword == storedPassword; // Placeholder, replace with actual verification
        }
    }
}
