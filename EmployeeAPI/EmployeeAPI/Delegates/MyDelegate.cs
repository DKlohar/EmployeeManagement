namespace EmployeeAPI.Delegates;

// Custom delegate — RequestDelegate ka apna version.
// Ek method hold karta hai jo: HttpContext leta hai,
// kaam karta hai, aur "next" delegate ko call karta hai.
public delegate Task MyDelegate(HttpContext context, Func<Task> next);