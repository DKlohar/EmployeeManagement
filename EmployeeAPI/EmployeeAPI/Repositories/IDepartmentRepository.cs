using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using EmployeeAPI.Pagination;

namespace EmployeeAPI.Repositories
{
    public interface IDepartmentRepository
    {
        Task<PagedResult<DepartmentDto>> GetAllAsync(PaginationParams param);
        Task<Department?> GetEntityByIdAsync(int deptId);
        Task<bool> NameExistsAsync(string name, int? excludeId = null);
        Task<bool> HasEmployeesAsync(int deptId);          // FK check — delete se pehle
        Task AddAsync(Department dept);
        Task UpdateAsync(Department dept);
        Task DeleteAsync(Department dept);
        Task<bool> SaveAsync();
    }
}
