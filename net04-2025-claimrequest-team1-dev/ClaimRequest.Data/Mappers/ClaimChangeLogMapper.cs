using AutoMapper;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Responses.ClaimChangeLog;

namespace ClaimRequest.DAL.Mappers
{
    public class ClaimChangeLogMapper : Profile
    {
        public ClaimChangeLogMapper()
        {
            CreateMap<ClaimChangeLog, ClaimChangeLogResponse>();
        }
    }
}
