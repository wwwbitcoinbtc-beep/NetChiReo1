namespace NetChi.Application.DTOs.Auth;

public class LoginRequest
{
    // Username/Password login
    public string? Username { get; set; }
    public string? Password { get; set; }
    
    // Phone OTP login
    public string? PhoneNumber { get; set; }
}
