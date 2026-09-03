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
*(Ensure `DATABASE_URL` is set to `mysql://root:rootpassword@127.0.0.1:3306/acme_hr` for local dev)*

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

### 6. Run Tests
```bash
npm test
```

### 7. Start the Server
```bash
npm run dev
```
*Check `/health/live` and `/health/ready` for service state.*

## Documentation
- Backend-specific setup: [backend/README.md](backend/README.md)
- Architecture: [docs/architecture.md](docs/architecture.md)
- API contract: [docs/api-contract.md](docs/api-contract.md)
