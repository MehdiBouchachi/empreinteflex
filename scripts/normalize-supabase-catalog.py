"""Convert a Supabase table snapshot into the catalog import format."""
import argparse
import csv
import json
from decimal import Decimal
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "apps/storefront/public"
PHOTOS = PUBLIC / "images/new mattress"
TABLES = {
    "products", "product_variants", "product_images", "product_specs",
    "categories", "dimensions", "thicknesses",
}
PHOTO_ALIASES = {
    "d36-1.png": "D36 (1).PNG",
    "d36-2.png": "D36 (2).jpeg",
    "d36-3.png": "D36 (3).jpeg",
    "hero5.png": "orthoflex/hero5.png",
    "orthoflex-3.png": "orthoflex/orthoflex-3.png",
    "viscoflex.png": "viscoconfort (1).jpeg",
    "WhatsApp Image 2026-08-25 at 7.24.57 PM.jpeg":
        "premium-spring/WhatsApp Image 2026-08-25 at 7.24.57 PM.jpeg",
    "prestige-1.png": "prestige (1).jpeg",
    "prestige-2.jpeg": "prestige (2).jpeg",
    "prestige-3.jpeg": "prestige (3).jpeg",
    "prestige-5.png": "prestige (5).jpeg",
    "prestige-6.png": "prestige (6).jpeg",
    "d30-1.png": "d30/d30-1.png",
    **{f"ViscoFlex-{i}.png": f"viscoflex ({i}).jpeg" for i in range(1, 9)},
    **{f"hrd45-{i}.png": f"conforthrd45/hrd45-{i}.png" for i in (0, 1, 3, 4)},
}


def photo_path(url):
    filename = Path(unquote(urlsplit(url).path)).name
    path = PUBLIC / "hero/hero1.png" if filename == "hero1.png" else PHOTOS / PHOTO_ALIASES[filename]
    if not path.is_file():
        raise ValueError(f"Missing catalog photo {path}")
    return path.relative_to(ROOT).as_posix()


def normalize(source):
    with source.open(encoding="utf-8-sig", newline="") as stream:
        tables = {
            row["table_name"]: json.loads(row["data"], parse_float=Decimal)
            for row in csv.DictReader(stream) if row["table_name"] in TABLES
        }
    if tables.keys() != TABLES:
        raise ValueError("The export is missing required catalog tables")
    dimensions = {
        item["id"]: [int(value) * 10 for value in item["label"].lower().split("x")]
        for item in tables["dimensions"]
    }
    heights = {item["id"]: int(item["value"] * 10) for item in tables["thicknesses"]}
    categories = {item["id"]: item for item in tables["categories"]}
    products = {item["id"]: item for item in tables["products"]}
    if len(products) != len(tables["products"]):
        raise ValueError("Duplicate product IDs")
    for name in ("product_variants", "product_images", "product_specs"):
        if any(item["product_id"] not in products for item in tables[name]):
            raise ValueError(f"Orphan rows in {name}")
    converted = []
    for legacy_id, product in sorted(products.items()):
        category = categories[product["category_id"]]
        subcategory = categories.get(product["subcategory_id"], {})
        category_code = {"classic": "MATTRESS", "multi-layer": "MATTRESS", "spring": "MATTRESS"}[category["value"]]
        if product["pricing_type"] != "VARIANT_FULL":
            raise ValueError(f"Unsupported pricing type for {product['slug']}")
        variants = []
        sizes = set()
        for variant in sorted(tables["product_variants"], key=lambda row: row["id"]):
            if variant["product_id"] != legacy_id:
                continue
            width, length = dimensions[variant["dimension_id"]]
            height = heights[variant["thickness_id"]]
            size = width, length, height
            amount = Decimal(variant["price"]) * 100
            if size in sizes or amount < 0 or amount != amount.to_integral_value():
                raise ValueError(f"Invalid variant {variant['id']}")
            sizes.add(size)
            variants.append(dict(legacyId=variant["id"], widthMm=width, lengthMm=length,
                                 heightMm=height, amountMinor=int(amount)))
        specs = [{"label": row["label"], "value": row["value"]}
                 for row in sorted(tables["product_specs"], key=lambda row: row["id"])
                 if row["product_id"] == legacy_id]
        photos = [{"legacyId": row["id"], "sourceUrl": row["url"], "path": photo_path(row["url"])}
                  for row in sorted(tables["product_images"], key=lambda row: row["id"])
                  if row["product_id"] == legacy_id]
        converted.append(dict(
            legacyId=legacy_id, slug=product["slug"], name=product["name"],
            description=product["description"], categoryCode=category_code,
            featured=product["featured"], discountPercent=str(product["discount"] or 0),
            metadata=dict(legacySupabaseId=legacy_id, legacyAvailable=product["available"],
                          range=category["value"], subcategory=subcategory.get("value"),
                          categoryTranslations=category["translations"],
                          subcategoryTranslations=subcategory.get("translations"),
                          pricingType=product["pricing_type"], technicalSpecs=specs),
            variants=variants, photos=photos,
        ))
    return converted


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    products = normalize(args.source)
    args.output.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Normalized {len(products)} products and {sum(len(p['variants']) for p in products)} variants")
