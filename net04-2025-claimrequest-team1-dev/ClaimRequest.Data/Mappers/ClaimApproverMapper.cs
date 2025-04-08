using AutoMapper;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Responses.ClaimApprover;

namespace ClaimRequest.DAL.Mappers;

public class ClaimApproverMapper : Profile
{
    public ClaimApproverMapper()
    {
        CreateMap<ClaimApprover, GetClaimApproverResponse>()
            .ForMember(dest => dest.ApproverId, opt => opt.MapFrom(src => src.ApproverId))
            .ForMember(dest => dest.ApproverStatus, opt => opt.MapFrom(src => src.ApproverStatus))
            .ForMember(dest => dest.DecisionAt, opt => opt.MapFrom(src => src.DecisionAt))
            .ForMember(dest => dest.Approver, opt => opt.MapFrom(src => src.Approver));
    }
}