using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Responses.ClaimChangeLog;
using ClaimRequest.DAL.Data.Responses.Project;
using ClaimRequest.DAL.Data.Responses.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClaimRequest.DAL.Data.Responses.ClaimApprover;

namespace ClaimRequest.DAL.Data.Responses.Claim
{
    public class GetDetailClaimResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public decimal Amount { get; set; }
        public string Remark { get; set; }
        public DateTime CreateAt { get; set; }
        public decimal TotalWorkingHours { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Status { get; set; }
        public string ClaimType { get; set; }
        public GetProjectResponse Project { get; set; }
        public ICollection<GetClaimApproverResponse> ClaimApprovers { get; set; }
        public ICollection<ClaimChangeLogResponse> ChangeHistory { get; set; }
        public GetStaffResponse Finance { get; set; }
        public GetStaffResponse Claimer { get; set; }
    }
}
