using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClaimRequest.DAL.Data.Requests.Project;
using ClaimRequest.DAL.Data.Responses.Project;

namespace ClaimRequest.BLL.Services.Interfaces
{
        public interface IProjectService
        {
                // B2: Tao method CRUD cho Project
                Task<CreateProjectResponse> CreateProject(CreateProjectRequest request);
                Task<CreateProjectResponse> GetProjectById(Guid id);
                Task<IEnumerable<CreateProjectResponse>> GetProjectsByMemberId(Guid id);
                Task<GetProjectDetailsResponse> GetProjectDetails(Guid id);
                Task<IEnumerable<CreateProjectResponse>> GetProjects();
                Task<IEnumerable<CreateProjectResponse>> GetProjectsWithPagination(int pageNumber, int pageSize);
                Task<IEnumerable<CreateProjectResponse>> GetProjectsByFilter(ProjectFilterRequest request);
                Task<CreateProjectResponse> UpdateProject(Guid id, UpdateProjectRequest request);
                Task<DeleteProjectResponse> DeleteProject(Guid id);
                Task<IEnumerable<DeleteProjectResponse>> DeleteProjectsBulk(IEnumerable<Guid> ids);
                Task<AssignStaffResponse> AssignStaffToProject(Guid projectId, AssignStaffRequest request);
                Task<RemoveStaffResponse> RemoveStaffFromProject(Guid projectId, Guid staffId);
                Task<AssignStaffResponse> UpdateStaffFromProject(Guid projectId, AssignStaffRequest request);
        }
}
