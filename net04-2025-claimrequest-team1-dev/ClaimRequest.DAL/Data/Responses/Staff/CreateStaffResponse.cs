public class CreateStaffResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string SystemRole { get; set; }
    public string Department { get; set; }
    public decimal Salary { get; set; }
    public bool IsActive { get; set; }
} 