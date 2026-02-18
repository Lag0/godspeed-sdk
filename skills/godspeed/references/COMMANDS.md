# Godspeed CLI Command Reference

Full reference for all CLI commands. Run any command with `--help` for usage details.

## Task commands

### List tasks
```bash
godspeed tasks list
godspeed tasks list --status incomplete
godspeed tasks list --list-id <list_id>
godspeed tasks list --updated-after 2024-01-01T00:00:00Z
godspeed tasks list --updated-before 2024-12-31T23:59:59Z
```

### Get a task
```bash
godspeed tasks get <task_id>
```

### Create a task
```bash
godspeed tasks create --title "Buy milk"
godspeed tasks create \
  --title "Buy milk" \
  --list-id <list_id> \
  --notes "Vitamin D" \
  --due-at "2024-03-30T01:21:22Z" \
  --label-names "Dairy,Urgent"
```

**Create options:**
| Flag | Required | Description |
|---|---|---|
| `--title` | Yes | Task title |
| `--list-id` | No | List ID (defaults to Inbox) |
| `--location` | No | `start` or `end` |
| `--notes` | No | Task notes |
| `--due-at` | No | ISO8601 timestamp |
| `--timeless-due-at` | No | YYYY-MM-DD date |
| `--starts-at` | No | ISO8601 timestamp |
| `--timeless-starts-at` | No | YYYY-MM-DD date |
| `--duration` | No | Duration in minutes (integer) |
| `--label-names` | No | Comma-separated label names |
| `--label-ids` | No | Comma-separated label IDs |
| `--metadata` | No | JSON string e.g. `'{"key":"value"}'` |

### Update a task
```bash
godspeed tasks update <task_id> --title "Buy whole milk"
godspeed tasks update <task_id> --complete true
godspeed tasks update <task_id> --add-label-names "Urgent"
```

**Update options:**
| Flag | Description |
|---|---|
| `--title` | New title |
| `--notes` | New notes |
| `--due-at` | ISO8601 timestamp |
| `--timeless-due-at` | YYYY-MM-DD date |
| `--starts-at` | ISO8601 timestamp |
| `--timeless-starts-at` | YYYY-MM-DD date |
| `--snoozed-until` | ISO8601 timestamp |
| `--timeless-snoozed-until` | YYYY-MM-DD date |
| `--duration` | Duration in minutes |
| `--complete` | `true` or `false` |
| `--cleared` | `true` or `false` |
| `--add-label-names` | Comma-separated labels to add |
| `--add-label-ids` | Comma-separated label IDs to add |
| `--remove-label-names` | Comma-separated labels to remove |
| `--remove-label-ids` | Comma-separated label IDs to remove |
| `--metadata` | JSON string |

### Delete a task
```bash
godspeed tasks delete <task_id>
```

## List commands

### List all lists
```bash
godspeed lists list
```

### Duplicate a list
```bash
godspeed lists duplicate <list_id>
godspeed lists duplicate <list_id> --name "My Copy"
```
