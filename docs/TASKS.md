# Project Tasks & Progress Tracker
## Nurse Shift Management App — Indonesia

> Living document. Update the **Status** and check boxes as work progresses.
> Companion to [`PRD.md`](./PRD.md). Last updated: 2026-06-16.

**Legend:** ⬜ Not started · 🟡 In progress · ✅ Done · 🔵 Blocked · ⏭️ Deferred

---

## 1. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | **NestJS** (TypeScript) | Modular monolith, REST + (optional) WebSocket gateway |
| Frontend | **React** (TypeScript, Vite) | SPA, mobile-first for nurses |
| Database | **PostgreSQL** | Primary store; Prisma or TypeORM as ORM (decision below) |
| Cache | **Redis** | Sessions, rule-set cache, rate limiting, locks |
| Queue | **RabbitMQ** | Async jobs: roster generation, notifications, reports |
| Auth | JWT (access + refresh) | Role-based access control (RBAC) |
| Infra | Docker Compose (dev), CI via GitHub Actions | |

### Architectural decisions
- [x] **ORM choice:** **TypeORM** (NestJS-native, `@nestjs/typeorm`). ✅ decided
- [x] **Monorepo tool:** **pnpm workspaces**. ✅ decided
- [ ] **Roster generation engine:** in-process solver vs dedicated worker (RabbitMQ consumer). *Recommendation: worker, it's CPU-heavy.*

---

## 2. Engineering Principles (Definition of "code very SOLID")

### SOLID applied
- **S — Single Responsibility:** thin controllers (HTTP only) → services (business logic) → repositories (data). Rule evaluation, scheduling, and notifications are separate services/modules.
- **O — Open/Closed:** the rule engine evaluates rules via a `RuleEvaluator` interface; new rule types are added as new strategy classes, not by editing a switch.
- **L — Liskov:** every `RuleEvaluator` / `NotificationChannel` / `StaffingMethod` implementation is fully substitutable behind its interface.
- **I — Interface Segregation:** narrow ports (`RosterRepository`, `LeaveRepository`) rather than one fat data service.
- **D — Dependency Inversion:** services depend on abstract tokens (interfaces) injected via NestJS DI; concrete adapters (Prisma, Redis, RabbitMQ) are bound in modules.

### NestJS best practices
- [ ] Feature modules per domain (`auth`, `facilities`, `nurses`, `rules`, `rosters`, `leave`, `notifications`, `reports`).
- [ ] DTOs + `class-validator` / `class-transformer`; global `ValidationPipe` (whitelist + transform).
- [ ] Config via `@nestjs/config` with schema validation (Joi/zod); no `process.env` scattered.
- [ ] Global exception filter + standardized error response shape.
- [ ] Interceptors for logging, response shaping, timeouts; Guards for auth/RBAC.
- [ ] Repository pattern decoupling domain from ORM; domain entities ≠ persistence models.
- [ ] Async work via `@nestjs/bullmq` or `@golevelup/nestjs-rabbitmq`; idempotent consumers.
- [ ] OpenAPI/Swagger auto-generated from DTOs.
- [ ] Testing: unit (Jest) for services/rule engine, e2e (Supertest) for endpoints.

### React best practices
- [ ] Feature-folder structure; colocate components, hooks, tests.
- [ ] **TanStack Query** for server state; local UI state via hooks/context (or Zustand) — no Redux unless needed.
- [ ] Typed API client generated from backend OpenAPI.
- [ ] Component composition over inheritance; small, single-purpose components.
- [ ] Form handling via React Hook Form + zod resolver (schema shared with backend where possible).
- [ ] Accessibility (WCAG), i18n (Bahasa Indonesia default, `react-i18next`).
- [ ] Error boundaries, suspense/loading states, optimistic updates for swaps.
- [ ] Testing: Vitest + React Testing Library; Playwright for e2e critical flows.

---

## 3. Task Breakdown

### EPIC 0 — Project Setup & Foundations
| # | Task | Status |
|---|---|---|
| 0.1 | Init monorepo (pnpm workspaces): `apps/api`, `apps/web`, `packages/shared` | ✅ |
| 0.2 | Docker Compose: Postgres, Redis, RabbitMQ for local dev | ✅ |
| 0.3 | NestJS app scaffold + config module + validation pipe + Swagger | ✅ |
| 0.4 | React (Vite + TS) scaffold + routing + i18n + API client setup | ✅ |
| 0.5 | ORM setup (**TypeORM**) + migration workflow + seed scripts | 🟡 (data-source, migration scripts, admin seed done; migration files generated once a DB is available) |
| 0.6 | Shared package: enums/constants reused FE+BE | ✅ |
| 0.7 | CI (GitHub Actions): typecheck, test, build for api + web | ⬜ (removed — no Actions runner in current env; re-add when runners available. Verify locally via `pnpm build && pnpm typecheck && pnpm test`) |
| 0.8 | ESLint + Prettier + Husky pre-commit + commitlint | ⬜ |
| 0.9 | Logging (pino), health checks (`@nestjs/terminus`), error filter | ✅ |

