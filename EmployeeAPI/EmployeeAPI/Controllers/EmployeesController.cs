using EmployeeAPI.DTOs;
using EmployeeAPI.Helpers;
using EmployeeAPI.Pagination;
using EmployeeAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _service;

        public EmployeesController(IEmployeeService service)
        {
            _service = service;
        }

        // GET: api/Employees?pageNumber=1&pageSize=10&search=rahul
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationParams param)
        {
            var result = await _service.GetAllAsync(param);
            return Ok(result);
        }

        // GET: api/Employees/xY9zAq7Lp   (encrypted ID)
        [HttpGet("{encryptedId}")]
        public async Task<IActionResult> GetById(string encryptedId)
        {
            int empId;
            try { empId = EncryptionHelper.Decrypt(encryptedId); }
            catch (FormatException) { return BadRequest(ApiResponse<EmployeeResponseDto>.Fail("Invalid employee ID")); }  // ✅ WAS: Ok(...)

            var result = await _service.GetByIdAsync(empId);
            if (!result.Success)
                return NotFound(result);          // ✅ consistent

            return Ok(result);
        }

        // POST: api/Employees
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeCreateDto dto)
        {
            var result = await _service.CreateAsync(dto);
            if (!result.Success)
                return BadRequest(result);

            // ✅ FIXED: route param name "encryptedId" (not "id") — warna 201 ka Location header tootta
            return CreatedAtAction(nameof(GetById),
                new { encryptedId = result.Data!.EncryptedId },
                result);
        }

        // PUT: api/Employees
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] EmployeeUpdateDto dto)
        {
            var result = await _service.UpdateAsync(dto);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // DELETE: api/Employees/xY9zAq7Lp   (encrypted ID)
        [HttpDelete("{encryptedId}")]
        public async Task<IActionResult> Delete(string encryptedId)
        {
            int empId;
            try { empId = EncryptionHelper.Decrypt(encryptedId); }
            catch (FormatException) { return BadRequest(ApiResponse<bool>.Fail("Invalid employee ID")); }  // ✅ WAS: Ok(...)

            var result = await _service.DeleteAsync(empId);
            if (!result.Success)
                return NotFound(result);          // ✅ consistent

            return Ok(result);
        }

        // GET: api/Employees/departments
        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var result = await _service.GetDepartmentsAsync();
            return Ok(result);
        }

        // GET: api/Employees/designations
        [HttpGet("designations")]
        public async Task<IActionResult> GetDesignations()
        {
            var result = await _service.GetDesignationsAsync();
            return Ok(result);
        }
    }
}