using ClaimRequest.DAL.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClaimRequest.DAL.Data.Responses.Project;

namespace ClaimRequest.DAL.Data.Responses.Staff
{
    public class ProfileResponse
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public SystemRole SystemRole { get; set; }
        public Department Department { get; set; }
        public string AvatarUrl { get; set; }
        public List<GetProjectResponse> project { get; set; }
    }
}
