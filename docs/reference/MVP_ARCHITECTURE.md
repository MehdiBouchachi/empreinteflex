# Empreinte Flex 2.0 — MVP Production Architecture (v1.2)

**Date:** 2026-11-22  
**Owner profile:** one engineer/maintainer  
**Initial scale:** one physical showroom + online store; 5–15 simultaneous employees; <50 sales/day  
**Target:** possible additional showrooms within two years; eventual consumer/employee mobile apps; possible B2B hotel and partner sales later.

## 0. Scope lock

### Ship in MVP
1. Retain/migrate the existing SEO-friendly Next.js storefront (fr/ar/en as applicable) with product browsing, product variants, cart/checkout, order status, and existing integrations verified against real behavior.
2. Staff-facing **responsive web** application (desktop-friendly POS + mobile-friendly dashboard); sell in-store, record payments, print/download receipt, locate SKUs, view customer history, view orders, update catalog, adjust stock, view simple reports.
3. Product catalog: MATTRESS, PILLOW, TOPPER are **seeded categories**, not permanent schema limits. Product -> sellable variant (SKU), dimensions in mm, validated category-specific attributes, price history, media.
4. One physical SHOWROOM location, optionally one WAREHOUSE location if stock truly exists there. Inventory is location-scoped now to avoid a later rewrite. Reserve stock for online orders, decrement on defined fulfillment/cash-and-carry transitions, journal stock movements, perform counted stock adjustments. Stock transfers if more than one stock location exists.
5. People/customer purchase history; staff identities, role/location grants, access control; admin vs technical operator privileges.
6. Basic order, payment, fulfillment, customer, receipt and auditing workflows; emails using small PostgreSQL outbox worker. External R2 storage for media.
7. Docker-based API + DB + worker + Caddy on Hostinger KVM 2; keep original Hostinger Business web hosting during the migration if still needed.
8. Integration-level tests, safe migration, offsite encrypted backups, restore rehearsal, basic health/uptime checks.

### Explicitly NOT in MVP
- Hotel/business organizations or organization memberships
- B2B quotations, contract pricing, trade credit, partner/reseller portals
- Partner referrals, commissions, supplier procurement, marketplaces
- Native React Native/Expo app; native Tauri/Electron desktop binary
- Full offline POS, conflict resolution, local device stock quotas
- Redis, message broker, Kafka, Kubernetes, microservices, multi-region, replicas
- Heavy BI dashboards, CRM automations or manufacturing/ERP workflows
- Per-unit serial/batch tracking unless specifically needed for day-one warranties or operations

**Definition:** A responsive web app used on phones and desktop PCs satisfies MVP cross-device access; native binaries are a later deliverable. If a native application is contractually mandatory on day one, treat it as an explicit increase to scope.

## 1. High-level architecture (C4 context and containers)

Clients:
- Existing **Next.js public storefront** (browser/customer)
- **React/Next.js responsive staff portal** (browser, desktop or mobile); POS screen within same app
- Later: Tauri desktop shell; Expo React Native apps; hotel portal — all use same API, not the database

Hostinger Business (optional during transition): web frontend.  Hostinger KVM 2 VPS: Caddy HTTPS -> NestJS API -> PostgreSQL; one tiny Node worker polls Postgres outbox. R2 stores product images and optionally encrypted offsite backup artifacts. Payments, emails and shipment providers connect via server-owned adapters, never from a public browser with provider secrets.

One database is the source of truth. No Supabase SDK direct writes from storefront or POS after cutover. No public DB ports. Network calls from native/web clients use `/v1` API over HTTPS.

## 2. Architecture style & patterns (pragmatic)

**One deployable modular monolith**, not 10 services. NestJS modules represent business capability boundaries: `identity`, `catalog`, `locations-inventory`, `customers`, `commerce` (online orders + POS), `payments`, `fulfillment`, `reporting`, `integrations`, `platform` (audit/outbox/idempotency). Small reporting queries may live in relevant modules until needed.

Inside complex modules:
- **Controller / DTO**: HTTP transport and input validation.
- **Application service / use case**: authorization, orchestration and transaction boundary.
- **Domain**: business rules such as stock availability, allowed transitions and price calculation.
- **Infrastructure**: Drizzle persistence, R2, email, payments, carrier adapters.

