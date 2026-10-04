# Auto Nunes Martins · Painel Interno

> **Website público: publicação pendente.** Consultar a [checklist de publicação](docs/publication-readiness.md) antes de avaliar prontidão. Os dados legais/contactos ainda incluem placeholders e demonstrações. Verificação manual: `node scripts/check-publication-readiness.mjs`.

Internal admin web app for a Portuguese used-car dealership. Phase 1 — single role
(ADMIN), pt-PT locale, EUR currency.

## What's in Phase 1

| Module | What it does |
| --- | --- |
| **M0 · Scaffolding + Login + Shell** | Yarn 4 workspaces, Prisma schema on Supabase Postgres, Clerk auth (with auto-provisioning on first sign-in), Tailwind v4 token system, brand DNA primitives, custom Clerk-styled login page, sidebar + topbar app shell |
| **M1 · Viaturas** | CRUD with filters/pagination/sort, signed photo upload (Supabase Storage, 20×5 MB JPEG/PNG/WEBP), per-vehicle expense tracker with inline edit, **margin-scheme VAT (23/123) profit card**, PDF + CSV export, SOLD-state confirmation flow on expense edits |
| **M2 · Clientes** | CRUD with digit-only NIF + phone, linked-vehicles list via Sale relation, PDF + CSV export |
| **M3 · Sales** | Transactional create from Vehicle detail (flips status, sets soldDate, computes figures, emits ActivityLog), customer picker with live search, **live margin-VAT preview** during entry, read-only sale detail with delivery management |
| **M4 · Tarefas** | Kanban (svelte-dnd-action) with optimistic UI, **assignee-only visibility** + "Geral" shared inbox option, recurring task spawning (MONTHLY/ANNUAL with date-fns clamp math), **automatic Sunday wipe of DONE tasks** (opportunistic, throttled), PDF + CSV export |
| **M5 · Dashboard** | Single `/api/dashboard` endpoint runs 7 parallel aggregates: KPIs with deltas + 6-month sparklines, 12-month sales chart (custom SVG), best sellers, stock-aged table with thumbnails, today's tasks, recent activity feed, smart alerts banner. Streamed SSR. |
| **M6 · Financeiro** | Tabs: Despesas Operacionais (CRUD with inline edit, category + date filters) + Lucro por Viatura (sortable table with totals row). PDF + CSV exports on both. |
| **M7 · Guia de Fluxo** | Static onboarding page: 4 stage cards (Financiamento / IMT / Registo / Documentação) with red chevrons, mapped to `Vehicle.pendingDocFlags` |
| **M8 · Definições** | Theme toggle, Clerk `<UserProfile />` (account/password/2FA), admin-editable `AppSetting` form for the stock-aging threshold |
| **M9 · Polish + deploy** | Branded 404/500 error pages, Docker + Fly.io config, Vercel config, deployment guide (this README) |

## Stack

- **Frontend**: SvelteKit 2 + Svelte 5 (runes) + TypeScript strict + Tailwind v4 + Clerk (svelte-clerk) + Superforms + Zod + pdf-lib + svelte-dnd-action
- **Backend**: Express 4 + TypeScript strict + Prisma 5 + Supabase Postgres + Supabase Storage + Clerk JWT verify + Svix webhooks + pino
- **Shared** (`@anm/types`): Zod schemas + TS types
- **Tooling**: Yarn 4 workspaces, ESLint flat config, Prettier, Vitest, Playwright

## Repo layout

```
auto-nunes-martins/
├── backend/
│   ├── Dockerfile           # multi-stage build for Fly.io
│   ├── fly.toml             # Fly.io deployment config
│   ├── prisma/              # schema + migrations + seed
│   └── src/
│       ├── lib/data/        # repositories (Prisma)
│       ├── lib/domain/      # business logic + unit tests (VAT, recurrence, NIF, Sunday math)
│       ├── lib/server/      # service layer (transactions + ActivityLog emission)
│       ├── middleware/      # Clerk JWT + auto-provision
│       └── routes/          # Express routers
├── apps/crm/
│   ├── vercel.json          # Vercel deployment config
│   └── src/
│       ├── lib/components/  # brand/ + common/ + per-feature folders
│       ├── lib/server/      # api.ts + per-resource typed clients
│       ├── lib/utils/       # pt-PT formatters
│       ├── lib/stores/      # theme
│       └── routes/
│           ├── +page.svelte # login (Clerk SignIn, custom styled)
│           └── (app)/       # authenticated route group with sidebar+topbar
├── apps/website/            # independent public SvelteKit app, no Clerk
│   ├── static/              # public assets + pre-paint startup
│   └── src/                 # stand routes (including Orbit references), public API client
├── scripts/                 # independent deployment change detection
└── shared/types/            # zod schemas + ts types
```

