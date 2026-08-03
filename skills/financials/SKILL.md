---
name: financials
description: "Query deterministic, normalized SEC company financials by ticker or CIK, including revenue, income, balance-sheet, cash-flow, and per-share metrics with optional filing provenance. Use whenever the user asks for reported company financials, historical financial trends, SEC-derived metrics, financial statement comparisons, or the source filing behind a reported value."
---

# Company Financials

Query normalized SEC EDGAR company-facts data through the Expert System API. Use canonical metric IDs and preserve reported period semantics; never infer missing values or turn year-to-date cash flow into a standalone quarter.

## Rules

- **Do not invent or silently derive SEC facts.** Report unavailable metrics as unavailable. Only calculate ratios or changes when the user requests them, using compatible dates, units, and period types and showing the calculation.
- **Use provenance for auditability.** Add `include=provenance` when the user asks for a filing, accession number, SEC concept, or primary-source verification.
- **Respect period types.** `instant` is measured on a date; `quarter` is a standalone fiscal quarter; `yearToDate` is a filed multi-quarter duration with `start`; `annual` is a fiscal year.
- **Do not assume observations are consecutive.** A quarterly `limit` returns the newest available standalone-quarter facts. Fiscal Q4 can be absent because a 10-K reports an annual duration rather than a standalone fourth quarter.
- **Describe provenance precisely.** The returned filing is the SEC fact selected for that observation and can be a later filing that repeats a comparative period; do not label it as the observation's first filing unless verified separately.
- **If no API key is configured**, direct the user to [expert-system.starmode.dev/account/api-keys](https://expert-system.starmode.dev/account/api-keys). Do not attempt the request without a key.
- **If the API returns an error**, report its machine-readable code and message rather than guessing.

## Authentication

All requests require `Authorization: Bearer <api_key>`.

**Claude Code plugin users:** Use the configured `${user_config.api_key}`.

**All other agents:** Use the `EXPERT_SYSTEM_API_KEY` environment variable.

Base URL: `https://expert-system.starmode.dev/api/v1`

## Workflow

1. **Resolve the company** — Use a ticker such as `AAPL` or a numeric SEC CIK, with or without a `CIK` prefix or leading zeroes.
2. **Discover metrics** — Call `GET /financials/{symbol}/metrics?period=quarterly|annual` when availability is uncertain. Use `GET /financials/metrics` for the global v1 catalog.
3. **Fetch data** — Use the single-metric GET for one series or the batch POST for several related metrics.
4. **Validate comparability** — Compare observations only when dates, units, and period types are compatible. Quarterly cash-flow results can legitimately be `yearToDate`.
5. **Present and source** — Report company, CIK, metric, period, unit, observation dates, values, and period types. Include SEC provenance when requested.

## API Reference

### Global Catalog — `GET /financials/metrics`

Returns `catalogVersion` and 27 canonical metrics with `id`, `label`, `statement`, and `unitType`.

Canonical IDs: `revenue`, `costOfRevenue`, `grossProfit`, `operatingIncome`, `netIncome`, `epsBasic`, `epsDiluted`, `researchAndDevelopment`, `sellingGeneralAdministrative`, `incomeTaxExpense`, `cash`, `accountsReceivable`, `inventory`, `currentAssets`, `totalAssets`, `accountsPayable`, `currentLiabilities`, `totalLiabilities`, `shortTermDebt`, `longTermDebt`, `stockholdersEquity`, `operatingCashFlow`, `capitalExpenditures`, `investingCashFlow`, `financingCashFlow`, `dividendsPaid`, and `shareRepurchases`.

### Company Availability — `GET /financials/{symbol}/metrics`

Query parameter: `period`, either `quarterly` (default) or `annual`.

Returns only metrics available for that company and period, plus the normalized symbol, 10-digit CIK, company name, and source.

### Single Metric — `GET /financials/{symbol}/{metric}`

| Param     | Required | Default     | Notes                               |
| --------- | -------- | ----------- | ----------------------------------- |
| `period`  | no       | `quarterly` | `quarterly` or `annual`             |
| `limit`   | no       | 8           | Integer from 1 through 40           |
| `include` | no       | —           | Set to `provenance` for filing data |

The compact response contains `catalogVersion`, symbol, CIK, company, metric, period, unit, newest-first `data`, and source. Each observation has `date`, numeric `value`, and `periodType`. Provenance adds `filed`, `form`, `accession`, and original SEC `concept`; the source becomes an SEC EDGAR provider object with the company-facts URL.

### Batch Metrics — `POST /financials`

```json
{
  "symbol": "AAPL",
  "metrics": ["revenue", "netIncome", "inventory"],
  "period": "quarterly",
  "limit": 4,
  "include": "provenance"
}
```

Send 1–27 unique canonical metric IDs. Valid but unavailable metrics appear in the response `errors` object while available metrics remain in `metrics` with status 200. An unknown metric ID rejects the entire request with `METRIC_NOT_FOUND`.

## Errors

Handle `UNAUTHORIZED`, `INVALID_REQUEST`, `COMPANY_NOT_FOUND`, `METRIC_NOT_FOUND`, `METRIC_UNAVAILABLE`, `SEC_UNAVAILABLE`, `RATE_LIMITED`, and `INTERNAL_ERROR`. A missing company-specific metric is not zero; preserve the distinction between unavailable data and a reported zero value.