The actual dependency direction should be inward for business logic; do not create an interface and repository class for each trivial SQL query. Use case service -> a focused DB function is acceptable for simple reads.

Patterns deliberately selected:
- Transaction script / Unit of Work for orders and stock, database constraints for invariants.
- State machine / explicit allowed transitions for order, payment and fulfillment.
- Adapter for an actual external payment/shipping provider; avoid arbitrary provider factory frameworks.
- Idempotency key for sales, checkout, payment webhook and stock updates with retry risk.
- Transactional outbox for post-commit email/notifications, one database-backed worker.
- Strangler migration: replace old Supabase/Next.js direct data writes in stages.

Patterns deferred: CQRS split read DB, event sourcing, Kafka, full DDD aggregate frameworks, service mesh, multi-tenant isolation infrastructure.

## 3. Boundary rules

1. **Catalog** controls SKUs, category attributes, current retail prices, images. A purchase saves a snapshot of SKU, dimensions/configuration, unit price, discount/tax components if applicable.
2. **Inventory** alone authorizes stock changes. All stock balances are `(location_id, variant_id)`. Every confirmed adjustment creates a movement record with actor and reason. A sale never writes balances directly from controller code.
3. **Commerce** creates and transitions orders; `ONLINE` and `POS` are sales channel codes. Physical selling location, inventory allocation location and delivery destination are distinct fields/concepts.
4. **Payments** controls payment state and webhook verification; do not mark an order PAID based only on a redirect from a gateway.
5. **Identity** controls employee credentials and permissions. A seller is scoped to the assigned showroom. A `TECHNICAL_OPERATOR` is not automatically authorized to read every customer's sensitive data.
6. **Customer** records may exist without a login (walk-in POS). Customers must not be required to create accounts to be recorded. A customer login is mapped to their person profile, not to an employee role.
7. **API** versioned from `/v1`; OpenAPI schema compiled/generate typed clients, no app-internal imports from server modules into web/mobile.
8. **No hardcoded location UUID or category enum in persistent schema**; categories and allowed sales channels use seed/reference data. Code can validate currently supported codes explicitly.
9. **No company/B2B table at launch.** Reserve future extension via module boundary + immutable customer/billing snapshots + order line fulfillment records, not speculative partner records.

## 4. Two key business workflows

### A. Showroom POS cash-and-carry
Seller logs in -> selects permitted location -> scans/searches SKU -> API revalidates product, availability and server-calculated retail price -> seller selects payment method -> API uses single DB transaction: idempotency claim, sale order+items, confirmed payment record when cash/card terminal outcome is actually known, decrement on-hand, stock journal, receipt number, audit, outbox -> response sale/receipt -> receipt can print. External printer integration is browser print for MVP; test receipt layout on actual hardware.

### B. Online checkout
Customer selects variant/dimensions -> API reprices authoritative cart -> selects delivery and a fulfillment source -> transaction creates PLACED/PENDING order and its immutable items, holds inventory using conditional update to `reserved` (when stock policy requires) -> payment workflow confirms separately -> fulfillment transitions release reservation and decrement stock -> outbox sends notifications. On failure/cancellation, release reservation exactly once. Reservation expiry is a scheduled worker task and must not silently release an order in an active approved payment flow.

**No overselling guarantee for stock** depends on transaction isolation, conditional updates and deterministic locking — never on frontend counters. For two inventory rows, acquire locks in a stable order.

## 5. Roles (minimum viable)

| Role | Read/write authority |
|---|---|
| CUSTOMER | Public catalog, own profile and own orders only, if registered |
| SELLER | Create POS sale, customers and view scoped showroom inventory/orders |
| LOCATION_MANAGER | Seller capabilities + location stock adjustments, local refunds with policy |
| COMPANY_ADMIN | Catalog, prices, role grants, all location operations and reports |
| TECHNICAL_OPERATOR | Deployment, diagnostics, configuration and anonymized operational logs; PII access only through explicitly granted emergency/admin capability |

Audit price changes, stock adjustments, refunds, employee grants and privileged accesses. All grants explicitly include location scope where relevant. `null` scope may indicate company-wide grant only for authorized roles — enforce in policy, not as generic wildcard.

## 6. Hostinger deployment on minimum budget

