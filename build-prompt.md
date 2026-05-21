# Build Prompt — Auto Dealer Management Platform (Phase 1)

You are building Phase 1 of an internal Auto Dealer Management Platform for a
used-car dealership in Portugal called Auto Nunes Martins. Admin-only web app, no public site.
Desktop-first, fully responsive. Currency EUR. Locale pt-PT.

This file is the truth that you need to follow and use when you are in dought ( or ask me ). And follow the index.html and the design-system.md to guide you on the design implementation.
The page should look as close to the index.html as possible, just with less features.

Always remmember to not show API credentials anywhere and use .gitignore for files like .env

## Architecture

Clean architecture with clear separation:

- `/ui` → Svelte components (presentation only, no business logic)
- `/lib/domain` → business logic, types, validation schemas (Zod)
- `/lib/data` → Prisma access, repositories
- `/lib/server` → server actions, API handlers
- `/lib/utils` → formatters (money pt-PT, dates DD/MM/YYYY), helpers

Frontend and backend are separate apps:

- `frontend/` → SvelteKit + Typescript (strict, no any) + Tailwind v4 + Superforms + Zod  + Clerk + pdf-lib + oklch for colors if needed
- `backend/` → Express + Typescript (strict, no any) + Prisma + Clerk (token verify) + Supabase

SSR enabled on dashboard, list pages, and detail pages. CSR for kanban
drag-and-drop and modals. Skeletons during data fetch. Toasts for every
action result.

## Auth

Clerk Auth for both apps. Frontend uses Clerk SDK for sign-in. Backend
verifies Clerk JWTs on every request via middleware. On first sign-in,
a webhook from Clerk creates a matching User row in Prisma. Single role
for Phase 1: ADMIN. Build the role check extensibly.

## Data Model (Prisma)

- **User** `{ id, clerkId (unique), email, name, role (default ADMIN), createdAt }`
- **Vehicle** `{ id, brand, model, year, fuel, mileage, vin, purchasePrice, salePrice, status, acquisitionDate, soldDate, description, photos (string[]), pendingDocFlags (Json: financing, imt, registration, docs), createdAt, updatedAt }`
- **VehicleExpense** `{ id, vehicleId (FK), category, description, amount, date }`
- **Customer** `{ id, name, phone, email, address, idNumber, notes (Text), lastContactDate, createdAt }`
- **Sale** `{ id, vehicleId (FK), customerId (FK), salePrice, vatAmount, realProfit, saleDate, deliveryDate, deliveryStatus }`
- **Task** `{ id, title, description, status, priority, assigneeId (FK User), startDate, dueDate, reminderDate, recurrence (NONE | MONTHLY | ANNUAL), recurrenceParentId (self-FK, nullable) }`
- **OperationalExpense** `{ id, category (RENT | BILLS | SERVICES | OTHER), description, amount, date }`

Enums: `VehicleStatus`, `TaskStatus` (TODO | IN_PROGRESS | DONE), `Priority`
(LOW | MEDIUM | HIGH | URGENT), `Recurrence`, `Role`.

## VAT & Profit (fixed formula)

```
vatAmount  = (salePrice - purchasePrice - totalVehicleExpenses) * 0.23
realProfit = salePrice - purchasePrice - totalVehicleExpenses - vatAmount
```

Compute server-side on Sale creation, persist on the Sale row, and recompute
if any input changes.

## Recurring Tasks (Option A)

When a Task with `recurrence != NONE` flips to status `DONE`, a server action
creates a new Task copying title/description/priority/assignee/recurrence,
with `dueDate` and `reminderDate` shifted by +1 month or +1 year, and
`recurrenceParentId` pointing to the completed task. Show a 🔁 badge on the
card with the recurrence label.

## Notifications

In-app toasts only (no email, SMS, push). Triggered for:

- All action confirmations (saved, deleted, status changed, exported)
- Dashboard load alerts: vehicles in stock > 60 days, tasks due today or
  overdue, tasks with `reminderDate = today`

## Exports

Every list view has an "Export" button with PDF and CSV options:

- **PDF** via `pdf-lib`: A4 landscape for tables, header with dealership name
  and export date in pt-PT format
- **CSV**: comma-separated, UTF-8 BOM for Excel compatibility, respects
  current filters and sort order
- Filename: `{module}_{YYYY-MM-DD}.{ext}`

Exportable lists: Vehicles, Customers, Sales, Tasks, Operational Expenses,
per-vehicle profit table.

## Modules to Build (in this order)

1. **Project scaffolding**: two apps (frontend, backend), Prisma schema,
   Supabase connection, Clerk integration, webhook for user sync, shared
   types package if needed.
2. **Vehicle Management**: CRUD, photo gallery (Supabase Storage upload +
   signed URLs), per-vehicle expense tracker, real-profit calculation
   displayed on detail page, filters by brand/model/fuel/year/mileage/status,
   PDF/CSV export.
3. **Customer Management**: CRUD, free-form notes field, link to purchased
   vehicles via Sale relation, PDF/CSV export.
4. **Sales**: create a Sale linking Vehicle + Customer, auto-update vehicle
   status to SOLD, compute and persist 23% VAT + real profit.
5. **Task Kanban**: drag-and-drop columns (TODO / In Progress / Done),
   filters by assignee/priority/due date, priority color coding, recurring
   task regeneration on completion, PDF/CSV export.
6. **Dashboard**: Monthly Sales count, Monthly Revenue, Monthly Profit,
   Average Margin %, 12-month sales bar chart, Recent Activity feed (last 10
   events), Best Selling Cars (last 12 months), Stock-aging banner (vehicles
   AVAILABLE > 60 days), Priority Tasks banner, Today's Tasks list.
7. **Financial page**: operational income/expenses CRUD with filters,
   per-vehicle profit table, PDF/CSV export.
8. **Static Workflow Guide page**: explains post-delivery document flow
   (Financing → IMT → Registration → Docs) as visual cards for onboarding.

## Design Rules

- Sidebar layout (left nav), main content, top bar with user menu (Clerk avatar)
- Use shadcn-svelte or bits-ui + Tailwind consistently
- Dark mode supported, default to light
- Money: `"1.234,56 €"` (pt-PT format via `Intl.NumberFormat`)
- Dates: `DD/MM/YYYY`
- Empty states for every list view
- Loading skeletons everywhere, no spinners
- Toasts for every action (`sonner-svelte` or `svelte-french-toast`)

## Out of Scope for Phase 1

- Multiple roles or granular permissions
- Custom recurrence rules beyond MONTHLY / ANNUAL
- Email / SMS / push notifications
- Public-facing website
- Multi-tenant / multi-dealership support
- Multiple currencies
- Dynamic user-defined custom fields

## Working Method

Start by scaffolding both apps and defining the Prisma schema. Then build
module by module in the order above. After each module: run lint, type-check,
and pause for confirmation before moving on.
