using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetChi.Application.DTOs.Orders;
using NetChi.Domain.Entities;
using NetChi.Infrastructure.Persistence.Context;

namespace NetChi.Api.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(ApplicationDbContext context, ILogger<OrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
    {
        _logger.LogInformation("Getting all orders");
        var orders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .ToListAsync();

        return Ok(orders.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(Guid id)
    {
        _logger.LogInformation("Getting order {OrderId}", id);
        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            _logger.LogWarning("Order not found: {OrderId}", id);
            return NotFound("Order not found");
        }

        return Ok(MapToDto(order));
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders(Guid userId)
    {
        _logger.LogInformation("Getting orders for user {UserId}", userId);
        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Verify user exists
        var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
        if (!userExists)
        {
            return BadRequest("Invalid user");
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            OrderNumber = request.OrderNumber,
            Description = request.Description,
            Amount = request.Amount,
            Status = Domain.Enums.OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Order created: {OrderId}", order.Id);

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, MapToDto(order));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<OrderDto>> UpdateOrder(Guid id, [FromBody] UpdateOrderRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
        {
            return NotFound("Order not found");
        }

        order.Description = request.Description;
        order.Status = request.Status;
        if (request.Amount.HasValue)
        {
            order.Amount = request.Amount.Value;
        }
        order.UpdatedAt = DateTime.UtcNow;

        if (request.Status == Domain.Enums.OrderStatus.Completed)
        {
            order.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Order updated: {OrderId}", id);

        return Ok(MapToDto(order));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(Guid id)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
        {
            return NotFound("Order not found");
        }

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Order deleted: {OrderId}", id);

        return NoContent();
    }

    private static OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            OrderNumber = order.OrderNumber,
            Description = order.Description,
            Amount = order.Amount,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            CompletedAt = order.CompletedAt
        };
    }
}
