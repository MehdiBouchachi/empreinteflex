# Delivery verification / production gap report

## Implemented in source

- Original uploaded Next.js site kept, three locales, with new `/v1/catalog/storefront` API adapter.
- Admin and employee sessions, location-scoped permission checks, product/variant creation and price history.
- Product media in PostgreSQL `bytea` with authenticated upload, direct GET and hash deduplication.
- Checkout with server-side price checks, stock holds and tracked orders; showroom POS and cash sales; audited inventory movements.
- Staff dashboard sharing storefront's blue, navy, red and white design; mobile responsive and Arabic RTL.
- Local and VPS Docker Compose files, migrations, setup credentials, SMTP outbox, backups and sample integration smoke script.

## Not verified in this generation environment

- Actual `pnpm install`, TypeScript type-checking, Docker builds, Next.js runtime rendering, complete API/DB integration tests and visual browser review. Docker and npm registry access were unavailable. TypeScript/JS syntax was parsed but that is **not equivalent** to compiling or executing the stack.
- Operations at expected production traffic and behavior across real receipt printers.

## Remaining before real launch

1. Obtain the live **Supabase export** and migration mapping for all products/SKUs/photos, accurate prices, customers and historical orders. This code uses **demo-only prices/stocks**.
2. Configure secure VPS domains and HTTPS, backups/encryption/restore testing, environment secrets, monitoring and update strategy.
3. Select and implement real payment gateway and delivery/shipping provider APIs where applicable. Initial checkout is pay-on-delivery and POS cash only.
4. Configure and verify SMTP sender, contact inbox and order notifications (absence of SMTP is an explicit unavailable state).
5. Validate Algerian invoicing/tax/returns, data privacy, employee workflows, image size/DB capacity and access controls.
6. Run the Docker build, tests, full browser regression in FR/EN/AR, checkout, stock-concurrency, rate limit and penetration checks.
7. Legacy tests copied from the original Supabase-based storefront must be adapted to the new data services.
8. Real-time POS offline mode, mobile native apps, hotel B2B, organizational price lists are future projects, not silently present in MVP.

Production deployment must remain blocked until these items are completed.
