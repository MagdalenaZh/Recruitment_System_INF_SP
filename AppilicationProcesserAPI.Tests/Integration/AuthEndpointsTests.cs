using System.Net;
using System.Net.Http.Json;
using AppilicationProcesserAPI.Models;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Integration;

/// <summary>
/// Tests for AuthController endpoints that do NOT require a real database.
/// Validation (BadRequest) paths are tested here; DB-dependent paths
/// (actual login/register) require a live SQL Server and are excluded.
/// </summary>
public class AuthEndpointsTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthEndpointsTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ── Register validation ──────────────────────────────────────────────────

    [Fact]
    public async Task Register_MissingEmail_ReturnsBadRequest()
    {
        var req = new RegisterRequest("Alice", "Smith", "", "pass123");

        var response = await _client.PostAsJsonAsync("/api/auth/register", req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_MissingPassword_ReturnsBadRequest()
    {
        var req = new RegisterRequest("Alice", "Smith", "alice@example.com", "");

        var response = await _client.PostAsJsonAsync("/api/auth/register", req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_MissingFirstName_ReturnsBadRequest()
    {
        var req = new RegisterRequest("", "Smith", "alice@example.com", "pass123");

        var response = await _client.PostAsJsonAsync("/api/auth/register", req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_MissingLastName_ReturnsBadRequest()
    {
        var req = new RegisterRequest("Alice", "", "alice@example.com", "pass123");

        var response = await _client.PostAsJsonAsync("/api/auth/register", req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_WhitespaceEmail_ReturnsBadRequest()
    {
        var req = new RegisterRequest("Alice", "Smith", "   ", "pass123");

        var response = await _client.PostAsJsonAsync("/api/auth/register", req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ── Login validation ─────────────────────────────────────────────────────

    [Fact]
    public async Task Login_MissingEmail_ReturnsBadRequest()
    {
        var req = new LoginRequest("", "pass123");

        var response = await _client.PostAsJsonAsync("/api/auth/login", req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_MissingPassword_ReturnsBadRequest()
    {
        var req = new LoginRequest("alice@example.com", "");

        var response = await _client.PostAsJsonAsync("/api/auth/login", req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WhitespaceCredentials_ReturnsBadRequest()
    {
        var req = new LoginRequest("   ", "   ");

        var response = await _client.PostAsJsonAsync("/api/auth/login", req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
