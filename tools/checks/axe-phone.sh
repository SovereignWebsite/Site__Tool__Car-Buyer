#!/usr/bin/env bash
# Phone-width accessibility check: build, run tools/checks/axe-phone.mjs, remove _site. Same install pattern as tools/check.sh.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
node .github/ci/build.mjs >/dev/null
t=$(mktemp -d); trap 'rm -rf "$t" _site' EXIT
pw=$(node -p 'require("path").dirname(require.resolve("playwright/package.json"))' 2>/dev/null || true)
(cd "$t" && npm init -y >/dev/null && npm install --no-save --no-audit --no-fund --loglevel=error @axe-core/playwright@4.10.1 $([ -n "$pw" ] || echo playwright@1.49.1))
if [ -n "$pw" ]; then rm -rf "$t/node_modules/playwright"; ln -s "$pw" "$t/node_modules/playwright"; fi
cp tools/checks/axe-phone.mjs "$t/axe-phone.mjs"; node "$t/axe-phone.mjs" "$PWD/_site"
