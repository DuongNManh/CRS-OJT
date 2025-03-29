namespace ClaimRequest.AI;

public interface IRAGChatService
{
    public  Task<string> Answer(string question);
}