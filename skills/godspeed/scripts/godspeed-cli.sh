#!/usr/bin/env bash
# godspeed-cli.sh — Thin wrapper around the Godspeed SDK CLI
# Requires: Bun runtime, GODSPEED_TOKEN env var

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
CLI_ENTRY="${SDK_ROOT}/src/cli.ts"

if [[ -z "${GODSPEED_TOKEN:-}" ]]; then
  echo '{"error":"GODSPEED_TOKEN environment variable is not set"}' >&2
  exit 1
fi

if ! command -v bun &>/dev/null; then
  echo '{"error":"Bun runtime not found. Install from https://bun.sh"}' >&2
  exit 1
fi

exec bun run "${CLI_ENTRY}" "$@"
