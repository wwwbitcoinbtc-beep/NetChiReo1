using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using NetChi.Application.DTOs.Auth;
using NetChi.Application.Services;
using NetChi.Domain.Entities;
using NetChi.Domain.Enums;
using NetChi.Infrastructure.Persistence.Context;
using Microsoft.AspNetCore.Mvc;

namespace NetChi.Api.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;
    private readonly IOtpService _otpService;

    public AuthController(ApplicationDbContext context, IConfiguration configuration, ILogger<AuthController> logger, IOtpService otpService)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _otpService = otpService;
    }

    /// <summary>
    /// Login with username and password
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validate request
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("نام کاربری و رمز عبور الزامی هستند.");
        }

        // Find user by username
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.Username);
        if (user == null)
        {
            _logger.LogWarning("Login attempt with non-existent username: {Username}", request.Username);
            return Unauthorized("نام کاربری یا رمز عبور اشتباه است.");
        }

        // Verify password
        if (!VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for user: {Username}", user.UserName);
            return Unauthorized("نام کاربری یا رمز عبور اشتباه است.");
        }

        // Check if user is active
        if (!user.IsActive)
        {
            _logger.LogWarning("Login attempt on inactive user: {Username}", user.UserName);
            return Unauthorized("حساب کاربری غیرفعال است.");
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = GenerateJwtToken(user);

        _logger.LogInformation("User logged in successfully: {Username}", user.UserName);

        return Ok(new LoginResponse
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddHours(24),
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                PhoneNumber = user.PhoneNumber,
                Type = user.Type.ToString()
            }
        });
    }

    /// <summary>
    /// Register new user
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validate inputs
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("نام کاربری، شماره موبایل و رمز عبور الزامی هستند.");
        }

        // Validate password - minimum 6 characters
        if (request.Password.Length < 6)
        {
            return BadRequest("رمز عبور باید حداقل ۶ کاراکتر باشد.");
        }

        // Check if username already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UserName == request.Username);
        if (existingUser != null)
        {
            return BadRequest("این نام کاربری قبلاً ثبت شده است.");
        }

        // Check if phone number already exists
        var existingPhone = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);
        if (existingPhone != null)
        {
            return BadRequest("این شماره موبایل قبلاً ثبت شده است.");
        }

        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = request.Username,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = HashPassword(request.Password),
            Type = UserType.Customer,
            IsActive = true,
            IsPhoneVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = GenerateJwtToken(user);

        _logger.LogInformation("New user registered: {Username}", user.UserName);

        return CreatedAtAction(nameof(Login), new LoginResponse
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddHours(24),
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                PhoneNumber = user.PhoneNumber,
                Type = user.Type.ToString()
            }
        });
    }

    /// <summary>
    /// Request OTP for phone number login/registration
    /// </summary>
    [HttpPost("request-otp")]
    public async Task<ActionResult<OtpResponseDto>> RequestOtp([FromBody] OtpRequestDto request)
    {
        if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            return BadRequest("شماره موبایل الزامی است.");
        }

        try
        {
            // Generate OTP
            var otp = _otpService.GenerateOtp();
            var otpHash = _otpService.HashOtp(otp);

            // Find or create user
            var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);
            
            if (user == null)
            {
                // New user - create with phone only (will complete registration after OTP verification)
                user = new User
                {
                    Id = Guid.NewGuid(),
                    PhoneNumber = request.PhoneNumber,
                    UserName = $"user_{Guid.NewGuid().ToString().Substring(0, 8)}", // Temporary username
                    PasswordHash = "", // Will be set later
                    Type = UserType.Customer,
                    IsActive = false, // Not active until phone is verified
                    IsPhoneVerified = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
            }

            // Store OTP hash and expiry
            user.VerificationCodeHash = otpHash;
            user.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(5); // 5 minutes expiry
            user.VerificationCodeAttempts = 0;

            await _context.SaveChangesAsync();

            _logger.LogInformation("OTP requested for phone: {PhoneNumber}", request.PhoneNumber);

            // In real scenario, send OTP via SMS. For now, return in response for testing
            return Ok(new OtpResponseDto
            {
                PhoneNumber = request.PhoneNumber,
                Message = $"کد تایید ارسال شد. (کد تست: {otp})",
                ExpirySeconds = 300
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting OTP for phone: {PhoneNumber}", request.PhoneNumber);
            return StatusCode(500, "خطا در درخواست کد تایید.");
        }
    }

    /// <summary>
    /// Verify OTP and complete login/registration
    /// </summary>
    [HttpPost("verify-otp")]
    public async Task<ActionResult<LoginResponse>> VerifyOtp([FromBody] OtpVerificationDto request)
    {
        if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.VerificationCode))
        {
            return BadRequest("شماره موبایل و کد تایید الزامی هستند.");
        }

        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber);
            
            if (user == null)
            {
                return Unauthorized("شماره موبایل یافت نشد.");
            }

            // Check if OTP is expired
            if (user.VerificationCodeExpiry == null || DateTime.UtcNow > user.VerificationCodeExpiry)
            {
                return Unauthorized("کد تایید منقضی شد.");
            }

            // Check OTP attempts
            if (user.VerificationCodeAttempts >= 3)
            {
                return Unauthorized("تعداد تلاش‌های نادرست بیشتر از حد است.");
            }

            // Verify OTP
            if (string.IsNullOrWhiteSpace(user.VerificationCodeHash) || !_otpService.VerifyOtp(request.VerificationCode, user.VerificationCodeHash))
            {
                user.VerificationCodeAttempts++;
                await _context.SaveChangesAsync();
                return Unauthorized("کد تایید اشتباه است.");
            }

            // Mark phone as verified
            user.IsPhoneVerified = true;
            user.IsActive = true;
            user.LastLoginAt = DateTime.UtcNow;
            
            // Clear OTP data
            user.VerificationCodeHash = null;
            user.VerificationCodeExpiry = null;
            user.VerificationCodeAttempts = 0;

            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = GenerateJwtToken(user);

            _logger.LogInformation("OTP verified for phone: {PhoneNumber}", request.PhoneNumber);

            return Ok(new LoginResponse
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(24),
                User = new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    PhoneNumber = user.PhoneNumber,
                    Type = user.Type.ToString()
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying OTP for phone: {PhoneNumber}", request.PhoneNumber);
            return StatusCode(500, "خطا در تایید کد.");
        }
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? 
                    Environment.GetEnvironmentVariable("Jwt__Key") ?? 
                    "YourSuperSecretKeyForJwtTokenGenerationThatIsAtLeast32CharactersLong";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? 
                       Environment.GetEnvironmentVariable("Jwt__Issuer") ?? 
                       "NetChi";
        var jwtAudience = _configuration["Jwt:Audience"] ?? 
                         Environment.GetEnvironmentVariable("Jwt__Audience") ?? 
                         "NetChiClient";

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(jwtKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim("sub", user.Id.ToString()),
                new System.Security.Claims.Claim("username", user.UserName),
                new System.Security.Claims.Claim("phone", user.PhoneNumber ?? ""),
                new System.Security.Claims.Claim("type", user.Type.ToString())
            }),
            Expires = DateTime.UtcNow.AddHours(24),
            Issuer = jwtIssuer,
            Audience = jwtAudience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    private bool VerifyPassword(string password, string hash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput == hash;
    }
}
