#!/usr/bin/env python3
"""
Refresh the v3.0 handover package.

`tools/package.sh` uses `rsync -a --delete`, which the command guard blocks in
this workspace. This script does the same job for the v3.0 handover only —
the v1.0 and v2.0 handovers are unaffected by the Pages-layout change, so they
are left alone.

Run:
    python3 tools/repackage-handover.py
"""
from __future__ import annotations

import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
MIG = WORKSPACE / "Migather"
OUT = MIG / "Migather_Website_v3.0_20261104"
BUILD_ZIP = "Migather_Website_v3.0_build_20261104.zip"
SOURCE_ZIP = "Migather_Website_v3.0_source_20261104.zip"

SKIP_DOCS = {"mockups", "review-set", "pages-site"}


def mirror(src: Path, dst: Path, skip: set[str] | None = None) -> None:
    """Make dst an exact copy of src, removing anything dst has that src lacks."""
    skip = skip or set()
    dst.mkdir(parents=True, exist_ok=True)
    keep: set[str] = set()
    for item in src.iterdir():
        if item.name in skip or item.name == ".DS_Store":
            continue
        target = dst / item.name
        if item.is_dir():
            shutil.rmtree(target, ignore_errors=True)
            shutil.copytree(item, target)
            keep.add(item.name)
        else:
            shutil.copy2(item, target)
            keep.add(item.name)
    for item in dst.iterdir():
        if item.name not in keep:
            if item.is_dir():
                shutil.rmtree(item, ignore_errors=True)
            else:
                item.unlink()


def zip_paths(zip_path: Path, entries: list[Path], base: Path, excludes: list[str] | None = None) -> None:
    excludes = excludes or []
    zip_path.unlink(missing_ok=True)
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for entry in entries:
            if entry.is_file():
                zf.write(entry, entry.relative_to(base))
            else:
                for path in sorted(entry.rglob("*")):
                    if not path.is_file():
                        continue
                    rel = str(path.relative_to(base))
                    if any(part in rel for part in excludes):
                        continue
                    if path.name == ".DS_Store":
                        continue
                    zf.write(path, rel)


def main() -> int:
    if not (ROOT / "dist" / "index.html").exists():
        print("no dist/ — run `npm run build` first", file=sys.stderr)
        return 1

    print("=== assemble the handover folder ===")
    OUT.mkdir(parents=True, exist_ok=True)
    mirror(ROOT / "dist", OUT / "dist")
    mirror(ROOT / "docs", OUT / "docs", skip=SKIP_DOCS)
    mirror(ROOT / "docs" / "review-set", OUT / "mockups")
    shutil.copy2(ROOT / "README.md", OUT / "PROJECT-README.md")

    print("=== build zip (dist + docs + README) ===")
    zip_paths(
        OUT / BUILD_ZIP,
        [OUT / "dist", OUT / "docs", OUT / "README.md"],
        base=OUT,
    )

    print("=== source zip ===")
    entries = [
        ROOT / n
        for n in (
            "src",
            "public",
            "scripts",
            "tools",
            "index.html",
            "package.json",
            "package-lock.json",
            "vite.config.js",
            "README.md",
        )
    ] + [ROOT / "docs" / n for n in (
        "DESIGN_V3.md",
        "LAUNCH_CHECKLIST.md",
        "COPY_COMPLIANCE.md",
        "REVIEW_GUIDE.md",
        "VERSION.md",
    )]
    zip_paths(OUT / SOURCE_ZIP, entries, base=ROOT, excludes=["args-feature.json"])

    print("\n=== the handover ===")
    for f in sorted(OUT.iterdir()):
        if f.is_file():
            print(f"  {f.stat().st_size / 1024 / 1024:6.1f} MB  {f.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
