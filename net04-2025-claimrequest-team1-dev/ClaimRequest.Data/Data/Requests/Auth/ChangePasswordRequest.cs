using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Data.Requests.Auth
{
    public class ChangePasswordRequest
    {
        public string email { get; set; }
        public string NewPassword { get; set; }
        public string otpCode { get; set; }
    }
}


