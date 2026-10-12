namespace EmployeeAPI.Pagination
{
    public class PagedResult<T>
    {
        // ✅ WAS: List<T>? — ab null nahi hoga, React side null-check nahi chahiye
        public List<T> Data { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalRecords / (double)PageSize);
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;
    }
}