
using CurrencyConverter.Api.Models;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Http.Json;

namespace CurrencyConverter.Api.Providers;

public class FrankfurterExchangeRateProvider : IExchangeRateProvider
{
    private readonly IHttpClientFactory _factory;
    private readonly IMemoryCache _cache;

    public FrankfurterExchangeRateProvider(IHttpClientFactory factory, IMemoryCache cache)
    {
        _factory = factory;
        _cache = cache;
    }

    public async Task<LatestRatesDto> GetLatestAsync(string baseCurrency)
    {
        return await _cache.GetOrCreateAsync($"latest-{baseCurrency}", async e =>
        {
            e.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            var client = _factory.CreateClient("Frankfurter");
            return await client.GetFromJsonAsync<LatestRatesDto>($"latest?from={baseCurrency}");
        })!;
    }

    public async Task<decimal> ConvertAsync(string from, string to, decimal amount)
    {
        var client = _factory.CreateClient("Frankfurter");
        var res = await client.GetFromJsonAsync<LatestRatesDto>($"latest?from={from}&to={to}");
        return amount * res!.Rates[to];
    }

    public async Task<PagedResult<HistoricalRateDto>> GetHistoricalAsync(string baseCurrency, DateTime start, DateTime end, int page, int pageSize)
    {
        var client = _factory.CreateClient("Frankfurter");
        var data = await client.GetFromJsonAsync<HistoricalResponse>($"{start:yyyy-MM-dd}..{end:yyyy-MM-dd}?from={baseCurrency}");
        var list = data!.Rates.Select(r => new HistoricalRateDto { Date = r.Key, Rates = r.Value }).ToList();
        return PagedResult<HistoricalRateDto>.Create(list, page, pageSize);
    }
}
