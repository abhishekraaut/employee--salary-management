# Testing Strategy

## Philosophy
We will follow a practical Test-Driven Development (TDD) approach, focusing on business value and critical logic rather than arbitrary code coverage metrics. The testing strategy is based on the Test Pyramid.

## 1. Unit Tests
- **Focus:** Pure functions, business rules, and validation logic.
- **Tools:** Vitest.
- **Key Areas to Test:**
  - Validation schemas (Zod) ensuring salaries are positive and dates are valid.
  - Compensation calculation logic (e.g., determining "current" salary from a list of historical records).
  - Redux slice reducers and selectors on the frontend.
- **Characteristics:** Fast, deterministic, zero external dependencies.

## 2. Integration / API Tests
- **Focus:** End-to-end backend functionality, database interactions, and tenant isolation.
- **Tools:** Vitest + Supertest + test-container database (MySQL).
- **Key Areas to Test:**
  - **Tenant Isolation (Critical):** Prove that a user from Tenant A cannot:
    - read Tenant B employees
    - read Tenant B compensation
    - modify Tenant B compensation
    - access Tenant B analytics
    - access Tenant B audit records
  - Salary history append logic (verifying `POST` creates a new record and doesn't overwrite).
  - Search and pagination queries handling 10,000 records correctly.
- **Characteristics:** Slower than unit tests, but provide high confidence in API contracts and data persistence.

## 3. End-to-End (E2E) Tests
- **Focus:** Critical user journeys.
- **Tools:** Playwright.
- **Key Areas to Test:**
  - Login flow.
  - Searching for an employee, viewing their profile, and updating their salary successfully.
- **Characteristics:** Minimal in number, testing the deployed system or a fully integrated build.

## Frontend Component Tests
- **Focus:** UI rendering and interaction.
- **Tools:** React Testing Library + Vitest.
- **Key Areas:** Complex components like the Salary History table or Analytics charts.
