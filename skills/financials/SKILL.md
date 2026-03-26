---
name: financials
description: "Query company financial data including income statements, balance sheets, cash flows, and key metrics like P/E, EPS, market cap, margins, and growth rates. Use this skill whenever the user asks about a company's financials, valuation, earnings, revenue, margins, stock metrics, analyst targets, or any company-specific financial data point."
---

# Company Financials

Query company financial data through the Expert System API using natural language. The system resolves ticker symbols and retrieves structured financial data.

## Rules

- **If the API returns an error or empty results**, tell the user plainly rather than guessing. For 401 errors, suggest checking their API key configuration.
- **Cross-reference with research.** For deeper context on a company, also use the `research` skill to find related takeaways (earnings call analysis, strategy commentary).

## Authentication

All requests require a Bearer token. Get an API key at: https://expert-system.starmode.dev/account/api-keys

**Claude Code plugin users:** Your API key is configured automatically when you enable the plugin. The key is available as `${user_config.api_key}`.

**All other agents:** Set the `EXPERT_SYSTEM_API_KEY` environment variable in your shell profile or `.env` file.

Include on all requests: `Authorization: Bearer <api_key>`

## Workflow

1. **Query** — `POST /query/financial` with a natural-language question. The system resolves ticker symbols and returns the relevant data.
2. **Present** — Format clearly, highlighting the specific metrics the user asked about.
3. **Enrich** — Use the `research` skill to search for related qualitative context if it would add value.

Available data: company overview, key metrics (P/E, EPS, market cap, margins, growth rates, analyst targets), quarterly income statements, quarterly balance sheets, and quarterly cash flow statements.

## API Reference

Base URL: `https://expert-system.starmode.dev/api/v1`

### Company Financial Data — `POST /query/financial`

**Body:** `{ "query": "what is Apple's current P/E ratio and revenue growth" }`

Returns structured financial data as JSON. Parse and format results clearly for the user's question.
