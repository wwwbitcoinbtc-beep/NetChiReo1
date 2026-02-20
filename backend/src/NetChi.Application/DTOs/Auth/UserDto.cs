namespace NetChi.Application.DTOs.Auth;

public class UserDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
