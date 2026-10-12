using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs
{
    public class EmployeeCreateDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? Phone { get; set; }

        public int? DeptId { get; set; }     // dropdown se aayega
        public int? DesgId { get; set; }     // dropdown se aayega

        [Range(0, 1000000)]
        public decimal? Salary { get; set; }
    }
}
