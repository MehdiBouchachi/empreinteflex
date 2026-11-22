# Solo Engineer Delivery Plan — Implement Only Current MVP

## Phase 0 — Existing system audit (mandatory)
- [ ] Record Next.js routes, translations, SEO structure, Supabase reads/writes, user accounts, product SKUs, prices, order states, delivery/email/payment integrations.
- [ ] Agree whether every SKU is stocked, made-to-order or both; record whether unique mattress identifiers/warranty tracking are needed on day one.
- [ ] Record existing sales documents, taxes, payment types, delivery rates, receipt numbering, inventory opening balances and staff locations.
- [ ] Make a production data export and a tested restore of the legacy dataset before touching anything.

**Gate:** written data mapping and no ambiguity around what decrements stock and when payment is finalized.

## Phase 1 — Foundation
- [ ] pnpm workspace: `apps/storefront`, `apps/staff`, `apps/api`, `packages/api-client`, `packages/config`; one shared design token package as needed.
- [ ] NestJS modules aligned to actual MVP boundaries; PostgreSQL 16+ with Drizzle migrations.
- [ ] Auth, safe password hashing/session lifecycle, RBAC by location and server-only secrets.
- [ ] Docker Compose for development (database + API + worker + Caddy optional); basic CI with lint, tests, migrations check, image builds.

**Gate:** protected `/v1/auth/me`, isolated DB, automated CI green.

## Phase 2 — Retail core
- [ ] Categories, products, variants, category-specific attribute validation, retail prices, R2 media.
- [ ] Locations, stock balances, movements, reservations, adjustments; transfers if >1 real location.
- [ ] Customer records; order+item snapshots; online order placement; POS sales; payment and fulfillment state machines.
- [ ] Idempotency, atomic stock transactions and audit logs; emails via Postgres outbox.

**Gate:** test race for last unit, retry safety and scoped access with real PostgreSQL.

## Phase 3 — Staff and storefront integration
- [ ] Staff-responsive web POS/admin with large touch targets on desktop, small-screen stock management and receipt print.
- [ ] Existing Next.js storefront rewired to server API; no direct client DB writes.
- [ ] Provider integration adapters (only providers actually used) with staging/sandbox tests, signed webhooks and failure workflows.
- [ ] Migration scripts and reconciliation report; handle SKU/price duplication and historical orders carefully.

**Gate:** real demo: seller sells SKU -> inventory and report update; website order -> reservation -> delivery -> inventory update; refund/cancel safe.

## Phase 4 — Production readiness
- [ ] Deploy pinned API/worker images on VPS behind Caddy; leave existing storefront hosting until cutover.
- [ ] Automated encrypted offsite DB backups and monthly restore drill; failure/uptime alerts, disk+RAM monitors.
- [ ] Limit public services to 80/443, protect SSH, enforce rate limiting, run permission/security checks, test order data privacy.
- [ ] Execute load scenario with 15 employees plus concurrent web traffic; verify p95 and errors.
- [ ] Launch with rollback checklist, prevent two authoritative stock/order databases during cutover.

**Gate:** backup restore proven; no critical oversell, auth leakage or payment-state bugs; recovery procedure documented.

## What NOT to do during these phases
- Do not create organization/partner/hotel tables, contracts, quotes, bulk price tiers or commercial agreements.
- Do not build separate native apps unless browser behavior objectively fails a required workflow.
- Do not deploy Redis, queues, Kubernetes, Terraform, separate database VPS or third-party managed services by default.
- Do not add generic repositories and fake microservice boundaries purely for pattern compliance.

## Solo maintenance cadence after launch
- Weekly: check errors, free disk, failed payments/orders, failed outbox events, backup success, pending updates.
- Monthly: restore rehearsal, dependency patch window, review access grants, test essential checkout/POS flows.
- Before second showroom: test staff scoping, transfers, location reports, outage recovery times and inventory reconciliation.
