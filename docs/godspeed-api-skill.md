# Godspeed API Skill

> Typed SDK + CLI + Agent Skill for the [Godspeed](https://godspeedapp.com) task management API.

## Overview

This skill gives AI agents the ability to manage Godspeed tasks and lists via the official API. It wraps the `godspeed` CLI, which is built on a fully typed TypeScript SDK (Bun + Zod).

## Installation

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Then set your token:

```bash
export GODSPEED_TOKEN=your_token_here
```

Get your token from the Godspeed desktop app → Command Palette → "Copy API access token".

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GODSPEED_TOKEN` | ✅ | — | Bearer token from Godspeed app |
| `GODSPEED_BASE_URL` | ❌ | `https://api.godspeedapp.com` | Override API base URL |

## Rate Limits

| Operation | Per Minute | Per Hour |
|---|---|---|
| List tasks / lists | 10 | 200 |
| Create / update tasks | 60 | 1,000 |

## CLI Reference

### Tasks

#### List tasks

```bash
godspeed tasks list
godspeed tasks list --status incomplete
godspeed tasks list --status complete
godspeed tasks list --list-id <list_id>
godspeed tasks list --updated-after 2024-01-01T00:00:00Z
godspeed tasks list --updated-before 2024-12-31T23:59:59Z
```

Returns up to 250 tasks ordered by `updated_at` descending. Use `--updated-before` to paginate.

#### Get a task

```bash
godspeed tasks get <task_id>
```

#### Create a task

```bash
godspeed tasks create --title "Buy milk"

godspeed tasks create \
  --title "Buy milk" \
  --list-id abc-123 \
  --location start \
  --notes "Vitamin D" \
  --due-at "2024-03-30T01:21:22Z" \
  --duration 30 \
  --label-names "Dairy,Urgent" \
  --metadata '{"source":"api"}'
```

**Flags:**

| Flag | Required | Description |
|---|---|---|
| `--title` | ✅ | Task title |
| `--list-id` | ❌ | List ID (defaults to Inbox) |
| `--location` | ❌ | `start` or `end` |
| `--notes` | ❌ | Task notes |
| `--due-at` | ❌ | ISO8601 timestamp |
| `--timeless-due-at` | ❌ | Date only: `YYYY-MM-DD` |
| `--starts-at` | ❌ | ISO8601 timestamp |
| `--timeless-starts-at` | ❌ | Date only: `YYYY-MM-DD` |
| `--duration` | ❌ | Duration in minutes (integer) |
| `--label-names` | ❌ | Comma-separated label names |
| `--label-ids` | ❌ | Comma-separated label IDs |
| `--metadata` | ❌ | JSON string `{"key":"value"}` (max 1024 chars) |

> Note: Do not specify both `--due-at` and `--timeless-due-at`.

#### Update a task

```bash
godspeed tasks update <task_id> --title "Buy whole milk"
godspeed tasks update <task_id> --complete true
godspeed tasks update <task_id> --add-label-names "Urgent"
godspeed tasks update <task_id> --remove-label-ids "def-456"
```

**Flags** (all optional):

| Flag | Description |
|---|---|
| `--title` | New title |
| `--notes` | New notes |
| `--due-at` | ISO8601 timestamp |
| `--timeless-due-at` | `YYYY-MM-DD` |
| `--starts-at` | ISO8601 timestamp |
| `--timeless-starts-at` | `YYYY-MM-DD` |
| `--snoozed-until` | ISO8601 timestamp |
| `--timeless-snoozed-until` | `YYYY-MM-DD` |
| `--duration` | Duration in minutes |
| `--complete` | `true` or `false` |
| `--cleared` | `true` or `false` |
| `--add-label-names` | Comma-separated names to add |
| `--add-label-ids` | Comma-separated IDs to add |
| `--remove-label-names` | Comma-separated names to remove |
| `--remove-label-ids` | Comma-separated IDs to remove |
| `--metadata` | JSON string |

#### Delete a task

```bash
godspeed tasks delete <task_id>
```

### Lists

#### List all lists

```bash
godspeed lists list
```

Returns all lists accessible by your account, including shared lists.

> Note: Smart lists are not supported by the API.

#### Duplicate a list

```bash
godspeed lists duplicate <list_id>
godspeed lists duplicate <list_id> --name "My Copy"
```

Duplicates a list and all its tasks. `--name` is optional.

## Output Format

All commands output JSON to stdout. Errors are written to stderr as JSON:

```json
{ "error": "Authentication failed. Check your GODSPEED_TOKEN." }
```

## SDK Usage (TypeScript)

```typescript
import { createClient, listTasks, createTask } from "godspeed-sdk";

const client = createClient({ token: process.env.GODSPEED_TOKEN! });

// List incomplete tasks
const { tasks } = await listTasks(client, { status: "incomplete" });

// Create a task
const task = await createTask(client, {
  title: "Buy milk",
  notes: "Vitamin D",
  due_at: "2024-03-30T01:21:22Z",
});
```

## Project Structure

```
wrappers/godspeed/src/
  client.ts      # HTTP client + auth
  endpoints.ts   # 1:1 endpoint functions
  schemas.ts     # Zod schemas (source of truth)
  types.ts       # z.infer types only
  errors.ts      # Typed error classes
  cli.ts         # CLI entry point
  index.ts       # SDK barrel export

skills/godspeed/
  SKILL.md                    # Agent Skill definition
  scripts/godspeed-cli.sh     # Thin bash wrapper

install.sh                    # Bash installer
```
