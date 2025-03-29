namespace ClaimRequest.DAL.Data.Requests.Auth
{
    public class VerifyRecoveryCodeRequest
    {
        public string email { get; set; }
        public string OtpCode { get; set; }
    }
}
