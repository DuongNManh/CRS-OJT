using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
