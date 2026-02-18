# Bug Report (Verification 2026-02-18)

> **All bugs resolved** in commit `28946ee`.

## 1. CLI Argument Parsing ✅ FIXED
**Impact**: `godspeed tasks create` and `update` commands ignored flags.
**Cause**: Secondary `parseArgs` call in router consumed only positional args, losing flags.
**Fix**: Removed secondary `parseArgs`; use top-level `flags` object directly.

## 2. API Schema Validation ✅ FIXED
**Impact**: `create`, `update`, and `duplicate` commands failed with "Validation failed".
**Cause**: API returns tasks wrapped in `todo_item` key (not `task`), and lists have varying key names.
**Fix**: Extract from `todo_item` → `task` → raw (fallback chain). Added `success: false` error handling.

## 3. Empty List/Task Handling ✅ FIXED
**Impact**: Minor. `is_complete` omitted by API for incomplete tasks.
**Fix**: Made optional with default `false` in `TaskSchema`.

## 4. Installer Runtime Detection ✅ ADDED
**Impact**: Installer required Bun; Node users couldn't install.
**Fix**: Detects Bun first → Node 18+ fallback → auto-installs Bun if neither found.

## Final Test Results
| Command | Status |
|---|---|
| `tasks list` | ✅ PASS |
| `tasks get` | ✅ PASS |
| `tasks create` | ✅ PASS |
| `tasks update` | ✅ PASS |
| `tasks delete` | ✅ PASS |
| `lists list` | ✅ PASS |
| `lists duplicate`| ✅ PASS |
