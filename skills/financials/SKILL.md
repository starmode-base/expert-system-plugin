---
name: financials
description: "Retrieve normalized SEC public-company financials from Expert System: revenue, earnings, balance sheets, cash flow, and per-share metrics. Use for reported financial history and comparisons with filing provenance, not stock prices, forecasts, or trading."
---

# Company financials

Use the `expert-system` MCP server and discover only the tools needed for the request. Follow current tool schemas. If unavailable, identify the missing connection and direct the user to the client's MCP controls to sign in or reconnect. Never request tokens or use REST/API keys as a fallback. Respect explicitly requested sources.

1. Resolve the company to an unambiguous ticker or SEC CIK. Ask when a name could refer to multiple issuers. Use `list_financial_metrics` when the canonical metric ID is unknown; use `list_company_financial_metrics` for availability for a particular `symbol` and `period`.
2. For one metric call `get_company_financial_metric`; for multiple metrics for one company use `get_company_financials`. For multiple companies, make separate calls. Pass canonical metric IDs, `period` (`quarterly` or `annual`), a bounded `limit` (1–40, default 8), and `include: "provenance"` for source attribution.
3. Inspect successful `metrics` and per-metric `errors` in batch results. Retain successful series and explicitly identify unavailable metrics; missing values are not zero. Do not silently replace a metric with a different accounting concept.
4. Present returned units without assuming scaling. Cite the returned company-facts source URL and filing provenance (form, filed date, accession, and original SEC concept). Use returned links; do not invent filing URLs.

`date` is the fiscal period end, not the filing date. Interpret `periodType`:

- `instant`: balance-sheet snapshot.
- `quarter`: standalone fiscal quarter.
- `yearToDate`: cumulative duration beginning at `start`; never label as a standalone quarter.
- `annual`: fiscal year, which may differ from the calendar year.

Before calculating growth, margins, or cross-company comparisons, check dates, duration, period type, and units. Explain calculations and avoid division by zero; do not compare year-to-date cash flow with quarterly revenue as if periods match. A quarterly request may still return year-to-date duration data.

These tools have no cursor pagination; increase `limit` only up to 40 and disclose history limits. Empty output indicates unavailable coverage, not zero performance. Clarify consequential period ambiguity. Stop on authentication, access, or quota errors and report the remedy; do not repeatedly retry permanent failures.
