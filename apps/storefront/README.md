# Empreinte Flex storefront (original UI preserved)

This is the `mattresses-main.zip` Next.js UI integrated into the new NestJS/PostgreSQL platform. Routes and visuals were preserved while former Supabase-based data services and checkout calls were replaced by API integrations.

Run via the **root Docker Compose** (`start.ps1` / `start.sh`). For direct development `API_INTERNAL_URL` must point to the NestJS API, e.g. `http://localhost:3001`, and dependencies must be installed via pnpm. Product photos are served from PostgreSQL at `/v1/media/:id` behind the shared Caddy proxy (or the Next rewrite in direct development).

FR, EN, and Arabic RTL page layouts are retained from the uploaded site. Original storefront test scripts referencing Supabase are legacy and must be updated before depending on them.
