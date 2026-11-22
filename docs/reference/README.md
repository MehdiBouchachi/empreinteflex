# Empreinte Flex 2.0 — MVP-First Architecture v1.2

**Status:** implementation blueprint, not a running application.

## Decision
Build **only** the retail MVP for one showroom + online store, while keeping the backend and data model extendable to more showrooms, new client apps, and future hotels/B2B. No B2B features or B2B database tables in the MVP.

## Files
- `MVP_ARCHITECTURE.md` — final scope, services, architecture/design patterns, workflows, security, operations
- `DATA_AND_API.md` — MVP relational model, invariants, real API contracts and migration approach
- `FUTURE_EXTENSIONS.md` — exactly how future B2B/mobile/multi-showroom functionality can be added
- `IMPLEMENTATION_PLAN.md` — sequence and acceptance criteria for a solo engineer
- `ADR.md` — architecture decision records, accepted tradeoffs
- `diagrams/` — system, module and checkout flow diagrams in Mermaid

## Non-goals
This package does not include executable application code, credentials, payment provider configuration, production migrations or a tested production deployment. Final accounting/invoicing, existing payment integration and product manufacturing rules require confirmation from current site behavior and actual business operations.
