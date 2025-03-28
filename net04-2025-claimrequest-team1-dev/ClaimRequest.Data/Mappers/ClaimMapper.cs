using AutoMapper;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Requests.Claim;
using ClaimRequest.DAL.Data.Responses.Claim;
using Claim = ClaimRequest.DAL.Data.Entities.Claim;

namespace ClaimRequest.DAL.Mappers
{
    public class ClaimMapper : Profile
    {
        public ClaimMapper()
        {
            CreateMap<CreateClaimRequest, Claim>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => ClaimStatus.Draft))
                .ForMember(dest => dest.CreateAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.UpdateAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Finance, opt => opt.Ignore())
                .ForMember(dest => dest.FinanceId, opt => opt.Ignore())
                .ForMember(dest => dest.Project, opt => opt.Ignore())
                .ForMember(dest => dest.Claimer, opt => opt.Ignore())
                .ForMember(dest => dest.ClaimerId, opt => opt.Ignore())
                .ForMember(dest => dest.ClaimApprovers, opt => opt.Ignore())
                .ForMember(dest => dest.ChangeHistory, opt => opt.Ignore());

            CreateMap<Claim, CreateClaimResponse>()
                .ForMember(dest => dest.ClaimStatus, opt => opt.MapFrom(src => src.Status));


            CreateMap<Claim, GetClaimResponse>()
                .ForMember(dest => dest.Project, opt => opt.MapFrom(src => src.Project))
                .ForMember(dest => dest.Claimer, opt => opt.MapFrom(src => src.Claimer))
                .ForMember(dest => dest.TotalWorkingHours, opt => opt.MapFrom(src => src.TotalWorkingHours))
                .ForMember(dest => dest.CreateAt, opt => opt.MapFrom(src => src.CreateAt.Date))
                .ForMember(dest => dest.ClaimApprover, opt => opt.MapFrom(src => src.ClaimApprovers.FirstOrDefault()));

            CreateMap<Claim, GetDetailClaimResponse>()
                .ForMember(dest => dest.TotalWorkingHours, opt => opt.MapFrom(src => src.TotalWorkingHours))
                .ForMember(dest => dest.Project, opt => opt.MapFrom(src => src.Project))
                .ForMember(dest => dest.ClaimApprovers, opt => opt.MapFrom(src => src.ClaimApprovers))
                .ForMember(dest => dest.ChangeHistory, opt => opt.MapFrom(src => src.ChangeHistory))
                .ForMember(dest => dest.Finance, opt => opt.MapFrom(src => src.Finance))
                .ForMember(dest => dest.Claimer, opt => opt.MapFrom(src => src.Claimer));

            CreateMap<Claim, ClaimExportDto>()
                .ForMember(dest => dest.ClaimId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ClaimType, opt => opt.MapFrom(src => src.ClaimType))
                .ForMember(dest => dest.ClaimName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.ClaimDescription, opt => opt.MapFrom(src => src.Remark))
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project != null ? src.Project.Name : "N/A"))
                .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.Amount))
                .ForMember(dest => dest.TotalWorkingHours, opt => opt.MapFrom(src => src.TotalWorkingHours))
                .ForMember(dest => dest.PaidDate, opt => opt.MapFrom(src => src.CreateAt));

            CreateMap<UpdateClaimRequest, Claim>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.CreateAt, opt => opt.Ignore())
                .ForMember(dest => dest.ClaimerId, opt => opt.Ignore())
                .ForMember(dest => dest.Claimer, opt => opt.Ignore())
                .ForMember(dest => dest.Finance, opt => opt.Ignore())
                .ForMember(dest => dest.FinanceId, opt => opt.Ignore())
                .ForMember(dest => dest.ClaimApprovers, opt => opt.Ignore())
                .ForMember(dest => dest.ChangeHistory, opt => opt.Ignore())
                .ForMember(dest => dest.UpdateAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

            CreateMap<Claim, SubmitClaimResponse>()
                .ForMember(dest => dest.ClaimId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.SubmittedDate, opt => opt.MapFrom(src => src.UpdateAt));
        }
    }
}
