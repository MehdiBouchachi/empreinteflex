# Empreinte Flex 2.0 — MVP Data Contract and API Specification

**Purpose:** implement the retail system now, without creating B2B tables or endpoints. Field-level constraints below are architectural requirements; implement as tested, versioned Drizzle/PostgreSQL migrations.

## A. Tables to implement in MVP

**Identity**
- `users(id, email unique case-insensitive, password_hash/identity_provider, display_name, active, created_at)` — login identity; verified email handling; no storing plaintext credentials.
- `user_role_grants(id, user_id, role, location_id nullable, granted_by, revoked_at)` — scoped employee access.
- `sessions(id, user_id, token_hash, expires_at, revoked_at)` or equivalent server-owned session store, depending on login strategy. Never trust a client-supplied role.

**Catalog**
- `categories(id, code unique, name, active)` — seed MATTRESS/PILLOW/TOPPER; no DB CHECK freezing exactly three category codes.
- `products(id, category_id, slug unique, name, description, active, timestamps)`.
- `product_variants(id, product_id, sku unique, width_mm, length_mm, height_mm, attributes JSONB, active)` — validate category-specific fields in the application and DB basics (positive dimensions).
- `variant_prices(id, variant_id, amount_minor BIGINT, currency, effective_from, effective_until)` — prevent overlapping active price periods for a given variant and currency.
- `product_media(id, product_id, variant_id nullable, r2_key, alt_text, sort_order)` — actual objects in R2, metadata in PostgreSQL.

**Locations / inventory**
- `locations(id, code unique, name, kind SHOWROOM|WAREHOUSE, active)` — initial one showroom; warehouse only if real.
- `stock_balances(location_id, variant_id, on_hand, reserved, updated_at)` — PK `(location_id, variant_id)`; enforce `on_hand>=0`, `reserved>=0`, `reserved<=on_hand` for stocked SKUs.
- `stock_movements(id, location_id, variant_id, event_type, event_id, event_line, delta_on_hand, delta_reserved, actor_id, reason, occurred_at)` — immutable ledger and unique event line to prevent duplication.
- `stock_reservations(id, order_item_id, location_id, variant_id, quantity, state, expires_at)` — reservations point to **order line**, not just order header; supports later split allocation.
- `stock_adjustments` optional header if you need a formal approval workflow; initially write an audited movement with reason.
- `stock_transfers` and `stock_transfer_items` only if warehouse and showroom are separate stock locations at launch. If not, reserve the module/API name and introduce migration with second location.

**Commerce, customers and fulfillment**
- `customers(id, full_name, email nullable, phone nullable, user_id nullable, created_at)` — person-only in MVP; never assume user account required for POS. Future organizations will be additive.
- `order_channels(code primary key, name)` — seed `ONLINE`, `POS`; B2B not seeded or exposed.
- `orders(id, order_number unique, channel_code FK, status, payment_status, customer_id nullable, created_by nullable, sales_location_id nullable, customer_snapshot JSONB, shipping_snapshot JSONB nullable, currency, total_minor, timestamps)` — **no mandatory single fulfillment_location_id**; channel is not a customer type.
- `order_items(id, order_id, variant_id nullable, sku_snapshot, name_snapshot, configuration_snapshot JSONB, qty, unit_price_minor, discount_minor, tax_minor, line_total_minor)` — historical values immutable after placement except explicit corrections/refunds.
- `fulfillments(id, order_id, source_location_id, status, method, delivery_reference nullable, timestamps)` — in MVP normally one per order; permits more later.
- `fulfillment_items(id, fulfillment_id, order_item_id, quantity)` — prevents order header assuming all stock ships together. If this is too much for launch, the **minimum** is to keep stock reservations tied to order items, and add these two tables before implementing deliveries; do not hardcode order->one location invariants in services.
- `payments(id, order_id, method, provider, provider_reference unique nullable, state, amount_minor, currency, created_at)` — provider webhooks authenticated; refunds separate when actually supported.

**Platform**
- `idempotency_records(scope, idempotency_key, request_hash, response, state, created_at)` unique `(scope, idempotency_key)`; use idempotency on money and stock commands.
- `outbox_events(id, event_type, aggregate_id, payload, state, attempts, next_attempt_at, locked_until nullable, created_at)` — claim/retry worker; after a crash, recover expired claims. Exactly-once delivery to external email/provider is not generally guaranteed; use dedup keys and idempotent handlers where possible.
- `audit_logs(id, actor_id, location_id nullable, action, subject_type, subject_id, metadata, created_at)` — suppress secrets and personal data from logs.

## B. Concrete invariants

