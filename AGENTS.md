# Agent guidelines

## Server–plugin synchronization

Expert System is maintained in two repositories, normally checked out as siblings:

- `expert-system` owns the MCP server, OAuth, tool schemas and response semantics, website, and public privacy/terms pages.
- `expert-system-plugin` owns the plugin manifests, shared skills, installation documentation, packaging tests, and plugin releases. Do not duplicate the plugin package in the server repository.

When changing MCP tool names, arguments, responses, errors, limits, pagination, units, fiscal-period semantics, endpoint URLs, or OAuth requirements, inspect the corresponding code and instructions in **both** repositories. Update affected plugin skills, `agents/openai.yaml` dependencies, manifests, tests, and documentation together with server changes. The server contract is defined by `src/server/mcp/tools.ts` and its referenced schemas/operations; do not infer it from stale skill text.

The plugin's `.claude-plugin/marketplace.json` is canonical. Keep the server's `public/marketplace.json` identical whenever plugin versions, descriptions, or source references change. Keep identity and version metadata synchronized across the plugin's portable, Claude, and Codex manifests; transport declarations must point to the same MCP endpoint. Policy URLs in plugin metadata must correspond to pages hosted by the server.

For changes affecting this shared contract or a plugin release, run this command **from the plugin repository**, in addition to each repository's relevant checks:

```bash
EXPERT_SYSTEM_SERVER_ROOT=../expert-system bun run plugin:check
```

Use the actual server checkout path if the repositories are not siblings. The cross-repository test is skipped when `EXPERT_SYSTEM_SERVER_ROOT` is unset; a standalone green run is not synchronization validation. The check verifies tool names, marketplace parity, and policy files, but does not validate argument/response semantics or live OAuth behavior. Review affected schemas and workflows and run relevant server tests; perform client smoke tests when connection or packaging behavior changes. Update contract assertions only for intentional changes, never merely to make drift checks pass.

Preserve compatibility with already-installed plugin versions where possible. For breaking changes, document the required plugin version and rollout order in `documents/plugin-release.md` in the plugin repository. If work spans both repositories, link the companion PRs and report checks for each. If a companion checkout is unavailable, report the synchronization work and checks still needed; do not claim the change is release-ready.
