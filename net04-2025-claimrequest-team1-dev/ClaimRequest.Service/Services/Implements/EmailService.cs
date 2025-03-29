//#define SMTP
#define SMTP
#define URL1
using AutoMapper;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.Responses.Project;
using ClaimRequest.DAL.Data.Responses.Staff;
using ClaimRequest.DAL.Repositories.Interfaces;
using Google.Apis.Gmail.v1;
using MailKit.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Claim = ClaimRequest.DAL.Data.Entities.Claim;
using MimeKit;


#if SMTP
using MimeKit.Text;
using MailKit.Net.Smtp;
#endif

#if OATH
using System.Net.Mail;
#endif



namespace ClaimRequest.BLL.Services.Implements
{
    public enum EmailTemplate
    {
        ClaimReturned,
        ManagerApproved,
        ClaimSubmitted,
        ClaimApproved
    }
    public class EmailService : BaseService<EmailService>, IEmailService
    {
        private static readonly string[] Scopes = { GmailService.Scope.GmailSend };
        private readonly string _applicationName;
        private readonly string _serviceAccountKeyFilePath;
        private readonly string _senderEmail;
        private readonly IClaimService _claimService;
        private readonly IProjectService _projectService;
        private readonly IStaffService _staffService;
        private readonly IConfiguration _configuration;


        public EmailService(IUnitOfWork<ClaimRequestDbContext> unitOfWork, ILogger<EmailService> logger, IMapper mapper, IHttpContextAccessor httpContextAccessor, IConfiguration configuration, IClaimService claimService, IProjectService projectService, IStaffService staffService) : base(unitOfWork, logger, mapper, httpContextAccessor)
        {
            _applicationName = configuration["Gmail:ApplicationName"];
            _serviceAccountKeyFilePath = Path.Combine(AppContext.BaseDirectory, "service-account-key.json");
            _senderEmail = configuration["SMTP:Username"];
            _claimService = claimService;
            _projectService = projectService;
            _staffService = staffService;
            _configuration = configuration;

        }

