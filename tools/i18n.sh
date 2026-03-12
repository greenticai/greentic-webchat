#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MODE="${1:-all}"
AUTH_MODE="${AUTH_MODE:-auto}"
LOCALE="${LOCALE:-en}"
EN_PATH="${EN_PATH:-apps/webchat-spa/public/i18n/en.json}"
I18N_TRANSLATOR_MANIFEST="${I18N_TRANSLATOR_MANIFEST:-../greentic-i18n/Cargo.toml}"
BATCH_SIZE="${BATCH_SIZE:-500}"
LANGS="${LANGS:-}"

usage() {
  cat <<'EOF'
Usage: tools/i18n.sh [translate|validate|status|all]

Environment overrides:
  EN_PATH=...                     English source file path
                                 (default: apps/webchat-spa/public/i18n/en.json)
  AUTH_MODE=...                   Translator auth mode for translate (default: auto)
  LOCALE=...                      CLI locale used for translator output (default: en)
  LANGS=...                       Comma-separated target locales override
                                 (default: all supported locales except source English)
  BATCH_SIZE=...                  Translation batch size (default: 500)
  I18N_TRANSLATOR_MANIFEST=...    Path to greentic-i18n Cargo.toml

Examples:
  tools/i18n.sh all
  AUTH_MODE=api-key tools/i18n.sh translate
  EN_PATH=apps/webchat-spa/public/i18n/en.json tools/i18n.sh validate
EOF
}

ensure_inputs() {
  if [[ ! -f "$EN_PATH" ]]; then
    echo "English source file not found: $EN_PATH" >&2
    exit 2
  fi

  if [[ ! -f "$I18N_TRANSLATOR_MANIFEST" ]]; then
    echo "Translator manifest not found: $I18N_TRANSLATOR_MANIFEST" >&2
    exit 2
  fi
}

resolve_langs() {
  if [[ -n "$LANGS" ]]; then
    printf '%s\n' "$LANGS"
    return
  fi

  node --input-type=module - <<'NODE'
import { SUPPORTED_LOCALES } from './apps/webchat-spa/shared/locale-utils.mjs';

const langs = SUPPORTED_LOCALES
  .map(({ code }) => code)
  .filter((code) => code !== 'en' && code !== 'en-US');

console.log(langs.join(','));
NODE
}

run_translate() {
  local langs
  langs="$(resolve_langs)"
  cargo run --manifest-path "$I18N_TRANSLATOR_MANIFEST" -p greentic-i18n-translator -- \
    --locale "$LOCALE" \
    translate --langs "$langs" --en "$EN_PATH" --auth-mode "$AUTH_MODE" --batch-size "$BATCH_SIZE"
}

run_validate() {
  local langs
  langs="$(resolve_langs)"
  cargo run --manifest-path "$I18N_TRANSLATOR_MANIFEST" -p greentic-i18n-translator -- \
    --locale "$LOCALE" \
    validate --langs "$langs" --en "$EN_PATH"
}

run_status() {
  local langs
  langs="$(resolve_langs)"
  cargo run --manifest-path "$I18N_TRANSLATOR_MANIFEST" -p greentic-i18n-translator -- \
    --locale "$LOCALE" \
    status --langs "$langs" --en "$EN_PATH"
}

if [[ "${MODE}" == "-h" || "${MODE}" == "--help" ]]; then
  usage
  exit 0
fi

ensure_inputs

case "$MODE" in
  translate) run_translate ;;
  validate) run_validate ;;
  status) run_status ;;
  all)
    run_translate
    run_validate
    run_status
    ;;
  *)
    echo "Unknown mode: $MODE" >&2
    usage
    exit 2
    ;;
esac
