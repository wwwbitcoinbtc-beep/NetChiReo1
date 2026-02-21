namespace NetChi.Application.DTOs.Auth;

public class OtpResponseDto
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int ExpirySeconds { get; set; } = 300; // 5 minutes
}
