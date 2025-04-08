using AutoMapper;
using ClaimRequest.BLL.Services.Implements;
using ClaimRequest.DAL.Data.Entities;
using ClaimRequest.DAL.Data.Exceptions;
using ClaimRequest.DAL.Data.Requests.Staff;
using ClaimRequest.DAL.Data.Responses.Staff;
using ClaimRequest.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Logging;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace ClaimRequest.UnitTest.Staff
{
    public class StaffServiceTests
    {
        private readonly Mock<IUnitOfWork<ClaimRequestDbContext>> _mockUnitOfWork;
        private readonly Mock<ILogger<StaffService>> _mockLogger;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly StaffService _staffService;
        private readonly Mock<IGenericRepository<DAL.Data.Entities.Staff>> _mockStaffRepository;

        public StaffServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork<ClaimRequestDbContext>>();
            _mockLogger = new Mock<ILogger<StaffService>>();
            _mockMapper = new Mock<IMapper>();
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            _mockStaffRepository = new Mock<IGenericRepository<DAL.Data.Entities.Staff>>();

            _mockUnitOfWork.Setup(uow => uow.GetRepository<DAL.Data.Entities.Staff>())
                .Returns(_mockStaffRepository.Object);

            _staffService = new StaffService(_mockUnitOfWork.Object, _mockLogger.Object, _mockMapper.Object, _mockHttpContextAccessor.Object, null, null);
        }

        [Fact]
        public async Task CreateStaff_WithExistingEmail_ShouldThrowBusinessException()
        {
            // Arrange
            var request = new CreateStaffRequest
            {
                Name = "Test Staff",
                Email = "existing@example.com",
                Password = "password123",
                SystemRole = SystemRole.Staff,
                Department = Department.Engineering,
                Salary = 50000
            };

            var existingStaff = new DAL.Data.Entities.Staff
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                IsActive = true
            };

            _mockStaffRepository.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<DAL.Data.Entities.Staff, bool>>>(),
                null,
                null))
                .Returns(() => Task.FromResult(existingStaff));

            _mockUnitOfWork.Setup(uow => uow.ExecuteInTransactionAsync(It.IsAny<Func<Task<ClaimRequest.DAL.Data.Responses.Staff.CreateStaffResponse>>>()))
                .Returns((Func<Task<ClaimRequest.DAL.Data.Responses.Staff.CreateStaffResponse>> action) => action());

            // Act & Assert
            await Assert.ThrowsAsync<BusinessException>(() => _staffService.CreateStaff(request));
        }

        [Fact]
        public async Task GetStaffById_WithValidId_ShouldReturnStaff()
        {
            // Arrange
            var staffId = Guid.NewGuid();
            var staffEntity = new DAL.Data.Entities.Staff
            {
                Id = staffId,
                Name = "Test Staff",
                Email = "test@example.com",
                SystemRole = SystemRole.Staff,
                Department = Department.Engineering,
                Salary = 50000,
                IsActive = true
            };

            var expectedResponse = new ClaimRequest.DAL.Data.Responses.Staff.CreateStaffResponse
            {
                Id = staffEntity.Id,
                Name = staffEntity.Name,
                Email = staffEntity.Email,
                SystemRole = ((SystemRole)staffEntity.SystemRole).ToString(),
                Department = ((Department)staffEntity.Department).ToString(),
                Salary = staffEntity.Salary,
                IsActive = staffEntity.IsActive
            };

            _mockStaffRepository.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<DAL.Data.Entities.Staff, bool>>>(),
                It.IsAny<Func<IQueryable<DAL.Data.Entities.Staff>, IOrderedQueryable<DAL.Data.Entities.Staff>>>(),
                It.IsAny<Func<IQueryable<DAL.Data.Entities.Staff>, IIncludableQueryable<DAL.Data.Entities.Staff, object>>>()))
                .Returns(() => Task.FromResult(staffEntity));

            _mockMapper.Setup(m => m.Map<ClaimRequest.DAL.Data.Responses.Staff.CreateStaffResponse>(staffEntity))
                .Returns(expectedResponse);

            // Act
            var result = await _staffService.GetStaffById(staffId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedResponse.Id, result.Id);
            Assert.Equal(expectedResponse.Name, result.Name);
            Assert.Equal(expectedResponse.Email, result.Email);
        }

        [Fact]
        public async Task GetStaffById_WithInvalidId_ShouldThrowNotFoundException()
        {
            // Arrange
            var invalidId = Guid.NewGuid();

            _mockStaffRepository.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<DAL.Data.Entities.Staff, bool>>>(),
                null,
                null))
                .Returns(() => Task.FromResult((DAL.Data.Entities.Staff)null));

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _staffService.GetStaffById(invalidId));
        }

        [Fact]
        public async Task GetStaffs_ShouldReturnAllActiveStaffs()
        {
            // Arrange
            var staffList = new List<DAL.Data.Entities.Staff>
            {
                new DAL.Data.Entities.Staff
                {
                    Id = Guid.NewGuid(),
                    Name = "Staff 1",
                    Email = "staff1@example.com",
                    SystemRole = SystemRole.Staff,
                    Department = Department.Engineering,
                    IsActive = true
                },
                new DAL.Data.Entities.Staff
                {
                    Id = Guid.NewGuid(),
                    Name = "Staff 2",
                    Email = "staff2@example.com",
                    SystemRole = SystemRole.Approver,
                    Department = Department.ProjectManagement,
                    IsActive = true
                }
            };

            var expectedResponses = staffList.Select(s => new ClaimRequest.DAL.Data.Responses.Staff.CreateStaffResponse
            {
                Id = s.Id,
                Name = s.Name,
                Email = s.Email,
                SystemRole = ((SystemRole)s.SystemRole).ToString(),
                Department = ((Department)s.Department).ToString(),
                IsActive = s.IsActive
            }).ToList();

            _mockStaffRepository.Setup(r => r.GetListAsync(
                It.Is<Expression<Func<DAL.Data.Entities.Staff, bool>>>(expr => true),
                It.IsAny<Func<IQueryable<DAL.Data.Entities.Staff>, IOrderedQueryable<DAL.Data.Entities.Staff>>>(),
                It.IsAny<Func<IQueryable<DAL.Data.Entities.Staff>, IIncludableQueryable<DAL.Data.Entities.Staff, object>>>(), null))
                .ReturnsAsync(staffList);

            _mockMapper.Setup(m => m.Map<IEnumerable<ClaimRequest.DAL.Data.Responses.Staff.CreateStaffResponse>>(staffList))
                .Returns(expectedResponses);

            // Act
            var result = await _staffService.GetStaffs();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.All(result, r => Assert.True(r.IsActive));
        }

        [Fact]
        public async Task UpdateStaff_WithValidRequest_ShouldReturnUpdatedStaff()
        {
            // Arrange
            var staffId = Guid.NewGuid();
            var request = new UpdateStaffRequest
            {
                Name = "Updated Staff",
                Email = "updated@example.com",
                SystemRole = SystemRole.Approver,
                Department = Department.ProjectManagement,
                Salary = 60000
            };

            var existingStaff = new DAL.Data.Entities.Staff
            {
                Id = staffId,
                Name = "Original Staff",
                Email = "original@example.com",
                SystemRole = SystemRole.Staff,
                Department = Department.Engineering,
                Salary = 50000,
                IsActive = true
            };

            var expectedResponse = new UpdateStaffResponse
            {
                Id = staffId,
                Name = request.Name,
                Email = request.Email,
                SystemRole = request.SystemRole.ToString(),
                Department = request.Department.ToString(),
                Salary = request.Salary,
                IsActive = true
            };

            _mockStaffRepository.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<DAL.Data.Entities.Staff, bool>>>(),
                null,
                null))
                .Returns(() => Task.FromResult(existingStaff));

            _mockMapper.Setup(m => m.Map(request, existingStaff))
                .Returns(existingStaff);

            _mockMapper.Setup(m => m.Map<UpdateStaffResponse>(existingStaff))
                .Returns(expectedResponse);

            _mockUnitOfWork.Setup(uow => uow.ExecuteInTransactionAsync(It.IsAny<Func<Task<UpdateStaffResponse>>>()))
                .Returns((Func<Task<UpdateStaffResponse>> action) => action());

            // Act
            var result = await _staffService.UpdateStaff(staffId, request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedResponse.Id, result.Id);
            Assert.Equal(expectedResponse.Name, result.Name);
            Assert.Equal(expectedResponse.Email, result.Email);
            Assert.Equal(expectedResponse.SystemRole, result.SystemRole);
            Assert.Equal(expectedResponse.Department, result.Department);
            Assert.Equal(expectedResponse.Salary, result.Salary);
        }

        [Fact]
        public async Task UpdateStaff_WithInvalidId_ShouldThrowNotFoundException()
        {
            // Arrange
            var invalidId = Guid.NewGuid();
            var request = new UpdateStaffRequest
            {
                Name = "Updated Staff",
                Email = "updated@example.com",
                SystemRole = SystemRole.Staff,
                Department = Department.Engineering,
                Salary = 60000
            };

            _mockStaffRepository.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<DAL.Data.Entities.Staff, bool>>>(),
                null,
                null))
                .Returns(() => Task.FromResult((DAL.Data.Entities.Staff)null));

            _mockUnitOfWork.Setup(uow => uow.ExecuteInTransactionAsync(It.IsAny<Func<Task<UpdateStaffResponse>>>()))
                .Returns((Func<Task<UpdateStaffResponse>> action) => action());

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _staffService.UpdateStaff(invalidId, request));
        }

        [Fact]
        public async Task DeleteStaff_WithValidId_ShouldReturnTrue()
        {
            // Arrange
            var staffId = Guid.NewGuid();
            var existingStaff = new DAL.Data.Entities.Staff
            {
                Id = staffId,
                Name = "Staff to Delete",
                Email = "delete@example.com",
                IsActive = true
            };

            _mockStaffRepository.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<DAL.Data.Entities.Staff, bool>>>(),
                null,
                null))
                .Returns(() => Task.FromResult(existingStaff));

            _mockUnitOfWork.Setup(uow => uow.ExecuteInTransactionAsync(It.IsAny<Func<Task<bool>>>()))
                .Returns((Func<Task<bool>> action) => action());

            // Act
            var result = await _staffService.DeleteStaff(staffId);

            // Assert
            Assert.True(result);
            Assert.False(existingStaff.IsActive);
        }

        [Fact]
        public async Task DeleteStaff_WithInvalidId_ShouldThrowNotFoundException()
        {
            // Arrange
            var invalidId = Guid.NewGuid();

            _mockStaffRepository.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<Expression<Func<DAL.Data.Entities.Staff, bool>>>(),
                null,
                null))
                .Returns(() => Task.FromResult((DAL.Data.Entities.Staff)null));

            _mockUnitOfWork.Setup(uow => uow.ExecuteInTransactionAsync(It.IsAny<Func<Task<bool>>>()))
                .Returns((Func<Task<bool>> action) => action());

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _staffService.DeleteStaff(invalidId));
        }
    }
}
