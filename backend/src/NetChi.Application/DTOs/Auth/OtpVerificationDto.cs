namespace NetChi.Application.DTOs.Auth;

public class OtpVerificationDto
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string VerificationCode { get; set; } = string.Empty;
}
