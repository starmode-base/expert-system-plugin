---
name: macro
description: "Query real-time macroeconomic data including GDP, unemployment, inflation (CPI, PCE), interest rates, housing data, and consumer sentiment. Use this skill whenever the user asks about macroeconomic conditions, economic indicators, the Fed, interest rates, inflation, employment, labor market, housing market, yield curve, or any broad economic data point."
---

# Macroeconomic Data

Query real-time macroeconomic data through the Expert System API using natural language.

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

1. **Query** — `POST /query/macro` with a natural-language question. The system queries the relevant economic data series.
2. **Present** — Format clearly, highlighting trends and the specific indicators the user asked about.
3. **Enrich** — Use the `research` skill to search for related expert analysis if it would add value.

Available data: GDP & real economy, labor market (unemployment, payrolls, JOLTS), inflation (CPI, PCE, trimmed-mean), wages & income, monetary policy & Fed liquidity, interest rates & yield curve, credit & financial stress, housing (starts, permits, prices, mortgage rates), and consumer sentiment.

## API Reference

Base URL: `https://expert-system.starmode.dev/api/v1`

### Macroeconomic Data — `POST /query/macro`

**Body:** `{ "query": "what is the current unemployment rate" }`

Returns structured economic data as JSON. Parse and format results clearly for the user's question.
