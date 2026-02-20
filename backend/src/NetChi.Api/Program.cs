using NetChi.Api.Hubs;
using NetChi.Api.Extensions;
using NetChi.Infrastructure.Persistence.Context;
using NetChi.Application.Mappings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file if exists
var envFilePath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envFilePath))
{
    foreach (var line in File.ReadAllLines(envFilePath))
    {
        if (line.Contains('='))
        {
            var parts = line.Split('=', 2);
            if (parts.Length == 2)
            {
                Environment.SetEnvironmentVariable(parts[0], parts[1]);
            }
        }
    }
}

// ============ Configuration ============

// Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                     Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, x => x.CommandTimeout(30)));

// ============ Security & Authentication ============

var jwtKey = builder.Configuration["Jwt:Key"] ?? 
             Environment.GetEnvironmentVariable("Jwt__Key") ?? 
             "YourSuperSecretKeyForJwtTokenGenerationThatIsAtLeast32CharactersLong";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? 
                Environment.GetEnvironmentVariable("Jwt__Issuer") ?? 
                "NetChi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? 
                  Environment.GetEnvironmentVariable("Jwt__Audience") ?? 
                  "NetChiClient";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };

        // Support JWT in SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ============ Rate Limiting (DDoS Protection) ============

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
        httpContext => RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { message = "Too many requests. Please try again later." }, token);
    };
});

// ============ CORS ============

var allowedOrigins = (builder.Configuration["AllowedOrigins"] ?? 
                     Environment.GetEnvironmentVariable("AllowedOrigins") ?? 
                     "http://localhost:3000,http://localhost:5173").Split(',');

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", corsPolicyBuilder =>
    {
        corsPolicyBuilder
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// ============ SignalR ============

builder.Services.AddSignalR();

// ============ API Services ============

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// ============ Build App ============

var app = builder.Build();

// ============ Middleware Pipeline ============

// HTTPS
app.UseHttpsRedirection();

// Rate Limiting
app.UseRateLimiter();

// CORS (before routing)
app.UseCors("AllowFrontend");

// Security Headers
app.UseSecurityHeaders();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Controllers & SignalR
app.MapControllers();
app.MapHub<OrderHub>("/hubs/order");

// Health check
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow })
    .WithName("HealthCheck");

app.Run();
