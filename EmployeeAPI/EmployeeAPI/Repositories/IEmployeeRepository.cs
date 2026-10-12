using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using EmployeeAPI.Pagination;

namespace EmployeeAPI.Repositories
{
    public interface IEmployeeRepository
    {
        Task<PagedResult<EmployeeResponseDto>> GetAllAsync(PaginationParams param);
        Task<EmployeeResponseDto?> GetByIdAsync(int empId);
        Task<Employee?> GetEntityByIdAsync(int empId);          // update/delete ke liye
        Task<bool> EmailExistsAsync(string email, int? excludeEmpId = null);
        Task<Employee> AddAsync(Employee employee);
        Task UpdateAsync(Employee employee);
        Task DeleteAsync(Employee employee);
        Task<bool> SaveAsync();
        Task<List<DepartmentDto>> GetDepartmentsAsync();
        Task<List<DesignationDto>> GetDesignationsAsync();
    }
}
