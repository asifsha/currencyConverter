using CurrencyConverter.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CurrencyConverter.Api.Controllers;

[ApiController]
[Route ("api/v{version:apiVersion}/rates")]
[ApiVersion ("1.0")]
[Authorize]
public class RatesController : ControllerBase {
    private readonly CurrencyRateService _service;
    public RatesController (CurrencyRateService service) => _service = service;

    [HttpGet ("latest")]
    [Authorize(Policy = "ConverterPolicy")]
    public async Task<IActionResult> Latest (string @base) {
        var result = await _service.GetLatestRatesAsync (@base);
        return Ok (result);
    }

    [HttpGet ("convert")]       
    [Authorize(Policy = "ConverterPolicy")]
    public async Task<IActionResult> Convert (string from, string to, decimal amount) {
        var result = await _service.ConvertAsync (from, to, amount);
        return Ok (new { result });
    }

    [HttpGet ("historical")]
    [Authorize(Policy = "HistoricalPolicy")]
    public async Task<IActionResult> Historical (string @base, DateTime start, DateTime end, int page = 1, int pageSize = 10) => Ok (await _service.GetHistoricalAsync (@base, start, end, page, pageSize));
}