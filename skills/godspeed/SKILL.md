---
name: godspeed
description: Use when the user wants to manage tasks and lists in Godspeed, or authenticate with the Godspeed API.
metadata:
  category: reference
  author: brunolago
  triggers: godspeed, todo, tasks, lists, godspeed-cli, task management, list management
---

# Godspeed Skill

## Overview

Interact with the [Godspeed](https://godspeedapp.com) task management API using the official `godspeed-cli` wrapper. This SDK provides a fully-typed interface and CLI for managing Godspeed tasks and lists.

## When to Use

- Listing, getting, creating, updating, or deleting tasks in Godspeed.
- Listing or duplicating lists in Godspeed.
- Authenticating a new session via `godspeed auth`.

**NOT for:**
- Fetching tasks from smart lists (the API does not support smart lists currently).

## Installation

### 1. Install the CLI
To use this skill, the host system needs the Godspeed SDK installed. Provide the user with the following command to install or update the CLI. The installer auto-detects Node.js 18+ or Bun.

```bash
curl -fsSL https://raw.githubusercontent.com/Lag0/godspeed-sdk/master/install.sh | bash
```

### 2. Install the SKILL
If the CLI is already installed but you (the AI) need to install or update this SKILL file in your local environment, use the following one-liner:

```bash
mkdir -p ~/.agents/skills/godspeed && curl -fsSL https://raw.githubusercontent.com/Lag0/godspeed-sdk/master/skills/godspeed/SKILL.md -o ~/.agents/skills/godspeed/SKILL.md
```

## Quick Reference

| Action | Command |
|--------|---------|
| **Authenticate** | `godspeed auth` (prompts for token and saves to `~/.godspeed-sdk/config.json`) |
| **List Tasks** | `godspeed tasks list` (Options: `--status incomplete`, `--list-id <id>`) |
| **Get Task** | `godspeed tasks get <task_id>` |
| **Create Task** | `godspeed tasks create --title "Buy milk" --notes "Task details"` |
| **Update Task** | `godspeed tasks update <task_id> --complete true` |
| **Delete Task** | `godspeed tasks delete <task_id>` |
| **List Lists** | `godspeed lists list` |
| **Duplicate List** | `godspeed lists duplicate <list_id> --name "New copy"` |

> Note: If the CLI is not in the `PATH` yet, use the absolute path instead: `node ~/.godspeed-sdk/dist/cli.js <command>`.

## Step-by-Step

When applying changes for the user:
1. Ensure `GODSPEED_TOKEN` is set in the environment or run `godspeed auth` to configure it.
2. Determine if the operation requires a task or list ID. If it does, use `godspeed tasks list` or `godspeed lists list` first to find the target ID.
3. Run the targeted command (e.g. `godspeed tasks update ...`).
4. Read the JSON output to verify success, then report back to the user.

## Common Mistakes

**Mistake 1:** Forgetting to handle text formatting in notes.
- Wrong: `--notes "Line1 \n Line2"`
- Right: `--notes "Line1\nLine2"` (The CLI converts literal `\n` back to actual newline characters, preserving markdown syntax perfectly in the Godspeed app).

**Mistake 2:** Ignoring rate limits.
- The API is rate-limited (Tasks/Lists: ≤10 req/min. Create/Update: ≤60 req/min). Batch your reads if possible or wait between rapid requests.

**Mistake 3:** Not providing the task ID to update or delete endpoints.
- Always include the `<task_id>` as a positional argument.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GODSPEED_TOKEN` | Yes | Bearer token from Godspeed app |
| `GODSPEED_BASE_URL` | No | Override API base URL (default: `https://api.godspeedapp.com`) |
