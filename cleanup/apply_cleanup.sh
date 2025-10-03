#!/usr/bin/env bash
set -euo pipefail

MODE="dry-run"
REPORT="cleanup/trash_report.jsonl"
BACKUP_ROOT="cleanup/_backup"

show_help() {
  cat <<'USAGE'
Usage: cleanup/apply_cleanup.sh [--dry-run|--apply] [--report PATH]

Options:
  --dry-run      Simulate the cleanup actions (default).
  --apply        Execute the cleanup using the report entries marked for removal.
  --report PATH  Use an alternate JSONL report (defaults to cleanup/trash_report.jsonl).
  --help         Show this help message.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    --apply)
      MODE="apply"
      shift
      ;;
    --report)
      REPORT="$2"
      shift 2
      ;;
    --help|-h)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      show_help >&2
      exit 1
      ;;
  esac
done

if [[ ! -f "$REPORT" ]]; then
  echo "Report not found: $REPORT" >&2
  exit 1
fi

mapfile -t ITEMS < <(python3 - "$REPORT" <<'PY'
import json
import sys
from pathlib import Path

report_path = Path(sys.argv[1])
with report_path.open('r', encoding='utf-8') as handle:
    for line in handle:
        line = line.strip()
        if not line:
            continue
        entry = json.loads(line)
        if entry.get('decision') == 'remove':
            path = entry.get('path')
            kind = entry.get('kind', 'file')
            risk = entry.get('risk', 'med')
            print(f"{path}\t{kind}\t{risk}")
PY
)

if [[ ${#ITEMS[@]} -eq 0 ]]; then
  echo "No removable items found in $REPORT."
  exit 0
fi

mkdir -p "$BACKUP_ROOT"

declare -a ACTION_LOG

for ROW in "${ITEMS[@]}"; do
  IFS=$'\t' read -r TARGET KIND RISK <<<"$ROW"
  if [[ -z "$TARGET" ]]; then
    continue
  fi
  ACTION_LOG+=("target=$TARGET kind=$KIND risk=$RISK")
  if [[ "$MODE" == "apply" ]]; then
    if [[ "$RISK" != "low" ]]; then
      echo "Refusing to delete $TARGET because risk level is $RISK (must be low)." >&2
      exit 2
    fi
    if [[ ! -e "$TARGET" ]]; then
      echo "Warning: $TARGET does not exist on disk; skipping." >&2
      continue
    fi
    safe_name=${TARGET//\//__}
    archive="$BACKUP_ROOT/${safe_name}.tar.gz"
    echo "Backing up $TARGET -> $archive"
    tar -czf "$archive" "$TARGET"
    echo "Removing $TARGET"
    rm -rf "$TARGET"
    git add -A "$TARGET"
  else
    if [[ "$RISK" != "low" ]]; then
      echo "[DRY-RUN] $TARGET would require manual review (risk=$RISK)."
    else
      echo "[DRY-RUN] Would backup and remove $TARGET (kind=$KIND)."
    fi
  fi
done

if [[ "$MODE" == "apply" ]]; then
  echo "Cleanup applied. Review git status before committing."
else
  echo "Dry run complete. Generated action plan for ${#ITEMS[@]} items."
fi
