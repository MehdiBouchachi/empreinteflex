// Run: node --experimental-vm-modules --test tests/order-documents.test.mjs
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SourceTextModule, SyntheticModule } from "node:vm";
import { test } from "node:test";
import * as pdf from "../src/lib/pdf.js";
import * as display from "../src/lib/order-document.js";

const fixture = {
  customer: { firstName: "مهدي", lastName: "بن أحمد", phone: "0667284306", email: null },
  shipping: { wilaya: "البليدة", city: "", street: "   ", mapLink: null },
  payment: { method: "cash_on_delivery", status: "pending" },
  items: [
    { name: "ريصور بريستيج", size: "90x190", thickness: 25, price: 50500, quantity: 1, subtotal: 50500 },
    { name: "Matelas HR D45 - مرتبة مريحة", size: "160x200", thickness: "30 سم", price: 62000, quantity: 1, subtotal: 62000 },
    { name: "Oreiller mémoire de forme", size: null, thickness: null, price: 5000, quantity: 1, subtotal: 5000 },
  ],
  summary: { itemsCount: 3, totalQuantity: 3, subtotalPrice: 117500, totalPrice: 117500 },
};

async function captureEmails(order) {
  const sent = [];
  class Resend {
    emails = { send: async (payload) => { sent.push(payload); return { data: { id: "test" } }; } };
  }
  const dependencies = { resend: { Resend }, "@/lib/pdf": pdf, "./order-document.js": display };
  const emailModule = new SourceTextModule(await readFile(new URL("../src/lib/email.js", import.meta.url), "utf8"));
  await emailModule.link(async (specifier) => {
    const namespace = dependencies[specifier];
    assert.ok(namespace, `Unexpected dependency: ${specifier}`);
    return new SyntheticModule(Object.keys(namespace), function () {
      for (const [key, value] of Object.entries(namespace)) this.setExport(key, value);
    });
  });
  await emailModule.evaluate();
  await emailModule.namespace.sendOrderEmail(order, "LTM-123456");
  return sent;
}

test("missing values consistently use an ASCII hyphen", () => {
  for (const value of [null, undefined, "", " \t "]) {
    assert.equal(display.displayValue(value), "-");
    assert.equal(display.escapeHtml(value), "-");
    assert.equal(display.customerName({ firstName: value, lastName: value }), "-");
    assert.equal(display.itemDetails({ size: value, thickness: value, density: value }), "-");
  }
  assert.equal(display.displayValue(0), "0");
  assert.equal(display.itemDetails({ size: "90x190", thickness: 25 }), "90x190 · 25 cm");
  assert.equal(display.itemDetails({ thickness: "30 سم" }), "30 سم");
});

test("email preserves French/Arabic Unicode and handles every blank customer/address field", async () => {
  for (const value of [null, undefined, "", "   "]) {
    const order = structuredClone(fixture);
    order.customer = { firstName: value, lastName: value, phone: value, email: value };
    order.shipping = { wilaya: value, city: value, street: value };
    const sent = await captureEmails(order);
    assert.equal(sent.length, 1, "Blank email must not receive a customer email");
    const html = sent.at(-1).html;
    for (const label of ["Nom", "Téléphone", "Email", "Wilaya", "Ville", "Rue"]) {
      assert.match(html, new RegExp(`${label}</td>\\s*<td[^>]*>-</td>`));
    }
    assert.match(html, /Commande reçue/);
    assert.match(html, /Articles commandés/);
    assert.match(html, /Paiement à la livraison/);
    assert.match(html, /ريصور بريستيج/);
    assert.doesNotMatch(html, /Ã|Â|â€|ðŸ|>null<|>undefined</);
  }
});

test("customer and internal attachments embed Arabic fonts; email escapes user text", async () => {
  const order = structuredClone(fixture);
  order.customer.email = "test@example.com";
  order.customer.firstName = "مهدي <test> & أحمد";
  const sent = await captureEmails(order);
  assert.equal(sent.length, 2);
  assert.match(sent[0].html, /a bien été enregistrée/);
  assert.match(sent[1].html, /مهدي &lt;test&gt; &amp; أحمد/);
  for (const message of sent) {
    const buffer = Buffer.from(message.attachments[0].content, "base64");
    assert.equal(buffer.subarray(0, 5).toString(), "%PDF-");
    assert.match(buffer.toString("latin1"), /Amiri/);
    assert.match(buffer.toString("latin1"), /\/FontFile2/);
    assert.match(buffer.toString("latin1"), /\/ToUnicode/);
  }
});

test("generate optional local previews without sending email", async () => {
  if (!process.env.PDF_PREVIEW_DIR) return;
  const dir = process.env.PDF_PREVIEW_DIR;
  await mkdir(dir, { recursive: true });
  for (const [name, generate] of [["customer", pdf.generateCustomerOrderPDF], ["internal", pdf.generateInternalOrderPDF]]) {
    await writeFile(path.join(dir, `${name}.pdf`), generate(fixture, "LTM-123456"));
  }
  const blank = structuredClone(fixture);
  blank.customer = {};
  blank.shipping = {};
  blank.items = [{ name: "Matelas français", quantity: 1, price: 50500, subtotal: 50500 }];
  blank.summary = { itemsCount: 1, totalQuantity: 1, subtotalPrice: 50500, totalPrice: 50500 };
  await writeFile(path.join(dir, "blank.pdf"), pdf.generateInternalOrderPDF(blank, "LTM-123456"));
  const sent = await captureEmails(fixture);
  await writeFile(path.join(dir, "internal.html"), sent.at(-1).html);
});
