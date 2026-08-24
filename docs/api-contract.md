# API Contract

## Authentication
### `POST /api/auth/login`
- **Purpose:** Authenticate user and return JWT.
- **Request Body:** `{ "email": "hr@acme.com", "password": "password123" }`
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
- **Response:** `200 OK`, `{ "data": [{ "group": "Engineering", "averageSalary": 120000, "headcount": 150 }, ...] }`

## Error Handling
- `400 Bad Request`: Validation errors (Zod payload).
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Attempting to access cross-tenant data.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Generic fallback.
