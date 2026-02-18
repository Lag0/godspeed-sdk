#!/usr/bin/env node
import { createClient } from "./client.js";
import {
  createTask,
  deleteTask,
  duplicateList,
  getTask,
  listLists,
  listTasks,
  updateTask,
} from "./endpoints.js";
import { GodspeedError } from "./errors.js";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as readline from "node:readline";

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env["GODSPEED_BASE_URL"] ?? "https://api.godspeedapp.com";

const CONFIG_DIR = path.join(os.homedir(), ".godspeed-sdk");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  token?: string;
}

const loadConfig = (): Config => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(content) as Config;
    }
  } catch {
    // ignore
  }
  return {};
};

const saveConfig = (config: Config): void => {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

const getToken = (): string => {
  // 1. Env var
  const envToken = process.env["GODSPEED_TOKEN"];
  if (envToken) return envToken;

  // 2. Config file
  const config = loadConfig();
  if (config.token) return config.token;

  printError("GODSPEED_TOKEN environment variable is not set and no config found.");
  printError("Run 'godspeed auth' to sign in, or set GODSPEED_TOKEN.");
  process.exit(1);
};

// ─── Output helpers ───────────────────────────────────────────────────────────

const printJson = (data: unknown): void => {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
};

const printError = (message: string, detail?: unknown): void => {
  const output: Record<string, unknown> = { error: message };
  if (detail !== undefined) output["detail"] = detail;
  process.stderr.write(JSON.stringify(output, null, 2) + "\n");
};

// ─── Arg parsing ──────────────────────────────────────────────────────────────

const parseArgs = (
  args: string[],
): { flags: Record<string, string | boolean>; positional: string[] } => {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === undefined) break;
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i += 1;
      }
    } else {
      positional.push(arg);
      i += 1;
    }
  }
  return { flags, positional };
};

const flag = (
  flags: Record<string, string | boolean>,
  key: string,
): string | undefined => {
  const v = flags[key];
  return typeof v === "string" ? v : undefined;
};

// ─── Help ─────────────────────────────────────────────────────────────────────

const HELP = `
godspeed — Godspeed task management CLI

USAGE
  godspeed <command> <subcommand> [options]

COMMANDS
  tasks list      List tasks
  tasks get       Get a task by ID
  tasks create    Create a task
  tasks update    Update a task
  tasks delete    Delete a task

  lists list      List all lists
  lists duplicate Duplicate a list

GLOBAL OPTIONS
  --json          Output JSON (default; for forward compatibility)

ENVIRONMENT
  GODSPEED_TOKEN     (required) Bearer token
  GODSPEED_BASE_URL  (optional) Override base URL

Run 'godspeed tasks --help' or 'godspeed lists --help' for subcommand help.
`.trim();

const TASKS_HELP = `
godspeed tasks — Manage Godspeed tasks

SUBCOMMANDS
  list
    --status      incomplete | complete
    --list-id     Filter by list ID
    --updated-before  ISO8601 timestamp
    --updated-after   ISO8601 timestamp

  get <task_id>

  create
    --title       (required) Task title
    --list-id     List ID (defaults to Inbox)
    --location    start | end
    --notes       Task notes
    --due-at      ISO8601 timestamp
    --timeless-due-at  YYYY-MM-DD
    --starts-at   ISO8601 timestamp
    --timeless-starts-at  YYYY-MM-DD
    --duration    Duration in minutes (integer)
    --label-names Comma-separated label names
    --label-ids   Comma-separated label IDs
    --metadata    JSON string e.g. '{"key":"value"}'

  update <task_id>
    --title, --notes, --due-at, --timeless-due-at
    --starts-at, --timeless-starts-at
    --snoozed-until, --timeless-snoozed-until
    --duration, --complete, --cleared
    --add-label-names, --add-label-ids
    --remove-label-names, --remove-label-ids
    --metadata

  delete <task_id>
`.trim();

const LISTS_HELP = `
godspeed lists — Manage Godspeed lists

SUBCOMMANDS
  list

  duplicate <list_id>
    --name  (optional) New list name
`.trim();

const AUTH_HELP = `
godspeed auth — Authenticate with Godspeed

USAGE
  godspeed auth [options]

OPTIONS
  --token <token>  Set token directly without prompt
`.trim();

// ─── Command handlers ─────────────────────────────────────────────────────────

