using System.Text;
using CurrencyConverter.Api.Factories;
using CurrencyConverter.Api.Middleware;
using CurrencyConverter.Api.Providers;
using CurrencyConverter.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Polly.Extensions.Http;
using Serilog;
// using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder (args);
builder.Host.UseSerilog ((_, lc) => lc.WriteTo.Console ());

builder.Services.AddControllers ();
builder.Services.AddEndpointsApiExplorer ();
builder.Services.AddSwaggerGen (c => {
    c.SwaggerDoc ("v1", new OpenApiInfo {
        Title = "CurrencyConverter API",
            Version = "v1"
    });
});

builder.Services.AddApiVersioning (o =>

    {
        o.DefaultApiVersion = new ApiVersion (1, 0);
        o.AssumeDefaultVersionWhenUnspecified = true;
        o.ApiVersionReader = new UrlSegmentApiVersionReader ();
    });

builder.Services.AddAuthentication (JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer (o => {
        o.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey (Encoding.UTF8.GetBytes ("DEV_SECRET_KEY"))
        };
    });

builder.Services.AddAuthorization ();
builder.Services.AddMemoryCache ();

builder.Services.AddHttpClient ("Frankfurter", c => {
    c.BaseAddress = new Uri ("https://api.frankfurter.app/");
});

builder.Services.AddScoped<IExchangeRateProvider, FrankfurterExchangeRateProvider> ();
builder.Services.AddScoped<ExchangeRateProviderFactory> ();
builder.Services.AddScoped<CurrencyRateService> ();
builder.Services.AddApiVersioning (options => {
    options.DefaultApiVersion = new ApiVersion (1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader ();
});

builder.Services.AddVersionedApiExplorer (options => {
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

var app = builder.Build ();
app.UseMiddleware<RequestLoggingMiddleware> ();
app.UseMiddleware<ExceptionMiddleware>();

var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider> ();

if (app.Environment.IsDevelopment ()) {
    app.UseSwagger ();
    app.UseSwaggerUI (options => {
        foreach (var description in provider.ApiVersionDescriptions) {
            options.SwaggerEndpoint (
                $"/swagger/{description.GroupName}/swagger.json",
                description.GroupName.ToUpperInvariant ());
        }
    });
}

app.UseAuthentication ();
app.UseAuthorization ();
app.MapControllers ();
app.Run ();