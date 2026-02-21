using System.Security.Cryptography;
using System.Text;

namespace NetChi.Application.Services;

public interface IOtpService
{
    /// <summary>
    /// Generate a random 6-digit OTP
    /// </summary>
    string GenerateOtp();

    /// <summary>
    /// Hash an OTP code
    /// </summary>
    string HashOtp(string otp);

    /// <summary>
    /// Verify an OTP against its hash
    /// </summary>
    bool VerifyOtp(string otp, string otpHash);
}

public class OtpService : IOtpService
{
    public string GenerateOtp()
    {
        // Generate random 6-digit code
        byte[] tokenData = new byte[4];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenData);
        }
        int randomNumber = Math.Abs(BitConverter.ToInt32(tokenData, 0));
        return (randomNumber % 900000 + 100000).ToString();
    }

    public string HashOtp(string otp)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(otp));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    public bool VerifyOtp(string otp, string otpHash)
    {
        var hashOfInput = HashOtp(otp);
        return hashOfInput == otpHash;
    }
}
