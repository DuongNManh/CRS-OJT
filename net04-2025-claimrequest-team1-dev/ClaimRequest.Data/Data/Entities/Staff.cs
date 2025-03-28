using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ClaimRequest.DAL.Data.Entities
{
    public enum SystemRole
    {
        Approver,
        Staff,
        Finance,
        Admin
    }

    public enum Department
    {
        Engineering,          // Covers software development, QA, IT support, DevOps, UI/UX, etc. => Staff
        ProjectManagement,    // Project managers and coordinators => Approver
        Finance,              // Budgeting, accounting, and financial planning => Finance
        BusinessUnitLeader    // Business unit leaders and department heads => Approver
    }


    [Table("Staffs")]
    public class Staff
    {
        [Key]
        [Required]
        [Column("id")]
        public Guid Id { get; set; }
        [Required]
        [Column("name")]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [Column("email")]
        [StringLength(256)]
        public string Email { get; set; }

        [Required]
        [Column("password")]
        public string Password { get; set; }

        [Required]
        [Column("role")]
        public SystemRole SystemRole { get; set; }

        [Column("department")]
        [Required]
        public Department Department { get; set; }

        [Column("salary", TypeName = "numeric")]
        public decimal Salary { get; set; }

        [Column("avatar_url")]
        [StringLength(1000)]
        public string? AvatarUrl { get; set; } = null;

        [Required]
        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        public virtual ICollection<ProjectStaff> ProjectStaffs { get; set; } = [];
    }
}
