using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Responses.Staff;

namespace ClaimRequest.DAL.Data.Responses.Project
{
    public class GetProjectResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public ProjectStatus Status { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public decimal Budget { get; set; }
        public GetStaffResponse? ProjectManager { get; set; }
        public GetStaffResponse? BusinessUnitLeader { get; set; }
    }
}
