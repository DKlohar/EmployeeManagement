using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs
{
    public class EmployeeUpdateDto
    {
        [Required]
        public int EmpId { get; set; }       // kaunse employee ko update karna hai

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? Phone { get; set; }

        public int? DeptId { get; set; }
        public int? DesgId { get; set; }

        [Range(0, 1000000)]
        public decimal? Salary { get; set; }
    }
}
