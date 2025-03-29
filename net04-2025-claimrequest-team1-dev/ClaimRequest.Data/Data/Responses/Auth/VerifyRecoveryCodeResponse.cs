namespace ClaimRequest.DAL.Data.Responses.Auth
{
    public class VerifyRecoveryCodeResponse
    {
        public string attempt_count { get; set; }

        public string is_success { get; set; }
    }
}
