using NWebsec.AspNetCore.Middleware;

namespace NetChi.Api.Extensions;

public static class SecurityHeadersExtensions
{
    public static WebApplication UseSecurityHeaders(this WebApplication app)
    {
        app.UseMiddleware<SecurityHeadersMiddleware>();
        return app;
    }
}

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public Task InvokeAsync(HttpContext context)
    {
        // X-Content-Type-Options: Prevents MIME-type sniffing
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

        // X-Frame-Options: Prevents clickjacking
        context.Response.Headers.Append("X-Frame-Options", "DENY");

        // X-XSS-Protection: IE XSS filter
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

        // Referrer-Policy: Control referrer information
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        // Remove server header
        context.Response.Headers.Remove("Server");

        return _next(context);
    }
}