- Money as integer **minor currency units** consistently, never JavaScript floating point for totals; define display rounding and tax conventions explicitly for DZD.
- For `orders`, source channel and in-store selling location are separate from stock/fulfillment source.
- For `stock_reservations`, an order item may be allocated across one or more locations in the future; do not enforce unique order item reservation globally.
- A stock mutation must be atomic with its immutable journal entry and related idempotency record.
- POS payment success has to match tender evidence (cash registered, external terminal confirmation, etc.).
- Idempotency keys are scoped to actor/operation and verified against request hash; simultaneous retries must not both process.
- Product dimensions should be physical quantities in millimeters; pricing may depend on the actual configured variant or a validated custom-size request. Custom manufacturing remains out of scope unless confirmed.
- Customer contact/billing snapshot is immutable on placed orders, even if a later business buyer relationship is introduced.

## C. MVP REST API surface (illustrative contracts)

All endpoints are prefixed `/v1`; OpenAPI docs are generated from validated DTOs; authorization on server and pagination on list endpoints.

| Route | Use | Permissions |
|---|---|---|
| `POST /v1/auth/login`, `POST /v1/auth/logout`, `GET /v1/auth/me` | Staff/customer auth | User |
| `GET /v1/catalog/products`, `GET /v1/catalog/products/:slug` | Public catalog | Public |
| `GET /v1/catalog/variants/:id/availability` | Availability estimate | Public (rate limited) |
| `POST /v1/admin/products`, `PATCH /v1/admin/products/:id` | Catalog management | Company admin |
| `POST /v1/admin/variants/:id/prices` | Retail prices | Company admin |
| `GET /v1/staff/locations` | Authorized locations | Staff |
| `GET /v1/staff/inventory?location_id=&q=` | Stock search | Scoped staff |
| `POST /v1/staff/inventory/adjustments` | Stock correction | Manager/admin |
| `POST /v1/staff/inventory/transfers` | Transfers, if needed | Manager/admin |
| `POST /v1/pos/sales` | Finalize showroom sale | Seller (scoped) |
| `POST /v1/checkout/orders` | Place online order | Customer or approved guest flow |
| `POST /v1/payments/webhooks/:provider` | Payment status update | Signed provider webhook |
| `GET /v1/me/orders`, `GET /v1/me/orders/:id` | Customer order tracking | Own data only |
| `GET /v1/staff/orders`, `GET /v1/staff/orders/:id` | Staff orders | Scoped staff |
| `POST /v1/staff/orders/:id/fulfill` | Goods handed over / dispatched | Scoped staff |
| `GET /v1/staff/customers`, `POST /v1/staff/customers` | Customer records | Scoped staff |
| `GET /v1/staff/reports/sales-summary` | Basic daily metrics | Manager/admin |
| `GET /health/live`, `GET /health/ready` | Monitoring | Public/live; ready safely implemented |

**No `/organizations`, `/b2b`, `/quotes`, `/partner`, `/price-lists` routes in MVP.**

## D. Sample request contracts

### `POST /v1/pos/sales`
Headers: `Authorization`, `Idempotency-Key`, `Content-Type: application/json`
```json
{
  "locationId": "UUID",
  "customerId": null,
  "items": [{ "variantId": "UUID", "quantity": 1 }],
  "payment": { "method": "CASH", "amountMinor": 1200000 }
}
```
Server verifies roles, location, authoritative retail price, available stock and payment sum. The provided `amountMinor` is a cash tender claim, **not** the authoritative product price. Returns sale ID, receipt number, actual totals and accepted payment state.

### `POST /v1/checkout/orders`
```json
{
  "items": [{ "variantId": "UUID", "quantity": 1 }],
  "customer": { "fullName": "Customer Example", "phone": "+213..." },
  "shippingAddress": { "wilaya": "Blida", "city": "Blida", "addressLine": "..." },
  "deliveryMethod": "DELIVERY"
}
```
Backend validates actual geographic/shipping fields according to existing checkout and provider rules, calculates price and stock source, creates order+reservation, returns order ID and next payment/confirmation step. Do not trust client prices or computed totals.

## E. Integration changes

- Frontend API client `packages/api-client` uses typed OpenAPI client; no Supabase business writes from storefront or POS.
- Website retains existing locale routes and metadata. Validate all payment/delivery/email/Meta Pixel integration behavior before removal/replacement; do not replace a working provider merely for architectural purity.
- R2 stores media; DB only object keys and metadata; signed upload URLs for staff and proper authorization for private documents.
- Customer and staff authentication flows must remain separate in authorization even if they share an identity service.
- B2B later adds `organizations`, `buyer_accounts`, contract prices, quotes and business grants; use a backwards-compatible migration to add `buyer_account_id` without rewriting MVP orders. See `FUTURE_EXTENSIONS.md`.
