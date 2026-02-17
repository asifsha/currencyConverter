using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CurrencyConverter.Api.Controllers;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using Xunit;

namespace CurrencyConverter.IntegrationTests;

public class RatesApiTests : IClassFixture<WebApplicationFactory<Program>> {
    private readonly HttpClient _client;

    public RatesApiTests (WebApplicationFactory<Program> factory) {
        _client = factory.CreateClient ();
    }

    /// <summary>
    /// Call protected endpoint without token → expect 401 Unauthorized
    /// </summary>
    [Fact]
    public async Task ConvertEndpoint_UnauthorizedWithoutToken () {
        var response = await _client.GetAsync ("/api/v1/rates/convert?from=USD&to=EUR&amount=10");
        Assert.Equal (HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Call login endpoint to get a JWT token
    /// </summary>
    private async Task<string> GetJwtTokenAsync (string username = "converter", string password = "password") {
        var loginResponse = await _client.PostAsJsonAsync ("/api/v1/auth/login", new LoginRequest {
            Username = username,
                Password = password
        });

        loginResponse.EnsureSuccessStatusCode (); // should return 200 OK

        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse> ();
        return loginResult?.Token ??
            throw new InvalidOperationException ("Token not returned from login");
    }

    private class LoginResponse {
        public string Token { get; set; } = string.Empty;
    }

    private async Task AuthenticateAsync () {
        var token = await GetJwtTokenAsync ();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue ("Bearer", token);
    }
    /// <summary>
    /// Call protected endpoint with token → expect 200 OK
    /// </summary>
    [Fact]
    public async Task ConvertEndpoint_WithToken_ReturnsSuccess () {
        // Get JWT token
        await AuthenticateAsync ();

        var response = await _client.GetAsync ("/api/v1/rates/convert?from=USD&to=EUR&amount=10");

        response.EnsureSuccessStatusCode (); // 200 OK
    }

    [Fact]
    public async Task GetLatestEndpoint_ReturnsSuccess () {
        await AuthenticateAsync ();
        var response = await _client.GetAsync ("/api/v1/rates/latest?base=USD");
        response.EnsureSuccessStatusCode (); // 200 OK
    }
}