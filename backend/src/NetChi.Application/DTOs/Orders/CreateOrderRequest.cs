using NetChi.Domain.Enums;

namespace NetChi.Application.DTOs.Orders;

public class CreateOrderRequest
{
    public Guid UserId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
