using ClaimRequest.DAL.Data.Entities;
using Org.BouncyCastle.Crypto;

namespace ClaimRequest.DAL.Data.Requests.Project
{
    public class ProjectFilterRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public ProjectStatus? Status { get; set; }
        public DateOnly? StartDateFrom { get; set; }
        public DateOnly? StartDateTo { get; set; }
        public DateOnly? EndDateFrom { get; set; }
        public DateOnly? EndDateTo { get; set; }
        public decimal? BudgetFrom { get; set; }
        public decimal? BudgetTo { get; set; }
        public Guid? ProjectManagerId { get; set; }
        public Guid? BusinessUnitLeaderId { get; set; }
        public bool? IsActive { get; set; }
    }
}