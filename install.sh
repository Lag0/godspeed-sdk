#!/bin/bash
set -euo pipefail

# Godspeed SDK Installer
# Usage: curl -fsSL https://godspeedapp.com/install.sh | bash

# ─── Colors ───────────────────────────────────────────────────────────────────

BOLD='\033[1m'
ACCENT='\033[38;2;99;102;241m'         # indigo-500
SUCCESS='\033[38;2;34;197;94m'         # green-500
WARN='\033[38;2;234;179;8m'            # amber-500
ERROR='\033[38;2;239;68;68m'           # red-500
MUTED='\033[38;2;107;114;128m'         # gray-500
NC='\033[0m'

# ─── Config ───────────────────────────────────────────────────────────────────

REPO_URL="${GODSPEED_REPO_URL:-https://github.com/brunolago/godspeed-sdk.git}"
INSTALL_DIR="${GODSPEED_INSTALL_DIR:-${HOME}/.godspeed-sdk}"
BIN_DIR="${HOME}/.local/bin"
BIN_LINK="${BIN_DIR}/godspeed"

VERBOSE="${GODSPEED_VERBOSE:-0}"
DRY_RUN="${GODSPEED_DRY_RUN:-0}"
HELP=0

INSTALL_STAGE_TOTAL=4
INSTALL_STAGE_CURRENT=0

# ─── Temp file cleanup ───────────────────────────────────────────────────────

TMPFILES=()
cleanup_tmpfiles() {
    local f
    for f in "${TMPFILES[@]:-}"; do
        rm -rf "$f" 2>/dev/null || true
    done
}
trap cleanup_tmpfiles EXIT

mktempfile() {
    local f
    f="$(mktemp)"
    TMPFILES+=("$f")
    echo "$f"
}

# ─── UI helpers ───────────────────────────────────────────────────────────────

ui_info() {
    echo -e "${MUTED}·${NC} $*"
}

ui_success() {
    echo -e "${SUCCESS}✓${NC} $*"
}

ui_warn() {
    echo -e "${WARN}!${NC} $*" >&2
}

ui_error() {
    echo -e "${ERROR}✗${NC} $*" >&2
}

ui_stage() {
    local title="$1"
    INSTALL_STAGE_CURRENT=$((INSTALL_STAGE_CURRENT + 1))
    echo ""
    echo -e "${ACCENT}${BOLD}[${INSTALL_STAGE_CURRENT}/${INSTALL_STAGE_TOTAL}] ${title}${NC}"
}

ui_kv() {
    local key="$1"
    local value="$2"
    printf "  ${MUTED}%-18s${NC} %s\n" "${key}:" "$value"
}

# ─── Banner ───────────────────────────────────────────────────────────────────

print_banner() {
    echo ""
    echo -e "${ACCENT}${BOLD}  ⚡ Godspeed SDK Installer${NC}"
    echo -e "${MUTED}  Typed SDK & CLI for the Godspeed task management API${NC}"
    echo ""
}

# ─── Help ─────────────────────────────────────────────────────────────────────

print_usage() {
    cat <<EOF
Godspeed SDK Installer (macOS + Linux)

Usage:
  curl -fsSL https://godspeedapp.com/install.sh | bash
  curl -fsSL https://godspeedapp.com/install.sh | bash -s -- [options]

Options:
  --dir <path>       Installation directory (default: ~/.godspeed-sdk)
  --dry-run          Print what would happen without making changes
  --verbose          Enable verbose output
  --help, -h         Show this help

Environment variables:
  GODSPEED_REPO_URL      Git repository URL (default: GitHub)
  GODSPEED_INSTALL_DIR   Installation directory (default: ~/.godspeed-sdk)
  GODSPEED_VERBOSE       Enable verbose output (0|1)
  GODSPEED_DRY_RUN       Dry run mode (0|1)

After installation:
  export GODSPEED_TOKEN=your_token_here
  godspeed tasks list
EOF
}

