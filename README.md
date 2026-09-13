# ACME HR Salary Management System (Assignment Submission)

## ?? Project Overview
This project is a web-based **Salary Management Application** designed for HR Managers at large-scale organizations. It enables them to manage employee data, update salaries securely, track comprehensive compensation histories, and view organizational analytics for a workforce of **10,000 employees**.

This repository is submitted as part of the Software Craftsperson assignment.

---

## ? Key Features & Requirements Met

1. **HR Manager Persona & Multi-Tenancy**
   - Secure login for HR Managers using JWT-based authentication.
   - Strict **multi-tenant isolation** implemented at the database query level (Prisma). HR Managers can only view and modify data belonging to their own organization.

2. **10,000 Employee Directory**
   - Deterministic and realistic seed script generates exactly 10,000 employees (majority India-focused).
   - High-performance, database-level **pagination, sorting, and filtering** (by name, department, and country).
   - Custom React UI component with scalable pagination controls (`Previous 1 2 3 ... Next Last`).

3. **Compensation & Salary Management**
   - Salaries are **appended, not overwritten**. Every compensation change is tracked historically with an effective date.
   - Strict domain invariant: A unique constraint prevents two compensation records for the same employee on the same effective date.
   - Preserves exact local currencies (e.g., INR, USD, GBP, AED) per employee without data loss.

4. **Currency-Aware Analytics & Dashboard**
   - The dashboard and analytics pages present aggregated views (e.g., Total Payroll, Average Salary).
   - **Centralized Currency Conversion:** Using deterministic exchange rates within raw SQL queries (`CASE WHEN currency = 'USD' THEN amount * 83`), all financial aggregates are cleanly normalized and displayed in **INR (?)** on the dashboard.

5. **Comprehensive Audit Trail**
   - Dedicated Audit Log tracks "who did what and when".
   - **Currency Integrity:** The audit records explicitly preserve and display both the *previous* currency/amount and the *new* currency/amount, guaranteeing zero loss of historical context during cross-currency salary updates.

6. **Refined UI/UX**
   - Fully functional **Dark Mode** integrated globally via Tailwind CSS variable mapping.
   - Responsive design with clear actions (Eye icon for details), status badges, and localized currency formatting (`en-IN`).

---

## ??? Architecture

The backend follows a **Modular Monolith** architecture with strict boundary enforcement, preventing business logic leakage and ensuring testability.

### Tech Stack
- **Backend:** Node.js, Express, TypeScript
- **Database:** MySQL via Prisma ORM
- **Frontend:** React, TypeScript, RTK Query, Tailwind CSS, Vite
- **Testing:** Vitest, Supertest
- **Observability:** Pino structured logging

### Module Flow
`Route -> Controller -> Service -> Repository -> Prisma -> MySQL`

Domains are strictly separated into:
- `Auth`
- `Employees`
- `Compensation`
- `Analytics`
- `Audit`

---

## ?? Setup & Execution Instructions

### 1. Prerequisites
- Node.js (v18+)
- Docker and Docker Compose (for MySQL)

### 2. Environment Configuration
Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```
*(Ensure `DATABASE_URL` is set to `mysql://root:rootpassword@127.0.0.1:3306/acme_hr`)*

### 3. Start Database
```bash
docker compose up -d
```
*Wait a few seconds for MySQL to initialize.*

### 4. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 5. Migrate & Seed the Database
```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```
*(The seed script generates 2 HR Managers and exactly 10,000 employees).*

### 6. Run the Application
You can run the backend and frontend concurrently:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### 7. Test Credentials
Once the application is running (frontend usually on `http://localhost:5173`), use these seeded accounts:

**Company 1 (India Focus):**
- **Email:** `abhishek.hr@abhitech.com`
- **Password:** `abhi@123`

**Company 2 (Global Focus):**
- **Email:** `hr@globex.com`
- **Password:** `abhi@123`

---

## ?? Testing & Validation

The application features a robust testing suite verifying isolation, calculations, and domain constraints.

To run the backend test suite:
```bash
cd backend
npm test
```

To run the frontend test suite:
```bash
cd frontend
npm test
```

*Both suites currently pass 100%.*
