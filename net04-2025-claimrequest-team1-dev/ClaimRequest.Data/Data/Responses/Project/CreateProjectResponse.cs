using ClaimRequest.DAL.Data.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClaimRequest.DAL.Data.Responses.Staff;
using ClaimRequest.DAL.Data.Responses.Claim;

namespace ClaimRequest.DAL.Data.Responses.Project
{
    public class CreateProjectResponse
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public ProjectStatus Status { get; set; }

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public decimal Budget { get; set; }

        public GetStaffResponse ProjectManager { get; set; }

        public GetStaffResponse BusinessUnitLeader { get; set; }
    }
}
