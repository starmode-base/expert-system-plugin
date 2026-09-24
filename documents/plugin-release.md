# Expert System plugin 2.0.0 release

## Contract and implementation status

- Plugin and MCP server name: `expert-system`.
- Production endpoint: `https://expert-system.starmode.dev/api/mcp`.
- Release target: `2.0.0`. Root portable manifests plus Claude and Codex overlays share the three skills.
- OAuth server gate: production discovery, unauthenticated challenge, and authenticated Codex MCP calls have been verified. Claude's first-login flow still needs an account sign-in to complete.
- Supported data surface: `search_takeaways`, `get_recent_takeaways`, `get_takeaways`, `get_documents`, `get_document_content`, `list_macro_series`, `get_macro_observations`, `list_financial_metrics`, `list_company_financial_metrics`, `get_company_financial_metric`, `get_company_financials`. `get_profile` is an additional free account utility.
- The existing plugin repository is the canonical package source. Claude uses `.claude-plugin/marketplace.json`; Codex uses `.agents/plugins/marketplace.json`. The server repository retains `public/marketplace.json` as a hosted Claude compatibility copy. Website and policy pages remain in the server repository.

## Validation history and migration checks

- Claude plugin and marketplace manifest validators: passed.
- Bundled Codex plugin validator: passed.
- Root manifests validated against the official Agent Plugins 1.0.0 JSON schemas: passed.
- Seven automated packaging checks: identity/version synchronization, credential-free connection shapes, both marketplace catalogs and hosted Claude parity, YAML dependencies and routing metadata, the 11-tool surface, and public policy files.
- Repository TypeScript, ESLint, and Prettier: passed.
- After separation: 349 server tests passed in 26 files. Plugin tests passed independently (five passed, one cross-repository check explicitly skipped); all six passed with `EXPERT_SYSTEM_SERVER_ROOT` set. TypeScript, lint, and formatting passed in both repositories.
- Clean temporary Codex profile: marketplace registration, install, removal, and reinstall passed with version 2.0.0.
- Clean temporary Claude profile: install, removal, and reinstall passed. `claude plugin details` discovered three skills and one MCP server; it reported approximately 197 always-on tokens, with tool schemas resolved at runtime.
- A later fresh clone of `main` at `fa5b7aa` passed frozen install, repository checks, cross-repository plugin checks, both Claude manifest validators, and the bundled Codex validator. Claude installed from the public GitHub marketplace in an isolated profile and discovered three skills and one MCP server. Because the GitHub source resolves to the default branch, `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` was needed in this environment to avoid SSH access.
- Codex registered that fresh GitHub repository but could not discover the plugin until `.agents/plugins/marketplace.json` was added. The pushed candidate at `3f11403` passed frozen install, typecheck, lint, formatting, seven contract tests, and both client validators in a fresh clone. Codex then installed version 2.0.0 directly from the GitHub candidate branch; its cached source resolved to that commit, with three skills and one MCP server. The temporary test installation was removed.
- The existing authenticated Codex MCP connection returned live recent/search/full takeaways, bounded document text, macro observations, and company financials. These calls verify production data and OAuth, but not automatic skill routing in a newly installed client.

## Before release

