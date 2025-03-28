using ClaimRequest.DAL.Data.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Data.Responses.Claim
{
    public class ReturnClaimResponse
    {
        public Guid ClaimId { get; set; }

        public ClaimStatus Status { get; set; }

        public string Remark { get; set; }

        public DateTime UpdatedAt { get; set; }

        //public Guid ClaimerId { get; set; }

        
    }
}
