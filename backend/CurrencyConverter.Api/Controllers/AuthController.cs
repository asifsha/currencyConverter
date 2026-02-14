using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace CurrencyConverter.Api.Controllers;

[ApiController]
[Route ("api/v{version:apiVersion}/auth")]
[ApiVersion ("1.0")]
public class AuthController : ControllerBase {
    private readonly IConfiguration _config;

    public AuthController (IConfiguration config) {
        _config = config;
    }

    [HttpPost ("login")]
    [AllowAnonymous]
    public IActionResult Login ([FromBody] LoginRequest request) {
        // Simple hard-coded user check (replace with DB in production)
        if (request.Username == "converter" && request.Password == "password") {
            var token = GenerateJwtToken (request.Username, new [] { "Converter" });
            return Ok (new { token });
        }
        if (request.Username == "admin" && request.Password == "password") {
            var token = GenerateJwtToken (request.Username, new [] { "Admin" });
            return Ok (new { token });
        }

        return Unauthorized (new { error = "Invalid username or password" });
    }

    private string GenerateJwtToken (string username, string[] roles) {
        var jwtSection = _config.GetSection ("Jwt");
        var key = new SymmetricSecurityKey (
            Encoding.UTF8.GetBytes (jwtSection["Key"]));
        var creds = new SigningCredentials (key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim> {
            new Claim (JwtRegisteredClaimNames.Sub, username),
            new Claim (JwtRegisteredClaimNames.Jti, Guid.NewGuid ().ToString ())
        };

        claims.AddRange (roles.Select (r => new Claim (ClaimTypes.Role, r)));

        var token = new JwtSecurityToken (
            issuer: _config["Jwt:Issuer"],
            audience : _config["Jwt:Audience"],
            claims : claims,
            expires : DateTime.UtcNow.AddHours (1),
            signingCredentials : creds
        );

        return new JwtSecurityTokenHandler ().WriteToken (token);
    }
}

public class LoginRequest {
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}