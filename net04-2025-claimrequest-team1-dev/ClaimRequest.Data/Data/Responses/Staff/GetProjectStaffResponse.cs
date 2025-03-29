using ClaimRequest.DAL.Data.Entities;

namespace ClaimRequest.DAL.Data.Responses.Staff
{
    public class GetProjectStaffResponse
    {
        public Guid Id { get; set; }
        public ProjectRole ProjectRole { get; set; }
        public GetStaffResponse Staff { get; set; }
    }
}
