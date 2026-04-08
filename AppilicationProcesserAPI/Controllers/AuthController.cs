using AppilicationProcesserAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
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
        private const string DefaultRoleName = "User";
        private const int ActiveStatus = 1;

        private readonly IConfiguration _config;
        private readonly string _connectionString;
        private readonly PasswordHasher<string> _passwordHasher = new();

        public AuthController(IConfiguration config)
        {
            _config = config;
            _connectionString = _config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Missing DefaultConnection");
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) ||
                string.IsNullOrWhiteSpace(req.Password) ||
                string.IsNullOrWhiteSpace(req.FirstName) ||
                string.IsNullOrWhiteSpace(req.LastName))
            {
                return BadRequest("Email, password, first name, and last name are required.");
            }

            var email = req.Email.Trim().ToLowerInvariant();
            var firstName = req.FirstName.Trim();
            var lastName = req.LastName.Trim();
            var userId = Guid.NewGuid();

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Check if email already exists
            await using (var checkCmd = new SqlCommand(
                "SELECT COUNT(1) FROM dbo.UserCredentials WHERE Email = @Email", connection))
            {
                checkCmd.Parameters.AddWithValue("@Email", email);

                var exists = (int)(await checkCmd.ExecuteScalarAsync() ?? 0) > 0;
                if (exists)
                    return BadRequest("Email already exists.");
            }

            // Get default role id from Roles table
            Guid roleId;
            await using (var roleCmd = new SqlCommand(
                "SELECT TOP 1 RoleId FROM dbo.Roles WHERE Name = @Name", connection))
            {
                roleCmd.Parameters.AddWithValue("@Name", DefaultRoleName);

                var roleObj = await roleCmd.ExecuteScalarAsync();
                if (roleObj == null || roleObj == DBNull.Value)
                    return StatusCode(500, $"Role '{DefaultRoleName}' was not found in dbo.Roles.");

                roleId = (Guid)roleObj;
            }

            // Hash password
            var hashedPassword = _passwordHasher.HashPassword(email, req.Password);

            await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

            try
            {
                // Insert into Users
                await using (var userCmd = new SqlCommand(@"
                    INSERT INTO dbo.Users
                        (UserId, DepartmentId, RoleId, FirstName, LastName, CvUrl, CvFileName, AcademicYear, StudyMajor)
                    VALUES
                        (@UserId, NULL, @RoleId, @FirstName, @LastName, NULL, NULL, NULL, NULL)", connection, transaction))
                {
                    userCmd.Parameters.AddWithValue("@UserId", userId);
                    userCmd.Parameters.AddWithValue("@RoleId", roleId);
                    userCmd.Parameters.AddWithValue("@FirstName", firstName);
                    userCmd.Parameters.AddWithValue("@LastName", lastName);

                    await userCmd.ExecuteNonQueryAsync();
                }

                // Insert into UserCredentials
                await using (var credCmd = new SqlCommand(@"
                    INSERT INTO dbo.UserCredentials
                        (Email, Password, UserId, Status)
                    VALUES
                        (@Email, @Password, @UserId, @Status)", connection, transaction))
                {
                    credCmd.Parameters.AddWithValue("@Email", email);
                    credCmd.Parameters.AddWithValue("@Password", hashedPassword);
                    credCmd.Parameters.AddWithValue("@UserId", userId);
                    credCmd.Parameters.AddWithValue("@Status", ActiveStatus);

                    await credCmd.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();

                return Ok(new RegisterResponse(userId, email, DefaultRoleName));
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("Email and password are required.");

            var email = req.Email.Trim().ToLowerInvariant();

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var cmd = new SqlCommand(@"
        SELECT TOP 1
            u.UserId,
            u.FirstName,
            u.LastName,
            u.DepartmentId,
            u.RoleId,
            u.AdminClubId,
            r.Name AS RoleName,
            uc.Email,
            uc.Password,
            uc.Status
        FROM dbo.UserCredentials uc
        INNER JOIN dbo.Users u ON u.UserId = uc.UserId
        INNER JOIN dbo.Roles r ON r.RoleId = u.RoleId
        WHERE uc.Email = @Email", connection);

            cmd.Parameters.AddWithValue("@Email", email);

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return Unauthorized("Invalid email or password.");

            var userId = reader.GetGuid(reader.GetOrdinal("UserId"));
            var firstName = reader.GetString(reader.GetOrdinal("FirstName"));
            var lastName = reader.GetString(reader.GetOrdinal("LastName"));
            var roleName = reader.GetString(reader.GetOrdinal("RoleName"));
            var dbEmail = reader.GetString(reader.GetOrdinal("Email"));
            var storedPassword = reader.GetString(reader.GetOrdinal("Password"));
            var status = reader.GetInt32(reader.GetOrdinal("Status"));

            Guid? departmentId = reader.IsDBNull(reader.GetOrdinal("DepartmentId"))
                ? null
                : reader.GetGuid(reader.GetOrdinal("DepartmentId"));

            Guid? clubId = null;
            if (departmentId != null)
            {
                using var depconnection = new SqlConnection(_connectionString);
                await depconnection.OpenAsync();
                using var getClubForDepartment = new SqlCommand(@"
                SELECT TOP 1 [ClubId] 
                FROM [Departments] 
                WHERE [DepartmentId] = @departmentId", depconnection);
                getClubForDepartment.Parameters.AddWithValue("@departmentId", departmentId);
                using var readerDep = await getClubForDepartment.ExecuteReaderAsync().ConfigureAwait(false);
                if (readerDep.Read())
                {
                    clubId = readerDep.GetGuid(0);
                }
            }

            Guid? clubAdminId = reader.IsDBNull(reader.GetOrdinal("AdminClubId"))
                ? null
                : reader.GetGuid(reader.GetOrdinal("AdminClubId"));

            if (status != ActiveStatus)
                return Unauthorized("Account is inactive.");

            var verifyResult = _passwordHasher.VerifyHashedPassword(dbEmail, storedPassword, req.Password);
            if (verifyResult == PasswordVerificationResult.Failed)
                return Unauthorized("Invalid email or password.");

            var token = CreateJwt(userId, dbEmail, roleName, firstName, lastName, departmentId, clubId, clubAdminId);

            return Ok(new
            {
                token,
                user = new
                {

                    userId,
                    email = dbEmail,
                    firstName,
                    lastName,
                    role = roleName,
                    departmentId,
                    clubId = (string?)null
                }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var cmd = new SqlCommand(@"
                SELECT TOP 1
                    uc.Email,
                    u.FirstName,
                    u.LastName,
                    r.Name AS RoleName
                FROM dbo.Users u
                INNER JOIN dbo.UserCredentials uc ON uc.UserId = u.UserId
                INNER JOIN dbo.Roles r ON r.RoleId = u.RoleId
                WHERE u.UserId = @UserId", connection);

            cmd.Parameters.AddWithValue("@UserId", userId);

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return NotFound();

            return Ok(new CurrentUserResponse
            {
                Email = reader.GetString(reader.GetOrdinal("Email")),
                FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
                LastName = reader.GetString(reader.GetOrdinal("LastName")),
                Role = reader.GetString(reader.GetOrdinal("RoleName"))
            });
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
                return BadRequest("First name and last name are required.");

            var userId = Guid.Parse(userIdClaim.Value);

            await using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var cmd = new SqlCommand(@"
                UPDATE dbo.Users
                SET FirstName = @FirstName,
                    LastName = @LastName
                WHERE UserId = @UserId", connection);

            cmd.Parameters.AddWithValue("@FirstName", request.FirstName.Trim());
            cmd.Parameters.AddWithValue("@LastName", request.LastName.Trim());
            cmd.Parameters.AddWithValue("@UserId", userId);

            var rows = await cmd.ExecuteNonQueryAsync();

            if (rows == 0)
                return NotFound();

            return NoContent();
        }

        private string CreateJwt(Guid userId, string email, string role, string firstName, string lastName, Guid? departmentId, Guid? clubId, Guid? adminClubId)
        {
            var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Missing Jwt:Key");
            var issuer = _config["Jwt:Issuer"] ?? "AubgRecruitment";
            var audience = _config["Jwt:Audience"] ?? "AubgRecruitment";

            var adminClubIdValue = adminClubId.HasValue ? adminClubId.Value.ToString() : string.Empty;
            var departmentIdValue = departmentId.HasValue ? departmentId.Value.ToString() : string.Empty;
            var clubIdValue = clubId.HasValue ? clubId.Value.ToString() : string.Empty;

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Role, role),
                new Claim("firstName", firstName),
                new Claim("lastName", lastName),
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(CustomClaimNames.AdminClubId, adminClubIdValue),
                new Claim(CustomClaimNames.DepartmentId, departmentIdValue),
                new Claim(CustomClaimNames.ClubId, clubIdValue)
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
    }
}

public static class CustomClaimNames
{
    public const string ClubId = "clubId";
    public const string AdminClubId = "adminClubId";
    public const string DepartmentId = "departmentId";
}