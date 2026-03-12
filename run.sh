#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT_DIR/apps/webchat-spa"
BUILD_DIR="$APP_DIR/dist"
PORT="${PORT:-8080}"

cd "$ROOT_DIR"

echo "[run.sh] Validating skins"
npm run validate:skins

echo "[run.sh] Building SPA for root path (/)"
(
  cd "$APP_DIR"
  npx vite build --base /
  node ./scripts/post-build.cjs
)

echo "[run.sh] Serving $BUILD_DIR at http://localhost:$PORT/"
echo "[run.sh] Press Ctrl+C to stop"

SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

python3 - <<'PY' "$BUILD_DIR" "$PORT" &
import http.server
import os
import socketserver
import sys
from functools import partial

build_dir = sys.argv[1]
port = int(sys.argv[2])


class SpaRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self):
        requested_path = self.translate_path(self.path)
        if self.path in ("/", ""):
            return super().do_GET()

        if os.path.exists(requested_path):
            return super().do_GET()

        self.path = "/index.html"
        return super().do_GET()


handler = partial(SpaRequestHandler, directory=build_dir)

with socketserver.TCPServer(("0.0.0.0", port), handler) as httpd:
    httpd.allow_reuse_address = True
    print(f"Serving SPA on http://0.0.0.0:{port}/ from {build_dir}")
    httpd.serve_forever()
PY

SERVER_PID=$!
wait "${SERVER_PID}"
