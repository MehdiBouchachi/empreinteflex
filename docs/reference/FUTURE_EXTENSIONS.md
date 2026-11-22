# Empreinte Flex — Planned Extensions (NOT in MVP)

## Principle
**A future-compatible architecture is not the same as implementing future features now.** Avoid speculative tables and empty modules. Preserve extensibility through API contracts, stable business invariants, location scoping, immutable commercial snapshots, bounded modules and reversible migrations.

## 1. Second showroom
Trigger: an actual new location is opened. Add location and stock balance records; assign scoped staff roles, allocate stock, activate transfers, reports by location. No separate databases or code forks. Upgrade VPS/availability based on real usage and business recovery needs.

## 2. Native employee / customer mobile app
Trigger: mobile-specific workflow (camera barcode scanning, native push, installed app, or app-store distribution) justifies cost. Build Expo/React Native using generated `/v1` SDK. Keep business logic, price, inventory and auth checks server-side. Add device token tables only if push notifications are needed. Backwards-compatible API changes because older app versions stay installed.

## 3. Native desktop/offline POS
Trigger: printer/cash-drawer/OS access or unreliable internet cannot be handled safely in browser. Wrap React portal with Tauri or use Electron if peripheral SDK compatibility favors it. Add local SQLite operation queue and client-generated idempotency keys. Never represent an offline sale as central stock-confirmed unless preallocated offline stock is reserved per device; otherwise mark PROVISIONAL and reconcile after reconnect.

## 4. Hotels and B2B buyers
Trigger: first real hotel/customer organization with need for negotiated purchasing. Implement as additive feature branch and migrations:
1. `organizations` with legal display name, contacts, billing addresses and status.
2. `buyer_accounts` whose purchaser can be person or organization; link existing retail `customers` through backfill without deleting old order history. Add nullable `orders.buyer_account_id`, backfill, then move new purchasing use cases to the buyer account abstraction. Preserve `customer_snapshot` and item prices already stored on old orders.
3. `organization_memberships` and external scopes, not reusing employee showroom grants.
4. `price_lists`, optional quantity tiers, contract terms and `quotes` only when pricing requires them. Use one server-side pricing policy implementation at MVP; add B2B policy later, retaining immutable accepted price snapshots.
5. Partner/hotel portal consumes same API; authorization filters by organization on each query/command.
6. If hotel requires split deliveries, add multiple fulfillment records for one order and allocate fulfillment lines to stock sources — base MVP design already accommodates it.

No B2B table, hotel portal, negotiated price, quote service, trade credit, supplier or reseller commission exists at launch. Future features involve application code and migrations, **not** a new backend architecture.

## 5. Third-party partners
Different models must not be confused:
- **Hotel (customer):** organization buyer, quotes, bulk delivery.
- **Reseller/distributor:** commercial account, assigned terms, potentially tiered prices.
- **Referral partner:** attribution and commission records.
- **Supplier:** purchasing/receipts module, separate from customer.
- **Independent marketplace seller:** genuinely distinct multi-seller accounting and catalog ownership; requires separate design, not promised by this architecture.

## 6. Infrastructure scaling
- Up to a few showrooms: continue one API and Postgres on the VPS if monitoring/load test and outage policy allow.
- At resource limits: more VPS capacity, indexes, connection pool discipline, then consider moving PostgreSQL off-host.
- At uptime requirements: independent DB/backup/failover and multiple API instances. More showrooms are first a reliability/operations challenge, not necessarily a CPU problem.
- Do not infer future exact capacity or costs from the number of modules.

## Explicit future proofing we do NOW
- `locations` and location-scoped transactions
- Channel as reference data, not frozen `ONLINE|POS` SQL check
- Customer/contact snapshots and immutable order item price/configuration
- Fulfillment and stock allocation recorded at order item level
- Clean backend API and OpenAPI-generated SDK, stateless server behavior
- Provider adapters only for integrations actually in use
- Expand/backfill/switch/contract versioned DB migration discipline

## Explicit non-promises
- No zero-migration or zero-code B2B enablement: hotel sales will require new feature development.
- No automatic high availability from one VPS.
- No guaranteed offline stock correctness without dedicated stock allocation design.
- No guarantee all real-world payment methods and invoices are compliant without local accounting/payment requirements review.
