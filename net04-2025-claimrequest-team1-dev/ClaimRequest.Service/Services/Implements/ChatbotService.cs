using AutoMapper;
using ClaimRequest.AI;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClaimRequest.BLL.Services.Implements;

public class ChatbotService(
    IUnitOfWork<ClaimRequestDbContext> unitOfWork,
    ILogger<Staff> logger,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor,
    IRAGChatService chatService)
    : BaseService<Staff>(unitOfWork, logger, mapper, httpContextAccessor), IChatbotService
{
    public async Task<string> HandleAnswer(string question)
    {
        var staffId = GetCurrentUserId();
        var staff = await _unitOfWork.GetRepository<Staff>().SingleOrDefaultAsync(
            predicate: c => c.Id == staffId
        );
        if (staff == null)
            throw new Exception("Staff not found");

        var answer = await chatService.Answer(
            new UserArugments
            {
                Email = staff.Email,
                Name = staff.Name,
                Role = staff.SystemRole.ToString()
            }, question);
        return answer;
    }
}