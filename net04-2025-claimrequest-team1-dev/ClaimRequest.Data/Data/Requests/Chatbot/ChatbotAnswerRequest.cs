using System.ComponentModel.DataAnnotations;

namespace ClaimRequest.DAL.Data.Requests.Chatbot;

public class ChatbotAnswerRequest
{
    [Required(ErrorMessage = "Question is required")]
    public string Question { get; set; }
}