using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using NetChi.Application.DTOs.Auth;
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

    public AuthController(ApplicationDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Find user by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            _logger.LogWarning("Login attempt with non-existent email: {Email}", request.Email);
            return Unauthorized("Invalid credentials");
        }

        // Verify password
        if (!VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for user: {Email}", user.Email);
            return Unauthorized("Invalid credentials");
        }

        // Check if user is active
        if (!user.IsActive)
        {
            _logger.LogWarning("Login attempt on inactive user: {Email}", user.Email);
            return Unauthorized("User account is inactive");
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = GenerateJwtToken(user);

        _logger.LogInformation("User logged in successfully: {Email}", user.Email);

        return Ok(new LoginResponse
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddHours(24).ToString("O"),
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Type = user.Type.ToString()
            }
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Check if email already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            return BadRequest("Email already registered");
        }

        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            UserName = request.Email.Split('@')[0], // Use email prefix as username
            PasswordHash = HashPassword(request.Password),
            Type = UserType.Customer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate JWT token
        var token = GenerateJwtToken(user);

        _logger.LogInformation("New user registered: {Email}", user.Email);

        return CreatedAtAction(nameof(Login), new LoginResponse
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddHours(24).ToString("O"),
            User = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Type = user.Type.ToString()
            }
        });
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
                new System.Security.Claims.Claim("email", user.Email),
                new System.Security.Claims.Claim("username", user.UserName),
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
