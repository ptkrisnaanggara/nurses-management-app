# nurses-management-app

App for nurse shift scheduling, built **Indonesia-first**. See [`docs/PRD.md`](./docs/PRD.md)
for the product spec (grounded in Indonesian labor & nursing regulations) and
[`docs/TASKS.md`](./docs/TASKS.md) for the task tracker.

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS + TypeORM |
| Frontend | React (Vite) + TanStack Query |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | RabbitMQ |
| Monorepo | pnpm workspaces |

## Layout

```
apps/
  api/      NestJS + TypeORM backend
  web/      React (Vite) frontend
packages/
  shared/   Enums, constants & types shared by api + web
docs/       PRD and task tracker
```

## Getting started

```bash
# 1. Install deps (pnpm 9+, Node 20+)
pnpm install

# 2. Start infra (Postgres, Redis, RabbitMQ)
cp .env.example .env
pnpm infra:up

# 3. Build shared package first, then run apps
pnpm --filter @nurses/shared build
pnpm dev            # runs api + web in parallel
```

- API: http://localhost:3000/api  ·  Swagger: http://localhost:3000/api/docs
- Web: http://localhost:5173
- RabbitMQ management: http://localhost:15672 (guest/guest)

## Database migrations (TypeORM)

```bash
pnpm --filter @nurses/api migration:generate src/database/migrations/Init
pnpm --filter @nurses/api migration:run
```

> Migrations are the source of truth — `synchronize` is **off** by default.

## Architecture notes

The codebase follows a strict **controller → service → repository-port → adapter**
layering (see `apps/api/src/modules/facilities` as the reference module).
Services depend on repository **interfaces** (DI tokens), not on TypeORM, so business
logic is unit-testable without a database (see `facilities.service.spec.ts`). New
domains should copy this shape.
