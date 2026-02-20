namespace AppilicationProcesserAPI.Models
{
    public record RegisterRequest(string FirstName, string LastName, string Email, string Password);
    public record RegisterResponse(Guid UserId, string Email, string Role);

    public record LoginRequest(string Email, string Password);
    public record LoginResponse(string Token, string Role);
}