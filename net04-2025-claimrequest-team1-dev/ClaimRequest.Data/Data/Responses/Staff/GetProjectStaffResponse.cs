using ClaimRequest.DAL.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Data.Responses.Staff
{
    public class GetProjectStaffResponse
    {
        public Guid Id { get; set; }
        public ProjectRole ProjectRole { get; set; }
        public GetStaffResponse Staff { get; set; }
    }
}
