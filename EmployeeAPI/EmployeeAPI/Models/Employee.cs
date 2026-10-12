using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace EmployeeAPI.Models
{
    public class Employee
    {
        [Key]
        [Column("Id")]                              // SQL column = Id
        public int EmpId { get; set; }              // C# name = EmpId

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? Phone { get; set; }

        [Column("DepartmentId")]                   
        public int? DeptId { get; set; }

        [Column("DesignationId")]                   
        public int? DesgId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Salary { get; set; }

        public DateTime JoinDate { get; set; }

        // Navigation properties — JOIN ke baad ye fill honge
        [ForeignKey(nameof(DeptId))]
        public Department? Department { get; set; }

        [ForeignKey(nameof(DesgId))]
        public Designation? Designation { get; set; }
    }
}
