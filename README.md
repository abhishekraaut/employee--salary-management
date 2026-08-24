# ACME HR Salary Management System

## Project Overview
This project is a web-based salary management application designed for HR Managers at ACME organization. It allows them to manage employee data, update salaries, track compensation history, and view organizational analytics for up to 10,000 employees.

## Backend Architecture
- **Language/Framework:** Node.js, Express, TypeScript
- **Database:** MySQL via Prisma ORM
- **Key Modules:** Authentication, Employees, Compensation, Analytics
- **Validation:** Zod schemas
- **Observability:** Pino structured logging, request IDs

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Docker and Docker Compose

### 2. Environment Configuration
Create a `.env` file in the `backend` directory based on `.env.example`.
```bash
cd backend
cp .env.example .env
```
*(Ensure `DATABASE_URL` is set to `mysql://root:rootpassword@127.0.0.1:3307/acme_hr` for local dev)*

### 3. Start Database
```bash
docker compose up -d
```
*Wait a few seconds for MySQL to initialize.*

### 4. Install Dependencies & Migrate
```bash
npm install
npx prisma migrate dev --name init
```

### 5. Seed the Database
```bash
npm run seed
```
*This deterministically inserts exactly 10,000 employees distributed across two logical tenants (ACME and Globex).*

### 6. Run Tests
```bash
npm test
```
*Executes the Vitest suite (including integration tests running directly against the MySQL instance, verifying strict tenant isolation).*

### 7. Code Quality
```bash
npm run typecheck
npx eslint src
```

### 8. Start the Server
```bash
npm start
```
*Check `/health/live` and `/health/ready` for service state.*

## Architecture Decisions & Constraints
- **Logical Multi-Tenancy:** The application enforces strict row-level isolation via the `tenantId` extracted exclusively from the JWT session.
- **Append-only History:** Compensation updates create atomic pairs of `Compensation` and `AuditLog` records without ever overwriting historical salary data.
- **Analytics Performance:** Aggregations (e.g., headcount, average salary) run fully within MySQL via `queryRawUnsafe` window functions.
- **Monetary Precision:** The `Compensation.amount` field utilizes a robust `Decimal(10, 2)` column in MySQL.

## Documentation
- [Requirements Document](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [API Contract](docs/api-contract.md)
- [Testing Strategy](docs/testing.md)
- [Observability](docs/observability.md)
- [Performance](docs/performance.md)
- [Trade-offs & Decisions](docs/tradeoffs.md)
- [AI Development Context](docs/ai/backend-workflow.md)
