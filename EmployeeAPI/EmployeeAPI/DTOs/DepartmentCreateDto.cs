using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs
{
    public class DepartmentCreateDto
    {
        [Required, MaxLength(50)]
        public string DeptName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}
