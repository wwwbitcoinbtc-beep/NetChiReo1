using NetChi.Domain.Enums;

namespace NetChi.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Email { get; set; } // Optional now - not used for authentication
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    
    // OTP/Verification Code Fields
    public string? VerificationCodeHash { get; set; } // Hashed verification code
    public DateTime? VerificationCodeExpiry { get; set; } // Expiry time
    public int VerificationCodeAttempts { get; set; } = 0; // Failed attempts
    public bool IsPhoneVerified { get; set; } = false; // Phone verification status
    
    public UserType Type { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
