using NetChi.Domain.Enums;

namespace NetChi.Application.DTOs.Orders;

public class OrderDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