1. The operator and private support contact have been set to Scout Smith LLC and `spencer.g.smith6@gmail.com` in the privacy and terms pages. Review retention and provider practices, and deploy the pages before submitting their URLs to directories. The pages are implementation-based initial policies, not a determination of jurisdiction-specific compliance.
2. Run `bun install --frozen-lockfile`, `bun run typecheck`, `bun run lint`, `bun run format:check`, and `bun run plugin:check` in this repository. Run `EXPERT_SYSTEM_SERVER_ROOT=/path/to/expert-system bun run plugin:check` to check the server contract, hosted marketplace copy, and policy files. Without that variable, the cross-repository test is explicitly skipped.
3. The candidate branch has been published and its `3f11403` code validated from a fresh clone. Repeat exact-commit validation if the candidate changes. Run `bun install --frozen-lockfile`, `bun run plugin:check`, both client manifest validators, and the repository checks. With the bundled Codex skill available, run `python3 /path/to/plugin-creator/scripts/validate_plugin.py .`.
4. For Claude's branch smoke test, add `starmode-base/expert-system-plugin` in a clean profile after the candidate reaches the default branch. The marketplace plugin source normally follows the default branch: for a prerelease candidate, set the source `ref` to its candidate tag in both Claude marketplace copies and validate them before publishing. Confirm the installed version and commit, not just installation success.
5. For Codex, register the candidate repository as a marketplace, install `expert-system@expert-system`, and confirm three skills and exactly one server in an isolated client profile. Remove, reinstall, and compare the installed manifests with the candidate. The archive can be checked separately as a portable distribution.
6. Exercise upgrade from an actual v1 installation, remove saved plugin API-key configuration, and confirm OAuth reconnect if such an installation is available. No v1 installation was present in the user profile. A v1 fixture from commit `ea2a74c` is rejected by the current Claude CLI manifest validator (`repository` and `userConfig` fields), so an authentic in-place v1 upgrade remains untested; do not claim this test passed.
7. Complete the behavioral matrix below in both clients. Record client versions, candidate commit, results, and redacted error details. Use the same candidate for the soak and stable release.

## Behavioral matrix

| Request or condition                                    | Expected behavior                                                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| “Find recent research about AI infrastructure”          | Research → search previews → full takeaways; dated source links; `recent` is not treated as a date filter |
| “Give me a recent research briefing”                    | Recent feed → selected full takeaways                                                                     |
| “Verify this source claim”                              | Bounded document content; follow the returned next offset only when useful; stop at null                  |
| No search matches or missing takeaway IDs               | Explicit collection/coverage limits; no invented claims                                                   |
| “Show inflation”                                        | Resolve ambiguous measures through catalog/clarification, then observations                               |
| Five macro series with one provider failure             | Successful observations retained; failed series disclosed                                                 |
| Different macro dates/frequencies or empty observations | No implicit alignment, interpolation, or zero substitution                                                |
| “Compare Apple revenue and operating cash flow”         | Company batch with provenance; distinguish quarterly and year-to-date values                              |
| Unsupported metric in a batch                           | Show successes and metric-specific errors; do not silently substitute                                     |
| Ambiguous issuer or fiscal period                       | Clarify the consequential ambiguity                                                                       |
| Larger document/history request                         | Respect ID, character, and history limits; do not invent cursors                                          |
| “Write a CSS animation”                                 | No Expert System skill/tool activation                                                                    |
| Unavailable server / missing tool                       | Report connection issue; no token request or REST fallback                                                |
| First sign-in, reconnect, expired session               | Client OAuth flow and subsequent successful tool call                                                     |
| Cancelled sign-in, denied access, logout                | Explain state; no unauthorized calls or retry loop                                                        |
| Quota exceeded                                          | Report limit, preserve partial findings, avoid repeated billed calls                                      |

In the separate server repository, the existing tests cover successful, empty, invalid, partial, quota, and protocol cases. They do not prove model routing or cross-client sign-in behavior.

## Publish and monitor

Build the plugin-only archive with `python3 scripts/package-plugin.py /tmp/expert-system-2.0.0.zip`. Inspect its contents; never upload a working-directory archive. The package allowlist excludes secrets, application source, dependencies, and client profiles.

After candidate validation, publish a GitHub prerelease tagged `v2.0.0-rc.1` with the archive and a record of the tested commit. Run at least one day of representative usage in both clients, including reconnect and partial-result handling. Resolve regressions before creating stable tag `v2.0.0`; publish the stable archive and release notes, then submit to Claude's marketplace and the OpenAI universal plugin directory. No release or directory submission has been performed by this implementation.

During the soak and after release, record MCP connection/auth failures, tool errors and latency, quota problems, skill-routing misses, and citation/period regressions. Use redacted client reports and existing service logs; never record bearer tokens or raw private prompts in the release log. Compare against the validated candidate before escalating.

Record the previous known-good Git tag before release. For packaging regressions, withdraw the affected release and reinstall the previous tested OAuth-compatible package. A v1 API-key plugin cannot be assumed compatible with the OAuth-only MCP server. Any server rollback requires a separate compatibility review; do not silently restore MCP API-key authentication.
