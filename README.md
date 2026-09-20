# Expert System

Research intelligence, FRED macroeconomic observations, and normalized SEC company financials for Claude Code and Codex. Version **2.0.0** uses OAuth and one shared set of skills.

Service: [expert-system.starmode.dev](https://expert-system.starmode.dev) · [Support](https://github.com/starmode-base/expert-system-plugin/issues) · [Privacy](https://expert-system.starmode.dev/privacy.html) · [Terms](https://expert-system.starmode.dev/terms.html)

## Capabilities

| Skill      | Example                                            | Workflow                                                           |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| Research   | “What are experts saying about AI infrastructure?” | Search previews → selected takeaways → bounded source verification |
| Macro      | “Show recent US inflation and unemployment.”       | Resolve supported FRED series → retrieve dated observations        |
| Financials | “Compare Apple's revenue and operating cash flow.” | Discover metrics → retrieve company series with filing provenance  |

Results preserve source links, observation dates, units, and fiscal-period semantics. These capabilities do not provide live stock prices, forecasts, or trading. There are 11 data tools; the server also offers a free `get_profile` identity utility. Data calls share the account's REST quota, including valid calls that return empty or partial results.

## Claude Code installation

Once v2 is available on the repository's default branch, run:

```text
/plugin marketplace add starmode-base/expert-system-plugin
/plugin install expert-system@expert-system
```

Restart Claude Code, open `/mcp`, and follow the Expert System sign-in flow. Approve the OAuth read access and any client tool-permission prompts you intend to allow. No API key is required. Use natural-language requests or `/expert-system:research`, `/expert-system:macro`, and `/expert-system:financials`.

For local development before publication: `claude --plugin-dir /absolute/path/to/expert-system-plugin`. For isolated install testing and GitHub branch validation, see [the release checklist](documents/plugin-release.md).

Update with `/plugin marketplace update expert-system` then `/plugin update expert-system@expert-system`. Remove with `/plugin uninstall expert-system@expert-system`. Manage sign-in separately in `/mcp`; uninstalling a plugin does not delete your service account or billing subscription.

## Codex installation

Clone the desired release of this repository. Register a local marketplace pointing at that checkout using the bundled plugin-creator skill, or create this temporary marketplace layout:

```text
expert-system-marketplace/
  .agents/plugins/marketplace.json
  plugins/expert-system/  # plugin files from the release archive
```

Use this catalog in `.agents/plugins/marketplace.json`:

```json
{
  "name": "expert-system-local",
  "interface": { "displayName": "Expert System" },
  "plugins": [
    {
      "name": "expert-system",
      "source": { "source": "local", "path": "./plugins/expert-system" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
      "category": "Productivity"
    }
  ]
}
```

Register and install it using a Codex CLI with plugin support:

```sh
codex plugin marketplace add /absolute/path/to/expert-system-marketplace
codex plugin add expert-system@expert-system-local
```

Alternatively, select that marketplace in the Codex Plugins UI and install Expert System. Complete its OAuth sign-in prompt, then start a new task so the skills and connection are loaded. Ask naturally or select the research, macro, or financials skill. The three summaries support routing; the host discovers tool schemas as needed rather than this plugin eagerly loading them.

To update, replace the plugin directory with the new release, refresh the marketplace with `codex plugin marketplace upgrade expert-system-local`, and reinstall from the Plugins UI (or remove/add using the CLI). Start a new task. Remove with `codex plugin remove expert-system@expert-system-local`; remove an unused marketplace with `codex plugin marketplace remove expert-system-local`.

## Sign-in and troubleshooting

The shared MCP endpoint is `https://expert-system.starmode.dev/api/mcp`. Sign in through the client's connection controls; credentials belong to the client, never plugin files or prompts. The server requests `expert-system:read`. Cancelling sign-in leaves the connection unavailable; retry when ready. An expired or revoked session may require reconnecting. For access denied, verify your account and authorization rather than repeatedly retrying tools.

In Claude Code use `/mcp`; in Codex inspect `/mcp` and the plugin's connection settings. If tools are missing, confirm installation, enable the plugin, reconnect, and start a fresh task. Remove duplicate manually configured Expert System connections if they cause duplicate tools. A quota error requires waiting for renewal or managing your plan, not reinstalling. Report client version and redacted error details through Support; never post tokens or personal data.

For a v1 upgrade, uninstall the old plugin, remove its saved plugin API-key configuration, then install v2 and sign in. Existing REST `/api/v1` integrations continue to use their API keys; revoke an old key only if it is no longer used elsewhere.

## Plugin development and release

The root `plugin.json` and `mcp.json` follow the [portable Agent Plugins format](https://developers.openai.com/plugins/build/plugins). `.claude-plugin/` and `.codex-plugin/` provide client compatibility; both use the same `skills/`. Skill MCP dependencies follow [OpenAI's skill guidance](https://developers.openai.com/plugins/build/skills). The server repository hosts `public/marketplace.json` as a compatibility copy of this repository’s canonical Claude marketplace. Privacy and terms pages are also hosted by the server.

```sh
bun install --frozen-lockfile
bun run plugin:check
claude plugin validate .claude-plugin/plugin.json
claude plugin validate .
python3 scripts/package-plugin.py /tmp/expert-system-2.0.0.zip
bun run typecheck && bun run lint && bun run format
```

The archive includes only the plugin manifests, README, release checklist, and skills. It excludes application code, environment files, local config, and dependencies. Installation from GitHub still checks out the repository; never commit credentials. Release, clean-profile validation, routing scenarios, monitoring, and rollback are documented in [the release checklist](documents/plugin-release.md).

The plugin checks run without a server checkout. Before release, additionally verify
the 11-tool contract, hosted marketplace copy, and policy files against the server:

```sh
EXPERT_SYSTEM_SERVER_ROOT=/absolute/path/to/expert-system bun run plugin:check
```
