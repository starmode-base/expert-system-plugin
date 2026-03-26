---
name: research
description: "Search a knowledge base of recent research, news, and analysis spanning AI development, technology, business strategy, economics, and industry trends. Sources include tech blogs, X posts, podcast transcripts, earnings calls, and expert commentary. Use this skill whenever the user asks about recent developments, news, trends, what's happening in a field or with a company, technical topics in AI/ML, or wants a research briefing. Also use when the user mentions specific companies, technologies, industries, or economic topics and seems to want current information rather than general knowledge."
---

# Research

Search and browse intelligence from the Expert System API. The system ingests public company earnings transcripts, tech blogs, X posts, podcast transcripts, economics analysis, and business strategy content, then processes it into atomic takeaways and synthesized research insights.

## Rules

- **Always cite sources.** Every claim backed by Expert System data must include the source name and a direct link from the takeaway or document metadata. Never present retrieved information without attribution.
- **If the API returns an error or empty results**, tell the user plainly rather than guessing. For 401 errors, suggest checking their API key configuration.
- **Cross-reference with other skills.** If the user's question would benefit from financial or macroeconomic data, use the `financials` or `macro` skills alongside this one.

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

## Workflows

### Ad-hoc Research

When the user asks about a specific topic, company, technology, or event:

1. **Search** — `GET /takeaways/search` with a natural-language query. Use `recent=true` to favor newer content. Returns titles, summaries, and IDs.
2. **Read takeaways** — `GET /takeaways?ids=...` to get full text, references, and document URLs.
3. **Read sources** (if needed) — `GET /documents?ids=...` for the full source text.

### News Briefing

When browsing for what's new or running as a recurring job:

1. **Research insights** — `GET /research` for AI-synthesized insights (highest signal).
2. **Recent takeaways** — `GET /takeaways/recent` for the latest raw takeaways.
3. **Drill down** — Fetch by ID to go deeper on anything interesting.

## API Reference

Base URL: `https://expert-system.starmode.dev/api/v1`

### Semantic Search — `GET /takeaways/search`

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `query` | yes | — | Natural-language search string |
| `limit` | no | 10 | Max 100 |
| `recent` | no | — | `true` for time-weighted reranking |

### Takeaways by ID — `GET /takeaways`

| Param | Required | Notes |
|-------|----------|-------|
| `ids` | yes | Comma-separated IDs, max 50 |

### Recent Takeaways — `GET /takeaways/recent`

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `limit` | no | 10 | Max 100 |

### Documents by ID — `GET /documents`

| Param | Required | Notes |
|-------|----------|-------|
| `ids` | yes | Comma-separated IDs, max 50 |

### Research Insights — `GET /research`

| Param | Required | Default | Notes |
|-------|----------|---------|-------|
| `limit` | no | 4 | Max 100 |
| `date` | no | — | Filter to single day (YYYY-MM-DD) |
| `cursor` | no | — | Pagination cursor from previous response |

## Output

All endpoints return JSON. Parse and format results clearly for the user's question.
