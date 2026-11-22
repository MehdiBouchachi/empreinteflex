# Operations — local and Hostinger VPS

## Hardware plan

Starting point: Hostinger KVM 2 (2 vCPU, 8 GB RAM, 100 GB NVMe), 5–15 staff, <50 daily sales and one showroom. This is a sizing hypothesis, **not a tested throughput or uptime guarantee**. PostgreSQL, API, worker, Next.js and static staff service run as Docker Compose containers; consider retaining your existing Business Hosting storefront during migration to avoid duplicated website hosting costs.

## Local development

1. Install Node 22+ and Docker Desktop/Engine with Compose v2.
2. `./start.sh` on Linux/macOS/WSL or PowerShell `start.ps1` on Windows. It creates a random `.env` and builds containers.
3. Read initial admin password from setup output. Existing `.env` is preserved on subsequent launches.
4. `docker compose ps` and `docker compose logs -f api worker`; open http://localhost:8081 and http://localhost:8080/fr.
5. For rapid iteration, `corepack enable && pnpm install` (requires npm network) and run `pnpm --filter @ef/staff dev` (Vite port 5174, proxies to local API port 3000), or rebuild Docker containers. The API's Postgres connection is internal by default; do not publish DB to the internet.

## Production VPS checklist

1. Install Ubuntu LTS, Docker Engine and Compose plugin, SSH key-based login, UFW allowing **22 from protected IPs, 80 and 443 publicly**. Patch regularly.
2. Get DNS A records for `empreinteflex.com` and `admin.empreinteflex.com` to the VPS; if the old website stays on Business Hosting, **do not repoint the main domain**. Use an alternate storefront hostname and edit production Caddyfile accordingly.
3. `node infra/scripts/setup.mjs` on first setup, then edit `.env`: `NODE_ENV=production`, `COOKIE_SECURE=true`, `SEED_DEMO=false`, `CUSTOMER_REGISTRATION_ENABLED=false`, real admin email/domain, strong secrets, optional R2 and SMTP values. Use **HTTPS** only. Never ship original demo credentials or test data to production.
4. **Use the production Compose file**: `docker compose -f compose.production.yaml up --build -d`. It publishes only `80:80` / `443:443`, configures Caddy ACME TLS, and keeps PostgreSQL private. Ensure no other site binds 80/443.
5. Product photos are stored as **PostgreSQL BYTEA**, not in R2 for the MVP. Monitor DB disk utilization and backup size. R2 is optional for a future image migration; it is not needed to start. Configure a **separate private encrypted offsite backup destination**. Never make database backups public.
6. Configure SMTP before enabling customer email expectations. Without SMTP, outbox events remain BLOCKED rather than falsely marked SENT.
7. Set up encrypted offsite DB backups **and test restore**; see below. Monitor errors, worker backlog, disk usage, backup freshness, RAM and 5xx/latency. Run `infra/scripts/integration-smoke.mjs` in disposable staging **only**.
8. Complete real payment, shipping, SEO, login, tax compliance, data retention and reconciliation checks before DNS cutover. This code is a development baseline, not a production-certified storefront.

## Migrations and rollback

- SQL files in `apps/api/migrations/` are applied in lexical order and recorded in `schema_migrations`; the API container runs migrations **once per file** before boot.
- For each schema change, prefer `expand -> backfill -> switch code -> contract` rather than destructive edits; keep previous Docker image tags for rollback.
- Do **not** edit previously applied migration scripts on a live DB; create `002_...sql` etc.
- For an existing Supabase deployment, import needs an explicit ID map and reconciliation. This repo contains **no production data export**.

## Offsite encrypted backup

The provided host-side `infra/scripts/backup.sh` uses `docker compose exec -T postgres pg_dump -Fc`, pipes through **age recipient encryption**, then uploads via **rclone** to a separately configured remote. Install age and rclone on the host. Generate and safeguard a private age identity **off the VPS**; only copy its **public recipient** onto the VPS. Example:

```bash
export AGE_RECIPIENT='age1...public...'
export RCLONE_REMOTE='ef-r2:empreinteflex-db-backups'
./infra/scripts/backup.sh
```

Run using systemd timer/cron after testing; configure remote retention and alerting. **Local VPS snapshots are not independent backups.** The script refuses to proceed if the encryption key or remote is missing.

For a restore: stop writers first; prepare a separate staging DB when rehearsing. For the destructive real restore:

```bash
RESTORE_I_UNDERSTAND=YES AGE_IDENTITY_FILE=/safe/place/age-key.txt ./infra/scripts/restore.sh path/to/encrypted.dump.age
```

Never run an untested restore against the live data store. Restore scripts do not automate business reconciliation.

## Deployment approach for one engineer

Prefer GitHub Actions build/tests -> versioned images -> deploy to Hostinger VPS, instead of compiling three applications during each production update. Docker Compose provided here also supports direct `--build` for simple onboarding. Never run `docker compose down --volumes` on real data. The example CI performs source builds; it does **not** auto-deploy because VPS SSH credentials and release approvals were not supplied.

## Supabase catalog import

The committed `data/catalog-supabase.json` contains the catalog subset of the legacy export. The original CSV contains customer and order records and should stay outside the repository.

- Regenerate the normalized data with `python scripts/normalize-supabase-catalog.py <export.csv> data/catalog-supabase.json`.
- With the local Compose API running, run `python scripts/import-supabase-catalog.py` to validate and roll back, or add `--apply` to commit.
- The import matches products by slug and variants by legacy ID or exact dimensions. It converts centimetres to millimetres and DZD to minor units, retains changed price history, and archives superseded demo variants that have no reservations. It preserves existing stock and creates no stock balances from the legacy availability flag.
- The photo mappings retain the original URLs and use the corresponding product assets already in the repository. Imported photos are served by the database media endpoint.
