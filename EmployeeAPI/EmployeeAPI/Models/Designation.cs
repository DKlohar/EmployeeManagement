using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeAPI.Models
{
    public class Designation
    {
        [Key]
        [Column("Id")]                      // SQL column = Id
        public int DesgId { get; set; }     // C# name = DesgId

        [Required, MaxLength(50)]
        public string Title { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
