---
name: macro
description: Retrieve current and historical FRED macroeconomic observations from Expert System for inflation, employment, GDP, interest rates, housing, and sentiment. Use for economic data and trends, not forecasts or market quotes.
---

# Macroeconomic data

Use the `expert-system` MCP server. Discover only the tools needed and follow their current schemas. If unavailable, identify the missing connection and direct the user to the client's MCP controls to sign in or reconnect. Never request tokens or use REST/API keys as a fallback. Respect explicitly requested sources.

1. When a series ID is uncertain, call `list_macro_series` with a concept such as inflation or unemployment. Resolve from returned descriptions, units, frequency, and source URLs. Clarify consequential ambiguity such as headline versus core inflation or nominal versus real GDP; do not silently substitute a different measure.
2. Call `get_macro_observations` with `series`, containing one to five unique IDs. For each series, use either `lastN` (1–120) or both `startDate` and `endDate` (YYYY-MM-DD), never both modes. Split larger requests into batches.
3. Choose `units`, `frequency`, and `aggregationMethod` only as needed. Aggregation requires a frequency and supports lower-frequency output, not upsampling. Inspect both `items` and `errors`: keep successful series and identify failed series individually.
4. Report observation dates, values, native units, transformation, frequency, and returned source URLs. Distinguish a percentage level from a percentage change, and a percent change from a percentage-point difference. Label any calculations you perform.

No interpolation, forward filling, or automatic date alignment is performed. Do not compare observations as contemporaneous without checking dates and frequencies. Missing values are not zero. The latest observation date may lag today; never describe it as today's measured value. Empty output means unavailable observations for the selected range, not a zero reading.

There is no cursor pagination. Use explicit adjacent date windows for longer requests if needed, deduplicate boundaries, and state remaining coverage gaps. Do not retry permanent per-series errors unchanged. Stop on authentication, access, or quota errors and report the remedy; do not fabricate a fallback series.
