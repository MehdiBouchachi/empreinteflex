// Run: node --experimental-vm-modules --test tests/checkout.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SourceTextModule, SyntheticModule } from "node:vm";
import { test } from "node:test";
import { splitFullName, fullNameFromDraft } from "../src/lib/customer-name.js";

test("full names preserve the backend's two-column contract", () => {
  assert.deepEqual(splitFullName("  Mehdi  "), { firstName: "Mehdi", lastName: "-" });
  assert.deepEqual(splitFullName("  Mehdi   Ben Ahmed "), { firstName: "Mehdi", lastName: "Ben Ahmed" });
  assert.deepEqual(splitFullName("مهدي بن أحمد"), { firstName: "مهدي", lastName: "بن أحمد" });
  assert.deepEqual(splitFullName("مهدي"), { firstName: "مهدي", lastName: "-" });
});

test("saved checkout drafts migrate without adding placeholder surnames", () => {
  assert.equal(fullNameFromDraft({ firstName: "Mehdi", lastName: "Ben Ahmed" }), "Mehdi Ben Ahmed");
  assert.equal(fullNameFromDraft({ firstName: "Mehdi", lastName: "-" }), "Mehdi");
  assert.equal(fullNameFromDraft({ fullName: "New name", firstName: "Old" }), "New name");
  assert.equal(fullNameFromDraft({ fullName: "", firstName: "Old" }), "");
});

async function orderService() {
  const inserts = [];
  const emails = [];
  const supabase = {
    from(table) {
      return {
        insert(row) {
          inserts.push({ table, row });
          return table === "orders"
            ? { select: () => ({ single: async () => ({ data: { id: 123 }, error: null }) }) }
            : Promise.resolve({ error: null });
        },
      };
    },
  };
  const dependencies = {
    "@/lib/supabase": { supabase },
    "@/lib/email": { sendOrderEmail: async (order) => { emails.push(order); } },
    "@/lib/meta-capi": { sendPurchaseCapiEvent: async () => {} },
  };
  const orderModule = new SourceTextModule(await readFile(new URL("../src/lib/data-services/orders.js", import.meta.url), "utf8"));
  await orderModule.link(async (specifier) => {
    const namespace = dependencies[specifier];
    assert.ok(namespace, `Unexpected dependency: ${specifier}`);
    return new SyntheticModule(Object.keys(namespace), function () {
      for (const [key, value] of Object.entries(namespace)) this.setExport(key, value);
    });
  });
  await orderModule.evaluate();
  return { createOrder: orderModule.namespace.createOrder, inserts, emails };
}

const order = {
  customer: { firstName: "Mehdi", phone: "0667284306" },
  shipping: { wilaya: "Blida" },
  items: [{ name: "Matelas", quantity: 1, price: 50000, subtotal: 50000 }],
  summary: { itemsCount: 1, totalQuantity: 1, totalPrice: 50000 },
};

test("missing wilaya is rejected before any database writes", async () => {
  const service = await orderService();
  for (const wilaya of [undefined, null, "", "   "]) {
    await assert.rejects(service.createOrder({ ...order, shipping: { wilaya } }), /Wilaya is required/);
  }
  assert.equal(service.inserts.length, 0);
  assert.equal(service.emails.length, 0);
});

test("orders retain existing DB columns and normalize missing last names for documents", async () => {
  for (const lastName of [undefined, null, "", "   ", "Ben Ahmed"]) {
    const service = await orderService();
    const payload = { ...order, customer: { ...order.customer, lastName }, shipping: { wilaya: " Blida " } };
    const result = await service.createOrder(payload);
    assert.equal(result.success, true);
    const stored = service.inserts.find((entry) => entry.table === "order_customer").row;
    assert.equal(stored.first_name, "Mehdi");
    assert.equal(stored.last_name, lastName === "Ben Ahmed" ? "Ben Ahmed" : "-");
    assert.equal("full_name" in stored, false);
    assert.equal(service.inserts.find((entry) => entry.table === "order_shipping").row.wilaya, "Blida");
    assert.equal(service.emails[0].customer.lastName, stored.last_name);
    assert.equal(payload.customer.lastName, lastName, "Do not mutate the submitted payload");
  }
});
