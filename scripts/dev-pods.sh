#!/usr/bin/env bash
# Manage @tapis/tapis-typescript-pods: toggle between local build and published npm.
#
# Interactive by default — shows current state, diffs, and a menu.
# Pass flags for non-interactive (CI / scripted) use.
#
# Flags:
#   --local          Wire in local gen/pods (skips Docker build if gen/pods exists)
#   --build          Force Docker rebuild, then wire local
#   --remote         Remove .pnpmfile.cjs, revert to published npm
#   --status         Print current state and exit
#   -h, --help       Show usage
#
# Env vars:
#   TAPIS_TS_DIR     Path to tapis-typescript repo  (default: ../tapis-typescript)
#   DOCKER_IMAGE     Docker image for builds         (default: tapis/tapis-typescript:latest)
#
# After any switch: run "pnpm install" in your nix shell.

set -euo pipefail

# Anchor all paths to the repo root (script lives in scripts/, repo root is one up)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

TAPIS_TS_DIR="${TAPIS_TS_DIR:-$REPO_ROOT/../tapis-typescript}"
DOCKER_IMAGE="${DOCKER_IMAGE:-tapis/tapis-typescript:latest}"
PNPMFILE="$REPO_ROOT/.pnpmfile.cjs"

# ── Colors (only when writing to a terminal) ──────────────────────────────────
if [ -t 1 ]; then
  BOLD='\033[1m'; DIM='\033[2m'
  GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'
  NC='\033[0m'
else
  BOLD=''; DIM=''; GREEN=''; YELLOW=''; CYAN=''; RED=''; NC=''
fi

# ── State detection ───────────────────────────────────────────────────────────
ABS_TS_DIR=""
if [ -d "$TAPIS_TS_DIR" ]; then
  ABS_TS_DIR="$(cd "$TAPIS_TS_DIR" && pwd)"
fi
GEN_PODS="${ABS_TS_DIR}/gen/pods"

REMOTE_VERSION=$(node -e "
  try {
    const p = require('$REPO_ROOT/package.json');
    const v = (p.devDependencies || {})['@tapis/tapis-typescript-pods']
           || (p.dependencies   || {})['@tapis/tapis-typescript-pods'];
    process.stdout.write(v || 'unknown');
  } catch(e) { process.stdout.write('unknown'); }
" 2>/dev/null || echo "unknown")

if [ -f "$PNPMFILE" ]; then
  CURRENT_MODE="local"
  CURRENT_PATH=$(grep -o "file:[^'\"]*" "$PNPMFILE" 2>/dev/null | head -1 | sed 's/file://' || echo "unknown")
else
  CURRENT_MODE="remote"
  CURRENT_PATH=""
fi

GEN_EXISTS=false
LOCAL_VERSION="(not built)"
if [ -n "$ABS_TS_DIR" ] && [ -d "$GEN_PODS" ]; then
  GEN_EXISTS=true
  LOCAL_VERSION=$(node -e "
    try { process.stdout.write(require('$GEN_PODS/package.json').version); }
    catch(e) { process.stdout.write('unknown'); }
  " 2>/dev/null || echo "unknown")
fi

# ── Print status ──────────────────────────────────────────────────────────────
print_status() {
  echo ""
  echo -e "${BOLD}  @tapis/tapis-typescript-pods${NC}"
  echo    "  ─────────────────────────────────────────────"

  if [ "$CURRENT_MODE" = "local" ]; then
    echo -e "  Mode     ${YELLOW}local${NC}   (.pnpmfile.cjs wired)"
    echo -e "  Using    ${DIM}$CURRENT_PATH${NC}"
  else
    echo -e "  Mode     ${GREEN}remote${NC}  (published npm)"
  fi

  echo ""
  echo -e "  ${BOLD}Remote${NC}   npm        ${CYAN}$REMOTE_VERSION${NC}"

  if [ -n "$ABS_TS_DIR" ]; then
    if $GEN_EXISTS; then
      echo -e "  ${BOLD}Local${NC}    gen/pods   ${CYAN}$LOCAL_VERSION${NC}   ${DIM}$GEN_PODS${NC}"
    else
      echo -e "  ${BOLD}Local${NC}    gen/pods   ${RED}not built${NC}       ${DIM}$GEN_PODS${NC}"
    fi
  else
    echo -e "  ${BOLD}Local${NC}    tapis-typescript  ${RED}not found${NC}  ${DIM}(TAPIS_TS_DIR=$TAPIS_TS_DIR)${NC}"
  fi

  echo ""
}

# ── Actions ───────────────────────────────────────────────────────────────────
do_build() {
  if [ -z "$ABS_TS_DIR" ]; then
    echo -e "${RED}❌  tapis-typescript not found at: $TAPIS_TS_DIR${NC}"
    echo    "    Set TAPIS_TS_DIR=<path> to override."
    exit 1
  fi
  echo -e "📦  Building ${BOLD}@tapis/tapis-typescript-pods${NC} via Docker..."
  docker run --rm -v "$ABS_TS_DIR":/src -w /src "$DOCKER_IMAGE" ./generate.sh pods
  if [ ! -d "$GEN_PODS" ]; then
    echo -e "${RED}❌  Build failed — $GEN_PODS not found.${NC}"
    exit 1
  fi
  GEN_EXISTS=true
  LOCAL_VERSION=$(node -e "
    try { process.stdout.write(require('$GEN_PODS/package.json').version); }
    catch(e) { process.stdout.write('unknown'); }
  " 2>/dev/null || echo "unknown")
  echo -e "${GREEN}✅  Built v$LOCAL_VERSION${NC}"
}

write_pnpmfile() {
  cat > "$PNPMFILE" << EOF
function readPackage(pkg) {
  const localPath = 'file:$GEN_PODS';
  if (pkg.dependencies?.['@tapis/tapis-typescript-pods']) {
    pkg.dependencies['@tapis/tapis-typescript-pods'] = localPath;
  }
  if (pkg.devDependencies?.['@tapis/tapis-typescript-pods']) {
    pkg.devDependencies['@tapis/tapis-typescript-pods'] = localPath;
  }
  return pkg;
}
module.exports = { hooks: { readPackage } };
EOF
}

do_local() {
  if [ -z "$ABS_TS_DIR" ]; then
    echo -e "${RED}❌  tapis-typescript not found at: $TAPIS_TS_DIR${NC}"
    echo    "    Set TAPIS_TS_DIR=<path> to override."
    exit 1
  fi
  if ! $GEN_EXISTS; then
    echo    "    gen/pods not found — building first..."
    do_build
  fi
  write_pnpmfile
  echo -e "${GREEN}✅  Local mode${NC}  →  $GEN_PODS  (v$LOCAL_VERSION)"
  echo -e "    ${DIM}Run in your nix shell: pnpm install${NC}"
}

do_remote() {
  if [ -f "$PNPMFILE" ]; then
    rm "$PNPMFILE"
    echo -e "${GREEN}✅  Remote mode${NC}  →  npm $REMOTE_VERSION"
  else
    echo -e "${DIM}    Already on remote — nothing changed.${NC}"
  fi
  echo -e "    ${DIM}Run in your nix shell: pnpm install${NC}"
}

# ── Argument parsing (non-interactive) ───────────────────────────────────────
MODE=""
DO_BUILD=false

for arg in "$@"; do
  case "$arg" in
    --local)  MODE="local" ;;
    --remote) MODE="remote" ;;
    --build)  DO_BUILD=true; MODE="${MODE:-local}" ;;
    --status) print_status; exit 0 ;;
    -h|--help)
      sed -n '2,18p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *) echo "Unknown arg: $arg  (try --help)"; exit 1 ;;
  esac
