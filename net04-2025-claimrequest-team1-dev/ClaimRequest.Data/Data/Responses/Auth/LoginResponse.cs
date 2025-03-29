using ClaimRequest.DAL.Data.Responses.Staff;

namespace ClaimRequest.DAL.Data.Responses.Auth
{
    public class LoginResponse
    {
        public string Token { get; set; }
        public GetStaffResponse User { get; set; }
        public DateTime Expiration { get; set; }
    }

}