---

## Local development

### Prerequisites

- **Node.js ≥ 20**
- **Yarn 4** via Corepack (the `packageManager` field handles versioning)
- **Git**
- **Supabase** project (free tier works)
- **Clerk** application (free tier works)
- **cloudflared** (or ngrok) for local Clerk webhook testing (optional — auto-provision works without it)

### One-time setup

```pwsh
# 1) Install deps
yarn install

# 2) Provision Supabase + Clerk (see "Production deploy" below for what each key is for)
Copy-Item backend\.env.example backend\.env
Copy-Item apps\crm\.env.example apps\crm\.env
Copy-Item apps\website\.env.example apps\website\.env
# Edit the configuration for each app; never copy CRM secrets to the website.

# 3) Run the first migration + seed
yarn workspace @anm/backend prisma:migrate     # type "init" when prompted
yarn workspace @anm/backend prisma:seed

# 4) Create the Supabase Storage bucket programmatically
yarn workspace @anm/backend supabase:bucket

# 5) Start dev
yarn dev   # website → :5173, CRM → :5174, backend → :4000
```

### Day-to-day commands

| Command | Description |
|---|---|
| `yarn dev` | Start website, CRM and backend in parallel |
| `yarn dev:website` | Public website on port 5173 |
| `yarn dev:crm` | CRM on port 5174 |
| `yarn typecheck` | Type-check all workspaces |
| `yarn lint` | Lint all workspaces |
| `yarn test` | Vitest suites in all workspaces |
| `yarn build` | Production build of both apps |
| `yarn workspace @anm/backend prisma:studio` | Open Prisma Studio against the DB |
| `yarn workspace @anm/backend check:env` | Diagnose backend env-var setup |
| `yarn workspace @anm/backend supabase:bucket` | Create the Storage bucket (idempotent) |
| `yarn workspace @anm/crm test:e2e` | CRM Playwright command (requires configured tests) |
| `node --test scripts/deployment-scope.test.mjs` | Independent deployment scope tests |

---

## Production deploy

The website, CRM and backend deploy independently. Database + storage live on Supabase. See [application deployment guide](docs/application-deployment.md).

### 1. Supabase (production data)

1. Create a new project (free tier OK; upgrade to enable daily backups when ready)
2. **Project Settings → API Keys**: copy
   - `Project URL` → `SUPABASE_URL`
   - `secret key` (`sb_secret_...`) → `SUPABASE_SECRET_KEY`
3. **Settings → Database → Connection string**: copy
   - Pooled (port 6543) → `DATABASE_URL`
   - Direct (port 5432) → `DIRECT_URL`
4. **Storage → New bucket** → `vehicle-photos` → **Private** (or just run the bucket script)

### 2. Backend on Fly.io

```bash
# from repo root, first time:
flyctl auth login
flyctl launch --copy-config --no-deploy --config backend/fly.toml --dockerfile backend/Dockerfile

# set secrets (one per line, repeat for each):
flyctl secrets set -a auto-nunes-martins-api \
  DATABASE_URL='postgresql://...' \
  DIRECT_URL='postgresql://...' \
  CLERK_PUBLISHABLE_KEY='pk_live_...' \
  CLERK_SECRET_KEY='sk_live_...' \
  CLERK_WEBHOOK_SECRET='whsec_...' \
  SUPABASE_URL='https://....supabase.co' \
  SUPABASE_SECRET_KEY='sb_secret_...' \
  SUPABASE_STORAGE_BUCKET='vehicle-photos' \
  FRONTEND_ORIGIN='https://your-app.vercel.app'

flyctl deploy --config backend/fly.toml --dockerfile backend/Dockerfile
```

