using AutoMapper;
using ClaimRequest.BLL.Services.Interfaces;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.Requests.Project;
using ClaimRequest.DAL.Data.Responses.Project;
using ClaimRequest.DAL.Data.Responses.Staff;
using ClaimRequest.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace ClaimRequest.BLL.Services.Implements
{
    public class ProjectService : BaseService<Project>, IProjectService
    {
        public ProjectService(IUnitOfWork<ClaimRequestDbContext> unitOfWork,
             ILogger<Project> logger,
             IMapper mapper,
             IHttpContextAccessor httpContextAccessor)
             : base(unitOfWork, logger, mapper, httpContextAccessor)
        {
        }


        private async Task Validation(CreateProjectRequest request)

        {
            var projectManager = await _unitOfWork.GetRepository<Staff>()
                .SingleOrDefaultAsync(
                    predicate: s => s.Id == request.ProjectManagerId,
                    orderBy: null,
                    include: null
                );

            if (projectManager == null)
            {
                throw new NotFoundException($"Project Manager with ID {request.ProjectManagerId} not found");
            }

            if (projectManager.SystemRole != SystemRole.Approver && projectManager.Department != Department.ProjectManagement)
            {
                throw new InvalidOperationException("The specified staff member is not a Project Manager");
            }

            if (!projectManager.IsActive)
            {
                throw new InvalidOperationException("The specified Project Manager is not active");
            }

            var businessUnitLeader = await _unitOfWork.GetRepository<Staff>()
                .SingleOrDefaultAsync(
                    predicate: s => s.Id == request.BusinessUnitLeaderId,
                    orderBy: null,
                    include: null
                );

            if (businessUnitLeader == null)
            {
                throw new NotFoundException($"Project Manager with ID {request.BusinessUnitLeaderId} not found");
            }

            if (businessUnitLeader.SystemRole != SystemRole.Approver && businessUnitLeader.Department != Department.BusinessUnitLeader)
            {
                throw new InvalidOperationException("The specified staff member is not a Business Unit Leader");
            }

            if (!businessUnitLeader.IsActive)
            {
                throw new InvalidOperationException("The specified Business Unit Leader is not active");
            }
        }

        private async Task ValidateUpdate(UpdateProjectRequest request)

        {
            var projectManager = await _unitOfWork.GetRepository<Staff>()
                .SingleOrDefaultAsync(
                    predicate: s => s.Id == request.ProjectManagerId,
                    orderBy: null,
                    include: null
                );

            if (projectManager == null)
            {
                throw new NotFoundException($"Project Manager with ID {request.ProjectManagerId} not found");
            }

            if (projectManager.SystemRole != SystemRole.Approver && projectManager.Department != Department.ProjectManagement)
            {
                throw new InvalidOperationException("The specified staff member is not a Project Manager");
            }

            if (!projectManager.IsActive)
            {
                throw new InvalidOperationException("The specified Project Manager is not active");
            }

            var businessUnitLeader = await _unitOfWork.GetRepository<Staff>()
                .SingleOrDefaultAsync(
                    predicate: s => s.Id == request.BusinessUnitLeaderId,
                    orderBy: null,
                    include: null
                );

            if (businessUnitLeader == null)
            {
                throw new NotFoundException($"Project Manager with ID {request.BusinessUnitLeaderId} not found");
            }

            if (businessUnitLeader.SystemRole != SystemRole.Approver && businessUnitLeader.Department != Department.BusinessUnitLeader)
            {
                throw new InvalidOperationException("The specified staff member is not a Business Unit Leader");
            }

            if (!businessUnitLeader.IsActive)
            {
                throw new InvalidOperationException("The specified Business Unit Leader is not active");
            }
        }


        public async Task<CreateProjectResponse> CreateProject(CreateProjectRequest request)
        {
            try
            {
                await Validation(request);
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var newProject = _mapper.Map<Project>(request);
                    await _unitOfWork.GetRepository<Project>().InsertAsync(newProject);

                    return _mapper.Map<CreateProjectResponse>(newProject);
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project: {Message}", ex.Message);
                throw;
            }
        }


        public async Task<DeleteProjectResponse> DeleteProject(Guid id)
        {
            try
            {
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var existingProject = await _unitOfWork.GetRepository<Project>()
                        .FirstOrDefaultAsync(
                            predicate: p => p.Id == id,
                            include: q => q
                                .Include(p => p.ProjectManager)
                                .Include(p => p.BusinessUnitLeader)
                                .Include(p => p.ProjectStaffs)
                        );

                    if (existingProject == null)
                    {
                        throw new NotFoundException($"Project with ID {id} not found");
                    }

                    existingProject.IsActive = false;
                    _unitOfWork.GetRepository<Project>().UpdateAsync(existingProject);

                    return new DeleteProjectResponse(id, true, "Project deleted successfully.");
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<DeleteProjectResponse>> DeleteProjectsBulk(IEnumerable<Guid> ids)
        {
            try
            {
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var responses = new List<DeleteProjectResponse>();

                    var projects = await _unitOfWork.GetRepository<Project>()
                        .GetListAsync(
                            predicate: p => ids.Contains(p.Id) && p.IsActive == true,
                            include: q => q
                                .Include(p => p.ProjectManager)
                                .Include(p => p.BusinessUnitLeader)
                                .Include(p => p.ProjectStaffs)
                        );

                    if (!projects.Any())
                    {
                        throw new NotFoundException("No projects found with the provided IDs");
                    }

                    foreach (var project in projects)
                    {
                        project.IsActive = false;
                        _unitOfWork.GetRepository<Project>().UpdateAsync(project);

                        responses.Add(new DeleteProjectResponse(
                            project.Id,
                            true,
                            $"Project {project.Name} deleted successfully."
                        ));
                    }

                    return responses;
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk deleting projects: {Message}", ex.Message);
                throw;
            }
        }


        // Get project by ID without all staffs

        public async Task<CreateProjectResponse> GetProjectById(Guid id)
        {
            try
            {
                var project = await _unitOfWork.GetRepository<Project>()
                    .FirstOrDefaultAsync(
                        predicate: p => p.Id == id,
                        include: q => q.AsNoTracking()
                            .Include(p => p.ProjectManager)
                            .Include(p => p.BusinessUnitLeader)
                            .Include(p => p.ProjectStaffs)
                    );

                if (project == null)
                {
                    throw new NotFoundException($"Project with ID {id} not found");
                }

                return _mapper.Map<CreateProjectResponse>(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving project: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<CreateProjectResponse>> GetProjectsByMemberId(Guid memberId)
        {
            try
            {
                var projects = await _unitOfWork.GetRepository<Project>()
                    .GetListAsync(
                        predicate: p => p.ProjectManagerId == memberId ||
                                        p.ProjectStaffs.Any(ps => ps.StaffId == memberId),
                        include: q => q.AsNoTracking()
                            .Include(p => p.ProjectManager)
                    );

                if (projects == null)
                {
                    throw new NotFoundException($"Project with Member ID {memberId} not found");
                }

                return _mapper.Map<IEnumerable<CreateProjectResponse>>(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving project: {Message}", ex.Message);
                throw;
            }
        }

        // Get project details with full details of all staffs

        public async Task<GetProjectDetailsResponse> GetProjectDetails(Guid id)
        {
            try
            {
                var project = await _unitOfWork.GetRepository<Project>()
                                    .SingleOrDefaultAsync(
                                        predicate: p => p.Id == id,
                                        include: q => q.AsNoTracking()
                                            .Include(p => p.ProjectManager)
                                            .Include(p => p.BusinessUnitLeader)
                                            .Include(p => p.ProjectStaffs)
                                            .ThenInclude(ps => ps.Staff)
                                    );
                if (project == null)
                {
                    throw new NotFoundException($"Project with ID {id} not found");
                }
                return _mapper.Map<GetProjectDetailsResponse>(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving project: {Message}", ex.Message);
                throw;
            }
        }


        public async Task<IEnumerable<CreateProjectResponse>> GetProjects()
        {
            try
            {
                var projects = await _unitOfWork.GetRepository<Project>()
                    .GetListAsync(
                        predicate: p => p.IsActive == true,
                        include: q => q.AsNoTracking()
                        .Include(p => p.ProjectManager)
                        .Include(p => p.BusinessUnitLeader)
                        .Include(p => p.ProjectStaffs)
                    );

                if (projects == null)
                {
                    throw new NotFoundException("No projects were found in data.");
                }

                return _mapper.Map<IEnumerable<CreateProjectResponse>>(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving project list: {Message}", ex.Message);
                throw;
            }
        }
        public async Task<IEnumerable<CreateProjectResponse>> GetProjectsWithPagination(int pageNumber = 1, int pageSize = 10)
        {
            try
            {

                var projects = await _unitOfWork.GetRepository<Project>()
                    .GetPagingListAsync(
                        predicate: p => p.IsActive == true,
                        orderBy: o => o.OrderByDescending(p => p.Name),
                        include: q => q.AsNoTracking()
                            .Include(p => p.ProjectManager)
                           .Include(p => p.BusinessUnitLeader)
                           .Include(p => p.ProjectStaffs),
                           page: pageNumber,
                           size: pageSize
                    );

                if (projects == null || !projects.Items.Any())
                {
                    throw new NotFoundException("No projects were found in data.");
                }

                return _mapper.Map<IEnumerable<CreateProjectResponse>>(projects.Items);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Error retrieving project list: {Message}", exception.Message);
                throw;
            }
        }

        public async Task<IEnumerable<CreateProjectResponse>> GetProjectsByFilter(ProjectFilterRequest filter)
        {
            try
            {
                var projects = await _unitOfWork.GetRepository<Project>()
                    .GetListAsync(
                        predicate: p =>
                            (string.IsNullOrEmpty(filter.Name.ToLower()) || p.Name.Contains(filter.Name.ToLower())) &&
                            (string.IsNullOrEmpty(filter.Description.ToLower()) || p.Description.Contains(filter.Description.ToLower())) &&
                            (!filter.StartDateFrom.HasValue || p.StartDate >= filter.StartDateFrom) &&
                            (!filter.StartDateTo.HasValue || p.StartDate <= filter.StartDateTo) &&
                            (!filter.EndDateFrom.HasValue || p.EndDate >= filter.EndDateFrom) &&
                            (!filter.EndDateTo.HasValue || p.EndDate <= filter.EndDateTo) &&
                            (!filter.ProjectManagerId.HasValue || p.ProjectManagerId == filter.ProjectManagerId) &&
                            (!filter.BusinessUnitLeaderId.HasValue || p.BusinessUnitLeaderId == filter.BusinessUnitLeaderId),
                        include: q => q.AsNoTracking()
                            .Include(p => p.ProjectManager)
                            .Include(p => p.BusinessUnitLeader)
                            .Include(p => p.ProjectStaffs)
                    );

                if (!projects.Any())
                {
                    throw new NotFoundException("No projects found matching the specified criteria.");
                }

                return _mapper.Map<IEnumerable<CreateProjectResponse>>(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error filtering projects: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<CreateProjectResponse> UpdateProject(Guid id, UpdateProjectRequest request)
        {
            try
            {
                await ValidateUpdate(request);
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    var existingProject = await _unitOfWork.GetRepository<Project>()
                        .FirstOrDefaultAsync(
                            predicate: p => p.Id == id,
                            include: q => q
                                .Include(p => p.ProjectManager)
                                .Include(p => p.BusinessUnitLeader)
                                .Include(p => p.ProjectStaffs)
                        );

                    if (existingProject == null)
                    {
                        throw new NotFoundException($"Project with ID {id} not found");
                    }

                    _mapper.Map(request, existingProject);
                    _unitOfWork.GetRepository<Project>().UpdateAsync(existingProject);

                    return _mapper.Map<CreateProjectResponse>(existingProject);
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project: {Message}", ex.Message);
                throw;
            }
        }


        public async Task<AssignStaffResponse> AssignStaffToProject(Guid projectId, AssignStaffRequest request)
        {
            try
            {
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    // Chuan bi data cho viec validate 1 lan choi het tat ca
                    var (project, staff) = await GetProjectAndStaffDetails(projectId, request.StaffId);

                    // Inject vao validate
                    ValidateProjectAndStaffExistence(project, staff);
                    await ValidateAssignment(project, staff);

                    var projectStaff = new ProjectStaff
                    {
                        ProjectId = projectId,
                        StaffId = request.StaffId,
                        ProjectRole = request.ProjectRole
                    };

                    await _unitOfWork.GetRepository<ProjectStaff>().InsertAsync(projectStaff);

                    return new AssignStaffResponse
                    {
                        ProjectId = projectId,
                        StaffId = staff.Id,
                        StaffName = staff.Name,
                        ProjectName = project.Name,
                        ProjectRole = request.ProjectRole
                    };
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning staff to project: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<RemoveStaffResponse> RemoveStaffFromProject(Guid projectId, Guid staffId)
        {
            try
            {
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    // Chuan bi data cho viec validate 1 lan choi het tat ca
                    var (project, staff) = await GetProjectAndStaffDetails(projectId, staffId);

                    // Inject vao validate
                    ValidateProjectAndStaffExistence(project, staff);

                    var projectStaff = await _unitOfWork.GetRepository<ProjectStaff>()
                        .FirstOrDefaultAsync(
                            predicate: p => p.ProjectId == projectId && p.StaffId == staffId);

                    if (projectStaff == null)
                    {
                        throw new NotFoundException($"Staff is not assigned to this project");
                    }

                    _unitOfWork.GetRepository<ProjectStaff>().DeleteAsync(projectStaff);

                    return new RemoveStaffResponse(
                        projectId, true, "Staff removed from project successfully");

                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning staff to project: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<AssignStaffResponse> UpdateStaffFromProject(Guid projectId, AssignStaffRequest request)
        {
            try
            {
                return await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    // Chuan bi data cho viec validate 1 lan choi het tat ca
                    var (project, staff) = await GetProjectAndStaffDetails(projectId, request.StaffId);

                    // Inject vao validate
                    ValidateProjectAndStaffExistence(project, staff);

                    var existingProjectStaff = await _unitOfWork.GetRepository<ProjectStaff>()
                       .FirstOrDefaultAsync(
                            predicate: p => p.ProjectId == projectId && p.StaffId == request.StaffId);

                    if (existingProjectStaff == null)
                    {
                        throw new NotFoundException($"Staff is not assigned to this project");
                    }

                    existingProjectStaff.ProjectRole = request.ProjectRole;

                    _unitOfWork.GetRepository<ProjectStaff>().UpdateAsync(existingProjectStaff);

                    return new AssignStaffResponse
                    {
                        ProjectId = projectId,
                        StaffId = staff.Id,
                        StaffName = staff.Name,
                        ProjectName = project.Name,
                        ProjectRole = request.ProjectRole
                    };

                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning staff to project: {Message}", ex.Message);
                throw;
            }
        }

        private async Task<(Project project, Staff staff)> GetProjectAndStaffDetails(Guid projectId, Guid staffId)
        {
            var project = await _unitOfWork.GetRepository<Project>()
                .FirstOrDefaultAsync(
                    predicate: p => p.Id == projectId,
                    orderBy: null,
                    include: null
                );
            var staff = await _unitOfWork.GetRepository<Staff>()
                .FirstOrDefaultAsync(
                    predicate: s => s.Id == staffId,
                    orderBy: null,
                    include: null
                );
            return (project, staff);
        }

        private void ValidateProjectAndStaffExistence(Project project, Staff staff)
        {
            if (project == null)
                throw new NotFoundException($"Project not found");
            if (staff == null)
                throw new NotFoundException($"Staff not found");
        }

        private async Task ValidateAssignment(Project project, Staff staff)
        {
            var existingAssignment = await _unitOfWork.GetRepository<ProjectStaff>()
                .FirstOrDefaultAsync(
                    predicate: ps => ps.ProjectId == project.Id && ps.StaffId == staff.Id,
                    orderBy: null,
                    include: null
                );
            if (existingAssignment != null)
                throw new BusinessException($"Staff {existingAssignment.Staff.Name} is already assigned to this project");

            if (project.ProjectManagerId == staff.Id)
                throw new BusinessException("Staff is already assigned as Project Manager");

            if (project.BusinessUnitLeaderId == staff.Id)
                throw new BusinessException("Staff is already assigned as Business Unit Leader");
        }
    }
}
