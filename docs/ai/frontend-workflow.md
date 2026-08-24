# AI Frontend Workflow Decisions

## Component Architecture
- Standardized on a feature-slice architecture for grouping RTK Query APIs, Redux slices, and components by business domain (auth, employees, dashboard, compensation, analytics, audit).
- Kept UI components lightweight, relying heavily on Tailwind CSS `@tailwindcss/vite` v4 integration.

## State Management Strategy
- Enforced strict boundaries: Redux Toolkit (auth, UI) for purely global client states.
- RTK Query handling exclusively server state (employees, audit logs, analytics) with `providesTags` and `invalidatesTags` used for cache reconciliation after compensation updates.
- React local state is used safely for Modal and Form visibility, minimizing global store noise.

## Accessibility (a11y)
- Implemented accessible semantic HTML in standard tables for Employee Directory and Analytics.
- Added ARIA `role="dialog"` and `aria-modal="true"` to the Compensation form modal.
- Ensured form elements are implicitly and explicitly labeled.

## Backend Modifications
- Added the missing `GET /api/audit` endpoint to properly hydrate the Audit Log feature requested by the Product team, exposing isolated audit records bridging actor, target, and before/after metrics.

## E2E Testing
- Defined a Playwright setup for validating the HR Manager's core flow from authentication down to salary mutation observation.

## API Architecture Migration
- Centralized Axios instance created in src/shared/api/axios.ts to own all HTTP transport concerns.
- RTK Query etchBaseQuery replaced with custom xiosBaseQuery to maintain server-state layer using Axios.
- Interceptors handle 401 normalization and token injection (via store injection).
- Feature APIs decoupled from transport implementations by using piSlice.injectEndpoints.