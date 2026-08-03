---
name: macro
description: "Query real-time macroeconomic data including GDP, unemployment, inflation (CPI, PCE), interest rates, housing data, and consumer sentiment. Use this skill whenever the user asks about macroeconomic conditions, economic indicators, the Fed, interest rates, inflation, employment, labor market, housing market, yield curve, or any broad economic data point."
---

# Macroeconomic Data

Query real-time macroeconomic data through the Expert System API by selecting supported FRED series and retrieving structured observations.

## Rules

- **If the API returns an error or empty results**, tell the user plainly rather than guessing.
- **If no API key is configured**, tell the user they need an API key to use Expert System and can get one at [expert-system.starmode.dev/account/api-keys](https://expert-system.starmode.dev/account/api-keys). Do not attempt the request without a key.
- **If the API returns a 401**, the key may be invalid or expired. Direct the user to [expert-system.starmode.dev/account/api-keys](https://expert-system.starmode.dev/account/api-keys) to check or regenerate their key.
- **Cross-reference with research.** For deeper context on macro trends, also use the `research` skill to find related expert takeaways and analysis.

## Authentication

All requests require a Bearer token. Get an API key at: https://expert-system.starmode.dev/account/api-keys

**Claude Code plugin users:** Your API key is configured automatically when you enable the plugin. The key is available as `${user_config.api_key}`.

**All other agents:** Set the `EXPERT_SYSTEM_API_KEY` environment variable in your shell profile or `.env` file.

Include on all requests: `Authorization: Bearer <api_key>`

## Workflow

1. **Resolve** — Identify the appropriate FRED series. If the series ID is uncertain, call `GET /macro/series?query=...` to search the supported catalog.
2. **Fetch** — Call `POST /macro/observations` with one series for simple questions or a batch for comparisons.
3. **Check partial failures** — Inspect both `items` and `errors`; a batch can return successful series and per-series errors together with status 200.
4. **Present** — Format clearly, highlighting trends, observation dates, units, transformations, and the specific indicators the user asked about.
5. **Enrich** — Use the `research` skill to search for related expert analysis if it would add value.

Keep each series at its native frequency unless the comparison requires a common lower frequency. Never imply that the API interpolates, forward-fills, or aligns observations. For mixed-frequency comparisons, either discuss each native timeline explicitly or request lower-frequency aggregation with `avg`, `sum`, or `eop`.

Available data: GDP & real economy, labor market (unemployment, payrolls, JOLTS), inflation (CPI, PCE, trimmed-mean), wages & income, monetary policy & Fed liquidity, interest rates & yield curve, credit & financial stress, housing (starts, permits, prices, mortgage rates), and consumer sentiment.

## API Reference

Base URL: `https://expert-system.starmode.dev/api/v1`

### Series Catalog — `GET /macro/series`

Optional query parameter: `query`. Search results include the series ID, description, category, native frequency, native units, and FRED source URL.

The response envelope is `{ "items": [...] }`. Use the returned canonical series IDs in observation requests rather than guessing unsupported IDs.

### Observations — `POST /macro/observations`

**Single-series body:**

```json
{
  "series": [{ "id": "UNRATE", "lastN": 12, "units": "lin" }]
}
```

**Mixed-frequency comparison:**

```json
{
  "series": [
    { "id": "UNRATE", "lastN": 12 },
    {
      "id": "ICSA",
      "lastN": 12,
      "frequency": "m",
      "aggregationMethod": "avg"
    }
  ]
}
```

Send one to five unique series. Each series accepts either `lastN` (default 12, maximum 120) or both `startDate` and `endDate`. Set `units` to one of `lin`, `chg`, `ch1`, `pch`, `pc1`, `pca`, `cch`, or `cca`. To request a lower frequency, set `frequency` and `aggregationMethod` (`avg`, `sum`, or `eop`); upsampling is rejected.

Transformation semantics: `lin` returns levels; `chg` returns period change; `ch1` returns year-ago change; `pch` returns period percent change; `pc1` returns year-ago percent change; `pca` returns compounded annualized percent change; `cch` and `cca` return continuously compounded period and annualized changes.

The response contains `asOf`, successful `items`, and per-series `errors`. Each item includes `seriesId`, description, source URL, native and returned frequency, native units, transformation, and dated numeric observations. Never treat `asOf` as the date of every observation; report the actual observation dates.
