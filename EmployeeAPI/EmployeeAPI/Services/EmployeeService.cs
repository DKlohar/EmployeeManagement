using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using EmployeeAPI.Pagination;
using EmployeeAPI.Repositories;

namespace EmployeeAPI.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repo;

        public EmployeeService(IEmployeeRepository repo)
        {
            _repo = repo;
        }

        // ── GET ALL ───────────────────────────────────────────
        public async Task<ApiResponse<PagedResult<EmployeeResponseDto>>> GetAllAsync(PaginationParams param)
        {
            var result = await _repo.GetAllAsync(param);
            return ApiResponse<PagedResult<EmployeeResponseDto>>.Ok(result, $"{result.TotalRecords} records found");
        }

        // ── GET BY ID ─────────────────────────────────────────
        public async Task<ApiResponse<EmployeeResponseDto>> GetByIdAsync(int empId)
        {
            var emp = await _repo.GetByIdAsync(empId);
            if (emp == null)
                return ApiResponse<EmployeeResponseDto>.Fail($"Employee with ID {empId} not found");

            return ApiResponse<EmployeeResponseDto>.Ok(emp);
        }

        // ── CREATE ────────────────────────────────────────────
        public async Task<ApiResponse<EmployeeResponseDto>> CreateAsync(EmployeeCreateDto dto)
        {
            // business rule: duplicate email not allowed
            if (await _repo.EmailExistsAsync(dto.Email))
                return ApiResponse<EmployeeResponseDto>.Fail("This email is already registered");

            // DTO → Model mapping (JoinDate repo set karega)
            var employee = new Employee
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                DeptId = dto.DeptId,
                DesgId = dto.DesgId,
                Salary = dto.Salary
            };

            await _repo.AddAsync(employee);

            if (!await _repo.SaveAsync())
                return ApiResponse<EmployeeResponseDto>.Fail("Failed to save employee");

            // saved employee wapas laakar (with JOIN names) response banao
            var saved = await _repo.GetByIdAsync(employee.EmpId);
            return ApiResponse<EmployeeResponseDto>.Ok(saved!, "Employee created successfully");
        }

        // ── UPDATE ────────────────────────────────────────────
        public async Task<ApiResponse<EmployeeResponseDto>> UpdateAsync(EmployeeUpdateDto dto)
        {
            var employee = await _repo.GetEntityByIdAsync(dto.EmpId);
            if (employee == null)
                return ApiResponse<EmployeeResponseDto>.Fail($"Employee with ID {dto.EmpId} not found");

            // business rule: email kisi aur ka to nahi?
            if (await _repo.EmailExistsAsync(dto.Email, excludeEmpId: dto.EmpId))
                return ApiResponse<EmployeeResponseDto>.Fail("This email is already used by another employee");

            // update fields
            employee.Name = dto.Name;
            employee.Email = dto.Email;
            employee.Phone = dto.Phone;
            employee.DeptId = dto.DeptId;
            employee.DesgId = dto.DesgId;
            employee.Salary = dto.Salary;

            await _repo.UpdateAsync(employee);

            if (!await _repo.SaveAsync())
                return ApiResponse<EmployeeResponseDto>.Fail("Failed to update employee");

            var updated = await _repo.GetByIdAsync(dto.EmpId);
            return ApiResponse<EmployeeResponseDto>.Ok(updated!, "Employee updated successfully");
        }

        // ── DELETE ────────────────────────────────────────────
        public async Task<ApiResponse<bool>> DeleteAsync(int empId)
        {
            var employee = await _repo.GetEntityByIdAsync(empId);
            if (employee == null)
                return ApiResponse<bool>.Fail($"Employee with ID {empId} not found");

            await _repo.DeleteAsync(employee);

            if (!await _repo.SaveAsync())
                return ApiResponse<bool>.Fail("Failed to delete employee");

            return ApiResponse<bool>.Ok(true, "Employee deleted successfully");
        }

        // ── DROPDOWNS ─────────────────────────────────────────
        public async Task<ApiResponse<List<DepartmentDto>>> GetDepartmentsAsync()
        {
            var list = await _repo.GetDepartmentsAsync();
            return ApiResponse<List<DepartmentDto>>.Ok(list);
        }

        public async Task<ApiResponse<List<DesignationDto>>> GetDesignationsAsync()
        {
            var list = await _repo.GetDesignationsAsync();
            return ApiResponse<List<DesignationDto>>.Ok(list);
        }
    }
}