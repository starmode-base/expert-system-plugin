---
name: expert-system
description: Search and browse a curated repository of recent research and insights about business, AI development, economics, and corporate strategy. Query real-time macroeconomic data (GDP, unemployment, inflation, rates) and company financial data (income statements, balance sheets, cash flows, key metrics) by asking natural-language questions. Use when you need current intelligence from earnings transcripts, tech blogs, podcast transcripts, synthesized research, or when the user asks about any company's financials, stock metrics, or macroeconomic indicators.
---

# Expert System

Pull the latest business and AI development intelligence from the Expert System API. The system ingests public company earnings transcripts, blog posts, podcast transcripts, economics analysis, and business strategy content, then processes it into atomic takeaways and synthesized research insights. It also provides natural-language interfaces to macroeconomic (FRED) and company financial (Alpha Vantage) data.

## Authentication

All requests require a Bearer token. Set via skill env in `~/.openclaw/openclaw.json`:

```json5
{
  skills: {
    entries: {
      "expert-system": {
        env: { "EXPERT_SYSTEM_API_KEY": "esak_..." }
      }
    }
  }
}
```

All requests must include: `Authorization: Bearer $EXPERT_SYSTEM_API_KEY`

## Workflows

### Ad-hoc Research

When the user asks about a specific topic (e.g., "what's happening with Zillow" or "latest on housing market"):

1. **Search**: Use semantic search with a natural-language query to find relevant takeaways. This returns lightweight results (title, summary, IDs). Use `recent=true` to favor newer content.
2. **Read takeaways**: Fetch takeaways by ID to get the full takeaway text, references, and document URL.
3. **Always cite sources**: When presenting data or making claims retrieved from the Expert System, you must include the source name and a direct link to the original document provided in the takeaway or document metadata.
4. **If helpful; Read sources**: Fetch documents by ID to read the full source text.

### Passive News Briefing

When browsing for what's new or running as a recurring job:

1. **Research insights**: Fetch the latest synthesized insights. These connect multiple takeaways into coherent analysis and are the highest-signal starting point.
2. **Recent takeaways**: Fetch the latest raw takeaways across all sources.
3. **Drill down**: Fetch takeaways or documents by ID to go deeper on anything interesting.

### Company Financial Analysis

When the user asks about a company's financials, valuation, earnings, revenue, margins, balance sheet, cash flow, or any stock/company metric:

1. **Query financials**: POST a natural-language question. The system resolves ticker symbols and retrieves the relevant data (overview, income statement, balance sheet, cash flow).
2. **Present results**: Format the returned data clearly, highlighting the specific metrics the user asked about.
3. **Combine with research**: For deeper context, also search for relevant takeaways about the company (e.g., earnings call analysis, strategy commentary).

Available financial data includes: company overview & key metrics (P/E, EPS, market cap, margins, growth rates, analyst targets), quarterly income statements, quarterly balance sheets, and quarterly cash flow statements.

### Macroeconomic Analysis

When the user asks about macroeconomic conditions, interest rates, inflation, employment, GDP, housing, or any economic indicator:

1. **Query macro data**: POST a natural-language question. The system queries the relevant FRED series and returns the data.
2. **Present results**: Format the returned data clearly, highlighting trends and the specific indicators the user asked about.
3. **Combine with research**: For deeper context, also search for relevant expert takeaways on the macro topic.

Available macro data covers: GDP & real economy, labor market (unemployment, payrolls, JOLTS), inflation (CPI, PCE, trimmed-mean), wages & income, monetary policy & Fed liquidity, interest rates & yield curve, credit & financial stress, housing (starts, permits, prices, mortgage rates), and consumer sentiment.

## API Reference

Base URL: `https://expert-system.starmode.dev/api/v1`

### 1. Semantic Search — `GET /takeaways/search`

Search across all takeaways by meaning. Returns titles, summaries, and IDs for drill-down.

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `query` | yes | — | Natural-language search string |
| `limit` | no | 10 | Max 100 |
| `recent` | no | — | Set to `true` for time-weighted reranking |

### 2. Takeaways by ID — `GET /takeaways`

Fetch full takeaway text and references for specific IDs returned by search.

| Param | Required | Notes |
|-------|----------|-------|
| `ids` | yes | Comma-separated takeaway IDs, max 50 |

### 3. Recent Takeaways — `GET /takeaways/recent`

Get the latest atomic takeaways sorted by publication date (newest first).

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `limit` | no | 10 | Max 100 |

### 4. Documents by ID — `GET /documents`

Fetch full source documents including article text.

| Param | Required | Notes |
|-------|----------|-------|
| `ids` | yes | Comma-separated document IDs, max 50 |

### 5. Research Insights — `GET /research`

Get AI-synthesized research insights with linked takeaways. Supports cursor pagination.

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `limit` | no | 4 | Max 100 |
| `date` | no | — | Filter to single day UTC (YYYY-MM-DD) |
| `cursor` | no | — | Opaque pagination cursor from previous response |

### 6. Macroeconomic Data — `POST /query/macro`

Query real-time macroeconomic data from FRED using natural language.

**Body:** `{ "query": "what is the current unemployment rate" }`

### 7. Company Financial Data — `POST /query/financial`

Query company financial data from Alpha Vantage using natural language.

**Body:** `{ "query": "what is Apple's current P/E ratio and revenue growth" }`

## Output

All endpoints return JSON. Parse and format results appropriately for the user's question.
