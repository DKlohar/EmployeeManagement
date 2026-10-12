using EmployeeAPI.Data;
using EmployeeAPI.DTOs;
using EmployeeAPI.Helpers;
using EmployeeAPI.Middleware;
using EmployeeAPI.Repositories;
using EmployeeAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;

// ══════════════════════════════════════════════════════════
// 1. Serilog — file + console (console WAS MISSING)
// ══════════════════════════════════════════════════════════
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()                              // ✅ ADDED — debug output wapas
    .WriteTo.File("Logs/app-.log",
        rollingInterval: RollingInterval.Day,        // roz nayi file
        retainedFileCountLimit: 7)                   // sirf 7 din ki files rakho
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog();   // built-in logging ko Serilog se replace

// ══════════════════════════════════════════════════════════
// 2. Services (andar wali layer — DI container)
// ══════════════════════════════════════════════════════════
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>          // ✅ ADDED — validation errors bhi
    {                                                //    ApiResponse<T> shape me aayenge
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => e.Value!.Errors.First().ErrorMessage)
                .ToList();

            return new BadRequestObjectResult(
                ApiResponse<string>.Fail(string.Join(" | ", errors)));
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS — React ko permission
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:5173","http://localhost:5174", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Dependency Injection registrations
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();

// Encryption key load karo (Helper use karne se pehle zaroori)
EncryptionHelper.Init(builder.Configuration);

var app = builder.Build();

// ══════════════════════════════════════════════════════════
// 3. Auto-migrate (dev ke liye — DB bana do agar nahi hai)
// ══════════════════════════════════════════════════════════
using (var scope = app.Services.CreateScope())       // ✅ ADDED
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();                           // pending migrations apply
}

// ══════════════════════════════════════════════════════════
// 4. Middleware pipeline (ORDER MATTERS)
// ══════════════════════════════════════════════════════════
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "EmployeeAPI v1"));
    // Root URL se Swagger UI open karne ke liye:
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

app.UseMiddleware<ExceptionMiddleware>();   // 1️⃣ SABSE PEHLE
app.UseSerilogRequestLogging();             // 2️⃣ har request ki entry log
app.UseMyMiddleware();                      // 3️⃣ custom delegate middleware
app.UseCors("AllowReact");                  // 4️⃣ React ke requests allow
app.UseAuthorization();                     // 5️⃣
app.MapControllers();                       // 6️⃣ endpoints map

app.Run();