### EPIC 1 — Auth & RBAC
| # | Task | Status |
|---|---|---|
| 1.1 | User entity, password hashing (argon2), login/refresh (JWT, rotation) | ✅ |
| 1.2 | Roles: Admin, Nursing Manager, Head Nurse, Staff Nurse, HRD | ✅ |
| 1.3 | RBAC guards + decorators (`@Roles`, `@Public`, `@CurrentUser`), global guards | ✅ |
| 1.4 | Redis-backed refresh-token store + rotation/revocation | ✅ |
| 1.5 | React auth flow: login, token refresh interceptor, protected routes | ✅ |

### EPIC 2 — Facility, Ward & Shift Configuration
| # | Task | Status |
|---|---|---|
| 2.1 | Facility CRUD (work-week scheme 6/5-day, time zone WIB/WITA/WIT) | ⬜ |
| 2.2 | Ward/unit CRUD (type: ICU/IGD/rawat inap, staffing demand config) | ⬜ |
| 2.3 | Shift definitions (Pagi/Siang/Malam, custom hours, breaks) | ⬜ |
| 2.4 | Holiday calendar import (SKB 3 Menteri / cuti bersama yearly) | ⬜ |
| 2.5 | Admin UI for the above | ⬜ |

### EPIC 3 — Nurse Profiles & Credentials
| # | Task | Status |
|---|---|---|
| 3.1 | Nurse entity: employment class (PNS/kontrak), role, gender, DOB, contract hours | ⬜ |
| 3.2 | Credentials: STR (lifetime), SIP per workplace + expiry, SKP balance, **PK level I–V** | ⬜ |
| 3.3 | Privacy-controlled health flags (pregnancy/lactation) — restricted access | ⬜ |
| 3.4 | Leave balances per type per employment class | ⬜ |
| 3.5 | Compliance alerts (SIP expiry, SKP shortfall) — queued reminders | ⬜ |
| 3.6 | Nurse profile UI (manager view + self view) | ⬜ |

### EPIC 4 — Flexible Rule Engine ⭐ (core differentiator)
| # | Task | Status |
|---|---|---|
| 4.1 | `Rule` model (scope, type HARD/SOFT, weight, params, legalRef, effective dates, overridable) | ✅ |
| 4.2 | Scope-precedence resolver (Individual→Role→Class→Ward→Facility→Global) + locked legal floors | ✅ |
| 4.3 | `RuleEvaluator` strategy interface + evaluators (max-hours, min-rest, malam-lalu-pagi, max-consecutive-nights, under-18 night, pregnant night) | 🟡 (6 evaluators; overtime/competency/staffing/leave/fairness SOFT rules remain) |
| 4.4 | Versioned **rule profiles** (Indonesia RS Umum seeded; Puskesmas/ASN/Kontrak remain) | 🟡 |
| 4.5 | Rule cache in Redis (invalidate on edit) | ✅ |
| 4.6 | Rule admin UI (edit params, enable/disable, view legal reference) | ⬜ |
| 4.7 | Unit tests covering statutory rules from PRD §3 | ✅ (engine + resolver, 8 tests) |

### EPIC 5 — Roster Generation & Editing
| # | Task | Status |
|---|---|---|
| 5.1 | Roster domain model (period, assignments nurse×date×shift) | ⬜ |
| 5.2 | Staffing-demand calculators (Douglas per-shift, Gillies, Depkes, WISN) | ⬜ |
| 5.3 | **Solver**: satisfy HARD constraints, optimize weighted SOFT (CSP/heuristic) | ⬜ |
| 5.4 | Run generation as RabbitMQ job; progress via WebSocket/polling | ⬜ |
| 5.5 | Live validation API for manual edits (returns violations + legal refs) | ⬜ |
| 5.6 | What-if simulation (sick call / swap ripple) | ⬜ |
| 5.7 | Publish + lock + audit trail | ⬜ |
| 5.8 | Roster grid UI (generate, edit, validation badges, publish) | ⬜ |

