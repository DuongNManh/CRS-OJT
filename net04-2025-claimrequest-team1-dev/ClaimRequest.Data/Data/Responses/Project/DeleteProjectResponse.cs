namespace ClaimRequest.DAL.Data.Responses.Project
{
    public class DeleteProjectResponse
    {
        public Guid ProjectId { get; set; }
        public bool IsDeleted { get; set; }
        public string Message { get; set; }

        public DeleteProjectResponse(Guid projectId, bool isDeleted, string message)
        {
            ProjectId = projectId;
            IsDeleted = isDeleted;
            Message = message;
        }
    }
}
