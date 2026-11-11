"""Build the Chrome Web Store zip with runtime files only.

Usage: python .0/build_store_zip.py
Output: .0/STORE_BUILDS/quick-bookmarks-YYYY-M-D-vN.zip
"""
import json
import re
import sys
import zipfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / ".0" / "STORE_BUILDS"
SHORT_NAME = "dockside"

manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))

# Runtime files = manifest + everything the html pages load + manifest icons
files = {"manifest.json"}
for page in ["newtab.html", "popup.html", "manage.html"]:
    files.add(page)
    text = (ROOT / page).read_text(encoding="utf-8")
    for ref in re.findall(r'(?:src|href)="([^"#]+\.(?:js|css))"', text):
        if not ref.startswith("http"):
            files.add(ref)
for icon in manifest.get("icons", {}).values():
    files.add(icon)
for icon in manifest.get("action", {}).get("default_icon", {}).values():
    files.add(icon)

missing = [f for f in sorted(files) if not (ROOT / f).is_file()]
if missing:
    sys.exit("Missing files: " + ", ".join(missing))

today = date.today()
stamp = f"{today.year}-{today.month}-{today.day}"
OUT_DIR.mkdir(parents=True, exist_ok=True)
n = 1
while (OUT_DIR / f"{SHORT_NAME}-{stamp}-v{n}.zip").exists():
    n += 1
out = OUT_DIR / f"{SHORT_NAME}-{stamp}-v{n}.zip"

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted(files):
        z.write(ROOT / f, f)  # forward slashes, manifest at zip root

print(f"Created {out}")
print(f"{len(files)} files, {out.stat().st_size / 1024:.0f} KB, version {manifest['version']}")
for f in sorted(files):
    print("  " + f)
