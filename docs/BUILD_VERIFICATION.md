# Build verification — generated package

- JS/JSX/TS/TSX syntactic parsing: **PASS (172 files, 0 parse failures)** using a local TypeScript parser.
- Relative and `@/` app import resolution: **PASS (172 files, no missing local imports)**.
- Staff FR/EN/AR dictionary parity: **PASS (171 keys each)**.
- Original source design: `app/[local]/layout.js` and `src/components/sections/HeroSection.js` are byte-for-byte copied from the uploaded source. Original page components, image assets and dictionaries are included.
- Docker Compose: service definitions supplied for local and VPS mode; **not executed** in this environment.
- NOT VERIFIED: `pnpm install`, `pnpm -r build`, TypeScript semantic type checks, Next build, Docker image build, SQL migrations against running PostgreSQL, browser visual comparison, API integration smoke tests, production load/security testing. npm registry DNS access and Docker are unavailable.
- `apps/storefront/tests/` contains some **original Supabase-specific tests**, not migrated or claimed passing. Do not use them as new-backend validation until updated.

When Docker is available, start locally using `start.ps1` or `start.sh`, inspect `docker compose logs`, run basic purchases/stock adjustments, then in demo mode run `node infra/scripts/integration-smoke.mjs` against a disposable database.
