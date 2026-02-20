using NetChi.Domain.Enums;

namespace NetChi.Application.DTOs.Orders;

public class UpdateOrderRequest
{
    public string Description { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public decimal? Amount { get; set; }
}
