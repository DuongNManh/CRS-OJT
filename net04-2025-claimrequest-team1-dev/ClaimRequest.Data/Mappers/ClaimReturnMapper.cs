using AutoMapper;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Requests.Claim;
using ClaimRequest.DAL.Data.Responses.Claim;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClaimRequest.DAL.Mappers
{
    public class ClaimReturnMapper : Profile
    {
        public ClaimReturnMapper()
        {
            CreateMap<ReturnClaimRequest, Claim>()
              .ForMember(dest => dest.Id, opt => opt.Ignore())
              .ForMember(dest => dest.Remark, opt => opt.MapFrom(src => src.Remark))
              .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ClaimStatus.Draft))
              .ForMember(dest => dest.UpdateAt, opt => opt.MapFrom(src => DateTime.UtcNow))
              .ForMember(dest => dest.ClaimType, opt => opt.Ignore())
              .ForMember(dest => dest.ProjectId, opt => opt.Ignore())
              .ForMember(dest => dest.ClaimerId, opt => opt.Ignore())
              .ForMember(dest => dest.FinanceId, opt => opt.Ignore())
              .ForMember(dest => dest.ClaimApprovers, opt => opt.Ignore())
              .ForMember(dest => dest.ChangeHistory, opt => opt.Ignore());


            CreateMap<Claim, ReturnClaimResponse>()
                .ForMember(dest => dest.ClaimId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.Remark, opt => opt.MapFrom(src => src.Remark))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdateAt));
        }
    }
}
