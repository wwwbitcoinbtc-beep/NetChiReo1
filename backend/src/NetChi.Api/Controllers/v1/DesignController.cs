using Microsoft.AspNetCore.Mvc;
using NetChi.Infrastructure.Persistence.Context;

namespace NetChi.Api.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class DesignController : ControllerBase
{
    private readonly ILogger<DesignController> _logger;

    public DesignController(ILogger<DesignController> logger)
    {
        _logger = logger;
    }

    [HttpGet("system")]
    public ActionResult GetDesignSystem()
    {
        try
        {
            _logger.LogInformation("Fetching design system assets");

            var designSystem = new
            {
                colors = new[]
                {
                    new { id = "primary", name = "رنگ اصلی", hex = "#3B82F6", tailwind = "bg-blue-500" },
                    new { id = "accent", name = "رنگ تاکیدی", hex = "#10B981", tailwind = "bg-emerald-500" },
                    new { id = "dark", name = "رنگ تاریک", hex = "#1E293B", tailwind = "bg-slate-800" },
                    new { id = "glass", name = "شیشه‌ای", hex = "rgba(255, 255, 255, 0.3)", tailwind = "backdrop-blur-md" },
                    new { id = "warning", name = "هشدار", hex = "#F59E0B", tailwind = "bg-amber-500" },
                    new { id = "danger", name = "خطر", hex = "#EF4444", tailwind = "bg-red-500" },
                },
                typography = new[]
                {
                    new { id = "heading1", name = "عنوان بزرگ", size = "32px", weight = "black", family = "Vazirmatn" },
                    new { id = "heading2", name = "عنوان متوسط", size = "24px", weight = "bold", family = "Vazirmatn" },
                    new { id = "body", name = "متن بدنه", size = "16px", weight = "regular", family = "Vazirmatn" },
                    new { id = "caption", name = "توضیح", size = "12px", weight = "medium", family = "Vazirmatn" },
                },
                spacing = new
                {
                    xs = "4px",
                    sm = "8px",
                    md = "16px",
                    lg = "24px",
                    xl = "32px",
                },
                borderRadius = new
                {
                    sm = "4px",
                    md = "8px",
                    lg = "12px",
                    xl = "16px",
                    full = "9999px",
                },
                shadows = new[]
                {
                    new { id = "sm", value = "0 1px 2px 0 rgba(0, 0, 0, 0.05)" },
                    new { id = "md", value = "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
                    new { id = "lg", value = "0 10px 15px -3px rgba(0, 0, 0, 0.1)" },
                    new { id = "glass", value = "0 8px 32px rgba(0, 0, 0, 0.1)" },
                },
                animations = new[]
                {
                    new { id = "float", duration = "6s", timing = "ease-in-out" },
                    new { id = "shimmer", duration = "2s", timing = "linear" },
                    new { id = "pulse", duration = "2s", timing = "cubic-bezier(0.4, 0, 0.6, 1)" },
                },
                components = new[]
                {
                    new { id = "button", name = "دکمه", states = new[] { "default", "hover", "active", "disabled" } },
                    new { id = "card", name = "کارت", variants = new[] { "default", "glass", "outlined" } },
                    new { id = "input", name = "فیلد ورودی", variants = new[] { "text", "email", "password" } },
                    new { id = "badge", name = "نشان", variants = new[] { "success", "warning", "danger" } },
                }
            };

            return Ok(new
            {
                status = "success",
                data = designSystem,
                timestamp = DateTime.UtcNow,
                message = "Design system assets loaded successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching design system");
            return StatusCode(500, new
            {
                status = "error",
                message = "خطا در بارگذاری سیستم طراحی",
                error = ex.Message
            });
        }
    }
}
