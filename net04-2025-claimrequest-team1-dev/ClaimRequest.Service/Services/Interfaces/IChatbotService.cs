namespace ClaimRequest.BLL.Services.Interfaces;

public interface IChatbotService
{
    Task<string> HandleAnswer(string question);
}