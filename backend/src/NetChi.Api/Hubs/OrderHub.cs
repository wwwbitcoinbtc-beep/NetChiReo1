using Microsoft.AspNetCore.SignalR;

namespace NetChi.Api.Hubs;

public class OrderHub : Hub
{
    public async Task SendOrderUpdate(string message)
    {
        await Clients.All.SendAsync("ReceiveOrderUpdate", message);
    }

    public async Task JoinOrderGroup(string orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"order-{orderId}");
        await Clients.Group($"order-{orderId}").SendAsync("UserJoined", $"User {Context.ConnectionId} joined");
    }

    public async Task LeaveOrderGroup(string orderId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"order-{orderId}");
        await Clients.Group($"order-{orderId}").SendAsync("UserLeft", $"User {Context.ConnectionId} left");
    }

    public async Task SendOrderStatusUpdate(string orderId, string status)
    {
        await Clients.Group($"order-{orderId}").SendAsync("OrderStatusChanged", 
            new { orderId, status, timestamp = DateTime.UtcNow });
    }

    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("Connected", new 
        { 
            message = "Successfully connected to NetChi real-time system",
            connectionId = Context.ConnectionId,
            timestamp = DateTime.UtcNow
        });
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Clients.All.SendAsync("UserDisconnected", new 
        { 
            message = "User disconnected",
            connectionId = Context.ConnectionId
        });
        await base.OnDisconnectedAsync(exception);
    }
}
