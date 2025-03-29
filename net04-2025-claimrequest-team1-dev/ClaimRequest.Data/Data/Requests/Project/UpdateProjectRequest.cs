using ClaimRequest.DAL.Data.Entities;
using System.ComponentModel.DataAnnotations;

namespace ClaimRequest.DAL.Data.Requests.Project
{
    public class UpdateProjectRequest
    {
        [Required(ErrorMessage = "Project Name is required")]
        [MaxLength(100, ErrorMessage = "Project Name must not exceed 100 characters")]
        public string Name { get; set; }

        [MaxLength(1000, ErrorMessage = "Description must not exceed 1000 characters")]
        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [EnumDataType(typeof(ProjectStatus), ErrorMessage = "Project status must be one of the following: Draft, Ongoing, Rejected, Archived")]
        public ProjectStatus Status { get; set; }

        [Required(ErrorMessage = "Start date is required")]
        public DateOnly StartDate { get; set; }

        [Required(ErrorMessage = "End date is required")]
        public DateOnly? EndDate { get; set; }

        [Required(ErrorMessage = "Budget is required")]
        [Range(1000000, double.MaxValue, ErrorMessage = "Budget must be greater than 1000000$")]
        public decimal Budget { get; set; }

        [Required(ErrorMessage = "Project Manager is required")]
        public Guid ProjectManagerId { get; set; }

        [Required(ErrorMessage = "Business Unit Leader is required")]
        public Guid BusinessUnitLeaderId { get; set; }
    }
}
