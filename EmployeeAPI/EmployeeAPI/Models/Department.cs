using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeAPI.Models
{
    public class Department
    {
        [Key]
        [Column("Id")]                      // SQL column = Id
        public int DeptId { get; set; }     // C# name = DeptId

        [Required, MaxLength(50)]
        public string DeptName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