        public async Task SendEmail(Guid claimId, EmailTemplate template)
        {
            try
            {
                // get and invoke the function based on the template
                switch (template)
                {
                    case EmailTemplate.ClaimReturned:
                        await SendClaimReturnedEmail(claimId);
                        break;
                    case EmailTemplate.ManagerApproved:
                        await SendManagerApprovedEmail(claimId);
                        break;
                    case EmailTemplate.ClaimSubmitted:
                        await SendClaimSubmittedEmail(claimId);
                        break;
                    case EmailTemplate.ClaimApproved:
                        await SendClaimApprovedEmail(claimId);
                        break;
                    default:
                        throw new Exception("Template not found.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in SendEmail: {ex.Message}");
            }
        }

        public async Task SendClaimReturnedEmail(Guid claimId)
        {
            try
            {
                Claim claim = await _claimService.GetClaimByIdAsync(claimId);
                if (claim == null)
                    throw new NotFoundException($"Claim with {claimId} not found.");

                string projectName = claim.Project.Name;
                var updatedDate = claim.UpdateAt.ToString("yyyy-MM-dd HH:mm:ss");
                var claimer = claim.Claimer;
                string recipientEmail = claimer.Email;
                string subject = $"Claim Request for {projectName} - {claimer.Name} ({claimer.Id})";

                string templatePath = Path.Combine(AppContext.BaseDirectory, "Services", "Templates", "ClaimReturnedEmailTemplate.html");
                string body = await File.ReadAllTextAsync(templatePath);
                string url = $"http://localhost:5173/claim-detail/{claim.Id}";
                body = body.Replace("{ClaimerName}", claimer.Name)
                           .Replace("{ProjectName}", projectName)
                           .Replace("{ClaimerId}", claimer.Id.ToString())
                           .Replace("{UpdatedDate}", updatedDate)
                           .Replace("Url", url);

                await SendEmailAsync(recipientEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in SendClaimReturnedEmail: {ex.Message}");
                throw;
            }
        }

        public async Task SendManagerApprovedEmail(Guid claimId)
        {
            try
            {
                Claim claim = await _claimService.GetClaimByIdAsync(claimId);
                if (claim == null)
                    throw new Exception("Claim not found.");

                string projectName = claim.Project.Name;
                var updatedDate = claim.UpdateAt.ToString("yyyy-MM-dd HH:mm:ss");
                CreateStaffResponse claimer = await _staffService.GetStaffById(claim.ClaimerId);
                if (claim.Finance.Email == null || string.IsNullOrEmpty(claim.Finance.Email))
                    throw new Exception("Finance information is invalid.");

                string recipientEmail = claim.Finance.Email;
                string subject = $"Claim Request for {projectName} - {claimer.Name} ({claimer.Id})";

                string templatePath = Path.Combine(AppContext.BaseDirectory, "Services", "Templates", "ManagerApprovedEmailTemplate.html");
                string body = await File.ReadAllTextAsync(templatePath);
                string url = $"http://localhost:5173/claim-detail/{claim.Id}";
                body = body.Replace("{ClaimerName}", claimer.Name)
                           .Replace("{ProjectName}", projectName)
                           .Replace("{ClaimerId}", claimer.Id.ToString())
                           .Replace("{UpdatedDate}", updatedDate)
                           .Replace("Url", url);

                await SendEmailAsync(recipientEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending claim returned email with claimId: {claimId}");
                throw;
            }
        }

        public async Task SendClaimSubmittedEmail(Guid claimId)
        {
            try
            {
                Claim claim = await _claimService.GetClaimByIdAsync(claimId);
                if (claim == null)
                    throw new Exception("Claim not found.");

                CreateProjectResponse project = await _projectService.GetProjectById(claim.ProjectId.Value);
                if (project == null)
                    throw new Exception("Project not found.");

                string projectName = claim.Project.Name;
                string projectManagerName = project.ProjectManager.Name;
                string projectManagerEmail = project.ProjectManager.Email;
                var updatedDate = claim.UpdateAt.ToString("yyyy-MM-dd HH:mm:ss");
                CreateStaffResponse claimer = await _staffService.GetStaffById(claim.ClaimerId);
                if (claimer == null || string.IsNullOrEmpty(claimer.Email))
                    throw new Exception("Claimer information is invalid.");

                string recipientEmail = projectManagerEmail;
                string subject = $"Claim Request for {projectName} - {claimer.Name} ({claimer.Id})";

                string templatePath = Path.Combine(AppContext.BaseDirectory, "Services", "Templates", "ClaimSubmittedEmailTemplate.html");
                string body = await File.ReadAllTextAsync(templatePath);
                string url = $"http://localhost:5173/claim-detail/{claim.Id}";
                body = body.Replace("{ProjectManagerName}", projectManagerName)
                            .Replace("{ClaimerName}", claimer.Name)
                           .Replace("{ProjectName}", projectName)
                           .Replace("{ClaimerId}", claimer.Id.ToString())
                           .Replace("{UpdatedDate}", updatedDate)
                           .Replace("Url", url);

                await SendEmailAsync(recipientEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in SendClaimReturnedEmail: {ex.Message}");
                throw;
            }
        }

        public async Task SendClaimApprovedEmail(Guid claimId)
        {
            try
            {
                Claim claim = await _claimService.GetClaimByIdAsync(claimId);
                if (claim == null)
                    throw new NotFoundException($"Claim with {claimId} not found.");

                string projectName = claim.Project.Name;
                var updatedDate = claim.UpdateAt.ToString("yyyy-MM-dd HH:mm:ss");
                var claimer = claim.Claimer;
                string recipientEmail = claimer.Email;
                string subject = $"Claim Request for {projectName} - {claimer.Name} ({claimer.Id})";

                string templatePath = Path.Combine(AppContext.BaseDirectory, "Services", "Templates", "ClaimApprovedEmailTemplate.html");
                string body = await File.ReadAllTextAsync(templatePath);
                string url = $"http://localhost:5173/claim-detail/{claim.Id}";
                body = body.Replace("{ClaimerName}", claimer.Name)
                           .Replace("{ProjectName}", projectName)
                           .Replace("{ClaimerId}", claimer.Id.ToString())
                           .Replace("{UpdatedDate}", updatedDate)
                           .Replace("Url", url);

                await SendEmailAsync(recipientEmail, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in SendClaimReturnedEmail: {ex.Message}");
                throw;
            }
        }

        public async Task SendEmailReminder()
        {
            try
            {
                var claims = await _unitOfWork.GetRepository<Claim>().GetListAsync(
                    predicate: c => c.Status == ClaimStatus.Approved || c.Status == ClaimStatus.Pending,
                    include: p => p.AsNoTracking()
                    .Include(c => c.ClaimApprovers)
                    .ThenInclude(c => c.Approver)
                    .Include(c => c.Project)
                    .Include(c => c.Claimer)
                    .Include(c => c.Finance));

                string templatePath = Path.Combine(AppContext.BaseDirectory, "Services", "Templates", "TemplateSendMailReminder.html");
                string templateOriginal = await File.ReadAllTextAsync(templatePath);
                string url = "";
                var emailTasks = new List<Task>();
                foreach (var claim in claims)
                {
                    if (claim == null || claim.Project == null || claim.Claimer == null)
                    {
                        continue; // Skip claims with null values
                    }
                    if (claim.ClaimApprovers != null && claim.Status == ClaimStatus.Pending)
                    {
                        foreach (var approver in claim.ClaimApprovers)
                        {
                            if (approver.Approver == null)
                            {
                                continue; // Skip approvers with null values
                            }
                            string template = templateOriginal;
                            url = $"http://localhost:5173/claim-detail/{claim.Id}";
                            template = template.Replace("{Name}", approver.Approver.Name)
                                .Replace("{StaffName}", claim.Claimer.Name)
                                .Replace("{ProjectName}", claim.Project.Name)
                                .Replace("{StaffId}", claim.Claimer.Id.ToString())
                                .Replace("Url", url);
                            emailTasks.Add(SendEmailAsync(approver.Approver.Email, "Pending Approval Claims", template));
                        }
                    }
                    if (claim.FinanceId != null && claim.Status == ClaimStatus.Approved)
                    {
                        string template = templateOriginal;
#if URL1
                        url = $"http://localhost:5173/claim-detail/{claim.Id}";
#else
                        url = $"https://crs-rust.vercel.app/claim-detail/{claim.Id}";
#endif
                        template = template.Replace("{Name}", claim.Finance.Name)
                        .Replace("{StaffName}", claim.Claimer.Name)
                        .Replace("{ProjectName}", claim.Project.Name)
                        .Replace("{StaffId}", claim.Claimer.Id.ToString())
                        .Replace("Url", url);
                        emailTasks.Add(SendEmailAsync(claim.Finance.Email, "Approval Claims Request", template));
                    }
                }
                await Task.WhenAll(emailTasks);
                Task.Delay(1000);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email", ex.Message);
                throw;
            }

        }

#if OATH
        public async Task SendEmailAsync(string recipientEmail, string subject, string body)
        {
            try
            {
                // Validate email format
                try
                {
                    var mailAddress = new MailAddress(recipientEmail);
                }
                catch (FormatException)
                {
                    throw new ArgumentException("Invalid email format", nameof(recipientEmail));
                }

                UserCredential credential;
                using (var stream = new FileStream("credentials.json", FileMode.Open, FileAccess.Read))
                {
                    credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
                        GoogleClientSecrets.FromStream(stream).Secrets,
                        Scopes,
                        "user",
                        CancellationToken.None,
                        new FileDataStore("token.json", true));
                }

                // Create Gmail API service.
                var service = new GmailService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = _applicationName,
                });

                var emailMessage = new MimeMessage();
                emailMessage.From.Add(new MailboxAddress("System Email", _senderEmail));
                emailMessage.To.Add(new MailboxAddress("", recipientEmail));
                emailMessage.Subject = subject;
                emailMessage.Body = new TextPart("html") { Text = body };

                using (var memoryStream = new MemoryStream())
                {
                    emailMessage.WriteTo(memoryStream);
                    var rawMessage = Convert.ToBase64String(memoryStream.ToArray())
                        .Replace('+', '-')
                        .Replace('/', '_')
                        .Replace("=", "");

                    var message = new Message { Raw = rawMessage };

                    // Log the raw message for debugging
                    _logger.LogInformation($"Raw message: {rawMessage}");

                    try
                    {
                        await service.Users.Messages.Send(message, "me").ExecuteAsync();
                    }
                    catch (GoogleApiException ex)
                    {
                        _logger.LogError(ex, $"Google API error: {ex.Message}");
                        _logger.LogError($"Error details: {ex.Error?.Message}");
                        _logger.LogError($"Error code: {ex.Error?.Code}");
                        _logger.LogError($"Error errors: {string.Join(", ", ex.Error?.Errors.Select(e => e.Message))}");
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in SendEmailAsync: {ex.Message}");
                throw;
            }

        }
#endif

#if SMTP
        public async Task SendEmailAsync(string recipientEmail, string subject, string body)
        {
            try
            {
                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(_configuration["SMTP:From"]));
                email.To.Add(MailboxAddress.Parse(recipientEmail));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html) { Text = body };
                using var smtpClient = new SmtpClient();
                await smtpClient.ConnectAsync(_configuration["SMTP:Host"], int.Parse(_configuration["SMTP:Port"]), SecureSocketOptions.StartTls);
                await smtpClient.AuthenticateAsync(_configuration["SMTP:Username"], _configuration["SMTP:Password"]);
                await smtpClient.SendAsync(email);
                await smtpClient.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to Email");
                throw;
            }
        }
#endif
    }
}
