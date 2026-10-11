#!/usr/bin/env bash
#
# Mirror the VCHUKI agents into this repo.
#
#   ./scripts/sync-skills.sh
#
# Skills live in your Claude account — that is the live copy, and the only one
# that changes when you edit a skill. This script copies them into
# .claude/skills/ so they are version-controlled, reviewable in a diff, and
# picked up by Claude Code when you run it inside this project.
#
# Direction is one-way: account -> repo. Editing a file in .claude/skills/ does
# NOT change the live skill. Re-run this after every skill change.
#
# Written for bash 3.2 (macOS default) — no mapfile, no associative arrays.

set -eu

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$REPO/.claude/skills"

SEARCH_PATHS="/var/folders $HOME/Library/Application Support/Claude"

echo "Looking for VCHUKI skills…"

# The cache directory name changes between sessions, so discover it.
NAMES="$(
  find $SEARCH_PATHS -type f -path '*/skills/vchuki-*/SKILL.md' 2>/dev/null \
    | sed -e 's|.*/skills/||' -e 's|/SKILL.md$||' \
    | sort -u
)"

if [ -z "$NAMES" ]; then
  echo "No skills found."
  echo
  echo "The cache may not be populated yet. Open Claude, run any /vchuki-* agent"
  echo "once so the skill is written to disk, then re-run this script."
  exit 1
fi

mkdir -p "$DEST"
COUNT=0

for NAME in $NAMES; do
  # Several cache dirs can hold the same skill — take the most recent.
  SRC="$(
    find $SEARCH_PATHS -type f -path "*/skills/$NAME/SKILL.md" 2>/dev/null \
      | while IFS= read -r f; do
          printf '%s\t%s\n' "$(stat -f %m "$f" 2>/dev/null || echo 0)" "$f"
        done \
      | sort -rn | head -1 | cut -f2-
  )"

  [ -z "$SRC" ] && continue

  mkdir -p "$DEST/$NAME"
  cp "$SRC" "$DEST/$NAME/SKILL.md"
  echo "  ✓ $NAME"
  COUNT=$((COUNT + 1))
done

echo
echo "Mirrored $COUNT skills into .claude/skills/"
echo
echo "Next:"
echo "  git add .claude/skills && git commit -m 'sync agents'"
