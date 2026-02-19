---
name: godspeed
description: Manage Godspeed tasks and lists via the official API. Use this skill when the user wants to create, list, get, update, or delete tasks in Godspeed, or when they want to list or duplicate Godspeed lists. Requires GODSPEED_TOKEN environment variable to authenticate with the Godspeed API.
compatibility: Requires Node.js 18+ or Bun runtime. GODSPEED_TOKEN env var required. Network access to api.godspeedapp.com.
metadata:
  author: brunolago
---

# Godspeed Skill

Interact with the [Godspeed](https://godspeedapp.com) task management API using the CLI wrapper.

## Prerequisites

- `GODSPEED_TOKEN` environment variable must be set (Bearer token from Godspeed app)
- Node.js 18+ or Bun runtime installed
- The godspeed-sdk must be installed and built

## When to use this skill

Use this skill when the user asks to:
- List, create, get, update, or delete **tasks** in Godspeed
- List or duplicate **lists** in Godspeed
- **Authenticate** with the Godspeed API (`godspeed auth`)

## How to run commands

All commands are run via the wrapper script:

```bash
bash skills/godspeed/scripts/godspeed-cli.sh <command> <subcommand> [options]
```

Or if the CLI is installed globally:

```bash
godspeed <command> <subcommand> [options]
```

## Quick examples

```bash
# Authenticate (saves token to ~/.godspeed-sdk/config.json)
bash skills/godspeed/scripts/godspeed-cli.sh auth

# List incomplete tasks
bash skills/godspeed/scripts/godspeed-cli.sh tasks list --status incomplete

# Create a task
bash skills/godspeed/scripts/godspeed-cli.sh tasks create --title "Buy milk"

# Create with markdown notes (use \n for newlines)
bash skills/godspeed/scripts/godspeed-cli.sh tasks create --title "Plan" --notes "## Goal\nShip v2\n\n## Tasks\n- Fix bugs\n- Deploy"

# Complete a task
bash skills/godspeed/scripts/godspeed-cli.sh tasks update <task_id> --complete true

# List all lists
bash skills/godspeed/scripts/godspeed-cli.sh lists list
```

> **Note:** Use `\n` in `--notes` for newlines. The CLI converts them to real line breaks, so markdown formatting (headings, lists, etc.) renders correctly in the Godspeed app.

## Output format

All commands output JSON. Errors are written to stderr as JSON with an `error` field.

## Rate limits

- List tasks/lists: ≤10 req/min, ≤200/hr
- Create/update tasks: ≤60 req/min, ≤1000/hr

## Installing / Updating

```bash
# Install or update (same command)
curl -fsSL https://raw.githubusercontent.com/Lag0/godspeed-sdk/master/install.sh | bash
```

The installer auto-detects Bun or Node.js 18+ and handles updates automatically.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GODSPEED_TOKEN` | Yes | Bearer token from Godspeed app |
| `GODSPEED_BASE_URL` | No | Override API base URL (default: `https://api.godspeedapp.com`) |

See [references/COMMANDS.md](references/COMMANDS.md) for the full CLI command reference.
