
using CurrencyConverter.Api.Providers;

namespace CurrencyConverter.Api.Factories;

public class ExchangeRateProviderFactory
{
    private readonly IServiceProvider _sp;
    public ExchangeRateProviderFactory(IServiceProvider sp) => _sp = sp;
    public IExchangeRateProvider Create() => _sp.GetRequiredService<IExchangeRateProvider>();
}
