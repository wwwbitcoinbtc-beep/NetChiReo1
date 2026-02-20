using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace NetChi.Api.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpGet]
    [Authorize]
    public IActionResult GetOrders()
    {
        var orders = new[]
        {
            new { id = 1, name = "Order 1", status = "pending" },
            new { id = 2, name = "Order 2", status = "completed" }
        };
        return Ok(orders);
    }

    [HttpGet("{id}")]
    [Authorize]
    public IActionResult GetOrder(int id)
    {
        return Ok(new { id, name = $"Order {id}", status = "processing" });
    }

    [HttpPost]
    [Authorize]
    public IActionResult CreateOrder([FromBody] object order)
    {
        return CreatedAtAction(nameof(GetOrder), new { id = 1 }, order);
    }
}
