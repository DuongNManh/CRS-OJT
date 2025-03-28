using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Data.Requests.Auth
{
    public class VerifyRecoveryCodeRequest
    {
        public string email { get; set; }
        public string OtpCode { get; set; }
    }
}
