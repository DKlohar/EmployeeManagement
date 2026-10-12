using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs
{
    public class DepartmentUpdateDto
    {
        [Required]
        public int DeptId { get; set; }

        [Required, MaxLength(50)]
        public string DeptName { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }
}
