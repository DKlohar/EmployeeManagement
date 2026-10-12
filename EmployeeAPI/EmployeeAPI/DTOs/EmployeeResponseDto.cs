namespace EmployeeAPI.DTOs
{
    public class EmployeeResponseDto
    {
        public int EmpId { get; set; }
        public string EncryptedId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public int? DeptId { get; set; }
        public string? Department { get; set; }    // "IT" (name, not id)
        public int? DesgId { get; set; }
        public string? Designation { get; set; }   // "Manager"
        public decimal? Salary { get; set; }
        public DateTime JoinDate { get; set; }
    }
}
