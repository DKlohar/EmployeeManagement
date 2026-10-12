using EmployeeAPI.Delegates;
namespace EmployeeAPI.Middleware
{
    public static class MyMiddlewareExtensions
    {
        public static IApplicationBuilder UseMyMiddleware(this IApplicationBuilder app)
        {
            return app.Use(async (context, next) =>
            {
                // pipeline ka "next" (Func<Task>) hamare MyDelegate me wrap karo
                MyDelegate pipeline = (ctx, nxt) => next();
                var middleware = new MyMiddleware(pipeline);
                await middleware.InvokeAsync(context);
            });
        }
    }
}
