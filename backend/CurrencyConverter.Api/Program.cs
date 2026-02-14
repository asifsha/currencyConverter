using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using CurrencyConverter.Api.Factories;
using CurrencyConverter.Api.Middleware;
using CurrencyConverter.Api.Providers;
using CurrencyConverter.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Polly;
using Polly.Extensions.Http;
using Polly.CircuitBreaker;
using Polly.Timeout;


var builder = WebApplication.CreateBuilder (args);
builder.Host.UseSerilog((ctx, lc) => lc
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
);

builder.Services.AddControllers ();
builder.Services.AddEndpointsApiExplorer ();

// -----------------------
// Swagger with JWT support
// -----------------------
builder.Services.AddSwaggerGen (c => {
    c.SwaggerDoc ("v1", new OpenApiInfo {
        Title = "CurrencyConverter API",
            Version = "v1"
    });

    // JWT Bearer authentication for Swagger
    c.AddSecurityDefinition ("Bearer", new OpenApiSecurityScheme {
        Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
    });

    c.AddSecurityRequirement (new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                }
            },
            Array.Empty<string> ()
        }
    });
});

builder.Services.AddHealthChecks ();

// -----------------------
// API Versioning
// -----------------------
builder.Services.AddApiVersioning (o => {
    o.DefaultApiVersion = new ApiVersion (1, 0);
    o.AssumeDefaultVersionWhenUnspecified = true;
    o.ApiVersionReader = new UrlSegmentApiVersionReader ();
});

builder.Services.AddVersionedApiExplorer (options => {
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// -----------------------
// JWT Authentication
// -----------------------


var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// -----------------------
// Authorization policies (role-based)
// -----------------------
builder.Services.AddAuthorization (options => {
    // Example policy for converter/admin endpoints
    options.AddPolicy ("ConverterPolicy", policy =>
        policy.RequireRole ("Converter", "Admin"));
});

builder.Services.AddHttpContextAccessor();

// -----------------------
// Memory Cache & Rate Limiting
// -----------------------
builder.Services.AddMemoryCache ();

builder.Services.AddRateLimiter (options => {
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string> (httpContext => {
        string partitionKey;
        if (httpContext.User?.Identity?.IsAuthenticated == true) {
            partitionKey = httpContext.User.FindFirst (ClaimTypes.NameIdentifier)?.Value ??
                httpContext.User.Identity.Name ?? "anonymous";
        } else {
            partitionKey = httpContext.Connection.RemoteIpAddress?.ToString () ?? "anonymous";
        }

        return RateLimitPartition.GetTokenBucketLimiter (partitionKey, _ => new TokenBucketRateLimiterOptions {
            TokenLimit = 60,
                TokensPerPeriod = 60,
                ReplenishmentPeriod = TimeSpan.FromMinutes (1),
                AutoReplenishment = true,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
        });
    });

    options.OnRejected = async (context, token) => {
        var response = context.HttpContext.Response;
        response.StatusCode = StatusCodes.Status429TooManyRequests;
        response.ContentType = "application/json";
        await response.WriteAsync ("{\"error\":\"Too many requests. Please try again later.\"}", cancellationToken : token);
    };
});

// -----------------------
// HttpClient for external API
// -----------------------
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();

builder.Services.AddHttpClient<FrankfurterExchangeRateProvider>(c =>
{
    c.BaseAddress = new Uri("https://api.frankfurter.app/");
})
.AddPolicyHandler(GetRetryPolicy())
.AddPolicyHandler(GetCircuitBreakerPolicy());

builder.Services.AddScoped<IExchangeRateProvider>(sp =>
    sp.GetRequiredService<FrankfurterExchangeRateProvider>());

builder.Services.AddScoped<CurrencyRateService>();



// -----------------------
// Dependency Injection
// -----------------------

builder.Services.AddScoped<ExchangeRateProviderFactory> ();


// -----------------------
// Build App
// -----------------------
var app = builder.Build ();

app.UseMiddleware<ObservabilityMiddleware>();

app.UseMiddleware<RequestLoggingMiddleware> ();
app.UseMiddleware<ExceptionMiddleware> ();

// -----------------------
// Dev JWT token endpoint
// -----------------------
if (app.Environment.IsDevelopment ()) {
    app.MapPost ("/dev/token", (TokenRequest req) => {
        var claims = new List<Claim> {
        new Claim (ClaimTypes.Name, req.Username ?? "dev"),
        new Claim (ClaimTypes.NameIdentifier, req.Username ?? "dev")
        };

        if (req.Roles != null) {
            foreach (var r in req.Roles)
                claims.Add (new Claim (ClaimTypes.Role, r));
        }

        var key = new SymmetricSecurityKey (Encoding.UTF8.GetBytes (jwtKey));
        var creds = new SigningCredentials (key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken (
            claims: claims,
            expires: DateTime.UtcNow.AddHours (8),
            signingCredentials: creds
        );

        return Results.Ok (new { token = new JwtSecurityTokenHandler ().WriteToken (token) });
    }).AllowAnonymous ();
}

// -----------------------
// Swagger UI
// -----------------------
var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider> ();

if (app.Environment.IsDevelopment ()) {
    app.UseSwagger ();
    app.UseSwaggerUI (options => {
        foreach (var description in provider.ApiVersionDescriptions) {
            options.SwaggerEndpoint (
                $"/swagger/{description.GroupName}/swagger.json",
                description.GroupName.ToUpperInvariant ());
        }
        options.InjectJavascript("/swagger-autologin.js");
    });
}

// -----------------------
// Middleware
// -----------------------
app.UseAuthentication (); // ✅ JWT validation
app.UseRateLimiter ();
app.UseAuthorization ();


app.MapControllers ();

app.Run ();



static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(
            retryCount: 3,
            retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))
        );
}

static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(
            handledEventsAllowedBeforeBreaking: 3,
            durationOfBreak: TimeSpan.FromSeconds(30)
        );
}

record TokenRequest (string? Username, string[] ? Roles);