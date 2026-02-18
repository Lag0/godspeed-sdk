# Godspeed SDK

Typed TypeScript SDK, CLI, and Agent Skill for the [Godspeed](https://godspeedapp.com) task management API.

![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)
![Runtime: Node/Bun](https://img.shields.io/badge/runtime-Node%20%7C%20Bun-black)

## Installation

Install via the installer script (works on macOS and Linux):

The installer auto-detects **Bun** or **Node.js 18+** — no need to install a specific runtime.

```bash
curl -fsSL https://raw.githubusercontent.com/Lag0/godspeed-sdk/master/install.sh | bash
```

Or build from source:

```bash
git clone https://github.com/Lag0/godspeed-sdk.git
cd godspeed-sdk
bun install
bun run build
# Add bin/godspeed to your PATH
```

## Authentication

You can authenticate in two ways:

### 1. Interactive Login (Recommended)

Run `godspeed auth` and paste your token from the Godspeed app:

```bash
godspeed auth
# Enter your Godspeed API token: ...
```

This saves your token to `~/.godspeed-sdk/config.json`.

### 2. Environment Variable

You can also set the `GODSPEED_TOKEN` environment variable, which overrides the config file:

```bash
export GODSPEED_TOKEN="your_token_here"
```

## CLI Usage

The `godspeed` CLI outputs JSON by default for easy parsing.

### Tasks

```bash
# List incomplete tasks
godspeed tasks list --status incomplete

# Create a task
godspeed tasks create --title "Buy milk" --label-names "Personal"

# Get a task
godspeed tasks get <task_id>

# Update a task
godspeed tasks update <task_id> --complete true

# Delete a task
godspeed tasks delete <task_id>
```

### Lists

```bash
# List all lists
godspeed lists list

# Duplicate a list
godspeed lists duplicate <list_id> --name "New Project"
```

### Help

```bash
godspeed --help
godspeed tasks --help
godspeed lists --help
godspeed auth --help
```

## Agent Integration

This SDK includes an **Agent Skill** following the [agentskills specification](https://github.com/agentskills/agentskills).

- **Skill Definition**: `skills/godspeed/SKILL.md`
- **Command Reference**: `skills/godspeed/references/COMMANDS.md`

Point your agent framework to the `skills/godspeed` directory to enable Godspeed capabilities.

## SDK Usage (TypeScript)

```typescript
import { createClient, listTasks } from "godspeed-sdk";

const client = createClient({ token: process.env.GODSPEED_TOKEN });

const tasks = await listTasks(client, { status: "incomplete" });
console.log(tasks);
```

## License

MIT
