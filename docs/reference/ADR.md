# Architecture Decision Records (ADRs)

### ADR-001: Modular monolith, not microservices
**Accepted.** One solo developer, few transactions and shared transactional inventory favor one deployable NestJS app. Extract services only for proven independent scaling or team boundaries.

### ADR-002: One PostgreSQL database; location-aware from day one
**Accepted.** Enforce inventory availability and finance consistency with transactions and constraints. Add showrooms as records, not databases.

### ADR-003: Staff responsive web app before native clients
**Accepted for MVP.** One maintainable staff UI for desktop and phone. Tauri/Expo reserved for validated native requirements. Business rules always server-side.

### ADR-004: B2B is deferred, not pre-built
**Accepted.** Retail people customers only now. Preserve snapshots, channels and fulfillment decomposition. Future B2B adds organization/buyer linkage via versioned migrations; do not write B2B SQL now.

### ADR-005: Hostinger KVM 2, Docker Compose, Caddy, R2, PostgreSQL outbox
**Accepted as initial sizing, subject to load test.** Avoid services that add subscriptions and operating overhead. One VPS is a SPOF; offsite encrypted backups and tested restore are mandatory.

### ADR-006: Existing storefront migration rather than rebuild
**Accepted.** Preserve Next.js route structure, SEO and translations; migrate business operations away from direct Supabase calls to a central versioned API. Cutover only with reconciled data.

### ADR-007: Drizzle ORM, targeted Clean Architecture
**Accepted.** Strong typed SQL and explicit migrations. Controller/use case/domain/infrastructure boundaries applied to complex modules; do not force every query through generic repository boilerplate.

### ADR-008: External integration boundary only for actual providers
**Accepted.** Payments, email, shipping and R2 adapters where they exist. Do not design an abstract payment mega-framework before the provider and methods are known.
