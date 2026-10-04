#!/usr/bin/env bash
# Packs the already-built beauty-sdk (its dist/, no rebuild) into vendor/.
set -euo pipefail
cd "$(dirname "$0")/.."
SDK="${SDK_DIR:-../seagull-web/packages/beauty-sdk}"
test -f "$SDK/dist/client/index.mjs" || { echo "beauty-sdk is not built: $SDK/dist missing" >&2; exit 1; }
mkdir -p vendor
rm -f vendor/gateway-experience-beauty-sdk-*.tgz
npm pack "$SDK" --ignore-scripts --pack-destination vendor
