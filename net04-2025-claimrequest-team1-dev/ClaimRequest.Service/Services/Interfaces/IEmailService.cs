using ClaimRequest.BLL.Services.Implements;

namespace ClaimRequest.BLL.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendClaimApprovedEmail(Guid claimId);
        Task SendClaimReturnedEmail(Guid claimId);
        Task SendClaimSubmittedEmail(Guid claimId);
        Task SendManagerApprovedEmail(Guid claimId);

        Task SendEmail(Guid claimId, EmailTemplate template);
        Task SendEmailAsync(string recipientEmail, string subject, string body);


    }
}
