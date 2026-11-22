import assert from "node:assert/strict";
import { test } from "node:test";
import { getAvailableSizes } from "../src/lib/mattress-sizes.js";
import { filterProducts } from "../src/lib/filterProducts.js";

const mattress = (id, available, sizes) => ({ id, available, pricingType: "VARIANT_FULL", details: { dimensions: sizes.map(size => ({ size, options: [{ thickness: 20, price: 10000 }, { thickness: 30, price: 15000 }] })) } });
test("sizes reflect available variants, count products once, and sort numerically", () => {
  const products = [mattress(1, true, ["160x200", "90x190", "90x190"]), mattress(2, true, ["90x190"]), mattress(3, false, ["200x200"]), { available: true, details: { dimensions: [{ size: "80x190", options: [] }] } }];
  assert.deepEqual(getAvailableSizes(products), [{ size: "90x190", count: 2 }, { size: "160x200", count: 1 }]);
  assert.deepEqual(getAvailableSizes([]), []);
});
test("size links match only available mattresses and use matching variant prices", () => {
  const products = [mattress(1, true, ["90x190"]), mattress(2, true, ["160x200"]), mattress(3, false, ["90x190"]), { id: 4, available: true, pricingType: "SIMPLE", basePrice: 1000 }];
  const filters = { category: "all", subcategory: "all", size: "90x190", thickness: null, minPrice: 0, maxPrice: Infinity };
  const results = filterProducts(products, filters);
  assert.deepEqual(results.map(p => p.id), [1]);
  assert.deepEqual(results[0].priceRange, { min: 10000, max: 15000 });
  assert.equal(filterProducts(products, { ...filters, size: "999x999" }).length, 0);
});
