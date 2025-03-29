namespace ClaimRequest.DAL.Data.Responses.Staff
{
    public class UpdateStaffResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string SystemRole { get; set; }
        public string Department { get; set; }
        public decimal Salary { get; set; }
        public bool IsActive { get; set; }

        public string? AvatarUrl { get; set; }
    }
}