using EmployeeAPI.Data;
using EmployeeAPI.DTOs;
using EmployeeAPI.Helpers;
using EmployeeAPI.Models;
using EmployeeAPI.Pagination;
using Microsoft.EntityFrameworkCore;

namespace EmployeeAPI.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _context;

        public EmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<EmployeeResponseDto>> GetAllAsync(PaginationParams param)
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(param.Search))
            {
                var s = param.Search.ToLower();
                query = query.Where(e =>
                    e.Name.ToLower().Contains(s) ||
                    e.Email.ToLower().Contains(s));
            }
            query = query.OrderByDescending(e => e.EmpId);

            var totalRecords = await query.CountAsync();

            var data = await query
                .Skip((param.PageNumber - 1) * param.PageSize)
                .Take(param.PageSize)
                .Select(e => new EmployeeResponseDto
                {
                    EmpId = e.EmpId,
                    EncryptedId = EncryptionHelper.Encrypt(e.EmpId),
                    Name = e.Name,
                    Email = e.Email,
                    Phone = e.Phone,
                    DeptId = e.DeptId,
                    Department = e.Department != null ? e.Department.DeptName : null,
                    DesgId = e.DesgId,
                    Designation = e.Designation != null ? e.Designation.Title : null,
                    Salary = e.Salary,
                    JoinDate = e.JoinDate
                })
                .ToListAsync();

            return new PagedResult<EmployeeResponseDto>
            {
                Data = data,
                PageNumber = param.PageNumber,
                PageSize = param.PageSize,
                TotalRecords = totalRecords
            };
        }

        // ── GET BY ID (single) ────────────────────────────────
        public async Task<EmployeeResponseDto?> GetByIdAsync(int empId)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Where(e => e.EmpId == empId)
                .Select(e => new EmployeeResponseDto
                {
                    EmpId = e.EmpId,
                    EncryptedId = EncryptionHelper.Encrypt(e.EmpId),
                    Name = e.Name,
                    Email = e.Email,
                    Phone = e.Phone,
                    DeptId = e.DeptId,
                    Department = e.Department != null ? e.Department.DeptName : null,
                    DesgId = e.DesgId,
                    Designation = e.Designation != null ? e.Designation.Title : null,
                    Salary = e.Salary,
                    JoinDate = e.JoinDate
                })
                .FirstOrDefaultAsync();
        }

        // ── raw entity (for update/delete attach) ─────────────
        public async Task<Employee?> GetEntityByIdAsync(int empId)
        {
            return await _context.Employees.FindAsync(empId);
        }

        // ── duplicate email check ─────────────────────────────
        public async Task<bool> EmailExistsAsync(string email, int? excludeEmpId = null)
        {
            return await _context.Employees
                .AnyAsync(e => e.Email.ToLower() == email.ToLower()
                            && (excludeEmpId == null || e.EmpId != excludeEmpId));
        }

        // ── CREATE ────────────────────────────────────────────
        public async Task<Employee> AddAsync(Employee employee)
        {
            // ✅ JoinDate ab sirf YAHAN set hota hai (service se hata diya)
            employee.JoinDate = DateTime.UtcNow;
            await _context.Employees.AddAsync(employee);
            return employee;
        }

        // ── UPDATE ────────────────────────────────────────────
        public Task UpdateAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            return Task.CompletedTask;
        }

        // ── DELETE ────────────────────────────────────────────
        public Task DeleteAsync(Employee employee)
        {
            _context.Employees.Remove(employee);
            return Task.CompletedTask;
        }

        // ── SAVE (commit to DB) ───────────────────────────────
        public async Task<bool> SaveAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        // ── dropdowns ─────────────────────────────────────────
        public async Task<List<DepartmentDto>> GetDepartmentsAsync()
        {
            return await _context.Departments
                .Where(d => d.IsActive)
                .OrderBy(d => d.DeptName)
                .Select(d => new DepartmentDto { DeptId = d.DeptId, DeptName = d.DeptName })
                .ToListAsync();
        }

        public async Task<List<DesignationDto>> GetDesignationsAsync()
        {
            return await _context.Designations
                .Where(g => g.IsActive)
                .OrderBy(g => g.Title)
                .Select(g => new DesignationDto { DesgId = g.DesgId, Title = g.Title })
                .ToListAsync();
        }
    }
}