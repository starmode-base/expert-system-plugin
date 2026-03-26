---
name: macro
description: "Query real-time macroeconomic data including GDP, unemployment, inflation (CPI, PCE), interest rates, housing data, and consumer sentiment. Use this skill whenever the user asks about macroeconomic conditions, economic indicators, the Fed, interest rates, inflation, employment, labor market, housing market, yield curve, or any broad economic data point."
---

# Macroeconomic Data

Query real-time macroeconomic data through the Expert System API using natural language.

## Rules

- **If the API returns an error or empty results**, tell the user plainly rather than guessing. For 401 errors, suggest checking their API key configuration.
- **Cross-reference with research.** For deeper context on macro trends, also use the `research` skill to find related expert takeaways and analysis.

## Authentication

All requests require a Bearer token. Users can get their API key at: https://expert-system.starmode.dev/account/api-keys

```json5
// ~/.claude/plugins/expert-system/env.json
// or via skill env in ~/.openclaw/openclaw.json
{
  "EXPERT_SYSTEM_API_KEY": "esak_..."
}
```

Include on all requests: `Authorization: Bearer $EXPERT_SYSTEM_API_KEY`

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
