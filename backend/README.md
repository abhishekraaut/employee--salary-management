# ACME HR Backend

## Installation
```bash
npm install
```

## Environment
Copy `.env.example` to `.env` and set `DATABASE_URL` and a random `JWT_SECRET` of at least 32 characters. `PORT`, `NODE_ENV`, `JWT_EXPIRES_IN`, `LOG_LEVEL`, and `CORS_ORIGINS` have development defaults. Set `CORS_ORIGINS` to a comma-separated allowlist of trusted frontend origins in deployed environments.

## Prisma
```bash
npx prisma generate
npx prisma migrate deploy
```
Use `npx prisma migrate dev --name <name>` only for new development migrations. Existing migrations are retained.

The tenant-integrity migration makes login emails globally unique and adds composite foreign keys so related records cannot cross tenant boundaries.

## Development and production
```bash
nodemon .
npm run build
npm start
```

## API
- `POST /api/auth/login`
- `GET /api/employees` and `GET /api/employees/:id`
- `GET/POST /api/employees/:id/compensations`
- `GET /api/analytics/compensation-summary`
- `GET /health/live` and `GET /health/ready`

The seeded ACME demo account is `abhishek.hr@abhitech.com` with password `abhi@123`. Running `npm run seed` recreates the demo data and replaces existing rows.
