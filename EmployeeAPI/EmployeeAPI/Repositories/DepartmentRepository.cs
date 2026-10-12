using EmployeeAPI.Data;
using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using EmployeeAPI.Pagination;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace EmployeeAPI.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly AppDbContext _context;

        public DepartmentRepository(AppDbContext context)
        {
            _context = context;
        }

        //public async Task<List<DepartmentDto>> GetAllAsync()
        //    => await _context.Departments
        //        .OrderBy(d => d.DeptName)
        //        .Select(d => new DepartmentDto { DeptId = d.DeptId, DeptName = d.DeptName })
        //        .ToListAsync();

        // ── GET ALL (paginated + search) ──────────────────────
        public async Task<PagedResult<DepartmentDto>> GetAllAsync(PaginationParams param)
        {
            var query = _context.Departments.AsQueryable();

            // search by dept name
            if (!string.IsNullOrWhiteSpace(param.Search))
            {
                var s = param.Search.ToLower();
                query = query.Where(d => d.DeptName.ToLower().Contains(s));
            }

            query = query.OrderBy(d => d.DeptId);

            var totalRecords = await query.CountAsync();

            var data = await query
                .Skip((param.PageNumber - 1) * param.PageSize)
                .Take(param.PageSize)
                .Select(d => new DepartmentDto { DeptId = d.DeptId, DeptName = d.DeptName })
                .ToListAsync();

            return new PagedResult<DepartmentDto>
            {
                Data = data,
                PageNumber = param.PageNumber,
                PageSize = param.PageSize,
                TotalRecords = totalRecords
            };
        }

        public async Task<Department?> GetEntityByIdAsync(int deptId)
            => await _context.Departments.FindAsync(deptId);

        public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
            => await _context.Departments
                .AnyAsync(d => d.DeptName.ToLower() == name.ToLower()
                            && (excludeId == null || d.DeptId != excludeId));

        // is department me employees assigned hain?
        public async Task<bool> HasEmployeesAsync(int deptId)
            => await _context.Employees.AnyAsync(e => e.DeptId == deptId);

        public async Task AddAsync(Department dept) => await _context.Departments.AddAsync(dept);
        public Task UpdateAsync(Department dept) { _context.Departments.Update(dept); return Task.CompletedTask; }
        public Task DeleteAsync(Department dept) { _context.Departments.Remove(dept); return Task.CompletedTask; }
        public async Task<bool> SaveAsync() => await _context.SaveChangesAsync() > 0;
    }
}
