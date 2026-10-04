#!/usr/bin/env bash
# Packs the already-built beauty-sdk (its dist/, no rebuild) into vendor/beauty-sdk.tgz (fixed name).
set -euo pipefail
cd "$(dirname "$0")/.."
SDK="${SDK_DIR:-../seagull-web/packages/beauty-sdk}"
test -f "$SDK/dist/client/index.mjs" || { echo "beauty-sdk is not built: $SDK/dist missing" >&2; exit 1; }
mkdir -p vendor
rm -f vendor/*.tgz
PACKED="$(npm pack "$SDK" --ignore-scripts --pack-destination vendor --silent | tail -n 1)"
mv "vendor/$PACKED" vendor/beauty-sdk.tgz
echo "packed vendor/beauty-sdk.tgz (from $PACKED)"
