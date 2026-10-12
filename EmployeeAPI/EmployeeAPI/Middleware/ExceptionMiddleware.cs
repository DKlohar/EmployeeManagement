using EmployeeAPI.DTOs;

namespace EmployeeAPI.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;   // built-in delegate = pipeline ka "next"
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);   // request aage bhejo
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception: {Path} → {Message}",
                    context.Request.Path, ex.Message);

                if (context.Response.HasStarted) throw;   // response bhej chuke to dubara nahi

                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";

                // React ko hamesha same shape milega — ApiResponse<T>
                var response = ApiResponse<string>.Fail("Something went wrong. Please try again.");
                await context.Response.WriteAsJsonAsync(response);

            }
        }
    }
}
