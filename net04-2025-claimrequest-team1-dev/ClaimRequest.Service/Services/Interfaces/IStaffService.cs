using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Staff;
using ClaimRequest.DAL.Data.Responses.Staff;
using Microsoft.AspNetCore.Http;

namespace ClaimRequest.BLL.Services.Interfaces
{
    // define cac method CRUD cho Staff
    public interface IStaffService
    {
        // B2: Tao method CRUD cho Staff
        Task<CreateStaffResponse> CreateStaff(CreateStaffRequest createStaffRequest);
        Task<CreateStaffResponse> GetStaffById(Guid id);
        Task<PagingResponse<CreateStaffResponse>> GetStaffsPaging(int pageNumber = 1, int pageSize = 10, string? role = null, string? department = null);
        Task<IEnumerable<CreateStaffResponse>> GetStaffs();
        Task<UpdateStaffResponse> UpdateStaff(Guid id, UpdateStaffRequest updateStaffRequest);
        Task<bool> DeleteStaff(Guid id);

        Task<UpdateStaffResponse> UpdateAvatar(Guid staffId, IFormFile avatarFile);

        Task<ProfileResponse> Profile();
    }
}