# ─── Arg parsing ──────────────────────────────────────────────────────────────

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dir)
                INSTALL_DIR="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=1
                shift
                ;;
            --verbose)
                VERBOSE=1
                shift
                ;;
            --help|-h)
                HELP=1
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
}

# ─── OS detection ─────────────────────────────────────────────────────────────

OS="unknown"

detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]] || [[ -n "${WSL_DISTRO_NAME:-}" ]]; then
        OS="linux"
    fi

    if [[ "$OS" == "unknown" ]]; then
        ui_error "Unsupported operating system"
        echo "  This installer supports macOS and Linux (including WSL)."
        exit 1
    fi

    ui_success "Detected: ${OS} ($(uname -m))"
}

# ─── Bun ──────────────────────────────────────────────────────────────────────

check_bun() {
    if command -v bun &>/dev/null; then
        ui_success "Bun $(bun --version) found"
        return 0
    fi
    return 1
}

install_bun() {
    ui_info "Installing Bun runtime..."

    if [[ "$DRY_RUN" == "1" ]]; then
        ui_info "[dry-run] Would install Bun via bun.sh"
        return 0
    fi

    local log
    log="$(mktempfile)"

    if [[ "$VERBOSE" == "1" ]]; then
        curl -fsSL https://bun.sh/install | bash 2>&1 | tee "$log"
    else
        curl -fsSL https://bun.sh/install | bash >"$log" 2>&1
    fi

    # Source bun into current session
    export BUN_INSTALL="${HOME}/.bun"
    export PATH="${BUN_INSTALL}/bin:${PATH}"

    if ! command -v bun &>/dev/null; then
        ui_error "Bun installation failed"
        if [[ -s "$log" ]]; then
            tail -n 20 "$log" >&2
        fi
        echo "  Install manually: https://bun.sh"
        exit 1
    fi

    ui_success "Bun $(bun --version) installed"
}

# ─── Git ──────────────────────────────────────────────────────────────────────

check_git() {
    if command -v git &>/dev/null; then
        ui_success "Git found"
        return 0
    fi
    return 1
}

install_git() {
    ui_info "Installing Git..."

    if [[ "$DRY_RUN" == "1" ]]; then
        ui_info "[dry-run] Would install Git"
        return 0
    fi

    if [[ "$OS" == "macos" ]]; then
        if command -v brew &>/dev/null; then
            brew install git
        else
            ui_error "Homebrew not found. Install Git manually."
            exit 1
        fi
    elif [[ "$OS" == "linux" ]]; then
        if command -v apt-get &>/dev/null; then
            sudo apt-get update -qq && sudo apt-get install -y -qq git
        elif command -v dnf &>/dev/null; then
            sudo dnf install -y -q git
        elif command -v yum &>/dev/null; then
            sudo yum install -y -q git
        elif command -v apk &>/dev/null; then
            sudo apk add --no-cache git
        else
            ui_error "Could not detect package manager. Install Git manually."
            exit 1
        fi
    fi

    ui_success "Git installed"
}

# ─── Clone / update repo ─────────────────────────────────────────────────────

ensure_repo() {
    if [[ "$DRY_RUN" == "1" ]]; then
        if [[ -d "${INSTALL_DIR}/.git" ]]; then
            ui_info "[dry-run] Would update ${INSTALL_DIR}"
        else
            ui_info "[dry-run] Would clone to ${INSTALL_DIR}"
        fi
        return 0
    fi

    if [[ -d "${INSTALL_DIR}/.git" ]]; then
        ui_info "Updating existing installation..."
        if [[ -z "$(git -C "${INSTALL_DIR}" status --porcelain 2>/dev/null || true)" ]]; then
            git -C "${INSTALL_DIR}" pull --ff-only --quiet || {
                ui_warn "Git pull failed; continuing with existing version"
            }
        else
            ui_warn "Local changes detected; skipping git pull"
        fi
        ui_success "Repository updated"
    else
        ui_info "Cloning godspeed-sdk..."
        git clone --depth 1 "${REPO_URL}" "${INSTALL_DIR}"
        ui_success "Repository cloned to ${INSTALL_DIR}"
    fi
}

# ─── Build ────────────────────────────────────────────────────────────────────

