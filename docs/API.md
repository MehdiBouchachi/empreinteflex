# API integration guide

The API is reachable through **the same origin as the frontend** using `/v1`, e.g. `http://localhost:8081/v1` for staff or `http://localhost:8080/v1` for the storefront. `GET /docs` exposes route discovery; **this file contains the actual validated request bodies**.

## Sessions and security

`POST /v1/auth/login` `{ "email": "...", "password": "..." }` sets an HttpOnly `ef_session` cookie; `GET /v1/auth/me` returns identity and role grants; `POST /v1/auth/logout` revokes. Customer `POST /v1/auth/register` `{ "email":"...", "password":"12+ chars", "fullName":"..." }`; verified-email workflow is not implemented, do not rely on email ownership until connected. All browser writes must be same origin. Do not call staff APIs directly from the public site with service secrets.

## Public catalog and checkout

- `GET /v1/catalog/storefront?locale=fr|en|ar` — original Next.js storefront-compatible localized products, galleries and SKU options
- `GET /v1/media/:id` — public, immutable product image from PostgreSQL BYTEA
- `GET /v1/catalog/categories`
- `GET /v1/catalog/products?q=&category=&page=1`
- `GET /v1/catalog/products/:slug` (variants, dimensions, current price, images)
- `GET /v1/catalog/variants/:id/availability`
- `POST /v1/checkout/orders` with `Idempotency-Key` (12–128 characters):

```json
{
  "items": [{"variantId":"UUID", "quantity":1}],
  "customer": {"fullName":"Example Customer", "email":"customer@example.com", "phone":"0550000000"},
  "shippingAddress":{"wilaya":"Blida", "city":"Blida", "addressLine":"Street and number"},
  "deliveryMethod":"DELIVERY"
}
```

The backend returns an opaque `trackingToken` and authoritative `totalMinor`; track with `GET /v1/track/:token`. Browser should retain the token privately, not post it publicly. For public lookup without the token use `GET /v1/track-by-code/:orderNumber?phone=...` — phone verification and rate limiting are enforced. **Pay-on-delivery only**. Shipping charges are not automatically computed. Do not mark online orders paid solely from this request.

Customer with active cookie: `GET /v1/me/orders`, `GET /v1/me/orders/:id` returns only own linked orders. Guest orders aren't automatically assigned to newly created accounts.

## Staff POS and inventory

- `GET /v1/staff/locations`
- `GET /v1/staff/inventory?locationId=UUID&q=...`
- `POST /v1/staff/inventory/adjustments` with `Idempotency-Key`: `{ "locationId":"UUID", "variantId":"UUID", "delta":5, "reason":"Opening stock count" }` (manager/admin).
- `POST /v1/pos/sales` with `Idempotency-Key` and cookie:

```json
{
  "locationId":"UUID",
  "customerId":null,
  "items":[{"variantId":"UUID","quantity":1}],
  "payment":{"method":"CASH","amountMinor":5000000}
}
```

`amountMinor` is cash tendered, **not the unit price**. Backend derives total from current catalog prices, checks cash tender >= total, writes order/payment/stock/audit atomically, and returns `orderNumber`, `changeMinor`, `totalMinor`.

## Order management

- `GET /v1/staff/orders`, `GET /v1/staff/orders/:id` (staff location-scoped)
- `POST /v1/staff/orders/:id/confirm` (PENDING -> CONFIRMED)
- `POST /v1/staff/orders/:id/cancel` `{ "reason":"..." }` (releases active reservation)
- `POST /v1/staff/orders/:id/fulfill` (CONFIRMED -> FULFILLED; consumes stock once)
- `POST /v1/staff/orders/:id/collect-payment` `{ "method":"CASH", "amountMinor":5000000 }` (cash actually received)
- `POST /v1/staff/orders/:id/refund` `{ "reason":"Customer return", "restock":false }` (manager/admin; **cash only**, full refund; manually confirm actual payout)

## Catalog administration

- `POST /v1/admin/products`: `{ "categoryCode":"MATTRESS", "name":"...", "slug":"...", "description":"..." }`
- `PATCH /v1/admin/products/:id` with optional name, slug, description, active
- `POST /v1/admin/products/:id/variants`: `{ "widthMm":1600, "lengthMm":2000, "heightMm":250, "priceMinor":6500000 }`. The server generates the SKU when omitted. Existing integrations can still supply `sku` explicitly.
- `POST /v1/admin/variants/:id/prices`: `{ "amountMinor":6900000 }`
- `POST /v1/admin/media/upload` — staff-admin authenticated multipart `file`, `productId`, optional `altText`; validates JPEG/PNG/WebP and stores the bytes in PostgreSQL. **Primary MVP image workflow.**
- `POST /v1/contact` — `{ "fullName":"...", "email":"...", "message":"..." }`; queued email, requires SMTP and `CONTACT_INBOX`.
- **Optional R2 adapter (not required for this MVP):** `POST /v1/admin/media/presign`: `{ "contentType":"image/webp", "productId":"UUID" }` -> signed R2 PUT URL
- `POST /v1/admin/media`: `{ "productId":"UUID", "key":"products/.../uuid.webp", "altText":"..." }`

## Customers and staff

- `GET /v1/staff/customers?q=...`, `POST /v1/staff/customers` with `fullName, email?, phone?, locationId`
- `GET /v1/staff/customers/:id/orders`
- `GET /v1/staff/reports/sales-summary?locationId=...` (today's **net cash flow**, not a general ledger)
- `GET /v1/admin/users`, `POST /v1/admin/users` with `email, displayName, password, role, locationId?`
- `PATCH /v1/admin/users/:id/status` `{ "active":false }`

## Schema and extension boundaries

Money values are integers in **minor currency units**. A displayed DA value of 45,000 maps to `amountMinor=4500000`. Dimensions are millimeters. Catalog is keyed by SKU; stock is keyed by `(variant_id,location_id)`. Order channel is seeded lookup data, not an unchangeable enum. **No B2B endpoint or table is created**.

### Product photos

- `GET /v1/admin/media/products/:productId` lists the product gallery in display order.
- `POST /v1/admin/media/upload` accepts a multipart product photo. Include `replaceId` to replace an existing photo in place.
- `PATCH /v1/admin/media/products/:productId/:id/primary` moves the selected photo to the start of the gallery.
- `DELETE /v1/admin/media/products/:productId/:id` removes the photo from the gallery. The underlying image remains stored so other references can still resolve.
