using Xunit;
using Moq;
using CurrencyConverter.Api.Services;
using CurrencyConverter.Api.Providers;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using CurrencyConverter.Api.Factories;

public class CurrencyRateServiceTests
{
    [Fact]
    public async Task ConvertAsync_ThrowsForBlockedCurrency()
    {
        var mockFactory = new Mock<IExchangeRateProviderFactory>();
        var service = new CurrencyRateService(mockFactory.Object);

        await Assert.ThrowsAsync<BadRequestException>(() => service.ConvertAsync("TRY", "USD", 100));
    }

    [Fact]
    public async Task ConvertAsync_ReturnsExpectedValue()
    {
        var mockProvider = new Mock<IExchangeRateProvider>();
        mockProvider.Setup(x => x.ConvertAsync("USD", "EUR", 2m)).ReturnsAsync(1.8m);

        var mockFactory = new Mock<IExchangeRateProviderFactory>();
        mockFactory.Setup(f => f.Create()).Returns(mockProvider.Object);

        var service = new CurrencyRateService(mockFactory.Object);

        var result = await service.ConvertAsync("USD", "EUR", 2m);

        Assert.Equal(1.8m, result);
    }
}
