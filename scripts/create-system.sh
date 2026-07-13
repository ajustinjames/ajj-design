#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: create-system.sh <name> <prefix>" >&2
}

NAME="${1:-}"
PREFIX="${2:-}"

if [ -z "$NAME" ] || [ -z "$PREFIX" ]; then
  usage
  exit 1
fi

case "$NAME" in
  *[!a-z0-9-]* | "" | -*)
    echo "Error: name must be lowercase kebab-case and cannot start with '-'" >&2
    exit 1
    ;;
esac

case "$PREFIX" in
  *[!a-z0-9-]* | "" | -*)
    echo "Error: prefix must be lowercase kebab-case and cannot start with '-'" >&2
    exit 1
    ;;
esac

NAME_CAP="$(printf '%s' "${NAME:0:1}" | tr '[:lower:]' '[:upper:]')${NAME:1}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

TOKENS_SRC="${REPO_ROOT}/packages/hardline-tokens"
COMPONENTS_SRC="${REPO_ROOT}/packages/hardline-components"
TOKENS_DEST="${REPO_ROOT}/packages/${NAME}-tokens"
COMPONENTS_DEST="${REPO_ROOT}/packages/${NAME}-components"

if [ ! -d "$TOKENS_SRC" ] || [ ! -d "$COMPONENTS_SRC" ]; then
  echo "Error: hardline template package directories do not exist" >&2
  exit 1
fi

if [ ! -f "${TOKENS_SRC}/package.json" ] || [ ! -f "${COMPONENTS_SRC}/package.json" ]; then
  echo "Error: hardline template package metadata is missing" >&2
  exit 1
fi

if [ -d "$TOKENS_DEST" ] || [ -d "$COMPONENTS_DEST" ]; then
  echo "Error: packages/${NAME}-tokens or packages/${NAME}-components already exists" >&2
  exit 1
fi

echo "Scaffolding ${NAME} from hardline template..."

cp -R "$TOKENS_SRC" "$TOKENS_DEST"
cp -R "$COMPONENTS_SRC" "$COMPONENTS_DEST"

rm -rf "${TOKENS_DEST}/dist" "${COMPONENTS_DEST}/dist"
rm -rf "${TOKENS_DEST}/node_modules" "${COMPONENTS_DEST}/node_modules"

# Find-replace order is load-bearing: longest patterns first.
find "$TOKENS_DEST" "$COMPONENTS_DEST" -type f \( \
  -name '*.ts' -o \
  -name '*.js' -o \
  -name '*.json' -o \
  -name '*.css' -o \
  -name '*.html' -o \
  -name '*.md' -o \
  -name '*.yml' -o \
  -name '*.yaml' \
\) -print0 |
  while IFS= read -r -d '' FILE; do
    perl -i -pe "
      s|\@ajustinjames/hardline|\@ajustinjames/${NAME}|g;
      s|--hl-|--${PREFIX}-|g;
      s|prefix: 'hl'|prefix: '${PREFIX}'|g;
      s|hl-|${PREFIX}-|g;
      s|hardline|${NAME}|g;
      s|Hardline|${NAME_CAP}|g;
    " "$FILE"
  done

echo ""
echo "Done. Next steps:"
echo "  pnpm install"
echo "  pnpm --filter @ajustinjames/${NAME}-tokens build"
echo "  pnpm --filter @ajustinjames/${NAME}-components exec tsc --noEmit"
