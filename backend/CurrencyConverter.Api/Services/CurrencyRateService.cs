using CurrencyConverter.Api.Factories;
using CurrencyConverter.Api.Models;
using Microsoft.Extensions.Caching.Memory;

namespace CurrencyConverter.Api.Services;

public class CurrencyRateService {

    private readonly IMemoryCache _cache;

public CurrencyRateService(
    ExchangeRateProviderFactory factory,
    IMemoryCache cache)
{
    _factory = factory;
    _cache = cache;
}
    private static readonly string[] Blocked = { "TRY", "PLN", "THB", "MXN" };
    private readonly ExchangeRateProviderFactory _factory;

    private static void ValidateCurrency (string currency, string paramName, bool validateBlocked = true) {
        if (string.IsNullOrWhiteSpace (currency))
            throw new BadRequestException ($"{paramName} currency is required.");

        currency = currency.ToUpper ();

        if (currency.Length != 3 || !currency.All (char.IsLetter))
            throw new BadRequestException ($"{paramName} currency must be a 3-letter alphabetic code.");

        if (validateBlocked && Blocked.Contains (currency))
            throw new BadRequestException ($"{paramName} currency '{currency}' is not supported.");
    }
    public CurrencyRateService (ExchangeRateProviderFactory factory) => _factory = factory;

    public async Task<LatestRatesDto> GetLatestRatesAsync(string baseCurrency)
{
    var cacheKey = $"latest_{baseCurrency}";

    if (_cache.TryGetValue(cacheKey, out LatestRatesDto cachedResult))
        return cachedResult;

    var result = await _factory.Create().GetLatestAsync(baseCurrency);

    _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

    return result;
}


    public async Task<decimal> ConvertAsync (string from, string to, decimal amount) {
        ValidateCurrency (from, "Source");
        ValidateCurrency (to, "Target");

        if (amount <= 0)
            throw new BadRequestException ("Amount must be greater than zero.");

        return await _factory.Create ().ConvertAsync (from.ToUpper (), to.ToUpper (), amount);
    }

    public async Task<PagedResult<HistoricalRateDto>> GetHistoricalAsync (
        string baseCurrency,
        DateTime start,
        DateTime end,
        int page,
        int pageSize) {
        ValidateCurrency (baseCurrency, "Base", false);

        if (start > end)
            throw new BadRequestException ("Start date must be earlier than or equal to end date.");

        if (end > DateTime.UtcNow.Date)
            throw new BadRequestException ("End date cannot be in the future.");

        if (page < 1)
            throw new BadRequestException ("Page must be greater than or equal to 1.");

        if (pageSize < 1 || pageSize > 100)
            throw new BadRequestException ("PageSize must be between 1 and 100.");

        return await _factory.Create ()
            .GetHistoricalAsync (baseCurrency.ToUpper (), start, end, page, pageSize);
    }

}