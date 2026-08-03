---
name: research
description: "Search a knowledge base of recent research, news, and analysis spanning AI development, technology, business strategy, economics, and industry trends. Sources include tech blogs, X posts, podcast transcripts, earnings calls, and expert commentary. Use this skill whenever the user asks about recent developments, news, trends, what's happening in a field or with a company, technical topics in AI/ML, or wants a research briefing. Also use when the user mentions specific companies, technologies, industries, or economic topics and seems to want current information rather than general knowledge."
---

# Research

Search and browse intelligence from the Expert System API. The system ingests public company earnings transcripts, tech blogs, X posts, podcast transcripts, economics analysis, and business strategy content, then processes it into atomic takeaways and synthesized research insights.

## Rules

- **Always cite sources.** Every claim backed by Expert System data must include the source name and a direct link from the takeaway or document metadata. Never present retrieved information without attribution.
- **If the API returns an error or empty results**, tell the user plainly rather than guessing.
- **If no API key is configured**, tell the user they need an API key to use Expert System and can get one at [expert-system.starmode.dev/account/api-keys](https://expert-system.starmode.dev/account/api-keys). Do not attempt the request without a key.
- **If the API returns a 401**, the key may be invalid or expired. Direct the user to [expert-system.starmode.dev/account/api-keys](https://expert-system.starmode.dev/account/api-keys) to check or regenerate their key.
- **Cross-reference with other skills.** If the user's question would benefit from macroeconomic data, use the `macro` skill alongside this one.

## Authentication

All requests require a Bearer token. Get an API key at: https://expert-system.starmode.dev/account/api-keys

**Claude Code plugin users:** Your API key is configured automatically when you enable the plugin. The key is available as `${user_config.api_key}`.

**All other agents:** Set the `EXPERT_SYSTEM_API_KEY` environment variable in your shell profile or `.env` file.

Include on all requests: `Authorization: Bearer <api_key>`

## Workflows

### Ad-hoc Research

When the user asks about a specific topic, company, technology, or event:

1. **Search** — `GET /takeaways/search` with a natural-language query. Use `recent=true` to favor newer content. Returns titles, summaries, and IDs.
2. **Read takeaways** — `GET /takeaways?ids=...` to get full text, references, and document URLs.
3. **Read sources** (if needed) — `GET /documents/{documentId}/content` for bounded source text. Read text from `item.content.text` and follow `item.content.nextOffset` only while `item.content.truncated` is true and more context is useful. Use `GET /documents?ids=...` only when complete source records are specifically needed.

### News Briefing

When browsing for what's new or running as a recurring job:

1. **Recent takeaways** — `GET /takeaways/recent` for the latest takeaways, including each source's `publicationDate`.
2. **Search related topics** — `GET /takeaways/search` with `recent=true` to find relevant recent context.
3. **Drill down** — Fetch selected takeaway IDs in one `GET /takeaways?ids=...` request.

## API Reference

Base URL: `https://expert-system.starmode.dev/api/v1`

### Semantic Search — `GET /takeaways/search`

| Param    | Required | Default | Notes                              |
| -------- | -------- | ------- | ---------------------------------- |
| `query`  | yes      | —       | Natural-language search string     |
| `limit`  | no       | 10      | Max 100                            |
| `recent` | no       | —       | `true` for time-weighted reranking |

### Takeaways by ID — `GET /takeaways`

| Param | Required | Notes                       |
| ----- | -------- | --------------------------- |
| `ids` | yes      | Comma-separated IDs, max 50 |

### Recent Takeaways — `GET /takeaways/recent`

| Param   | Required | Default | Notes   |
| ------- | -------- | ------- | ------- |
| `limit` | no       | 10      | Max 100 |

Returns lightweight takeaway objects with `id`, `documentId`, `title`, `summary`, and `publicationDate`.

Search and recent results also include a `document` metadata object. Use the returned IDs with `GET /takeaways`; do not assume lightweight results contain full takeaway text or inline references.

### Documents by ID — `GET /documents`

| Param | Required | Notes                       |
| ----- | -------- | --------------------------- |
| `ids` | yes      | Comma-separated IDs, max 50 |

### Bounded Document Content — `GET /documents/{documentId}/content`

| Param    | Required | Default | Notes                                                    |
| -------- | -------- | ------- | -------------------------------------------------------- |
| `offset` | no       | 0       | Character offset; use the prior `nextOffset` to continue |
| `limit`  | no       | 12000   | Character count, capped at 30000                         |

The response is `{ "item": { ...documentMetadata, "content": { "text", "offset", "nextOffset", "totalCharacters", "truncated" } } }`.

## Output

All endpoints return JSON. Preserve the API's ordering, parse response envelopes before presenting results, and cite the original `document.link` for source-backed claims. Use the takeaway `url` only when linking to the Expert System takeaway page is useful in addition to the original source.
