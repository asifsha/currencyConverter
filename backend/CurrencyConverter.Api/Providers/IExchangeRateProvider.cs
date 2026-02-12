
using CurrencyConverter.Api.Models;

namespace CurrencyConverter.Api.Providers;

public interface IExchangeRateProvider
{
    Task<LatestRatesDto> GetLatestAsync(string baseCurrency);
    Task<decimal> ConvertAsync(string from, string to, decimal amount);
    Task<PagedResult<HistoricalRateDto>> GetHistoricalAsync(string baseCurrency, DateTime start, DateTime end, int page, int pageSize);
}
