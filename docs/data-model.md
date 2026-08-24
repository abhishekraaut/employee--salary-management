# Data Model

## Entities and Relationships

The data model is designed to support multi-tenancy, preserve compensation history, and allow efficient querying for 10,000+ employees.

### 1. Tenant
Represents the organization using the software.
- `id`: UUID (PK)
- `name`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

### 2. User
Represents the HR Manager logging in.
- `id`: UUID (PK)
- `tenantId`: UUID (FK)
- `email`: String (Unique per tenant)
- `passwordHash`: String
- `name`: String

### 3. Employee
Core employee information.
- `id`: UUID (PK)
- `tenantId`: UUID (FK)
- `firstName`: String
- `lastName`: String
- `email`: String (Unique per tenant)
- `department`: String (e.g., Engineering, Sales)
- `country`: String
- `hireDate`: Date
- `isActive`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime

### 4. Compensation
Append-only log of salary changes to preserve history.
- `id`: UUID (PK)
- `tenantId`: UUID (FK)
- `employeeId`: UUID (FK)
- `amount`: Decimal (Precision 10, Scale 2)
- `currency`: String (e.g., USD, EUR)
- `effectiveDate`: Date
- `createdAt`: DateTime
- `createdBy`: UUID (FK to User) - Auditability

## Key Considerations
- **Immutability of Compensation:** To change a salary, a *new* Compensation record is inserted with a future or current `effectiveDate`. Past records are never updated or deleted.
- **Tenant Isolation:** Every primary entity has a `tenantId`. Indexes will prefix `tenantId` to ensure fast tenant-scoped queries.
- **Money Representation:** Salaries use `Decimal` types to avoid floating-point inaccuracies.
- **Indexes:** 
  - `Employee`: `(tenantId, lastName, firstName)`, `(tenantId, department)`
  - `Compensation`: `(tenantId, employeeId, effectiveDate DESC)`
