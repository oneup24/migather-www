#!/usr/bin/env bash
#
# Download generated mock-up imagery into tools/media/_masters/.
#
# The generator returns a node_id per image, not a local file. This resolves
# each node_id to a short-lived download URL and writes the bytes to a raw
# staging folder. `optimize.py` then resizes and re-encodes them into the
# final public/media/ files the site actually loads.
#
# Usage:  bash tools/media/fetch-media.sh node_id:name [node_id:name ...]
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$ROOT/tools/media/_masters"
mkdir -p "$OUT"

if [ "$#" -eq 0 ]; then
  echo "usage: fetch-media.sh node_id:name ..." >&2
  exit 1
fi

for pair in "$@"; do
  node="${pair%%:*}"
  name="${pair##*:}"

  url=$(mcode-tools get_asset_url "$node" \
    | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).download_url))")

  curl -sSL "$url" -o "$OUT/$name"
  printf 'raw  %-22s %s\n' "$name" "$(du -h "$OUT/$name" | cut -f1)"
done
