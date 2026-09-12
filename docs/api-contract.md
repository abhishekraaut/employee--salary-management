# API Contract

## Authentication
### `POST /api/auth/login`
- **Purpose:** Authenticate user and return JWT.
- **Request Body:** `{ "email": "abhishek.hr@abhitech.com", "password": "abhi@123" }`
- **Response:** `200 OK`, `{ "token": "jwt...", "user": { "id": "...", "name": "..." } }`

## Employees
### `GET /api/employees`
- **Purpose:** Fetch paginated list of employees with current salary.
- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 50)
  - `search` (optional)
  - `department` (optional)
  - `country` (optional)
  - `sortBy` (optional, enum: 'firstName' | 'lastName' | 'hireDate' | 'createdAt', default: 'createdAt')
  - `sortOrder` (optional, enum: 'asc' | 'desc', default: 'desc')
- **Response:** `200 OK`, `{ "data": [{ "id": "...", "firstName": "...", "currentSalary": 100000, ... }], "meta": { "total": 10000, "page": 1, "totalPages": 200 } }`

### `GET /api/employees/:id`
- **Purpose:** Fetch detailed employee profile.
- **Response:** `200 OK`, `{ "id": "...", "firstName": "...", "department": "...", "country": "..." }`

## Compensation
### `GET /api/employees/:id/compensations`
- **Purpose:** Fetch salary history for an employee, sorted by effective date descending.
- **Response:** `200 OK`, `{ "data": [{ "id": "...", "amount": 100000, "effectiveDate": "2023-01-01", "currency": "USD" }, ...] }`

### `POST /api/employees/:id/compensations`
- **Purpose:** Add a new salary record (pay rise, adjustment).
- **Request Body:** `{ "amount": 110000, "currency": "USD", "effectiveDate": "2024-01-01" }`
- **Response:** `201 Created`, `{ "id": "...", "amount": 110000, ... }`

## Analytics
### `GET /api/analytics/compensation-summary`
- **Purpose:** Fetch aggregated salary data by department and country.
- **Query Params:** `groupBy` (enum: 'department' | 'country')
- **Response:** `200 OK`, `{ "data": [{ "group": "Engineering", "averageSalary": 120000, "totalPayroll": 18000000, "headcount": 150, "currency": "USD" }, ...] }`

## Error Handling
- `400 Bad Request`: Validation errors (Zod payload).
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Reserved for authenticated operations that are explicitly forbidden.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Generic fallback.

Cross-tenant employee requests intentionally return `404 Not Found` rather than `403 Forbidden` so the API does not reveal whether a resource exists in another tenant. Current salary is the latest compensation whose `effectiveDate` is not in the future; ties are resolved by creation time.