build_sdk() {
    if [[ "$DRY_RUN" == "1" ]]; then
        ui_info "[dry-run] Would install deps and build CLI"
        return 0
    fi

    ui_info "Installing dependencies..."
    local log
    log="$(mktempfile)"

    if [[ "$VERBOSE" == "1" ]]; then
        bun install --cwd "${INSTALL_DIR}" 2>&1 | tee "$log"
    else
        bun install --cwd "${INSTALL_DIR}" --frozen-lockfile >"$log" 2>&1 \
            || bun install --cwd "${INSTALL_DIR}" >"$log" 2>&1
    fi
    ui_success "Dependencies installed"

    ui_info "Building CLI..."
    bun build \
        "${INSTALL_DIR}/src/cli.ts" \
        --outdir "${INSTALL_DIR}/dist" \
        --target node \
        --minify >/dev/null 2>&1

    ui_success "CLI built (dist/cli.js)"
}

# ─── Symlink ──────────────────────────────────────────────────────────────────

create_launcher() {
    if [[ "$DRY_RUN" == "1" ]]; then
        ui_info "[dry-run] Would create launcher at ${BIN_LINK}"
        return 0
    fi

    mkdir -p "${BIN_DIR}"

    cat > "${BIN_LINK}" <<EOF
#!/usr/bin/env bash
set -euo pipefail
exec node "${INSTALL_DIR}/dist/cli.js" "\$@"
EOF
    chmod +x "${BIN_LINK}"
    ui_success "Launcher installed: ${BIN_LINK}"
}

# ─── PATH check ──────────────────────────────────────────────────────────────

check_path() {
    if [[ ":${PATH}:" == *":${BIN_DIR}:"* ]]; then
        return 0
    fi

    echo ""
    ui_warn "${BIN_DIR} is not in your PATH"
    echo "  Add to your shell profile (~/.zshrc or ~/.bashrc):"
    echo ""
    echo "    export PATH=\"\${HOME}/.local/bin:\${PATH}\""
    echo ""
}

# ─── Install plan ─────────────────────────────────────────────────────────────

show_install_plan() {
    echo -e "${MUTED}Install plan:${NC}"
    ui_kv "OS" "$OS ($(uname -m))"
    ui_kv "Install directory" "$INSTALL_DIR"
    ui_kv "CLI launcher" "$BIN_LINK"
    ui_kv "Repository" "$REPO_URL"
    if [[ "$DRY_RUN" == "1" ]]; then
        ui_kv "Dry run" "yes"
    fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────

main() {
    if [[ "$HELP" == "1" ]]; then
        print_usage
        return 0
    fi

    print_banner

    # [1/4] Detecting environment
    ui_stage "Detecting environment"
    detect_os
    show_install_plan

    if [[ "$DRY_RUN" == "1" ]]; then
        echo ""
        ui_success "Dry run complete (no changes made)"
        return 0
    fi

    # [2/4] Installing dependencies
    ui_stage "Installing dependencies"

    if ! check_git; then
        install_git
    fi

    if ! check_bun; then
        install_bun
    fi

    # [3/4] Installing Godspeed SDK
    ui_stage "Installing Godspeed SDK"
    ensure_repo
    build_sdk

    # [4/4] Finalizing
    ui_stage "Finalizing"
    create_launcher
    check_path

    # ─── Success ──────────────────────────────────────────────────────────────

    echo ""
    echo -e "${SUCCESS}${BOLD}⚡ Godspeed SDK installed successfully!${NC}"
    echo ""
    echo "  Set your token:"
    echo -e "    ${MUTED}export GODSPEED_TOKEN=your_token_here${NC}"
    echo ""
    echo "  Try it:"
    echo -e "    ${MUTED}godspeed tasks list${NC}"
    echo -e "    ${MUTED}godspeed tasks create --title \"My first task\"${NC}"
    echo -e "    ${MUTED}godspeed lists list${NC}"
    echo ""
}

parse_args "$@"

if [[ "$VERBOSE" == "1" ]]; then
    set -x
fi

main
