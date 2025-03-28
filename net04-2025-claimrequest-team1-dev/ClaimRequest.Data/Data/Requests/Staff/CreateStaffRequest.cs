using ClaimRequest.DAL.Data.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Data.Requests.Staff
{
    // tao class CreateStaffRequest de nhan thong tin tu client gui ve BE
    public class CreateStaffRequest
    {

        [Required(ErrorMessage = "Name field is required")]
        [MaxLength(100, ErrorMessage = "Name cannot be more than 100 characters")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email field is required")]
        [MaxLength(256, ErrorMessage = "Email cannot be more than 100 characters")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        [RegularExpression(@"^[^@\s]+@(gmail\.com|fpt\.edu\.vn)$", ErrorMessage = "Email must be from @gmail.com or @fpt.edu.vn domain")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password field is required")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Role field is required")]
        [EnumDataType(typeof(SystemRole), ErrorMessage = "Role must be one of the following: Approver, Staff, Finance, Admin")]
        public SystemRole SystemRole { get; set; }

        [Required(ErrorMessage = "Department field is required")]
        [EnumDataType(typeof(Department), ErrorMessage = "Department must be one of the following: Engineering, ProjectManagement, Finance, BusinessUnitLeader")]
        public Department Department { get; set; }

        [Required(ErrorMessage = "Salary field is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Salary must be greater than 0")]
        public decimal Salary { get; set; }

    }
}
