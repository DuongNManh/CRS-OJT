using AutoMapper;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Claim;
using ClaimRequest.DAL.Data.Responses.Claim;
using ClaimRequest.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Claim = ClaimRequest.DAL.Data.Entities.Claim;

namespace ClaimRequest.BLL.Services.Implements
{
    public class ClaimService : BaseService<Claim>, IClaimService
    {
        public enum ViewMode
        {
            ApproverMode,
            FinanceMode,
            ClaimerMode
        }

        private readonly IEmailServiceFactory _emailServiceFactory;

        public ClaimService(
            IUnitOfWork<ClaimRequestDbContext> unitOfWork,
            ILogger<Claim> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IEmailServiceFactory emailServiceFactory)
            : base(unitOfWork, logger, mapper, httpContextAccessor)
        {
            _emailServiceFactory = emailServiceFactory;
        }

        public async Task<CreateClaimResponse> CreateClaim(CreateClaimRequest createClaimRequest)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserEmail = GetCurrentUserEmail();

                var newClaim = _mapper.Map<Claim>(createClaimRequest);

                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    // Map request to entity
                    newClaim.ClaimerId = currentUserId;
                    newClaim.Status = ClaimStatus.Draft;
                    newClaim.CreateAt = DateTime.UtcNow;

                    // Validate project exists
                    if (newClaim.ProjectId != null)
                    {
                        var project = await _unitOfWork.GetRepository<Project>()
                                          .FirstOrDefaultAsync(
                                              predicate: p => p.Id == newClaim.ProjectId,
                                              orderBy: null,
                                              include: null) ??
                                      throw new BusinessException($"Project with ID {newClaim.ProjectId} not found");

                        // Check if user is part of the project (as staff, PM, or BUL)
                        var isStaffInProject = await _unitOfWork.GetRepository<ProjectStaff>()
                            .CountAsync(ps => ps.ProjectId == newClaim.ProjectId && ps.StaffId == currentUserId) > 0;
                        var isProjectManager = project.ProjectManagerId == currentUserId;
                        var isBusinessUnitLeader = project.BusinessUnitLeaderId == currentUserId;

                        if (!isStaffInProject && !isProjectManager && !isBusinessUnitLeader)
                            throw new BusinessException("You must be a member of this project to create a claim.");
                    }

                    // Insert new claim
                    await _unitOfWork.GetRepository<Claim>().InsertAsync(newClaim);


