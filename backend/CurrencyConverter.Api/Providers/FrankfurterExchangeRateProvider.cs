using CurrencyConverter.Api.Models;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Http.Json;

namespace CurrencyConverter.Api.Providers;

public class FrankfurterExchangeRateProvider : IExchangeRateProvider
{
    private readonly HttpClient _client;
    private readonly IMemoryCache _cache;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public FrankfurterExchangeRateProvider(HttpClient client, IMemoryCache cache, IHttpContextAccessor httpContextAccessor)
    {
        _client = client ?? throw new ArgumentNullException(nameof(client));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    private void AddCorrelationHeader()
    {
        var correlationId = _httpContextAccessor.HttpContext?.TraceIdentifier;
        if (!string.IsNullOrEmpty(correlationId) && !_client.DefaultRequestHeaders.Contains("X-Correlation-ID"))
        {
            _client.DefaultRequestHeaders.Add("X-Correlation-ID", correlationId);
        }
    }

    public async Task<LatestRatesDto> GetLatestAsync(string baseCurrency)
    {
        AddCorrelationHeader();

        return await _cache.GetOrCreateAsync($"latest-{baseCurrency}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return await _client.GetFromJsonAsync<LatestRatesDto>($"latest?from={baseCurrency}")!;
        });
    }

    public async Task<decimal> ConvertAsync(string from, string to, decimal amount)
    {
        AddCorrelationHeader();

        var res = await _client.GetFromJsonAsync<LatestRatesDto>($"latest?from={from}&to={to}");
        if (res == null || !res.Rates.ContainsKey(to))
            throw new InvalidOperationException($"Currency conversion failed for {from} -> {to}");

        return amount * res.Rates[to];
    }

    public async Task<PagedResult<HistoricalRateDto>> GetHistoricalAsync(string baseCurrency, DateTime start, DateTime end, int page, int pageSize)
    {
        AddCorrelationHeader();

        var data = await _client.GetFromJsonAsync<HistoricalResponse>($"{start:yyyy-MM-dd}..{end:yyyy-MM-dd}?from={baseCurrency}");
        if (data == null || data.Rates == null)
            throw new InvalidOperationException("Failed to fetch historical rates");

        var list = data.Rates
            .Select(r => new HistoricalRateDto { Date = r.Key, Rates = r.Value })
            .ToList();

        return PagedResult<HistoricalRateDto>.Create(list, page, pageSize);
    }
}
