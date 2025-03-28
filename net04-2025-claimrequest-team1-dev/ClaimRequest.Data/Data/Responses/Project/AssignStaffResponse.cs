using ClaimRequest.DAL.Data.Entities;

public class AssignStaffResponse
{
    public Guid ProjectId { get; set; }
    public Guid StaffId { get; set; }
    public string StaffName { get; set; }
    public string ProjectName { get; set; }
    public ProjectRole ProjectRole { get; set; }
} 