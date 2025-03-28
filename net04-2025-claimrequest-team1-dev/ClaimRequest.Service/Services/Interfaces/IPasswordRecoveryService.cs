using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClaimRequest.DAL.Data.Responses.Auth;

namespace ClaimRequest.BLL.Services.Interfaces
{
    
        public interface IPasswordRecoveryService
        {
            Task RequestRecoveryCode(string email);
            Task<bool> VerifyRecoveryCode(string email, string otpCode);

           Task<VerifyRecoveryCodeResponse> ChangePassword(string email, string otpCode, string newPassword);
    }
    }