const handleTasksList = async (
  flags: Record<string, string | boolean>,
): Promise<void> => {
  const client = createClient({ token: getToken(), baseUrl: BASE_URL });
  const result = await listTasks(client, {
    status: flag(flags, "status") as "incomplete" | "complete" | undefined,
    list_id: flag(flags, "list-id"),
    updated_before: flag(flags, "updated-before"),
    updated_after: flag(flags, "updated-after"),
  });
  printJson(result);
};

const handleTasksGet = async (
  positional: string[],
): Promise<void> => {
  const taskId = positional[0];
  if (!taskId) {
    printError("Missing required argument: <task_id>");
    process.exit(1);
  }
  const client = createClient({ token: getToken(), baseUrl: BASE_URL });
  const task = await getTask(client, taskId);
  printJson(task);
};

const handleTasksCreate = async (
  flags: Record<string, string | boolean>,
): Promise<void> => {
  const title = flag(flags, "title");
  if (!title) {
    printError("Missing required flag: --title");
    process.exit(1);
  }

  const metaRaw = flag(flags, "metadata");
  let metadata: Record<string, string> | undefined;
  if (metaRaw) {
    try {
      metadata = JSON.parse(metaRaw) as Record<string, string>;
    } catch {
      printError("--metadata must be valid JSON");
      process.exit(1);
    }
  }

  const labelNamesRaw = flag(flags, "label-names");
  const labelIdsRaw = flag(flags, "label-ids");
  const durationRaw = flag(flags, "duration");

  const client = createClient({ token: getToken(), baseUrl: BASE_URL });
  const task = await createTask(client, {
    title,
    list_id: flag(flags, "list-id"),
    location: flag(flags, "location") as "start" | "end" | undefined,
    notes: flag(flags, "notes"),
    due_at: flag(flags, "due-at"),
    timeless_due_at: flag(flags, "timeless-due-at"),
    starts_at: flag(flags, "starts-at"),
    timeless_starts_at: flag(flags, "timeless-starts-at"),
    duration_minutes: durationRaw ? parseInt(durationRaw, 10) : undefined,
    label_names: labelNamesRaw ? labelNamesRaw.split(",") : undefined,
    label_ids: labelIdsRaw ? labelIdsRaw.split(",") : undefined,
    metadata,
  });
  printJson(task);
};

const handleTasksUpdate = async (
  positional: string[],
  flags: Record<string, string | boolean>,
): Promise<void> => {
  const taskId = positional[0];
  if (!taskId) {
    printError("Missing required argument: <task_id>");
    process.exit(1);
  }

  const metaRaw = flag(flags, "metadata");
  let metadata: Record<string, string> | undefined;
  if (metaRaw) {
    try {
      metadata = JSON.parse(metaRaw) as Record<string, string>;
    } catch {
      printError("--metadata must be valid JSON");
      process.exit(1);
    }
  }

  const durationRaw = flag(flags, "duration");
  const addLabelNamesRaw = flag(flags, "add-label-names");
  const addLabelIdsRaw = flag(flags, "add-label-ids");
  const removeLabelNamesRaw = flag(flags, "remove-label-names");
  const removeLabelIdsRaw = flag(flags, "remove-label-ids");

  const isCompleteFlag = flags["complete"];
  const isClearedFlag = flags["cleared"];

  const client = createClient({ token: getToken(), baseUrl: BASE_URL });
  const task = await updateTask(client, taskId, {
    title: flag(flags, "title"),
    notes: flag(flags, "notes"),
    due_at: flag(flags, "due-at"),
    timeless_due_at: flag(flags, "timeless-due-at"),
    snoozed_until: flag(flags, "snoozed-until"),
    timeless_snoozed_until: flag(flags, "timeless-snoozed-until"),
    starts_at: flag(flags, "starts-at"),
    timeless_starts_at: flag(flags, "timeless-starts-at"),
    duration_minutes: durationRaw ? parseInt(durationRaw, 10) : undefined,
    is_complete:
      isCompleteFlag === "true"
        ? true
        : isCompleteFlag === "false"
          ? false
          : undefined,
    is_cleared:
      isClearedFlag === "true"
        ? true
        : isClearedFlag === "false"
          ? false
          : undefined,
    add_label_names: addLabelNamesRaw
      ? addLabelNamesRaw.split(",")
      : undefined,
    add_label_ids: addLabelIdsRaw ? addLabelIdsRaw.split(",") : undefined,
    remove_label_names: removeLabelNamesRaw
      ? removeLabelNamesRaw.split(",")
      : undefined,
    remove_label_ids: removeLabelIdsRaw
      ? removeLabelIdsRaw.split(",")
      : undefined,
    metadata,
  });
  printJson(task);
};

