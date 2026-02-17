using CurrencyConverter.Api.Providers;

public interface IExchangeRateProviderFactory
{
    IExchangeRateProvider Create();
}
