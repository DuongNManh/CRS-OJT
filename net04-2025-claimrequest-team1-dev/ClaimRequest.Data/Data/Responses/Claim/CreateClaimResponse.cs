using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Responses.Project;
using ClaimRequest.DAL.Data.Responses.Staff;

namespace ClaimRequest.DAL.Data.Responses.Claim
{
    public class CreateClaimResponse
    {
        public ClaimType ClaimType { get; set; }

        public ClaimStatus ClaimStatus { get; set; }

        public string Name { get; set; }

        public string Remark { get; set; }

        public decimal Amount { get; set; }

        public DateTime CreateAt { get; set; }

        public decimal TotalWorkingHours { get; set; }

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }
    }
}
