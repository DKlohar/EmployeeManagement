using EmployeeAPI.Delegates;

namespace EmployeeAPI.Middleware
{
    public class MyMiddleware
    {
        private readonly MyDelegate _next;   // 👈 hamara custom delegate

        public MyMiddleware(MyDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext context)
        {
            var start = DateTime.UtcNow;

            Console.WriteLine($"[MyDelegate] → {context.Request.Method} {context.Request.Path}");

            await _next(context, () => Task.CompletedTask);   // next ko call karo

            var ms = (DateTime.UtcNow - start).TotalMilliseconds;
            Console.WriteLine($"[MyDelegate] ← Status {context.Response.StatusCode} | {ms:0.0} ms");
        }
    }
}
