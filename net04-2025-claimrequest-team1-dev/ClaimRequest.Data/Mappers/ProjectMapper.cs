using AutoMapper;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Requests.Project;
using ClaimRequest.DAL.Data.Responses.Project;
using ClaimRequest.DAL.Data.Responses.Staff;

namespace ClaimRequest.DAL.Mappers
{
    public class ProjectMapper : Profile
    {
        public ProjectMapper()
        {
            // CreateProjectRequest -> Project
            CreateMap<CreateProjectRequest, Project>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Claims, opt => opt.Ignore())
                .ForMember(dest => dest.ProjectStaffs, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));


            // Project -> CreateProjectRequest
            CreateMap<Project, CreateProjectResponse>()
                .ForMember(dest => dest.ProjectManager, opt => opt.MapFrom(src => src.ProjectManager))
                .ForMember(dest => dest.BusinessUnitLeader, opt => opt.MapFrom(src => src.BusinessUnitLeader));

            // UpdateProjectRequest -> Project
            CreateMap<UpdateProjectRequest, Project>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Claims, opt => opt.Ignore())
                .ForMember(dest => dest.ProjectStaffs, opt => opt.Ignore())
                .ForMember(dest => dest.ProjectManager, opt => opt.Ignore())
                .ForMember(dest => dest.BusinessUnitLeader, opt => opt.Ignore())
                .ForMember(dest => dest.ProjectManagerId, opt => opt.MapFrom(src => src.ProjectManagerId))
                .ForMember(dest => dest.BusinessUnitLeaderId, opt => opt.MapFrom(src => src.BusinessUnitLeaderId))
                .ForMember(dest => dest.IsActive, opt => opt.Ignore());

            // Project -> GetProjectResponse
            CreateMap<Project, GetProjectResponse>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate))
                .ForMember(dest => dest.ProjectManager, opt => opt.MapFrom(src => src.ProjectManager))
                .ForMember(dest => dest.BusinessUnitLeader, opt => opt.MapFrom(src => src.BusinessUnitLeader));

            // Project --> GetProjectDetailsResponse
            CreateMap<Project, GetProjectDetailsResponse>()
               .ForMember(dest => dest.ProjectManager, opt => opt.MapFrom(src => src.ProjectManager))
               .ForMember(dest => dest.BusinessUnitLeader, opt => opt.MapFrom(src => src.BusinessUnitLeader))
               .ForMember(dest => dest.ProjectStaffs, opt => opt.MapFrom(src => src.ProjectStaffs));

            // ProjectStaff --> GetProjectStaffResponse
            CreateMap<ProjectStaff, GetProjectStaffResponse>()
               .ForMember(dest => dest.Staff, opt => opt.MapFrom(src => src.Staff))
               .ForMember(dest => dest.ProjectRole, opt => opt.MapFrom(src => src.ProjectRole));

        }
    }
}
