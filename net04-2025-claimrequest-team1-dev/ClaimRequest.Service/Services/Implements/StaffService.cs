using AutoMapper;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.MetaDatas;
using ClaimRequest.DAL.Data.Requests.Staff;
using ClaimRequest.DAL.Data.Responses.Project;
using ClaimRequest.DAL.Data.Responses.Staff;
using ClaimRequest.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;


namespace ClaimRequest.BLL.Services.Implements
{
    // chuẩn bị cho việc implement các method CRUD cho Staff 
    public class StaffService : BaseService<StaffService>, IStaffService
    {
        private readonly IConfiguration _configuration;
        private readonly CloudinaryService _cloudinaryService;
        public StaffService(IUnitOfWork<ClaimRequestDbContext> unitOfWork, ILogger<StaffService> logger, IMapper mapper, IHttpContextAccessor httpContextAccessor, IConfiguration configuration, CloudinaryService cloudinaryService) : base(unitOfWork, logger, mapper, httpContextAccessor)
        {
            _configuration = configuration;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<ProfileResponse> Profile()
        {
            try
            {
                var id = GetCurrentUserId();
                var staff = await _unitOfWork.GetRepository<Staff>().SingleOrDefaultAsync(
                    predicate: c => c.Id == id,
                    include: q => q.AsNoTracking()
                        .Include(c => c.ProjectStaffs)
                        .ThenInclude(c => c.Project)
                );
                var profileResponse = _mapper.Map<ProfileResponse>(staff);
                profileResponse.project = staff.ProjectStaffs.Select(ps => _mapper.Map<GetProjectResponse>(ps.Project)).ToList();
                return profileResponse;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating avatar: {Message}", e.Message);
                throw;
            }
        }

        public async Task<UpdateStaffResponse> UpdateAvatar(Guid staffId, IFormFile avatarFile)
        {
            try
            {
                var staff = await _unitOfWork.GetRepository<Staff>()
                    .FirstOrDefaultAsync(
                        predicate: s => s.Id == staffId && s.IsActive
                    );

                if (staff == null)
                {
                    throw new NotFoundException($"Staff with ID {staffId} not found");
                }

                // Upload the avatar image to Cloudinary
                var avatarUrl = await _cloudinaryService.UploadImageAsync(avatarFile);

                // Update the avatar URL in the staff entity
                staff.AvatarUrl = avatarUrl;

                // Save changes to the database
                _unitOfWork.GetRepository<Staff>().UpdateAsync(staff);
                await _unitOfWork.Context.SaveChangesAsync();

                // Return updated response
                return _mapper.Map<UpdateStaffResponse>(staff);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating avatar: {Message}", ex.Message);
                throw;
            }
        }

        // B3: Implement method CRUD cho Staff
        // nhớ tạo request và response DTO cho staff
        // method cho endpoint create staff
        public async Task<CreateStaffResponse> CreateStaff(CreateStaffRequest createStaffRequest)
        {
            try
            {
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    // Check for existing staff with the same email
                    var existingStaff = await _unitOfWork.GetRepository<Staff>()
                        .FirstOrDefaultAsync(
                            predicate: s => s.Email == createStaffRequest.Email && s.IsActive
                        );

                    if (existingStaff != null)
                    {
                        throw new BusinessException($"A staff member with email {createStaffRequest.Email} already exists");
                    }

                    // Map request to entity
                    var newStaff = _mapper.Map<Staff>(createStaffRequest);

                    // Insert new staff
                    await _unitOfWork.GetRepository<Staff>().InsertAsync(newStaff);

                    // Map and return response
                    return _mapper.Map<CreateStaffResponse>(newStaff);
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating staff member: {Message}", ex.Message);
                throw;
            }
        }

        // method cho endpoint get staff by id
        public async Task<CreateStaffResponse> GetStaffById(Guid id)
        {
            try
            {
                var staff = await _unitOfWork.GetRepository<Staff>()
                    .FirstOrDefaultAsync(
                        predicate: s => s.Id == id && s.IsActive,
                        include: q => q.AsNoTracking().Include(s => s.ProjectStaffs)
                    );

                if (staff == null)
                {
                    throw new NotFoundException($"Staff with ID {id} not found");
                }

                return _mapper.Map<CreateStaffResponse>(staff);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving staff member: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<CreateStaffResponse>> GetStaffs()
        {
            try
            {
                var staffs = await _unitOfWork.GetRepository<Staff>()
                    .GetListAsync(
                        predicate: s => s.IsActive,
                        include: q => q.Include(s => s.ProjectStaffs)
                    );

                return _mapper.Map<IEnumerable<CreateStaffResponse>>(staffs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving staff list: {Message}", ex.Message);
                throw;
            }
        }


        // method cho endpoint get all staffs
        public async Task<PagingResponse<CreateStaffResponse>> GetStaffsPaging(int pageNumber = 1, int pageSize = 10, string? role = null, string? department = null)
        {
            try
            {
                //Convert 
                var staffs = (await _unitOfWork.GetRepository<Staff>()
                   .GetListAsync(
                       predicate: s => s.IsActive,
                       include: q => q.Include(s => s.ProjectStaffs)
                   )).ToList();

                //Get follow Role 
                if (!string.IsNullOrEmpty(role) && Enum.TryParse(role, true, out SystemRole roleEnum))
                {
                    staffs = staffs.Where(s => s.SystemRole == roleEnum).ToList();
                }
                // Get follow depart
                if (!string.IsNullOrEmpty(department) && Enum.TryParse(department, true, out Department departmentEnum))
                {
                    staffs = staffs.Where(s => s.Department == departmentEnum).ToList();
                }

                // build metadata
                var metadata = new PaginationMeta
                {
                    TotalPages = (int)Math.Ceiling(staffs.Count / (double)pageSize),
                    TotalItems = staffs.Count,
                    CurrentPage = pageNumber,
                    PageSize = pageSize
                };

                // Appy paging
                staffs = staffs.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

                return new PagingResponse<CreateStaffResponse>
                {
                    Items = _mapper.Map<IEnumerable<CreateStaffResponse>>(staffs),
                    Meta = metadata
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving staff list: {Message}", ex.Message);
                throw;
            }
        }

        // method cho endpoint update staff
        // co the xay ra loi trong create, update, delete nen dung transaction
        // tao update request DTO cho staff (neu can)
        public async Task<UpdateStaffResponse> UpdateStaff(Guid id, UpdateStaffRequest updateStaffRequest)
        {
            try
            {
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var existingStaff = await _unitOfWork.GetRepository<Staff>()
                        .FirstOrDefaultAsync(
                            predicate: s => s.Id == id && s.IsActive
                        );

                    if (existingStaff == null)
                    {
                        throw new NotFoundException($"Staff with ID {id} not found");
                    }

                    // Update properties
                    _mapper.Map(updateStaffRequest, existingStaff);
                    _unitOfWork.GetRepository<Staff>().UpdateAsync(existingStaff);

                    return _mapper.Map<UpdateStaffResponse>(existingStaff);
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating staff member: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<bool> DeleteStaff(Guid id)
        {
            try
            {
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var staff = await _unitOfWork.GetRepository<Staff>()
                        .FirstOrDefaultAsync(
                            predicate: s => s.Id == id && s.IsActive
                        );

                    if (staff == null)
                    {
                        throw new NotFoundException($"Staff with ID {id} not found");
                    }

                    // Soft delete
                    staff.IsActive = false;
                    _unitOfWork.GetRepository<Staff>().UpdateAsync(staff);

                    return true;
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting staff member: {Message}", ex.Message);
                throw;
            }
        }

    }
}
