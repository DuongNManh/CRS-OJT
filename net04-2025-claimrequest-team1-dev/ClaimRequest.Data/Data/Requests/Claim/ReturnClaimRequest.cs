using ClaimRequest.DAL.Data.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Data.Requests.Claim
{
    public class ReturnClaimRequest
    {
        [Required(ErrorMessage = "Claim ID must not be null.")]
        public Guid ClaimId { get; set; }

        [Required(ErrorMessage = "Please input your remarks to return the claim.")]
        [StringLength(1000, ErrorMessage = "Remarks cannot exceed 1000 characters.")]
        [MinLength(1, ErrorMessage = "Remarks cannot be empty.")]
        public string Remark { get; set; }
    }
}