The Dockerfile's `CMD` runs `prisma migrate deploy` before booting so each
deploy is zero-touch with respect to schema changes.

The `fly.toml` config:
- Madrid region (`mad`) — closest to Portugal
- Auto-stops idle machines (`min_machines_running = 0`) — cold-start tolerated for admin tooling
- `/health` HTTP check every 30s
- `512mb` / 1 shared CPU — plenty for low-traffic admin app

> **Windows local-build note**: the Vercel-adapted app builds on Windows
> fails on a symlink the `adapter-vercel` creates (`EPERM: symlink ...catchall.func`).
> Either enable Windows Developer Mode (Settings → Privacy & security →
> For developers) or skip the local production build — Vercel's Linux build
> environment doesn't have this restriction. `yarn dev` is unaffected.

### 3. CRM and website on Vercel

1. Connect the GitHub repo at <https://vercel.com/new>
2. Create two projects, rooted at **`apps/crm`** and **`apps/website`**. Include files outside each root for workspace dependencies and deployment scripts.
3. Vercel auto-detects SvelteKit. Each application's `vercel.json` declares:
   - `cdg1` (Paris) region — closest to Lisbon
   - Custom install/build that respects Yarn 4 workspaces
4. Add env vars to the **CRM project** only:
   - `PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...`
   - `CLERK_SECRET_KEY` = `sk_live_...`
   - `PUBLIC_BACKEND_URL` = `https://auto-nunes-martins-api.fly.dev`
   - `PUBLIC_WEBSITE_URL` = the public website origin
5. The **website project** needs only `PUBLIC_BACKEND_URL`. Do not add Clerk keys or storage/database secrets.
6. Set backend `FRONTEND_ORIGIN` to the CRM origin, and configure Clerk for the CRM domain. Validate both deployment pipelines before publishing; local production builds have not been run for this migration.

### 4. Wire the Clerk webhook

Once both apps are deployed:

1. Clerk dashboard → **Configure → Webhooks → Add endpoint**
2. URL: `https://auto-nunes-martins-api.fly.dev/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`
4. Copy the **Signing secret** (`whsec_...`)
5. `flyctl secrets set -a auto-nunes-martins-api CLERK_WEBHOOK_SECRET='whsec_...'`
6. Fly auto-deploys with the new secret

The auth flow still works without the webhook — `requireUser` middleware
auto-provisions a `User` row on first authenticated request via the Clerk
API. The webhook just keeps the row in sync if you edit your profile in Clerk.

---

## Key domain rules (worth knowing)

### VAT formula (margin scheme)

PT used-car dealers operate under the *regime especial dos bens em segunda mão*:

```
margin     = salePrice - purchasePrice - totalVehicleExpenses
vatAmount  = margin × 23 / 123             (extracted from gross margin)
realProfit = margin - vatAmount
```

Implemented in `backend/src/lib/domain/sale.ts`, locked down by 6 unit tests.

### Recurring tasks

When a task with `recurrence != NONE` flips to DONE, a new occurrence is spawned
in the same transaction with `dueDate` shifted by `addMonths(1)` or `addYears(1)`
(date-fns clamps Jan-31 → Feb-28/29 correctly). The old task stays in DONE.

### Task visibility

Tasks are visible to a user when **assigned to them** OR **unassigned (Geral)**.
The kanban has a `Todas / Minhas / Gerais` toggle. Mutations on someone else's
task return 404 (deliberately, to avoid leaking existence).

### Sunday task purge

Every Sunday at 00:00 local time, all DONE tasks get wiped. Triggered
opportunistically on the next visit to `/tarefas` after Sunday — no cron.
Module-level `lastPurgeAt` guard prevents double-wipes within a week.

---

## Tests

```pwsh
yarn test
```

Currently:
- **8 NIF schema tests** in `shared/types`
- **21 backend domain tests**: 6 margin-scheme VAT cases, 6 recurrence shift cases (incl. leap years), 4 stock-aging, 5 Sunday-math

Playwright E2E is scaffolded but the suite is empty — the recommended first
test covers the golden path: sign in → create vehicle → upload photo → create
customer → register sale → verify dashboard KPI increments + ActivityLog row
appears.