const handleTasksDelete = async (positional: string[]): Promise<void> => {
  const taskId = positional[0];
  if (!taskId) {
    printError("Missing required argument: <task_id>");
    process.exit(1);
  }
  const client = createClient({ token: getToken(), baseUrl: BASE_URL });
  await deleteTask(client, taskId);
  printJson({ success: true, deleted: taskId });
};

const handleListsList = async (): Promise<void> => {
  const client = createClient({ token: getToken(), baseUrl: BASE_URL });
  const result = await listLists(client);
  printJson(result);
};

const handleListsDuplicate = async (
  positional: string[],
  flags: Record<string, string | boolean>,
): Promise<void> => {
  const listId = positional[0];
  if (!listId) {
    printError("Missing required argument: <list_id>");
    process.exit(1);
  }
  const name = flag(flags, "name");
  const client = createClient({ token: getToken(), baseUrl: BASE_URL });
  const result = await duplicateList(client, listId, name ? { name } : undefined);
  printJson(result);
};

const handleAuth = async (flags: Record<string, string | boolean>): Promise<void> => {
  const tokenFlag = flag(flags, "token");
  let token = tokenFlag;

  if (!token) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      token = await new Promise<string>((resolve) => {
        rl.question("Enter your Godspeed API token: ", (answer) => {
          resolve(answer.trim());
        });
      });
    } finally {
      rl.close();
    }
  }

  if (!token) {
    printError("Token cannot be empty.");
    process.exit(1);
  }

  saveConfig({ token });
  printJson({ success: true, message: "Token saved to " + CONFIG_FILE });
};

// ─── Router ───────────────────────────────────────────────────────────────────

const run = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const { flags, positional } = parseArgs(args);

  const [command, subcommand, ...rest] = positional;

  if (!command || command === "help") {
    process.stdout.write(HELP + "\n");
    return;
  }

  try {
    if (command === "auth") {
      if (flags["help"]) {
        process.stdout.write(AUTH_HELP + "\n");
        return;
      }
      await handleAuth(flags);
    } else if (command === "tasks") {
      if (!subcommand || flags["help"]) {
        process.stdout.write(TASKS_HELP + "\n");
        return;
      }
      const { flags: subFlags, positional: subPositional } = parseArgs([
        subcommand,
        ...rest,
      ]);
      const sub = subPositional[0];
      const subArgs = subPositional.slice(1);

      if (sub === "list") {
        await handleTasksList(subFlags);
      } else if (sub === "get") {
        await handleTasksGet(subArgs);
      } else if (sub === "create") {
        await handleTasksCreate(subFlags);
      } else if (sub === "update") {
        await handleTasksUpdate(subArgs, subFlags);
      } else if (sub === "delete") {
        await handleTasksDelete(subArgs);
      } else {
        printError(`Unknown tasks subcommand: ${sub ?? "(none)"}`);
        process.stdout.write(TASKS_HELP + "\n");
        process.exit(1);
      }
    } else if (command === "lists") {
      if (!subcommand || flags["help"]) {
        process.stdout.write(LISTS_HELP + "\n");
        return;
      }
      const { flags: subFlags, positional: subPositional } = parseArgs([
        subcommand,
        ...rest,
      ]);
      const sub = subPositional[0];
      const subArgs = subPositional.slice(1);

      if (sub === "list") {
        await handleListsList();
      } else if (sub === "duplicate") {
        await handleListsDuplicate(subArgs, subFlags);
      } else {
        printError(`Unknown lists subcommand: ${sub ?? "(none)"}`);
        process.stdout.write(LISTS_HELP + "\n");
        process.exit(1);
      }
    } else {
      printError(`Unknown command: ${command}`);
      process.stdout.write(HELP + "\n");
      process.exit(1);
    }
  } catch (err) {
    if (err instanceof GodspeedError) {
      printError(err.message, err instanceof Error ? undefined : err);
    } else if (err instanceof Error) {
      printError(err.message);
    } else {
      printError("An unexpected error occurred", err);
    }
    process.exit(1);
  }
};

run();
