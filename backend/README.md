# ACME HR Backend

## Installation
```bash
npm install
```

## Environment
Copy `.env.example` to `.env` and set `DATABASE_URL` and a random `JWT_SECRET` of at least 32 characters. `PORT`, `NODE_ENV`, `JWT_EXPIRES_IN`, and `LOG_LEVEL` have development defaults.

## Prisma
```bash
npx prisma generate
npx prisma migrate deploy
```
Use `npx prisma migrate dev --name <name>` only for new development migrations. Existing migrations are retained.

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
