using EmployeeAPI.DTOs;
using EmployeeAPI.Pagination;
using EmployeeAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _service;

        public DepartmentsController(IDepartmentService service)
        {
            _service = service;
        }

        // GET: api/Departments?pageNumber=1&pageSize=10&search=IT
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PaginationParams param)   // ✅ paginated
        {
            var result = await _service.GetAllAsync(param);
            return Ok(result);
        }


        // GET: api/Departments/5
        [HttpGet("{deptId:int}")]
        public async Task<IActionResult> GetById(int deptId)
        {
            var result = await _service.GetByIdAsync(deptId);
            if (!result.Success)
                return NotFound(result);          // ✅ consistent status code

            return Ok(result);
        }


        // POST: api/Departments
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DepartmentCreateDto dto)
        {
            var result = await _service.CreateAsync(dto);
            if (!result.Success)
                return BadRequest(result);        // ✅ WAS: Ok(result) — 200 with error

            return Ok(result);
        }

        // PUT: api/Departments
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] DepartmentUpdateDto dto)
        {
            var result = await _service.UpdateAsync(dto);
            if (!result.Success)
                return BadRequest(result);        // ✅ WAS: Ok(result)

            return Ok(result);
        }

        // DELETE: api/Departments/5
        [HttpDelete("{deptId:int}")]
        public async Task<IActionResult> Delete(int deptId)
        {
            var result = await _service.DeleteAsync(deptId);
            if (!result.Success)
                return BadRequest(result);        // ✅ WAS: Ok(result)

            return Ok(result);
        }
    }
}
