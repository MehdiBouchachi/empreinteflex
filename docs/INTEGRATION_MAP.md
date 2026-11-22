# Integration map: uploaded Next.js storefront → new API

| Function in original Next.js | New integration |
|---|---|
| Product listings/details, names, sizes | `src/lib/data-services/products.js` → GET `/v1/catalog/storefront?locale=fr\|en\|ar` |
| Product image galleries | PostgreSQL `media_assets.bytes` (BYTEA), served from GET `/v1/media/:id` |
| Category/dimension filter metadata | Original taxonomy UI retained; dimensions derived from backend SKU dimensions |
| Cart and variant selection | Original Redux/UI retained; cart records backend `variantId` |
| Checkout | `src/lib/actions.js` → POST `/v1/checkout/orders`; server prices and reserves stock |
| Confirmation | Private order tracking token from backend, held in browser localStorage |
| Order lookup | GET `/v1/track-by-code/:code?phone=...`, phone verified; private token alternate |
| Contact form | Next route → POST `/v1/contact` → PostgreSQL outbox → SMTP configured by owner |
| Staff administration | New React/Vite app → `/v1/*` through Caddy same-origin proxy |
| Dashboard photo uploads | POST `/v1/admin/media/upload`, MIME sniffed and stored in DB |

**Preserved:** original page and component JSX, local FR/EN/AR dictionaries, styling, fonts, section animations, product galleries, locale links, SEO metadata, blogless page structure and decorative assets. The original Meta Pixel hook remains, but any server-side Conversions API integration needs new configuration and verification.

**Not available in attachment:** Supabase production data/credentials, payment provider configuration, carrier credentials, customer records, order exports, actual prices and inventory balances. We cannot truthfully import unknown values.

**Production note:** storing all product JPEG/PNG bytes in PostgreSQL was requested and implemented. This increases database size and backup volume. Reconsider object storage (R2 or S3-compatible) when the photo library grows; the `media_assets` abstraction makes a future adapter practical.