- VPS: Hostinger KVM 2 2 vCPU, 8 GiB RAM, 100 GB NVMe as starting sizing assumption; verify plan resources at purchase time.
- `caddy` handles 80/443 and TLS; `api` and `worker` use pinned container images built by CI; `postgres` has private Docker network and durable volume.
- Existing website remains on Business Hosting initially; if eventually migrated to VPS, measure RAM and CPU headroom.
- No self-hosted image bucket or mail server on VPS; product images stored on R2 and email via existing delivery provider or economical SMTP service.
- No Redis initially; use PostgreSQL outbox and indexes. Avoid R2 operations for routine DB query caching.
- Docker Compose, automated CI build/test/deploy and pinned image tags. Retain previous images for rollback, apply backward-compatible migrations before new code.
- Firewall only SSH from protected access, 80/443 public; SSH keys; no public PostgreSQL; secrets outside source control; HTTPS everywhere; request-rate limits and secure cookies/tokens.
- Encrypt DB backups **before** uploading offsite; maintain retention policy and perform a restoration rehearsal. VPS snapshots alone are not the backup plan.
- Monitor external uptime, free disk, backup age, worker backlog, 5xx and p95 request latency, resource pressure and Postgres connection count.

**Cost:** additional infrastructure = one VPS + storage/backup usage + any existing paid email/payment services. No extra VPS, Redis, RDS, Kubernetes, SaaS observability suite or managed queue for MVP. Do not promise production availability from a single host; define acceptable recovery downtime with management.

## 7. Existing Empreinte Flex integration & migration

1. Inventory all current Next.js -> Supabase calls, auth, order lifecycle, payments, carrier/shipping, Meta Pixel, multilingual SEO, email templates, image paths and storage. Mark data reads vs business writes.
2. Snapshot/export current Supabase schema and records; preserve old IDs in mapping table during migration. Back up R2/image source keys before switchover.
3. Implement NestJS API with PostgreSQL tables and real migrations; write data import scripts for products, variants, prices, customers and historical orders; reconcile totals and count by table.
4. Replace existing direct writes with typed API requests behind a frontend data-access layer. Avoid running two separate authorities for order/stock writes; do a controlled cutover after final sync.
5. Run POS and online checkout smoke tests against staging with real PostgreSQL. Confirm payment webhooks and stock transitions using sandbox provider credentials or explicitly simulated provider responses, never fake settled payments in production.
6. Use DNS/hosting switch only after rollback instructions, reconciliation and backup restore test. Keep SEO routes and translated URLs stable.

## 8. Must-pass acceptance gates

- Two concurrent purchase attempts against one remaining SKU cannot both succeed.
- Replaying a POS sale / payment webhook with the same idempotency key has no duplicate order/charge/stock movement.
- Seller at Location A cannot mutate Location B inventory; both web and prospective native apps are restricted by same policy.
- Successful payment + fulfillment changes match order records and exactly one stock ledger movement.
- Walk-in customers can buy without an app account; registered customer cannot read anyone else's order.
- Previously created orders retain original price/configuration when catalog price/variant details change.
- One checkout/one POS sale/one refund/one cancellation/one stock adjustment/one stock transfer (if warehouse used) works end-to-end.
- Images load through R2 after source migration; public URL SEO still works; notifications are retried safely.
- 15 staff sessions plus online checkout can operate with acceptable p95 latency and no double-sale or stock inconsistency.
- VPS can be rebuilt and PostgreSQL restored from an external encrypted backup; operation is documented and tested.

## 9. Actual extensibility guarantee — limited and honest

- More showroom locations: add location records, inventory balances and role grants; existing commerce architecture unchanged.
- Mobile native app: implement API client against versioned OpenAPI; no business rule duplication.
- Hotel/B2B: **requires new tables and use cases later** (organizations, company buyers, price lists, quotes and partner scopes). Orders already contain immutable line snapshots; inventory allocation is location-aware; add business buyer linkage via backward-compatible migration rather than replacing the retail system. Not zero work, but no backend platform rewrite.
- Multi-location fulfillment and multi-batch delivery: extend fulfillment allocations/lines; MVP already avoids using one location field as the sole stock source.
- Stronger availability: one VPS cannot be made HA by code alone. Separate DB host/second API and failover are future infrastructure investments.
