import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SourceTextModule, SyntheticModule } from "node:vm";
import { test } from "node:test";

test("catalog lists each product once with Pixel-compatible IDs and direct product links", async () => {
  const products = ["SIMPLE", "VARIANT_DIMENSION", "VARIANT_FULL"].map((pricingType, i) => ({
    slug: `mattress-${i}`,
    name: `Matelas ${i}`,
    description: "Confort مريح",
    available: true,
    pricingType,
    basePrice: pricingType === "SIMPLE" ? 10000 : null,
    minPrice: 10001,
    discount: i === 2 ? 15 : 0,
    images: ["/images/mattress.jpg"],
    details: { dimensions: [
      { size: "90x190", options: [{ thickness: 20, price: 10001 }, { thickness: 25, price: 15000 }] },
      { size: "160x200", options: [{ thickness: 20, price: 20000 }] },
    ] },
  }));
  const route = new SourceTextModule(await readFile(new URL("../app/api/meta/catalog/route.js", import.meta.url), "utf8"));
  await route.link(async (specifier) => {
    assert.equal(specifier, "@/lib/data-services/products");
    return new SyntheticModule(["getProductsWithDetails"], function () {
      this.setExport("getProductsWithDetails", async (filters) => {
        assert.deepEqual(filters, { available: true });
        return products;
      });
    });
  });
  await route.evaluate();
  const response = await route.namespace.GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "text/csv; charset=utf-8");
  const [header, ...lines] = (await response.text()).split("\n");
  const keys = header.split(",");
  assert.equal(keys.includes("item_group_id"), false);
  assert.equal(lines.length, products.length);
  const rows = lines.map((line) => Object.fromEntries(line.split(",").map((value, i) => [keys[i], value])));
  rows.forEach((row, i) => {
    assert.equal(row.id, products[i].slug);
    assert.equal(row.title, `${products[i].name} | Empreinte Flex`);
    assert.equal(row.description, "Confort مريح");
    const url = new URL(row.link);
    assert.equal(url.pathname, `/fr/product/${products[i].slug}`);
    assert.equal(url.search, "");
  });
  assert.equal(rows[0].price, "10000.00 DZD");
  assert.equal(rows[1].price, "10001.00 DZD");
  assert.equal(rows[1].sale_price, "");
  assert.equal(rows[2].price, "10001.00 DZD");
  assert.equal(rows[2].sale_price, "8501.00 DZD");
});
