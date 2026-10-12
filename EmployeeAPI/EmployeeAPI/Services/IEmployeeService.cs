using EmployeeAPI.DTOs;
using EmployeeAPI.Pagination;

namespace EmployeeAPI.Services
{
    public interface IEmployeeService
    {
        Task<ApiResponse<PagedResult<EmployeeResponseDto>>> GetAllAsync(PaginationParams param);
        Task<ApiResponse<EmployeeResponseDto>> GetByIdAsync(int empId);
        Task<ApiResponse<EmployeeResponseDto>> CreateAsync(EmployeeCreateDto dto);
        Task<ApiResponse<EmployeeResponseDto>> UpdateAsync(EmployeeUpdateDto dto);
        Task<ApiResponse<bool>> DeleteAsync(int empId);
        Task<ApiResponse<List<DepartmentDto>>> GetDepartmentsAsync();
        Task<ApiResponse<List<DesignationDto>>> GetDesignationsAsync();
    }
}
