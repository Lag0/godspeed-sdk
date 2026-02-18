# Bug Report (Verification 2026-02-18)

## 1. CLI Argument Parsing (High Priority)
**Impact**: `godspeed tasks create` and `update` commands ignore flags.
**Cause**: The router in `src/cli.ts` (lines 412+) calls `parseArgs` a second time on `subcommand` arguments. This causes flags parsed in the first pass (global `flags` object) to be lost/ignored by the subcommand handler.
**Status**: Found during testing. Needs fix in `src/cli.ts`.

## 2. API Schema Validation Failures (High Priority)
**Impact**: `create`, `update`, and `duplicate` commands fail with "Validation failed".
**Cause**: The Godspeed API is inconsistent in its response shape:
- `GET /tasks/:id` returns `{ task: { ... } }` (Wrapped) -> **Works**.
- `POST /tasks` returns `{ ... }` (Unwrapped Task object) -> **Fails** `TaskResponseSchema` which expects `{ task: ... }`.
- `PATCH /tasks/:id` returns `{ ... }` (Unwrapped) -> **Fails**.
- `POST /lists/:id/duplicate` returns `{ ... }` (Unwrapped) -> **Fails** `DuplicateListResponseSchema` which expects `{ list: ... }`.

**Evidence**:
```json
// create/update failure
{
  "error": "[createTask:response] Validation failed: [{ \"path\": [\"task\"], \"message\": \"Required\" }]"
}
```

**Recommended Fix**: Update `schemas.ts` or `endpoints.ts` to handle unwrapped responses for write operations.

## 3. Empty List/Task Handling
**Impact**: Minor.
**Cause**: `is_complete` is omitted by API for incomplete tasks.
**Status**: **Fixed** in `src/schemas.ts` (made optional with default false).

## Summary of Test Results
| Command | Status | Notes |
|---|---|---|
| `tasks list` | ✅ PASS | Works (after schema fix) |
| `tasks get` | ✅ PASS | Returns wrapped task |
| `tasks create` | ❌ FAIL | Arg parsing bug + Schema validation (unwrapped response) |
| `tasks update` | ❌ FAIL | Arg parsing bug + Schema validation (unwrapped response) |
| `tasks delete` | ❓ UNTESTED | Likely works (returns 204) |
| `lists list` | ✅ PASS | Works |
| `lists duplicate`| ❌ FAIL | Schema validation (unwrapped response) |
