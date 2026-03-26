# Expert System Plugin for Claude Code

A Claude Code plugin that gives Claude access to real-time research intelligence, company financial data, and macroeconomic indicators.

## Skills

| Skill | Command | What it does |
|-------|---------|-------------|
| **Research** | `/expert-system:research` | Search recent news, analysis, and insights from tech blogs, X posts, podcast transcripts, earnings calls, and expert commentary |
| **Financials** | `/expert-system:financials` | Query company financial data — income statements, balance sheets, cash flows, key metrics (P/E, EPS, margins, growth rates) |
| **Macro** | `/expert-system:macro` | Query macroeconomic indicators — GDP, unemployment, inflation, interest rates, housing, consumer sentiment |

All three skills also trigger automatically based on context — you don't need to invoke them by name.

## Install

```
/plugin install github://starmode-base/expert-system-plugin
```

## Setup

1. Get your API key at [expert-system.starmode.dev/account/api-keys](https://expert-system.starmode.dev/account/api-keys)

2. Add your key to `~/.claude/plugins/expert-system/env.json`:

```json
{
  "EXPERT_SYSTEM_API_KEY": "esak_..."
}
```

## Examples

- "What's happening with Nvidia?"
- "Give me a news briefing on AI development"
- "What's Apple's current P/E ratio and revenue growth?"
- "What's the current unemployment rate and how has it trended?"
- "Compare Tesla's margins to the rest of the auto industry"

## Links

- [Expert System](https://expert-system.starmode.dev)
- [API Key Management](https://expert-system.starmode.dev/account/api-keys)
