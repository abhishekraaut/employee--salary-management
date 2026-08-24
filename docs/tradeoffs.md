# Architecture Trade-offs

## 1. Modular Monolith vs. Microservices
- **Decision:** Modular Monolith.
- **Reasoning:** For an MVP built by a small team, microservices introduce severe operational complexity (network latency, distributed transactions, deployment overhead) without tangible benefits. A modular monolith enforces logical boundaries while keeping the deployment simple and execution deterministic.

## 2. Prisma ORM vs. Raw SQL / Query Builders
- **Decision:** Prisma.
- **Reasoning:** Prisma provides excellent end-to-end type safety with TypeScript and rapid schema migrations. The tradeoff is slightly less control over complex SQL queries. Given the schema simplicity, Prisma's developer experience outweighs the need for raw SQL optimization at this stage.

## 3. Redux Toolkit + RTK Query vs. React Query / Context
- **Decision:** Redux Toolkit + RTK Query.
- **Reasoning:** RTK Query provides excellent out-of-the-box caching, pagination handling, and request deduplication. While React Query is also excellent, RTK provides a unified architecture for both server state and complex client state if the application grows.

## 4. Relational (MySQL) vs. NoSQL (MongoDB)
- **Decision:** MySQL.
- **Reasoning:** Financial and HR data is inherently relational and structured. Preserving compensation history, enforcing foreign keys, and running aggregate analytics queries are significantly easier and safer in a relational database.

## 5. Logical vs. Physical Multi-Tenancy
- **Decision:** Genuine Logical Multi-Tenancy (Row-level `tenantId` in a shared MySQL database).
- **Reasoning:** Physical multi-tenancy (database-per-tenant or schema-per-tenant) introduces unnecessary infrastructure complexity and deployment overhead for an MVP. Row-level tenancy is standard for early SaaS products. By strictly deriving the `tenantId` from the authenticated session and enforcing it on every query, we achieve robust data isolation without the cost and complexity of microservices, Kubernetes, or advanced distributed infrastructure.
- **Testing Mitigations:** To mitigate the primary risk of logical multi-tenancy (data leakage), explicit integration tests will be implemented to prove that cross-tenant access is strictly prohibited across all data models (employees, compensation, analytics, and audit records).
