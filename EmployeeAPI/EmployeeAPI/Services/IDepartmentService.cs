using EmployeeAPI.DTOs;
using EmployeeAPI.Pagination;

namespace EmployeeAPI.Services
{
    public interface IDepartmentService
    {
        Task<ApiResponse<PagedResult<DepartmentDto>>> GetAllAsync(PaginationParams param);
        Task<ApiResponse<DepartmentDto>> GetByIdAsync(int deptId);
        Task<ApiResponse<DepartmentDto>> CreateAsync(DepartmentCreateDto dto);
        Task<ApiResponse<DepartmentDto>> UpdateAsync(DepartmentUpdateDto dto);
        Task<ApiResponse<bool>> DeleteAsync(int deptId);
    }
}
