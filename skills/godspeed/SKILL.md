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
# List incomplete tasks
bash skills/godspeed/scripts/godspeed-cli.sh tasks list --status incomplete

# Create a task
bash skills/godspeed/scripts/godspeed-cli.sh tasks create --title "Buy milk"

# Complete a task
bash skills/godspeed/scripts/godspeed-cli.sh tasks update <task_id> --complete true

# List all lists
bash skills/godspeed/scripts/godspeed-cli.sh lists list
```

## Output format

All commands output JSON. Errors are written to stderr as JSON with an `error` field.

## Rate limits

- List tasks/lists: ≤10 req/min, ≤200/hr
- Create/update tasks: ≤60 req/min, ≤1000/hr

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GODSPEED_TOKEN` | Yes | Bearer token from Godspeed app |
| `GODSPEED_BASE_URL` | No | Override API base URL (default: `https://api.godspeedapp.com`) |

See [references/COMMANDS.md](references/COMMANDS.md) for the full CLI command reference.
