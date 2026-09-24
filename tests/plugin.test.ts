import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { z } from "zod";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const json = (path: string): unknown => JSON.parse(read(path));
const endpoint = "https://expert-system.starmode.dev/api/mcp";
const identity = z.object({
  name: z.literal("expert-system"),
  version: z.literal("2.0.0"),
  description: z.string().min(1),
  author: z.object({
    name: z.literal("STARMODE"),
    url: z.literal("https://www.starmode.dev/"),
  }),
  homepage: z.url(),
  repository: z.literal(
    "https://github.com/starmode-base/expert-system-plugin",
  ),
  keywords: z.array(z.string()),
});
const presentation = z.object({
  displayName: z.string().min(1),
  shortDescription: z.string().min(1),
  longDescription: z.string().min(1),
  developerName: z.literal("STARMODE"),
  category: z.string().min(1),
  capabilities: z.array(z.literal("Read")),
  websiteURL: z.url(),
  privacyPolicyURL: z.literal(
    "https://expert-system.starmode.dev/privacy.html",
  ),
  termsOfServiceURL: z.literal("https://expert-system.starmode.dev/terms.html"),
  defaultPrompt: z.array(z.string().max(128)).max(3),
});
const portable = identity
  .extend({
    $schema: z.literal(
      "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    ),
    extensions: z
      .object({ "com.openai": z.object({ interface: presentation }).strict() })
      .strict(),
  })
  .strict();
const compatibility = identity
  .extend({
    skills: z.literal("./skills/"),
    mcpServers: z.literal("./.mcp.json"),
    interface: presentation,
  })
  .strict();

const tools = [
  "search_takeaways",
  "get_recent_takeaways",
  "get_takeaways",
  "get_documents",
  "get_document_content",
  "list_macro_series",
  "get_macro_observations",
  "list_financial_metrics",
  "list_company_financial_metrics",
  "get_company_financial_metric",
  "get_company_financials",
];

describe("distributed plugin contract", () => {
  it("keeps portable and client identities and presentation synchronized", () => {
    const canonical = portable.parse(json("plugin.json"));
    const codex = compatibility.parse(json(".codex-plugin/plugin.json"));
    const claude = identity
      .extend({ skills: z.literal("./skills/") })
      .strict()
      .parse(json(".claude-plugin/plugin.json"));
    expect(identity.parse(codex)).toEqual(identity.parse(canonical));
    expect(identity.parse(claude)).toEqual(identity.parse(canonical));
    expect(codex.interface).toEqual(
      canonical.extensions["com.openai"].interface,
    );
  });

  it("declares only the OAuth remote endpoint with no embedded credentials", () => {
    const server = z
      .object({ type: z.literal("http"), url: z.literal(endpoint) })
      .strict();
    const connections = z.object({ "expert-system": server }).strict();
    z.object({ mcpServers: connections }).strict().parse(json(".mcp.json"));
    z.object({
      $schema: z.literal(
        "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
      ),
      mcpServers: z
        .object({
          "expert-system": server.extend({
            type: z.literal("streamable-http"),
          }),
        })
        .strict(),
    })
      .strict()
      .parse(json("mcp.json"));
  });

  it("uses the plugin GitHub repository as the marketplace source", () => {
    const manifest = portable.parse(json("plugin.json"));
    const marketplace = z
      .object({
        name: z.literal("expert-system"),
        owner: identity.shape.author,
        metadata: z.object({ description: z.string().min(1) }),
        plugins: z
          .array(
            z
              .object({
                name: identity.shape.name,
                version: identity.shape.version,
                description: z.string(),
                source: z
                  .object({
                    source: z.literal("github"),
                    repo: z.literal("starmode-base/expert-system-plugin"),
                  })
                  .strict(),
              })
              .strict(),
          )
          .length(1),
      })
      .strict()
      .parse(json(".claude-plugin/marketplace.json"));
    expect(marketplace.plugins[0]?.description).toBe(manifest.description);
    expect(marketplace.owner).toEqual(manifest.author);
  });

  it("makes the repository root installable as a Codex plugin", () => {
    const marketplace = z
      .object({
        name: z.literal("expert-system"),
        interface: z.object({ displayName: z.literal("Expert System") }),
        plugins: z
          .array(
            z.object({
              name: z.literal("expert-system"),
              source: z.object({
                source: z.literal("local"),
                path: z.literal("./"),
              }),
              policy: z.object({
                installation: z.literal("AVAILABLE"),
                authentication: z.literal("ON_INSTALL"),
              }),
              category: z.literal("Productivity"),
            }),
          )
          .length(1),
      })
      .parse(json(".agents/plugins/marketplace.json"));
    expect(marketplace.plugins[0]?.name).toBe(
      portable.parse(json("plugin.json")).name,
    );
  });

  it("exposes three routable skills with resolvable MCP dependencies", () => {
    expect(readdirSync(resolve(root, "skills")).sort()).toEqual([
      "financials",
      "macro",
      "research",
    ]);
    for (const name of ["research", "macro", "financials"]) {
      const skill = read(`skills/${name}/SKILL.md`);
      const frontmatter = /^---\n([\s\S]+?)\n---\n/.exec(skill)?.[1];
      expect(frontmatter).toBeDefined();
      z.object({
        name: z.literal(name),
        description: z.string().min(25).max(1024),
      })
        .strict()
        .parse(parse(frontmatter ?? ""));
      z.object({
        interface: z
          .object({
            display_name: z.string().min(1),
            short_description: z.string().min(25).max(64),
            default_prompt: z.string().includes(`$${name}`),
          })
          .strict(),
        dependencies: z
          .object({
            tools: z
              .array(
                z
                  .object({
                    type: z.literal("mcp"),
                    value: z.literal("expert-system"),
                    description: z.string().min(1),
                    transport: z.literal("streamable_http"),
                    url: z.literal(endpoint),
                  })
                  .strict(),
              )
              .length(1),
          })
          .strict(),
        policy: z
          .object({ allow_implicit_invocation: z.literal(true) })
          .strict(),
      })
        .strict()
        .parse(parse(read(`skills/${name}/agents/openai.yaml`)));
      expect(skill).not.toMatch(/\/api\/v1|alwaysLoad|Authorization:|esak_/);
    }
  });

  it("covers the existing 11 data tools without importing server secrets", () => {
    const skills = ["research", "macro", "financials"]
      .map((name) => read(`skills/${name}/SKILL.md`))
      .join("\n");
    for (const tool of tools) expect(skills).toContain(`\`${tool}\``);
  });

  it.skipIf(!process.env.EXPERT_SYSTEM_SERVER_ROOT)(
    "matches the server tool contract, hosted marketplace, and policy files",
    () => {
      const serverRoot = process.env.EXPERT_SYSTEM_SERVER_ROOT;
      if (!serverRoot) throw new Error("EXPERT_SYSTEM_SERVER_ROOT is required");
      const serverRead = (path: string) =>
        readFileSync(resolve(serverRoot, path), "utf8");
      const registered = [
        ...serverRead("src/server/mcp/tools.ts").matchAll(/name: "([a-z_]+)"/g),
      ].map((match) => match[1]);
      expect(registered.sort()).toEqual([...tools].sort());
      const hosted: unknown = JSON.parse(serverRead("public/marketplace.json"));
      expect(hosted).toEqual(json(".claude-plugin/marketplace.json"));
      for (const page of ["privacy", "terms"]) {
        expect(serverRead(`public/${page}.html`)).toContain('<html lang="en">');
      }
    },
  );
});
