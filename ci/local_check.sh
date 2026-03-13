#!/usr/bin/env bash
set -euo pipefail

export NODE_VERSION=20

echo "[local_check] npm ci (root)"
npm ci

echo "[local_check] npm ci (apps/webchat-spa)"
(
  cd apps/webchat-spa
  npm ci
)

echo "[local_check] typecheck + validate:skins"
(
  cd apps/webchat-spa
  npm run typecheck --if-present
)
(
  cd apps/webchat-spa
  npm run validate:skins --if-present || true
)

echo "[local_check] build SPA"
(
  cd apps/webchat-spa
  npm run build
)

echo "[local_check] assembling site/"
rm -rf site
mkdir -p site/js site/skins
[ -d docs ] && rsync -a docs/ site/
echo "[local_check] verifying skins statusBar metadata"
python3 - <<'PY'
import json
import pathlib
import sys

skins_dir = pathlib.Path('site/skins')
missing = []
for skin in skins_dir.glob('*.json'):
    try:
        payload = json.loads(skin.read_text())
    except json.JSONDecodeError as error:
        missing.append(f"{skin}: invalid JSON ({error})")
        continue
    status = payload.get('statusBar')
    if not status or 'show' not in status:
        missing.append(f"{skin}: missing statusBar.show")

if missing:
    print('Skin metadata missing statusBar.show:')
    for entry in missing:
        print('  ', entry)
    sys.exit(1)
PY
echo "[local_check] ensuring Cisco demo renders WebChat + StatusBar"
if [ ! -f docs/cisco/index.html ]; then
  echo "docs/cisco/index.html missing!"
  exit 1
fi
if ! grep -q 'id=\"webchat\"' docs/cisco/index.html || ! grep -q 'id=\"statusbar\"' docs/cisco/index.html; then
  echo "docs/cisco/index.html missing required WebChat mounts"
  exit 1
fi

mkdir -p site/app
rsync -a apps/webchat-spa/dist/ site/app/

shopt -s nullglob
for index in demos/*/index.html; do
  tenant=$(basename "$(dirname "$index")")
  dest="site/${tenant}"
  mkdir -p "$dest"
  cp "$index" "$dest/index.html"
  python3 scripts/inject_tenant.py "$tenant" "$dest/index.html"
done

[ -e site/skins/cisco.json ] || cat > site/skins/cisco.json <<'JSON'
{ "theme":"cisco","brand":{"name":"Cisco","primary":"#005c9a","accent":"#00a0e0","text":"#0b1220"} }
JSON
echo "[local_check] OK — site/ ready."
echo "Try locally: python3 -m http.server -d site 8080"