                    // Add change log
                    await AddChangeLog(newClaim.Id, "Claim created", currentUserEmail, newClaim.CreateAt);
                    // Send email notification
                    //var emailService = _emailServiceFactory.Create();
                    //await emailService.SendClaimSubmittedEmail(newClaim.Id, "ClaimSubmittedEmailTemplate");
                    return newClaim;
                });

                // Send email notification
                var emailService = _emailServiceFactory.Create();
                await emailService.SendEmail(newClaim.Id, EmailTemplate.ClaimSubmitted);

                return _mapper.Map<CreateClaimResponse>(newClaim);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating claim: {Message}", ex.Message);
                throw;
            }
        }

        public Task<bool> DeleteClaim(Guid id)
        {
            throw new NotImplementedException();
        }


        public async Task<GetDetailClaimResponse> GetClaim(Guid id)
        {
            try
            {
                // as no tracking to avoid update entity
                var response = await _unitOfWork.GetRepository<Claim>().FirstOrDefaultAsync(
                    include: query => query.AsNoTracking()
                        .Include(c => c.Claimer)
                        .Include(c => c.Project)
                        .ThenInclude(p => p.ProjectManager)
                        .Include(c => c.Project)
                        .ThenInclude(p => p.BusinessUnitLeader)
                        .Include(c => c.Finance)
                        .Include(c => c.ChangeHistory)
                        .Include(c => c.ClaimApprovers)
                        .ThenInclude(ca => ca.Approver),
                    predicate: c => c.Id == id,
                    selector: c => _mapper.Map<GetDetailClaimResponse>(c));

                if (response == null)
                {
                    throw new NotFoundException($"Claim with ID {id} not found");
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claim: {Message}", ex.Message);
                throw;
            }
        }

        private void ValidateInputParameters(string? viewMode, string? claimStatus, string? approveStatus,
            DateTime? startDate, DateTime? endDate)
        {
            if (!string.IsNullOrEmpty(viewMode) && !Enum.TryParse<ViewMode>(viewMode, out _))
            {
                throw new ValidationException("The view mode is invalid");
            }

            if (!string.IsNullOrEmpty(claimStatus) && !Enum.TryParse<ClaimStatus>(claimStatus, out _))
            {
                throw new ValidationException("The claim status is invalid");
            }

            if (!string.IsNullOrEmpty(approveStatus) && !Enum.TryParse<ApproverStatus>(approveStatus, out _))
            {
                throw new ValidationException("The approve status is invalid");
            }

            if (startDate.HasValue && endDate.HasValue && startDate > endDate)
            {
                throw new ValidationException("Start date cannot be after end date");
            }
        }

        public async Task<PagingResponse<GetClaimResponse>> GetClaims(
            int pageNumber = 1, int pageSize = 20, string? claimStatus = null,
            string? viewMode = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                var currentUserRole = GetCurrentUserRole();

                if (viewMode == ViewMode.ClaimerMode.ToString())
                {
                    return await GetClaimsForClaimerAndFinance(pageNumber, pageSize, claimStatus, viewMode, startDate,
                        endDate);
                }
                else if (viewMode == ViewMode.FinanceMode.ToString() &&
                         currentUserRole == SystemRole.Finance.ToString())
                {
                    return await GetClaimsForClaimerAndFinance(pageNumber, pageSize, claimStatus, viewMode, startDate,
                        endDate);
                }
                else if (viewMode == ViewMode.ApproverMode.ToString() &&
                         currentUserRole == SystemRole.Approver.ToString())
                {
                    return await GetClaimsForApprover(pageNumber, pageSize, claimStatus, startDate, endDate);
                }

                throw new InvalidOperationException("Invalid view mode or user role.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claims: {Message}", ex.Message);
                throw;
            }
        }

        private async Task<PagingResponse<GetClaimResponse>> GetClaimsForClaimerAndFinance(
            int pageNumber = 1, int pageSize = 20, string? status = null, string? viewMode = null,
            DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                // Validate input parameters
                ValidateInputParameters(viewMode, status, null, startDate, endDate);

                // Check if startDate and endDate have values before converting to UTC
                var startDateUtc = ChangeToDateTimeUtc(startDate);
                var endDateUtc = ChangeToDateTimeUtc(endDate);

                var currentUserId = GetCurrentUserId();
                ClaimStatus? parsedStatus = null;
                if (!string.IsNullOrEmpty(status))
                {
                    parsedStatus = Enum.Parse<ClaimStatus>(status);
                }

                var baseQuery = _unitOfWork.GetRepository<Claim>().CreateBaseQuery(
                    include: query => query.Include(c => c.Project),
                    predicate: c => (parsedStatus == null || c.Status == parsedStatus) &&
                                    (startDateUtc == null || c.CreateAt >= startDateUtc) &&
                                    (endDateUtc == null || c.CreateAt <= endDateUtc));

                if (viewMode == ViewMode.ClaimerMode.ToString())
                {
                    // Claimer sees all claims based on overall claim status
                    baseQuery = baseQuery.Where(c => c.ClaimerId == currentUserId);
                }
                else if (viewMode == ViewMode.FinanceMode.ToString() &&
                         GetCurrentUserRole() == SystemRole.Finance.ToString())
                {
                    var allowedStatuses = new[] {
                        ClaimStatus.Approved,
                        ClaimStatus.Paid
                    };
                    baseQuery = baseQuery.Where(c => c.FinanceId == currentUserId &&
                                                     (allowedStatuses.Contains(c.Status)));
                }
                // Return the paginated response
                return await baseQuery
                    .OrderByDescending(c => c.CreateAt)
                    .Select(c => _mapper.Map<GetClaimResponse>(c))
                    .ToPagingResponse(pageNumber, pageSize, 1);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claims: {Message}", ex.Message);
                throw;
            }
        }

        private async Task<PagingResponse<GetClaimResponse>> GetClaimsForApprover(
            int pageNumber = 1, int pageSize = 20, string? approveStatus = null, DateTime? startDate = null,
            DateTime? endDate = null)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            // Ensure the user is an approver
            if (currentUserRole != SystemRole.Approver.ToString())
            {
                throw new UnauthorizedException("User is not authorized to view claims as an approver.");
            }

            // validate input parameters
            ValidateInputParameters(null, null, approveStatus, startDate, endDate);

            // Check if startDate and endDate have values before converting to UTC
            var startDateUtc = startDate.HasValue
                ? (startDate.Value.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc)
                    : startDate.Value.ToUniversalTime())
                : (DateTime?)null;
            var endDateUtc = endDate.HasValue
                ? (endDate.Value.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc)
                    : endDate.Value.ToUniversalTime())
                : (DateTime?)null;

            var allowedStatuses = new[] {
                ClaimStatus.Approved,
                ClaimStatus.Pending,
                ClaimStatus.Rejected,
            };

            // Pre-parse the approveStatus to avoid parsing in the query
            ApproverStatus? parsedApproveStatus = null;
            if (!string.IsNullOrEmpty(approveStatus))
            {
                parsedApproveStatus = Enum.Parse<ApproverStatus>(approveStatus);
            }

            var response = await _unitOfWork.GetRepository<Claim>().GetPagingListAsync(
                selector: c => _mapper.Map<GetClaimResponse>(c),
                predicate: c => allowedStatuses.Contains(c.Status) &&
                                (startDateUtc == null || c.CreateAt >= startDateUtc) &&
                                (endDateUtc == null || c.CreateAt <= endDateUtc) &&
                                c.ClaimApprovers.Any(ca => ca.ApproverId == currentUserId &&
                                                           (approveStatus == null || ca.ApproverStatus == parsedApproveStatus)),
                orderBy: q => q.OrderByDescending(c => c.CreateAt),
                include: q => q.Include(c => c.Project)
                    .Include(c => c.ClaimApprovers.Where(ca => ca.ApproverId == currentUserId))
                    .ThenInclude(ca => ca.Approver),
                page: pageNumber,
                size: pageSize);
            return response;
        }

        public async Task<CreateClaimResponse> UpdateClaim(Guid id, UpdateClaimRequest updateClaimRequest)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserEmail = GetCurrentUserEmail();
                var currentUserRole = GetCurrentUserRole();

                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    // Get existing claim with related data
                    var existingClaim = await _unitOfWork.GetRepository<Claim>().FirstOrDefaultAsync(
                        predicate: c => c.Id == id,
                        include: query => query
                            .Include(c => c.Project)
                            .Include(c => c.Claimer)
                            .Include(c => c.ClaimApprovers)
                            .Include(c => c.ChangeHistory)
                    );

                    // Validate claim
                    ValidateClaimAndProject(existingClaim, ClaimStatus.Draft, "updated");

                    var currentTime = DateTime.UtcNow;

                    // Update the claim properties
                    _mapper.Map(updateClaimRequest, existingClaim);

                    // Create audit trail entry with detailed update message
                    await AddChangeLog(existingClaim.Id, "Updated", currentUserEmail, DateTime.UtcNow);

                    // Update the claim
                    _unitOfWork.GetRepository<Claim>().UpdateAsync(existingClaim);
                    // Map and return response
                    var response = _mapper.Map<CreateClaimResponse>(existingClaim);
                    return response;
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating claim: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<bool> CancelClaim(Guid id, string remark)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserEmail = GetCurrentUserEmail();
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var claim = await GetClaimByIdAsync(id);
                    ValidateClaimOwnership(claim, currentUserId);
                    // check if the claim is in the correct status Draft
                    if (claim.Status != ClaimStatus.Draft)
                    {
                        throw new BadRequestException("Only claims in Draft status can be cancelled");
                    }

                    claim.Status = ClaimStatus.Cancelled;
                    claim.Remark = remark;
                    _unitOfWork.GetRepository<Claim>().UpdateAsync(claim);

                    await AddChangeLog(claim.Id, "Cancelled", currentUserEmail);
                    return true;
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling claim: {Message}", ex.Message);
                throw;
            }
        }

        private void ValidateClaimOwnership(Claim claim, Guid currentUserId)
        {
            if (claim.ClaimerId != currentUserId)
            {
                throw new UnauthorizedException("You do not have permission to cancel this claim");
            }
        }

        public async Task<bool> ApproveClaim(Guid claimId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserEmail = GetCurrentUserEmail();

                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var claim = await _unitOfWork.GetRepository<Claim>()
                        .FirstOrDefaultAsync(
                            predicate: c => c.Id == claimId,
                            include: q => q.Include(c => c.ClaimApprovers));

                    var approver = ValidateAndGetApprover(claim, currentUserId, ClaimStatus.Pending, "approved");
                    await UpdateClaimStatus(claim, approver, ApproverStatus.Approved, "Approved", currentUserEmail);

                    // Send email notification
                    var emailService = _emailServiceFactory.Create();
                    await emailService.SendEmail(claimId, EmailTemplate.ManagerApproved);


                    return true;
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving claim: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<Claim> GetClaimByIdAsync(Guid claimId)
        {
            try
            {
                var claim = await _unitOfWork.GetRepository<Claim>()
                    .FirstOrDefaultAsync(
                        predicate: c => c.Id == claimId,
                        include: q => q.Include(c => c.ClaimApprovers)
                            .Include(c => c.Project)
                            .Include(c => c.Claimer)
                            .Include(c => c.Finance)
                    );

                if (claim == null)
                {
                    throw new NotFoundException($"Claim with ID {claimId} not found");
                }

                return claim;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving claim: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<ReturnClaimResponse> ReturnClaim(ReturnClaimRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserEmail = GetCurrentUserEmail();
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var claim = await _unitOfWork.GetRepository<Claim>().FirstOrDefaultAsync(
                        include: query => query
                            .Include(c => c.Project)
                            .Include(c => c.Finance)
                            .Include(c => c.ClaimApprovers)
                            .ThenInclude(ca => ca.Approver),
                        predicate: c => c.Id == request.ClaimId);

                    // common validation
                    ValidateClaimAndProject(claim, ClaimStatus.Pending, "returned");

                    // check the current user is the approver in the claim
                    var approver = claim.ClaimApprovers.FirstOrDefault(ca => ca.ApproverId == currentUserId);

                    // check the current user is the finance in this claim
                    var finance = claim.FinanceId == currentUserId ? claim.Finance : null;

                    if (approver == null && finance == null)
                    {
                        throw new BusinessException("You are not assigned to this claim.");
                    }

                    claim.Status = ClaimStatus.Draft;
                    claim.Remark = request.Remark;

                    _unitOfWork.GetRepository<Claim>().UpdateAsync(claim);

                    // Add to change history
                    await AddChangeLog(claim.Id, "Returned", currentUserEmail, DateTime.UtcNow);

                    // Send email notification
                    var emailService = _emailServiceFactory.Create();
                    await emailService.SendEmail(claim.Id, EmailTemplate.ClaimReturned);


                    //var updatedClaim = await GetClaimByIdAsync(claim.Id);
                    return _mapper.Map<ReturnClaimResponse>(claim);
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error returning claim: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<bool> PaidClaim(Guid id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserEmail = GetCurrentUserEmail();
                var currentUserRole = GetCurrentUserRole();

                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var existingClaim = await _unitOfWork.GetRepository<Claim>()
                        .FirstOrDefaultAsync(
                            predicate: c => c.Id == id,
                            include: q => q.Include(c => c.Finance)
                        );

                    // Common validation
                    ValidateClaimAndProject(existingClaim, ClaimStatus.Approved, "Paid");

                    if (existingClaim.FinanceId != currentUserId)
                    {
                        throw new BusinessException("You are not assigned to this claim.");
                    }

                    existingClaim.Status = ClaimStatus.Paid;
                    _unitOfWork.GetRepository<Claim>().UpdateAsync(existingClaim);

                    // Add to change history
                    await AddChangeLog(existingClaim.Id, "Paid", currentUserEmail, DateTime.UtcNow);

                    // Send email notification
                    var emailService = _emailServiceFactory.Create();
                    await emailService.SendEmail(existingClaim.Id, EmailTemplate.ClaimApproved);

                    return true;
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error Paid Claim: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<bool> RejectClaim(Guid claimId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserEmail = GetCurrentUserEmail();

                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var claim = await _unitOfWork.GetRepository<Claim>()
                        .FirstOrDefaultAsync(
                            predicate: c => c.Id == claimId,
                            include: q => q.Include(c => c.ClaimApprovers)
                        );

                    var approver = ValidateAndGetApprover(claim, currentUserId, ClaimStatus.Pending, "rejected");
                    await UpdateClaimStatus(claim, approver, ApproverStatus.Rejected, "Rejected", currentUserEmail);

                    return true;
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting claim: {Message}", ex.Message);
                throw;
            }
        }

        public Task<SubmitClaimResponse> SubmitClaim(Guid claimId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserEmail = GetCurrentUserEmail();
                return _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var claim = await _unitOfWork.GetRepository<Claim>().FirstOrDefaultAsync(
                        include: query => query
                            .Include(c => c.Project)
                            .Include(c => c.ClaimApprovers)
                            .Include(c => c.Finance),
                        predicate: c => c.Id == claimId);

                    if (claim == null)
                    {
                        throw new NotFoundException($"Claim with ID {claimId} not found");
                    }

                    if (claim.ClaimerId != currentUserId)
                    {
                        throw new UnauthorizedException("You are not the claimer of this claim.");
                    }

                    ValidateClaimAndProject(claim, ClaimStatus.Draft, "submitted");

                    // Handle project-based claims
                    if (claim.ProjectId != null)
                    {
                        if (claim.ClaimApprovers != null && claim.ClaimApprovers.Any())
                        {
                            // Re-submit case: Reset all approver statuses
                            foreach (var approver in claim.ClaimApprovers)
                            {
                                approver.ApproverStatus = currentUserId == approver.ApproverId
                                    ? ApproverStatus.Approved
                                    : ApproverStatus.Pending;
                                approver.DecisionAt = null;
                            }
                        }
                        else
                        {
                            // First submit case: Assign approvers
                            claim.ClaimApprovers = await AssignApproversAutomatically(claim.ProjectId.Value, claim.ClaimerId);
                        }
                        claim.Status = ClaimStatus.Pending;
                    }
                    // Handle non-project claims
                    else
                    {
                        if (claim.Finance == null)
                        {
                            claim.Finance = await AssignRandomFinance(claim.ClaimerId);
                            claim.FinanceId = claim.Finance.Id;
                        }
                        claim.Status = ClaimStatus.Approved;
                    }

                    _unitOfWork.GetRepository<Claim>().UpdateAsync(claim);

                    // Add to change history
                    await AddChangeLog(claim.Id, "Submitted", currentUserEmail, DateTime.UtcNow);

                    return _mapper.Map<SubmitClaimResponse>(claim);
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting claim: {Message}", ex.Message);
                throw;
            }
        }

        private async Task<List<ClaimApprover>> AssignApproversAutomatically(Guid projectId, Guid claimerId)
        {
            var project = await _unitOfWork.GetRepository<Project>()
                .FirstOrDefaultAsync(predicate: p => p.Id == projectId);

            if (project == null)
            {
                throw new BusinessException($"Project with ID {projectId} not found");
            }

            var approvers = new List<ClaimApprover>();

            // 1. Add Project Managers, if claimer is PM then auto-approve
            approvers.Add(new ClaimApprover
            {
                ApproverId = project.ProjectManagerId,
                ApproverStatus = claimerId == project.ProjectManagerId
                    ? ApproverStatus.Approved
                    : ApproverStatus.Pending
            });

            // 2. Add Business Unit Leaders, if claimer is BUL then auto-approve
            approvers.Add(new ClaimApprover
            {
                ApproverId = project.BusinessUnitLeaderId,
                ApproverStatus = claimerId == project.BusinessUnitLeaderId
                    ? ApproverStatus.Approved
                    : ApproverStatus.Pending
            });

            return approvers;
        }

        private async Task<Staff> AssignRandomFinance(Guid claimerId)
        {
            // Randomly select from available finance staff, except the claimer
            var financeStaff = await _unitOfWork.GetRepository<Staff>()
                .GetListAsync(
                    predicate: s => s.SystemRole == SystemRole.Finance &&
                                    s.IsActive &&
                                    s.Id != claimerId
                );

            if (!financeStaff.Any())
            {
                throw new BusinessException("No active finance staff members found to approve the claim");
            }

            // Randomly select one finance staff member
            var random = new Random();
            var randomFinanceStaff = financeStaff.ToList()[random.Next(financeStaff.Count())];

            return randomFinanceStaff;
        }

        private async Task AddChangeLog(Guid claimId, string action, string userEmail, DateTime? changeTime = null)
        {
            var changeLog = new ClaimChangeLog
            {
                HistoryId = Guid.NewGuid(),
                ClaimId = claimId,
                Message = $"{action} by {userEmail} on {changeTime ?? DateTime.UtcNow:g}",
                ChangedAt = changeTime ?? DateTime.UtcNow,
                ChangedBy = userEmail
            };

            await _unitOfWork.GetRepository<ClaimChangeLog>().InsertAsync(changeLog);
        }

        private void ValidateClaimAndProject(Claim claim, ClaimStatus expectedStatus, string operation)
        {
            if (claim == null)
            {
                throw new NotFoundException("Claim not found");
            }

            if (claim.Status != expectedStatus)
            {
                throw new BusinessException(
                    $"Only claims in {expectedStatus} status can be {operation}. Current status: {claim.Status}");
            }
        }

        private ClaimApprover ValidateAndGetApprover(Claim claim, Guid currentUserId, ClaimStatus expectedStatus,
            string operation)
        {
            // Common validation for claim status
            ValidateClaimAndProject(claim, expectedStatus, operation);

            // Check if the approver exists for this claim
            var claimApprover = claim.ClaimApprovers?.FirstOrDefault(ca => ca.ApproverId == currentUserId);
            if (claimApprover == null)
            {
                throw new BusinessException($"Approver with ID {currentUserId} is not assigned to this claim");
            }

            if (claimApprover.ApproverStatus != ApproverStatus.Pending)
            {
                throw new BusinessException(
                    $"Only approver claims in Pending status can be {operation}. Current status: {claimApprover.ApproverStatus}");
            }

            return claimApprover;
        }

        private async Task UpdateClaimStatus(Claim claim, ClaimApprover approver, ApproverStatus newStatus,
            string action, string userEmail)
        {
            var currentTime = DateTime.UtcNow;

            approver.ApproverStatus = newStatus;
            approver.DecisionAt = currentTime;

            if (newStatus == ApproverStatus.Rejected)
            {
                // If rejected, update all approvers' statuses
                foreach (var otherApprover in claim.ClaimApprovers)
                {
                    otherApprover.ApproverStatus = ApproverStatus.Rejected;
                    otherApprover.DecisionAt = currentTime;
                }

                claim.Status = ClaimStatus.Rejected;
            }
            else
            {
                // For approve or return, update based on overall status
                claim.Status = claim.GetOverallStatus();

                // If all approvers approve (status becomes Approved) and no finance is assigned yet
                if (claim.Status == ClaimStatus.Approved && claim.FinanceId == null)
                {
                    claim.Finance = await AssignRandomFinance(claim.ClaimerId);
                    claim.FinanceId = claim.Finance.Id;
                }
            }

            claim.UpdateAt = currentTime;
            _unitOfWork.GetRepository<Claim>().UpdateAsync(claim);
            await AddChangeLog(claim.Id, action, userEmail, currentTime);
        }

        public async Task<ClaimStatusCountResponse> GetClaimStatusCount(string viewMode, DateTime? startDate, DateTime? endDate)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserRole = GetCurrentUserRole();

                if (viewMode == ViewMode.ClaimerMode.ToString())
                {
                    return await GetClaimStatusCountForClaimer(currentUserId, startDate, endDate);
                }
                else if (viewMode == ViewMode.FinanceMode.ToString() &&
                         currentUserRole == SystemRole.Finance.ToString())
                {
                    return await GetClaimStatusCountForFinance(currentUserId, startDate, endDate);
                }
                else if (viewMode == ViewMode.ApproverMode.ToString() &&
                         currentUserRole == SystemRole.Approver.ToString())
                {
                    return await GetClaimStatusCountForApprover(currentUserId, startDate, endDate);
                }

                throw new InvalidOperationException("Invalid view mode or user role.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting claim status: {Message}", ex.Message);
                throw;
            }
        }

        private async Task<ClaimStatusCountResponse> GetClaimStatusCountForClaimer(Guid currentUserId, DateTime? startDate, DateTime? endDate)
        {
            var startDateUtc = ChangeToDateTimeUtc(startDate);
            var endDateUtc = ChangeToDateTimeUtc(endDate);

            var claims = await _unitOfWork.GetRepository<Claim>().GetListAsync(
                include: null,
                predicate: c => c.ClaimerId == currentUserId &&
                                (startDateUtc == null || c.CreateAt >= startDateUtc) && (endDate == null || c.CreateAt <= endDateUtc),
                orderBy: null,
                selector: c => c.Status
            );

            return new ClaimStatusCountResponse
            {
                Draft = claims.Count(c => c == ClaimStatus.Draft),
                Pending = claims.Count(c => c == ClaimStatus.Pending),
                Approved = claims.Count(c => c == ClaimStatus.Approved),
                Rejected = claims.Count(c => c == ClaimStatus.Rejected),
                Paid = claims.Count(c => c == ClaimStatus.Paid),
                Cancelled = claims.Count(c => c == ClaimStatus.Cancelled),
                Total = claims.Count
            };
        }

        private async Task<ClaimStatusCountResponse> GetClaimStatusCountForFinance(Guid currentUserId, DateTime? startDate, DateTime? endDate)
        {
            var startDateUtc = ChangeToDateTimeUtc(startDate);
            var endDateUtc = ChangeToDateTimeUtc(endDate);

            var claims = await _unitOfWork.GetRepository<Claim>().GetListAsync(
                include: null,
                predicate: c => c.FinanceId == currentUserId &&
                                c.Status != ClaimStatus.Draft &&
                                c.Status != ClaimStatus.Cancelled &&
                                c.Status != ClaimStatus.Pending &&
                                c.Status != ClaimStatus.Rejected &&
                                (startDateUtc == null || c.CreateAt >= startDateUtc) && (endDate == null || c.CreateAt <= endDateUtc),
                orderBy: null,
                selector: c => c.Status
            );

            return new ClaimStatusCountResponse
            {
                Draft = claims.Count(c => c == ClaimStatus.Draft),
                Pending = claims.Count(c => c == ClaimStatus.Pending),
                Approved = claims.Count(c => c == ClaimStatus.Approved),
                Rejected = claims.Count(c => c == ClaimStatus.Rejected),
                Paid = claims.Count(c => c == ClaimStatus.Paid),
                Cancelled = claims.Count(c => c == ClaimStatus.Cancelled),
                Total = claims.Count
            };
        }

        private async Task<ClaimStatusCountResponse> GetClaimStatusCountForApprover(Guid currentUserId, DateTime? startDate, DateTime? endDate)
        {
            var startDateUtc = ChangeToDateTimeUtc(startDate);
            var endDateUtc = ChangeToDateTimeUtc(endDate);

            var claims = await _unitOfWork.GetRepository<Claim>().CreateBaseQuery(
                include: query => query.Include(c => c.ClaimApprovers.Where(ca => ca.ApproverId == currentUserId)),
                predicate: c => c.Status != ClaimStatus.Paid &&
                                c.Status != ClaimStatus.Draft &&
                                c.Status != ClaimStatus.Cancelled &&
                                (startDateUtc == null || c.CreateAt >= startDateUtc) && (endDate == null || c.CreateAt <= endDateUtc)
            ).ToListAsync();

            var approverStatuses = claims.SelectMany(c => c.ClaimApprovers)
                .Where(ca => ca.ApproverId == currentUserId)
                .Select(ca => ca.ApproverStatus)
                .ToList();

            return new ClaimStatusCountResponse
            {
                Pending = approverStatuses.Count(c => c == ApproverStatus.Pending),
                Approved = approverStatuses.Count(c => c == ApproverStatus.Approved),
                Rejected = approverStatuses.Count(c => c == ApproverStatus.Rejected),
                Total = approverStatuses.Count
            };
        }
        private DateTime? ChangeToDateTimeUtc(DateTime? dateTime)
        {
            return dateTime.HasValue
                ? (dateTime.Value.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(dateTime.Value, DateTimeKind.Utc)
                    : dateTime.Value.ToUniversalTime())
                : (DateTime?)null;
        }

        public async Task<SubmitClaimResponse> SubmitV2(CreateClaimRequest createClaimRequest)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserEmail = GetCurrentUserEmail();

                var newClaim = _mapper.Map<Claim>(createClaimRequest);
                newClaim.ClaimerId = currentUserId;
                newClaim.CreateAt = DateTime.UtcNow;

                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    // Validate project exists
                    if (newClaim.ProjectId != null)
                    {
                        var project = await _unitOfWork.GetRepository<Project>()
                                          .FirstOrDefaultAsync(
                                              predicate: p => p.Id == newClaim.ProjectId,
                                              orderBy: null,
                                              include: null) ??
                                      throw new BusinessException($"Project with ID {newClaim.ProjectId} not found");

                        // Check if user is part of the project (as staff, PM, or BUL)
                        var isStaffInProject = await _unitOfWork.GetRepository<ProjectStaff>()
                            .CountAsync(ps => ps.ProjectId == newClaim.ProjectId && ps.StaffId == currentUserId) > 0;
                        var isProjectManager = project.ProjectManagerId == currentUserId;
                        var isBusinessUnitLeader = project.BusinessUnitLeaderId == currentUserId;

                        if (!isStaffInProject && !isProjectManager && !isBusinessUnitLeader)
                            throw new BusinessException("You must be a member of this project to create a claim.");

                        // Assign approvers automatically
                        newClaim.ClaimApprovers = await AssignApproversAutomatically(newClaim.ProjectId.Value, currentUserId);
                        newClaim.Status = ClaimStatus.Pending;
                    }
                    else
                    {
                        // Assign finance automatically
                        newClaim.Finance = await AssignRandomFinance(currentUserId);
                        newClaim.FinanceId = newClaim.Finance.Id;
                        newClaim.Status = ClaimStatus.Approved;
                    }

                    // Insert new claim
                    await _unitOfWork.GetRepository<Claim>().InsertAsync(newClaim);

                    // Add change log
                    await AddChangeLog(newClaim.Id, "Claim created and submitted", currentUserEmail, newClaim.CreateAt);
                });

                // Send email notification
                var emailService = _emailServiceFactory.Create();
                await emailService.SendEmail(newClaim.Id, EmailTemplate.ClaimSubmitted);

                return _mapper.Map<SubmitClaimResponse>(newClaim);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting claim: {Message}", ex.Message);
                throw;
            }
        }
    }
}