### EPIC 6 — Self-Service (Leave, Swap, Schedule View)
| # | Task | Status |
|---|---|---|
| 6.1 | Leave/izin request + approval workflow (balance & rule checks) | ⬜ |
| 6.2 | **Tukar shift** (swap) request — validate both nurses pass HARD rules | ⬜ |
| 6.3 | Women's protections: menstrual/maternity/miscarriage/lactation leave types | ⬜ |
| 6.4 | Personal & ward schedule views (calendar + list), mobile-first | ⬜ |
| 6.5 | Notifications (push/WhatsApp/email) via queue — channel configurable | ⬜ |

### EPIC 7 — Compliance & Fairness
| # | Task | Status |
|---|---|---|
| 7.1 | Pre-publish compliance report (all violations + severity + legal ref) | ⬜ |
| 7.2 | Women's night-work flags (antar-jemput transport, meal, under-18/pregnancy block) | ⬜ |
| 7.3 | Fairness dashboard (per-nurse nights/weekends/holidays/hours, inequality metric) | ⬜ |
| 7.4 | Fatigue checks (consecutive nights, malam-lalu-pagi, 11h rest gap) | ⬜ |

### EPIC 8 — Reporting & Exports
| # | Task | Status |
|---|---|---|
| 8.1 | Overtime report w/ PP 35/2021 multiplier breakdown (queued generation) | ⬜ |
| 8.2 | Holiday/rest-day duty report (holiday-rate flags) | ⬜ |
| 8.3 | WISN/workload & staffing-gap reports | ⬜ |
| 8.4 | Exports CSV/Excel/PDF + payroll/HRIS API | ⬜ |
| 8.5 | Immutable audit log viewer | ⬜ |

### EPIC 9 — Non-Functional & Hardening
| # | Task | Status |
|---|---|---|
| 9.1 | i18n complete (Bahasa Indonesia default) | ⬜ |
| 9.2 | UU PDP 27/2022 compliance (PII access controls, retention) | ⬜ |
| 9.3 | Rate limiting (Redis), security headers, input sanitization | ⬜ |
| 9.4 | Observability (metrics, tracing), backups, runbook | ⬜ |
| 9.5 | Load test roster generation (<30s for 30 nurses × 30 days) | ⬜ |
| 9.6 | E2E test suite (Playwright) for critical flows | ⬜ |

---

## 4. Phase Mapping (from PRD §9)

| Phase | Epics | Goal |
|---|---|---|
| **Phase 1 — MVP** | 0, 1, 2, 3, 4, 5 (manual+validation), 6.1/6.4 | Compliant manual rostering |
| **Phase 2 — Automation & Fairness** | 5.3 (solver), 6.2/6.5, 7, 8.1/8.2 | Auto-generation, fairness, swaps, reports |
| **Phase 3 — Intelligence & Scale** | 5.2 (full calculators), 8.3, multi-site, integrations, 9.x | WISN, forecasting, SATUSEHAT/HRIS |

---

## 5. Progress Summary

| Epic | Done / Total | Status |
|---|---|---|
| 0 — Setup | 6 / 9 | 🟡 |
| 1 — Auth & RBAC | 5 / 5 | ✅ |
| 2 — Facility/Ward/Shift | 0 / 5 | ⬜ |
| 3 — Nurses & Credentials | 0 / 6 | ⬜ |
| 4 — Rule Engine ⭐ | 4 / 7 | 🟡 |
| 5 — Roster Generation | 0 / 8 | ⬜ |
| 6 — Self-Service | 0 / 5 | ⬜ |
| 7 — Compliance & Fairness | 0 / 4 | ⬜ |
| 8 — Reporting | 0 / 5 | ⬜ |
| 9 — Non-Functional | 0 / 6 | ⬜ |
| **Total** | **15 / 60** | 🟡 |

---

## 6. Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-06-16 | Stack: NestJS + React + Postgres + Redis + RabbitMQ | Per product direction |
| 2026-06-17 | ORM: **TypeORM** | User decision |
| 2026-06-17 | Monorepo: **pnpm workspaces** | User decision |

## 7. Open Questions (carried from PRD §10)
1. SIP workplace cap under PP 28/2024 (still 2?) — verify before hard-coding.
2. KIA maternity 6-month wage tiers + implementing PP.
3. Target facilities PNS-heavy / private / mixed?
4. Notification channel (WhatsApp provider?).
5. Default staffing method per facility (Douglas/Gillies/WISN).
6. KARS accreditation edition (SNARS Ed.1 vs STARKES 2022).
