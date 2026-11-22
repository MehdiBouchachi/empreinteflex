"""Load the normalized catalog and its repository photos into the local Compose database."""
import argparse
import base64
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--apply", action="store_true", help="Commit the import. Default is a dry run.")
args = parser.parse_args()
products = json.loads((ROOT / "data/catalog-supabase.json").read_text(encoding="utf-8"))
for product in products:
    for photo in product["photos"]:
        path = (ROOT / photo["path"]).resolve(strict=True)
        if not path.is_relative_to(ROOT / "apps/storefront/public"):
            raise ValueError("Catalog photos must come from the storefront's public assets")
        photo["bytes"] = base64.b64encode(path.read_bytes()).decode("ascii")
script = (ROOT / "apps/api/scripts/import-supabase-catalog.cjs").read_text(encoding="utf-8-sig")
result = subprocess.run(
    ["docker", "compose", "exec", "-T", "-w", "/app/apps/api", "-e",
     f"CATALOG_IMPORT_DRY_RUN={str(not args.apply).lower()}", "api", "node", "-e", script],
    input=json.dumps(products).encode("ascii"), cwd=ROOT,
)

raise SystemExit(result.returncode)

