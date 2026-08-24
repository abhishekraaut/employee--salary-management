# Product & Architecture Planning Prompt

*This document contains a cleaned version of the core instructions provided to the AI agent during the planning phase.*

---

**Role:** Product Engineer + Software Architect

**Task:** Define the solution BEFORE implementation begins for a take-home engineering assessment.

**Context:**
- Goal: Build employee salary management software for an organization with 10,000 employees.
- Persona: HR Manager.
- Problem: Currently managing salary data using Excel. Needs a web app to manage data and answer compensation questions.
- Constraints: End-to-end, functional, Node/TS backend, React frontend, Relational DB, Seed script with 10k employees.
- Stack: React, Redux Toolkit, RTK Query, Node.js, Express, Prisma, MySQL, Zod.
- Architecture: Modular monolith (no microservices).
- Focus: Code quality, TDD, multi-tenant architecture, observability, performance for 10k records.

**Required Outputs (No implementation code allowed):**
1. `requirements.md` (MVP scope, workflows, out-of-scope).
2. `architecture.md` (Boundaries, multi-tenancy, deployment).
3. `data-model.md` (Entities, preserving salary history).
4. `api-contract.md` (REST endpoints).
5. `testing.md` (Test Pyramid strategy).
6. `observability.md` (Logging, health checks).
7. `performance.md` (Handling 10k rows, pagination).
8. `tradeoffs.md` (Architectural decisions and justifications).
9. `README.md` (Project overview and doc links).
