# Empreinte Flex 2.0 — Integrated storefront and retail platform

This monorepo **preserves the uploaded Empreinte Flex Next.js website** (`mattresses-main.zip`): its page layouts, typography, images, animations, header, footer, and existing FR/EN/AR translations. The legacy Supabase catalog/checkout data layer has been replaced with a new **NestJS/PostgreSQL** API. A new blue/navy/red staff dashboard matches the website identity.

**Status:** code-complete *development MVP / migration baseline*, **not verified production-ready**. Docker and npm dependency downloads were unavailable in the build environment. Run the actual builds, end-to-end checkout, and security tests on your computer before deployment. A Supabase data export and payment/shipping provider credentials were not uploaded. Accordingly the seed catalog contains **demonstration names/sizes/prices** and selected product photos from the provided source. **Do not launch with demo pricing or stock.**

## Quick start

Install **Docker Desktop** (Compose V2), **Node.js 22+**, and ensure ports **8080** and **8081** are available. Docker needs internet on first run to fetch base images and npm packages.

**Windows PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

**Linux / macOS / WSL:**
```bash
chmod +x start.sh && ./start.sh
```

The first-run setup generates a `.env` with random passwords (including an administrator password). Keep `.env` private. API migrations and initial seeding are applied automatically. For evaluation only, `.env` is generated with `SEED_DEMO=true`. When staging or deploying with real stock, disable demonstration seeding and import validated production records.

- **Storefront FR:** http://localhost:8080/fr
- **Storefront EN:** http://localhost:8080/en
- **Storefront AR (RTL):** http://localhost:8080/ar
- **POS / staff admin:** http://localhost:8081 (switch language in the header)
- **API Swagger:** http://localhost:8080/docs
- **API readiness:** http://localhost:8080/health/ready

Stop containers without deleting data: `docker compose down`. **Never run `docker compose down --volumes` against important data.**

```bash
docker compose ps
docker compose logs -f api
# Temporary demo-only test; creates test transactions
node infra/scripts/integration-smoke.mjs
```

## Monorepo

```text
apps/
  storefront/          Original uploaded Next.js design, connected to NestJS
  staff/               New React/Vite blue-red POS/dashboard (FR, EN, AR + RTL)
  api/                 NestJS API, SQL migrations, worker and transaction logic
packages/shared/       Shared API types
infra/                 Dockerfiles, reverse proxy, backups, setup, smoke checks
data/                  Curated demo catalog + source product photos for DB seeding
docs/                  API, integration map, migration, operational caveats
compose.yaml           Local Docker composition
compose.production.yaml VPS template with HTTPS Caddy
```

## Features included

- Products: **mattresses, pillows, toppers**; SKU-specific variants, sizes, thickness, prices, multi-location stock.
- Stock: availability, audited adjustments, reservations, concurrent transaction checks and movements.
- Sales: cashier POS, online pay-on-delivery checkout, order status, partial operational tracking, refund flows.
- Staff: session login, admins and location-scoped permissions, employees, customers/history, sales dashboard.
- FR/EN/AR: original storefront translations preserved; new staff dictionary added with Arabic RTL.
- Product imagery: seed product photographs and new dashboard uploads are stored in PostgreSQL `media_assets.bytes` (BYTEA) and returned through `/v1/media/:id`; site illustrations and decorative images remain static in `/public`, as they should.
- Email: contact requests go through a PostgreSQL outbox worker and SMTP **only when configured**.
- Deployment: Docker Compose, Caddy reverse proxy, migrations, backup/restore scripts; no Redis/Kubernetes.

## Missing / requires real-world integration before production

Actual **Supabase database export** (products, variants, exact selling prices, customers, historical orders, images) was not supplied. The imported website has been adapted to a fresh API schema, **not** populated with your live commercial data. Card/online payment gateway, carrier/Aramex, transactional SMTP, taxes/invoices for Algeria, delivery pricing, and real domain/DNS/HTTPS require configuration, implementation where needed, and testing. Customer account migration, external Meta Conversions API and native offline POS are also not claimed complete. Existing storefront SEO, pages, translations, client Meta Pixel hooks and static assets are preserved. The older storefront automated tests were written for Supabase and require migration before they can be treated as valid tests.

**Do not edit prices, balances, or paid orders directly in SQL in production; use the application workflows and audit logs.** For operational and hosting details see `docs/OPERATIONS.md` and `docs/GAP_REPORT.md`.

## Future growth

A second showroom is a new `locations` record with scoped staff grants and stock balances, not another database. Future hotel/partner B2B features can be implemented as additive modules and migrations; B2B accounts and pricing are **not** implemented today.
