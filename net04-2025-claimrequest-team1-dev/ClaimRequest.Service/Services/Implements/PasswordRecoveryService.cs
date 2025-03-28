using AutoMapper;
using ClaimRequest.BLL.Services;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Repositories.Implements;
using ClaimRequest.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OtpNet;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.Responses.Auth;

namespace ClaimRequest.API.Services
{
    public class PasswordRecoveryService : BaseService<RecoveryCode>, IPasswordRecoveryService
    {
        private readonly IEmailService _emailService;

        public PasswordRecoveryService(
            IEmailService emailService,
            IUnitOfWork<ClaimRequestDbContext> unitOfWork,
            ILogger<RecoveryCode> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
            : base(unitOfWork, logger, mapper, httpContextAccessor)
        {
            _emailService = emailService;
        }

        public async Task RequestRecoveryCode(string email)
        {
            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                var staff = await _unitOfWork.GetRepository<Staff>()
                    .SingleOrDefaultAsync(
                        predicate: s => s.Email == email && s.IsActive
                    );

                if (staff == null)
                {
                    throw new Exception("Email not found.");
                }

                // Check for existing recovery code and cooldown period
                var existingRecoveryCode = await _unitOfWork.GetRepository<RecoveryCode>()
                    .SingleOrDefaultAsync(
                        predicate: rc => rc.StaffId == staff.Id
                    );
                if (existingRecoveryCode != null)
                {
                    var cooldownPeriod = TimeSpan.FromMinutes(1); // Set cooldown period (e.g., 1 minute)
                    if (DateTime.UtcNow - existingRecoveryCode.CreatedAt < cooldownPeriod)
                    {
                        throw new Exception("You must wait before requesting a new recovery code.");
                    }

                    _unitOfWork.Context.RecoveryCodes.Remove(existingRecoveryCode);
                }

                var recoveryCode = new RecoveryCode
                {
                    StaffId = staff.Id,
                    OtpCode = GenerateOtp(staff.Email),
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                    AttemptCount = 3 // Set attempt count to 3
                };

                await _unitOfWork.GetRepository<RecoveryCode>()
                    .InsertAsync(recoveryCode);
                await _emailService.SendEmailAsync(staff.Email, "Your recovery code", $"Your recovery code is {recoveryCode.OtpCode}");
            });
        }

        public async Task<bool> VerifyRecoveryCodeAsync(string email, string otpCode)
        {
            return await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                var staff = await _unitOfWork.GetRepository<Staff>()
                    .SingleOrDefaultAsync(
                        predicate: s => s.Email == email && s.IsActive
                    );
                if (staff == null)
                {
                    throw new NotFoundException("email not found");
                }

                var recoveryCode = await _unitOfWork.GetRepository<RecoveryCode>()
                    .FirstOrDefaultAsync(
                        predicate: rc => rc.StaffId == staff.Id
                    );
                if (recoveryCode == null || recoveryCode.ExpiresAt < DateTime.UtcNow || recoveryCode.IsUsed)
                {
                    return false;
                }

                // Decrement attempt count
                recoveryCode.AttemptCount--;
                if (recoveryCode.AttemptCount <= 0)
                {
                    _unitOfWork.GetRepository<RecoveryCode>()
                        .DeleteAsync(recoveryCode);
                    return false;
                }

                if (recoveryCode.OtpCode != otpCode)
                {
                    _unitOfWork.GetRepository<RecoveryCode>()
                        .UpdateAsync(recoveryCode);
                    return false;
                }

                recoveryCode.IsUsed = true;
                _unitOfWork.GetRepository<RecoveryCode>()
                    .DeleteAsync(recoveryCode); // Delete the instance after successful attempt

                return true;
            });
        }

        public async Task<bool> VerifyRecoveryCode(string email, string otpCode)
        {
            return await VerifyRecoveryCodeAsync(email, otpCode);
        }

        public async Task<VerifyRecoveryCodeResponse> ChangePassword(string email, string otpCode, string newPassword)
        {
            var staff = await _unitOfWork.Context.Staffs.SingleOrDefaultAsync(s => s.Email == email);
            if (staff == null)
            {
                throw new Exception("Email not found.");
            }
            var isVerified = await VerifyRecoveryCodeAsync(email, otpCode);
            if (!isVerified)
            {

                throw new Exception("Invalid or expired recovery code.");
            }

            

            // Change the password
            staff.Password = newPassword; // You should hash the password before saving it
            await _unitOfWork.Context.SaveChangesAsync();

            return new VerifyRecoveryCodeResponse
            {
                attempt_count = "0", // Assuming the password change is successful, attempt count is reset
                is_success = "true"
            };
        }

        private static readonly ConcurrentDictionary<string, (string Otp, DateTime ExpirationTime)> OtpStore = new ConcurrentDictionary<string, (string Otp, DateTime ExpirationTime)>();
        private static readonly TimeSpan OtpValidityDuration = TimeSpan.FromMinutes(5); // OTP valid for 5 minutes

        static string GenerateSecretKey(string email)
        {
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes("secret_salt")))
            {
                byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(email));
                return Base32Encoding.ToString(hash); // Use Base32 encoding
            }
        }

        public static string GenerateOtp(string email)
        {
            var secretKey = GenerateSecretKey(email);
            var totp = new Totp(Base32Encoding.ToBytes(secretKey));
            var otp = totp.ComputeTotp();

            // Store OTP with expiration time associated with the username
            OtpStore[email] = (otp, DateTime.UtcNow.Add(OtpValidityDuration));

            return otp;
        }
    }
}
