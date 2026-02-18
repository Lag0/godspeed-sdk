# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## Project Overview
Godspeed SDK — typed TypeScript SDK + CLI for the **official** Godspeed API (Tasks and Lists). Includes an Agent Skill following the [agentskills spec](https://github.com/agentskills/agentskills) and an OpenClaw-style bash installer.

## Docs
- [Godspeed API Guide](https://godspeedapp.com/guides/api)
- [Local API Docs](docs/godspeed-api-docs.md)

## API Scope (current)
**Auth**
- `POST /sessions/sign_in` (optional; token usually provided via app)

**Tasks**
- `POST /tasks`
- `GET /tasks` (filters: `status`, `list_id`, `updated_before`, `updated_after`)
- `GET /tasks/:task_id`
- `PATCH /tasks/:task_id`
- `DELETE /tasks/:task_id`

**Lists**
- `GET /lists`
- `POST /lists/:list_id/duplicate`

> Note: There is **no** create/update/delete for lists beyond duplication.

## Auth & Security
- Use `GODSPEED_TOKEN` env var (Bearer token).
- Default base URL: `https://api.godspeedapp.com` (override via `GODSPEED_BASE_URL`).
- **Never** hardcode tokens or log them.

## Rate Limits (be conservative)
- List tasks/lists: **≤10/min** or **≤200/hr**
- Create/update tasks: **≤60/min** or **≤1000/hr**

## Repository Layout
```
src/
  schemas.ts          # Zod schemas (source of truth for all API payloads)
  types.ts            # inferred types only (z.infer)
  errors.ts           # GodspeedError hierarchy (Api, Auth, RateLimit, Validation)
  client.ts           # HTTP client factory (Bearer auth, URL builder)
  endpoints.ts        # 1:1 typed endpoint functions
  cli.ts              # CLI entry point (tasks + lists commands)
  index.ts            # SDK barrel export
dist/
  cli.js              # built CLI bundle (Node target)
bin/
  godspeed            # bash launcher → node dist/cli.js
skills/godspeed/
  SKILL.md            # Agent Skill (agentskills spec compliant)
  scripts/
    godspeed-cli.sh   # thin bash wrapper for agent use
  references/
    COMMANDS.md       # full CLI command reference (progressive disclosure)
docs/
  godspeed-api-docs.md
  godspeed-api-skill.md
install.sh            # OpenClaw-style installer (4 stages, flags, colored output)
```

## Common Commands
Run from repo root.

```bash
bun install           # install deps
bun run build         # build CLI (Bun target)
bun run build:node    # build CLI (Node target)
bun run lint          # typecheck (tsc --noEmit)
bun run test          # run tests
```

## Installer
```bash
# Full install (auto-detects Bun or Node 18+)
curl -fsSL https://raw.githubusercontent.com/Lag0/godspeed-sdk/master/install.sh | bash

# Dry run (preview only)
bash install.sh --dry-run

# Verbose mode
bash install.sh --verbose

# Custom directory
bash install.sh --dir ~/my-godspeed
```

## Workflow: Add/Modify Endpoint
1. Update `schemas.ts` with Zod schemas for request/response.
2. Update `types.ts` using `z.infer<typeof Schema>` (no `any`).
3. Implement endpoint in `endpoints.ts` with explicit typing.
4. Expose in CLI (`src/cli.ts`).
5. Update `skills/godspeed/references/COMMANDS.md` with new command docs.
6. Run build + tests.

## Schema & Types (Zod)
- **Zod is the source of truth** for all API payloads.
- `schemas.ts`: Zod schemas for requests and responses.
- `types.ts`: inferred types only (`export type X = z.infer<typeof XSchema>`).
- Do **not** write standalone interfaces for API payloads outside Zod.
- Validate inputs always; validate responses where applicable.

## Code Style (Hard Rules)
- **TypeScript strict**, **no `any`**.
- Use **arrow functions** only: `const fn = () => {}`.
- **No `var`**; prefer `const`, then `let`.
- Clean Code + SOLID.
- Public functions must have explicit return types.

## CLI Conventions
- All output is JSON for machine consumption.
- Errors are structured JSON written to stderr.
- Accept `--json` for forward compatibility.

## Agent Skill Conventions
- SKILL.md follows the [agentskills spec](https://github.com/agentskills/agentskills).
- Keep SKILL.md under 500 lines; move details to `references/`.
- Frontmatter: `name` (lowercase, match dir), `description` (≤1024 chars), `compatibility`.

## Terminology
- **Task**: Godspeed task object.
- **List**: Task list in Godspeed.
- **Label**: Tag applied to tasks; IDs or names.
- **Metadata**: `Record<string, string>`; must stay ≤1024 chars total.