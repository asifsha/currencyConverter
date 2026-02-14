using System.Diagnostics;
using System.Security.Claims;
using Serilog;

namespace CurrencyConverter.Api.Middleware;

public class ObservabilityMiddleware
{
    private readonly RequestDelegate _next;

    public ObservabilityMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var sw = Stopwatch.StartNew();

        // Capture initial request info
        var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var clientId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
        var method = context.Request.Method;
        var path = context.Request.Path;

        // Add correlation ID for internal/external calls
        context.TraceIdentifier = Guid.NewGuid().ToString();

        // Add correlation ID to Response headers
        context.Response.Headers.Add("X-Correlation-ID", context.TraceIdentifier);

        try
        {
            await _next(context);
        }
        finally
        {
            sw.Stop();
            var statusCode = context.Response.StatusCode;
            var elapsedMs = sw.ElapsedMilliseconds;

            Log.Information(
                "Request {Method} {Path} from {ClientIp} (ClientId: {ClientId}) responded {StatusCode} in {ElapsedMilliseconds}ms | CorrelationId: {CorrelationId}",
                method,
                path,
                clientIp,
                clientId,
                statusCode,
                elapsedMs,
                context.TraceIdentifier
            );
        }
    }
}
