using ClaimRequest.DAL.Data.Entities;
using System;
using System.ComponentModel.DataAnnotations;

public class AssignStaffRequest
{
    [Required(ErrorMessage = "Staff ID is required")]
    public Guid StaffId { get; set; }

    [Required(ErrorMessage = "Project Role is required")]
    [EnumDataType(typeof(ProjectRole))]
    public ProjectRole ProjectRole { get; set; }
} 