using AppilicationProcesserAPI.Data;
using AppilicationProcesserAPI.Entities;
using AppilicationProcesserAPI.Models;
using AppilicationProcesserAPI.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AppilicationProcesserAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("Email and password are required.");

            var email = req.Email.Trim().ToLowerInvariant();

            var exists = await _context.UserAccounts.AnyAsync(u => u.Email.ToLower() == email);
            if (exists) return BadRequest("Email already exists.");

            PasswordHasher.CreateHash(req.Password, out var hash, out var salt);

            var user = new UserAccount
            {
                Email = email,
                UserName = email,
                FirstName = req.FirstName.Trim(),
                LastName = req.LastName.Trim(),
                Role = "User",
                PasswordHash = hash,
                PasswordSalt = salt
            };

            _context.UserAccounts.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new RegisterResponse(user.UserId, user.Email, user.Role));
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("Email and password are required.");

            var email = req.Email.Trim().ToLowerInvariant();

            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
            if (user == null) return Unauthorized("Invalid email or password.");

            var ok = PasswordHasher.Verify(req.Password, user.PasswordHash, user.PasswordSalt);
            if (!ok) return Unauthorized("Invalid email or password.");

            var token = CreateJwt(user);
            return Ok(new LoginResponse(token, user.Role));
        }

        private string CreateJwt(UserAccount user)
        {
            var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Missing Jwt:Key");
            var issuer = _config["Jwt:Issuer"] ?? "AubgRecruitment";
            var audience = _config["Jwt:Audience"] ?? "AubgRecruitment";

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),

            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var jwt = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(jwt);


        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            var user = await _context.UserAccounts
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (user == null)
                return NotFound();

            return Ok(new CurrentUserResponse
            {
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role
            });
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            var user = await _context.UserAccounts
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (user == null)
                return NotFound();

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}