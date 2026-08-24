# AI Backend Workflow

During the implementation of the backend, the following AI-assisted decisions and steps were taken:

1. **Database Fallback:** The initial plan used MySQL via Docker. Due to Docker daemon unavailability in the testing environment, the architecture was intentionally downgraded to `SQLite`. This ensures the application remains functional and testable for the assessment without external system dependencies. The `Compensation` model was adapted to use `Int` (cents) instead of `Decimal` to comply with the restriction against floating-point money.
2. **Prisma Version:** Downgraded from Prisma 7 to Prisma 5 to maintain compatibility with standard schema configurations, as Prisma 7 introduces breaking changes to connection string management (`prisma.config.ts`).
3. **Tenant Isolation:** Enforced rigorously at the API layer. The `authenticate` middleware extracts `tenantId` from the JWT. All employee and compensation routes explicitly inject `{ tenantId: req.user.tenantId }` into their Prisma `where` clauses.
4. **Testing:** An integration test suite using Supertest and Vitest verifies that a user logged into Tenant A receives a 404/Empty response when attempting to read or modify resources belonging to Tenant B, satisfying the core architectural constraint.
5. **Seeding:** The seed script is configured to insert 10,000 employees. To accommodate SQLite's limits on concurrent connections and batch sizes, insertions are chunked into smaller groups, though massive concurrency in a single transaction can still cause SQLite locks (a tradeoff of leaving MySQL).
