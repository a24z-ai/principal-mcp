# Principal MCP

## Goal

Package the PrincipalMD Model Context Protocol (MCP) server as a standalone npm bundle—mirroring the `agent-hooks` distribution and Bun-based workflow—so teams can run `npx principal-mcp` to start the server without cloning the full Electron app.

## Source Implementation Summary

- **Server entry point:** `PrincipleMD/core/src/mcp/index.ts` boots a stdio MCP server (`McpServer`) and wires branding-derived name/version plus HTTP bridge env vars.
- **Core server logic:** `src/mcp/server/McpServer.ts` registers MCP tools/resources with `@modelcontextprotocol/sdk`, serving tools over stdio and exposing helpers to add tools/resources.
- **Tools:** `src/mcp/tools/*` provides reusable `BaseTool`, `UserPromptTool`, and `AgentHandoffTool`, with planning-specific tools in `src/mcp/planning/tools/*` that call the planning HTTP bridge.
- **Types & utilities:** `src/mcp/types/*` defines protocol types (`McpTool`, `McpResource`, etc.) and `src/mcp/utils/zod-to-json-schema.ts` converts Zod schemas to JSON Schema for tool metadata.
- **Bundling:** `scripts/bundle-mcp-esbuild.js` bundles `src/mcp/index.ts` into `dist/mcp-standalone/mcp-server.js`, marking `@modelcontextprotocol/sdk` and `zod` as externals and adding a Node shebang.
- **Agent configuration helpers:** `src/agents/mcp/mcp-config.ts` provides add/remove/count helpers for inserting the bundled MCP server into Claude, Gemini, and OpenCode configs.

## Planned Package Layout

```
principal-mcp/
  package.json           # npm metadata aligned with agent-hooks conventions
  src/
    index.ts             # re-export MCP server entry and CLI startup
    server/              # ported McpServer implementation
    tools/               # base tool + prompt & handoff tools
    planning/            # planning bridge tool set (optional toggle at build time)
    types/               # protocol types reused by tools
    utils/               # zod-to-json-schema helper
  scripts/
    bundle.ts            # esbuild bundler (ported from bundle-mcp-esbuild.js, executed via Bun)
  dist/                  # emitted bundle published with package
```

## Migration Checklist

1. Copy MCP sources listed above from `PrincipleMD/core` into this repository, preserving relative imports or adjusting paths.
2. Translate the existing `bundle-mcp-esbuild.js` into a Bun-friendly script (TypeScript or plain JS) under `scripts/` and expose via `bun run build`.
3. Define `package.json` similar to `agent-hooks` (name, bin pointing to `dist/mcp-server.js`, dependencies on `@modelcontextprotocol/sdk`, `zod`, `esbuild`, and scripts that invoke Bun for build/test commands).
4. Add a `bin` entry so `npx principal-mcp` executes the bundled server.
5. Mirror agent-hooks release tooling (`bun test`, optional `test-*.sh`) if distribution parity is required.
6. Validate with `npm pack` + `node dist/mcp-server.js` (or `bun run dist/mcp-server.js`) to ensure the stdio bridge starts and MCP tools resolve correctly.

## Operational Notes

- The runtime collapses all MCP interactions onto a single HTTP bridge port (default `3043`, aligning with `agent-hooks`).
- Consumers configure the port via CLI (`principal-mcp --port 3043`) or `PRINCIPLE_MCP_PORT`, mirroring the hooks library’s flag/environment pattern.
- Prompt, planning, and agent-handoff requests will multiplex through that one endpoint.

## Next Steps

- Port source files and verify TypeScript builds.
- Add Bun-powered tests (mirroring `agent-hooks/tests`) to exercise tool registration and HTTP bridge interactions.
- Document usage in package README once implementation lands (include `npx principal-mcp` quick start and environment configuration table).