done

if [ -n "$MODE" ]; then
  print_status
  if $DO_BUILD; then do_build; fi
  case "$MODE" in
    local)  do_local  ;;
    remote) do_remote ;;
  esac
  exit 0
fi

# ── Interactive mode ──────────────────────────────────────────────────────────
print_status

# Build the option list based on current state
OPTS=()
LABELS=()
CHANGES=()

if [ "$CURRENT_MODE" = "remote" ]; then
  if $GEN_EXISTS; then
    OPTS+=("local")
    LABELS+=("Use local build")
    CHANGES+=("$REMOTE_VERSION  →  local v$LOCAL_VERSION  (skip Docker, fast)")
  fi
  if [ -n "$ABS_TS_DIR" ]; then
    OPTS+=("build")
    LABELS+=("Rebuild + use local")
    CHANGES+=("$REMOTE_VERSION  →  local rebuilt  (Docker build)")
  fi
  OPTS+=("none"); LABELS+=("No change"); CHANGES+=("")
else
  # currently local
  if [ -n "$ABS_TS_DIR" ]; then
    OPTS+=("build")
    LABELS+=("Rebuild local")
    CHANGES+=("Docker rebuild  (stays local)")
  fi
  OPTS+=("remote")
  LABELS+=("Switch to remote")
  CHANGES+=("local v$LOCAL_VERSION  →  npm $REMOTE_VERSION")
  OPTS+=("none"); LABELS+=("No change"); CHANGES+=("")
fi

echo -e "  ${BOLD}Options:${NC}"
for i in "${!OPTS[@]}"; do
  n=$(( i + 1 ))
  label="${LABELS[$i]}"
  change="${CHANGES[$i]}"
  if [ -n "$change" ]; then
    echo -e "    ${CYAN}[$n]${NC}  $label  ${DIM}($change)${NC}"
  else
    echo -e "    ${CYAN}[$n]${NC}  $label"
  fi
done
echo ""

read -rp "  Choice [1-${#OPTS[@]}]: " RAW_CHOICE 2>/dev/null || RAW_CHOICE=""
echo ""

# Validate input
if [[ "$RAW_CHOICE" =~ ^[0-9]+$ ]] && [ "$RAW_CHOICE" -ge 1 ] && [ "$RAW_CHOICE" -le "${#OPTS[@]}" ]; then
  ACTION="${OPTS[$(( RAW_CHOICE - 1 ))]}"
else
  echo "  No change."
  exit 0
fi

case "$ACTION" in
  local)  do_local ;;
  build)  do_build; do_local ;;
  remote) do_remote ;;
  none)   echo "  No change." ;;
esac
