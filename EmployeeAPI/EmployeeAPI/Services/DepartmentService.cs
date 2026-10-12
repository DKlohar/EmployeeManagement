using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using EmployeeAPI.Pagination;
using EmployeeAPI.Repositories;

namespace EmployeeAPI.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _repo;

        public DepartmentService(IDepartmentRepository repo)
        {
            _repo = repo;
        }

        // ── GET ALL (paginated + search) ──────────────────────
        public async Task<ApiResponse<PagedResult<DepartmentDto>>> GetAllAsync(PaginationParams param)
        {
            var result = await _repo.GetAllAsync(param);
            return ApiResponse<PagedResult<DepartmentDto>>.Ok(result, $"{result.TotalRecords} departments found");
        }

        public async Task<ApiResponse<DepartmentDto>> GetByIdAsync(int deptId)
        {
            var dept = await _repo.GetEntityByIdAsync(deptId);
            if (dept == null) return ApiResponse<DepartmentDto>.Fail("Department not found");

            return ApiResponse<DepartmentDto>.Ok(
                new DepartmentDto { DeptId = dept.DeptId, DeptName = dept.DeptName });
        }

        public async Task<ApiResponse<DepartmentDto>> CreateAsync(DepartmentCreateDto dto)
        {
            if (await _repo.NameExistsAsync(dto.DeptName))
                return ApiResponse<DepartmentDto>.Fail("Department name already exists");

            var dept = new Department { DeptName = dto.DeptName, IsActive = dto.IsActive };
            await _repo.AddAsync(dept);

            if (!await _repo.SaveAsync())
                return ApiResponse<DepartmentDto>.Fail("Failed to save department");

            return ApiResponse<DepartmentDto>.Ok(
                new DepartmentDto { DeptId = dept.DeptId, DeptName = dept.DeptName },
                "Department created successfully");
        }

        public async Task<ApiResponse<DepartmentDto>> UpdateAsync(DepartmentUpdateDto dto)
        {
            var dept = await _repo.GetEntityByIdAsync(dto.DeptId);
            if (dept == null) return ApiResponse<DepartmentDto>.Fail("Department not found");

            if (await _repo.NameExistsAsync(dto.DeptName, excludeId: dto.DeptId))
                return ApiResponse<DepartmentDto>.Fail("Another department has this name");

            dept.DeptName = dto.DeptName;
            dept.IsActive = dto.IsActive;

            await _repo.UpdateAsync(dept);
            if (!await _repo.SaveAsync())
                return ApiResponse<DepartmentDto>.Fail("Failed to update department");

            return ApiResponse<DepartmentDto>.Ok(
                new DepartmentDto { DeptId = dept.DeptId, DeptName = dept.DeptName },
                "Department updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int deptId)
        {
            var dept = await _repo.GetEntityByIdAsync(deptId);
            if (dept == null) return ApiResponse<bool>.Fail("Department not found");

            // 🔑 FK protection — employees assigned hain to delete block
            if (await _repo.HasEmployeesAsync(deptId))
                return ApiResponse<bool>.Fail("Cannot delete — employees are assigned to this department");

            await _repo.DeleteAsync(dept);
            if (!await _repo.SaveAsync())
                return ApiResponse<bool>.Fail("Failed to delete department");

            return ApiResponse<bool>.Ok(true, "Department deleted successfully");
        }
    }
}
