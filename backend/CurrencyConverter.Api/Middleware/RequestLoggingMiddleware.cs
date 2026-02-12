
using Serilog;

namespace CurrencyConverter.Api.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    public RequestLoggingMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        await _next(ctx);
        sw.Stop();
        Log.Information("{Method} {Path} {Status} {Elapsed}ms",
            ctx.Request.Method, ctx.Request.Path, ctx.Response.StatusCode, sw.ElapsedMilliseconds);
    }
}
