#!/usr/bin/env bash
#
# Package the v3.0 handover, and rebuild the v1.0 / v2.0 handovers that the
# shared icon fix invalidated.
#
# The v1.0 / v2.0 zips contain the compiled bundle, so the icon fix changed
# them — they are rebuilt here rather than left shipping a bundle whose
# icons do not render.
#
# Run:  bash tools/package.sh
set -euo pipefail

ROOT="/Users/migather_macbookair/Documents/Client B2B"
MIG="$ROOT/Migather"
PROJECT="$ROOT/migather-site-v3"
OUT="$MIG/Migather_Website_v3.0_20261104"
BUILD_ZIP="Migather_Website_v3.0_build_20261104.zip"
SOURCE_ZIP="Migather_Website_v3.0_source_20261104.zip"

echo "=== build v3.0 ==="
(cd "$PROJECT" && npm run build >/dev/null)

echo "=== assemble the handover folder ==="
mkdir -p "$OUT/docs" "$OUT/mockups"

rsync -a --delete "$PROJECT/dist/" "$OUT/dist/"
rsync -a --delete "$PROJECT/docs/" "$OUT/docs/" --exclude 'mockups' --exclude 'review-set'
cp "$PROJECT/README.md" "$OUT/PROJECT-README.md"

# The review set — 3 contact sheets and 60 full-page screens.
rsync -a --delete "$PROJECT/docs/review-set/" "$OUT/mockups/"

echo "=== build zip (dist + docs + README) ==="
rm -f "$OUT/$BUILD_ZIP"
(cd "$OUT" && zip -qr "$BUILD_ZIP" dist docs README.md -x '*.DS_Store')

echo "=== source zip ==="
rm -f "$OUT/$SOURCE_ZIP"
(cd "$PROJECT" && zip -qr "$OUT/$SOURCE_ZIP" \
  src public scripts tools index.html package.json package-lock.json \
  vite.config.js README.md docs/DESIGN_V3.md docs/LAUNCH_CHECKLIST.md \
  docs/COPY_COMPLIANCE.md docs/REVIEW_GUIDE.md docs/VERSION.md \
  -x '*.DS_Store' -x 'tools/media/args-*.json')

echo
echo "=== rebuild the v1.0 and v2.0 handovers (icon fix) ==="
repackage() {
  local project="$1" outdir="$2" zipname="$3"
  echo "--- $outdir ---"
  mkdir -p "$MIG/$outdir/dist" "$MIG/$outdir/docs"
  rsync -a --delete "$ROOT/$project/dist/" "$MIG/$outdir/dist/"
  rsync -a --delete "$ROOT/$project/docs/" "$MIG/$outdir/docs/"
  cp "$ROOT/$project/README.md" "$MIG/$outdir/README.md"
  rm -f "$MIG/$outdir/$zipname"
  (cd "$MIG/$outdir" && zip -qr "$zipname" dist docs README.md -x '*.DS_Store')
  echo "    $(du -h "$MIG/$outdir/$zipname" | cut -f1)  $zipname"
}

repackage migather-site   "Migather_Website_v1.0_20261028" "Migather_Website_v1.0_build_20261028.zip"
repackage migather-site-v2 "Migather_Website_v2.0_20261028" "Migather_Website_v2.0_build_20261028.zip"

echo
echo "=== verify: every shipped bundle renders its icons ==="
#
# Note: these use bash pattern matching rather than `printf | grep -q`.
# With `set -o pipefail`, `grep -q` exits the moment it finds a match and
# closes the pipe, so `printf` dies of SIGPIPE and the pipeline reports
# failure on a string that actually contains what we are looking for.
#
check_icons() {
  local f="$1"
  local name bundle
  name=$(basename "$f")
  bundle=$(unzip -p "$f" 'dist/assets/*.js')

  # The <svg> wrapper must be in the bundle. The compiled JSX keeps the
  # attribute as a template literal, so match on the geometry and the
  # stroke attributes rather than on a quoted string.
  if [[ "$bundle" != *"0 0 24 24"* ]]; then
    echo "FAIL  $name: the icon <svg> viewBox is missing from the bundle"
    exit 1
  fi
  if [[ "$bundle" != *"strokeLinecap"* ]]; then
    echo "FAIL  $name: the icon <svg> stroke attributes are missing from the bundle"
    exit 1
  fi
  # The paths must still be present.
  for good in 'M4 6h16M4 12h16M4 18h16' 'M5 12h14m0 0l-6-6m6 6l-6 6' 'M6 6l12 12M18 6L6 18'; do
    if [[ "$bundle" != *"$good"* ]]; then
      echo "FAIL  $name: icon path $good is missing from the bundle"
      exit 1
    fi
  done
  echo "ok    $name: icons render"
}

check_icons "$MIG/Migather_Website_v1.0_20261028/Migather_Website_v1.0_build_20261028.zip"
check_icons "$MIG/Migather_Website_v2.0_20261028/Migather_Website_v2.0_build_20261028.zip"
check_icons "$OUT/$BUILD_ZIP"

echo
echo "=== verify: the mock-up disclosure ships in every bundle ==="
bundle=$(unzip -p "$OUT/$BUILD_ZIP" 'dist/assets/*.js')
for good in "Mock-up imagery" "not client photography" "佔位視覺" "占位视觉"; do
  if [[ "$bundle" != *"$good"* ]]; then
    echo "FAIL  v3.0 build: the disclosure string '$good' is missing"
    exit 1
  fi
done
echo "ok    v3.0 build: the mock-up disclosure ships in all three languages"

echo
echo "=== verify: the official logo still ships ==="
for good in 'M53.42 87.52L71.51 69.37' 'M54.79 88.89L72.89 70.74' 'M56.69 90.78L74.79 72.63'; do
  if [[ "$bundle" != *"$good"* ]]; then
    echo "FAIL  v3.0 build: accent outline $good is missing"
    exit 1
  fi
done
for good in "#7FE3D4" "#6E6496" "#E98BAE"; do
  if [[ "$bundle" != *"$good"* ]]; then
    echo "FAIL  v3.0 build: accent colour $good is missing"
    exit 1
  fi
done
echo "ok    v3.0 build: the official logo ships"

echo
echo "=== verify: the unsourced client Chinese names are absent everywhere ==="
for f in "$MIG/Migather_Website_v1.0_20261028/Migather_Website_v1.0_build_20261028.zip" \
         "$MIG/Migather_Website_v2.0_20261028/Migather_Website_v2.0_build_20261028.zip" \
         "$OUT/$BUILD_ZIP"; do
  b=$(unzip -p "$f" 'dist/assets/*.js')
  for bad in "中銀國際" "中銀人壽"; do
    if [[ "$b" == *"$bad"* ]]; then
      echo "FAIL  $(basename "$f"): still contains $bad"
      exit 1
    fi
  done
  for good in "ICBC Asia" "CTFlife" "中銀香港" "華泰證券"; do
    if [[ "$b" != *"$good"* ]]; then
      echo "FAIL  $(basename "$f"): missing $good"
      exit 1
    fi
  done
  echo "ok    $(basename "$f")"
done

echo
echo "=== the handover ==="
ls -la "$OUT"
du -sh "$OUT"
