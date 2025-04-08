using ClaimRequest.AI;
using ClaimRequest.API.Constants;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Chatbot;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClaimRequest.API.Controllers;

public class ChatbotController(ILogger<ClaimController> logger, IChatbotService chatbotService) : BaseController<ClaimController>(logger)
{
    [HttpPost(ApiEndPointConstant.Chatbot.AnswerEndpoint)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    [Authorize(Roles = "Staff, Approver, Finance, Admin")]
    public async Task<IActionResult> Answer([FromBody] ChatbotAnswerRequest request)
    {
        var response = await chatbotService.HandleAnswer(request.Question);
        return Ok(ApiResponseBuilder.BuildResponse(
            StatusCodes.Status200OK,
            "Answer retrieved",
            response
        ));
    }
}