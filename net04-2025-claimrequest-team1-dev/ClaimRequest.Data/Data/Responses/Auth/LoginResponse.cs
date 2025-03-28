using ClaimRequest.DAL.Data.Responses.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Data.Responses.Auth
{
    public class LoginResponse
    {
        public string Token { get; set; }
        public GetStaffResponse User { get; set; }
        public DateTime Expiration { get; set; }
    }

}

