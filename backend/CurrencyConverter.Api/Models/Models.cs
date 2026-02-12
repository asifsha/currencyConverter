
namespace CurrencyConverter.Api.Models;

public record LatestRatesDto(string Base, Dictionary<string, decimal> Rates);

public class HistoricalRateDto
{
    public string Date { get; set; } = string.Empty;
    public Dictionary<string, decimal> Rates { get; set; } = new();
}

public class HistoricalResponse
{
    public Dictionary<string, Dictionary<string, decimal>> Rates { get; set; } = new();
}

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int Total { get; set; }

    public static PagedResult<T> Create(List<T> src, int page, int size)
        => new()
        {
            Items = src.Skip((page - 1) * size).Take(size),
            Total = src.Count
        };
}
