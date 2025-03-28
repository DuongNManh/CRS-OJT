using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Data.Responses.Auth
{
    public class VerifyRecoveryCodeResponse
    {
        public string attempt_count { get; set; }

        public string is_success { get; set; }
    }
}
