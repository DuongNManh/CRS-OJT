using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Responses.ClaimApprover;
using ClaimRequest.DAL.Data.Responses.Project;
using ClaimRequest.DAL.Data.Responses.Staff;

namespace ClaimRequest.DAL.Data.Responses.Claim
{
    public class GetClaimResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public GetProjectResponse Project { get; set; }
        public GetStaffResponse Claimer { get; set; }
        public string Status { get; set; }
        public decimal TotalWorkingHours { get; set; }
        public decimal Amount { get; set; }
        public string CreateAt { get; set; }
        // field for approver view mode sort
        public GetClaimApproverResponse ClaimApprover { get; set; }
    }
}
