# Design Handoff — Auto Dealer Admin Panel

For the public Orbit storefront (distinct from this admin system), see
[Orbit visual identity](docs/orbit-visual-identity.md), including the reusable
signature red-line glow.

## Overview

A custom-built admin panel for a Portuguese used-car dealership ("comércio
de automóveis"). The panel is the dealership's operational nerve center —
staff log in, manage vehicle inventory, track customers, log financials,
and run an internal kanban for tasks.

The product is in Portuguese (PT-PT) for the end user. Currency: EUR. Date
format: DD/MM/YYYY.

---

## About the Design Files

The files in this bundle are **design references created in HTML** —
high-fidelity prototypes showing intended look, layout, interactions, and
brand DNA. They are **not production code to copy directly**. The task is
to **recreate these designs in the target stack**:

- **Frontend:** SvelteKit + TypeScript + Tailwind CSS + Zod + Clerk Auth
  + pdf-lib (SSR where useful, skeletons for loading, toasts for feedback)
- **Backend:** Express + TypeScript + Prisma + Clerk (JWT verify) +
  PostgreSQL (Supabase) + Supabase Storage (vehicle photos)
- **Architecture:** clean architecture, business logic separated from UI

The HTML prototypes use inline React + Babel for fast iteration —
production should split into proper Svelte components, use TypeScript,
and follow clean-architecture conventions.

## Fidelity

**High-fidelity (hifi).** Pixel-perfect mockups with final colors,
typography, spacing, radii, gradients, and interaction states. Recreate
as closely as possible, preserving:

- Exact hex values for brand red and graphite
- Barlow Black Italic Uppercase for display headlines
- JetBrains Mono for labels, numerics, breadcrumbs
- The red diagonal wedge accents and "red icon │ vertical divider │ text" pattern
- The italic-uppercase voice in CTAs and titles

---

## Brand DNA (essential — do not omit)

The dealership has a strong visual identity. Three motifs anchor everything:

### 1. The diagonal red wedge
A bold red diagonal stripe/wedge is the brand's signature graphic element.
In this admin panel it manifests as a **12px solid red vertical bar pinned
to the right edge of the viewport** (the "edge" mode). The bar is
fixed-position, runs from top to bottom, sits between content and the
scrollbar.

CSS implementation:
```css
.app::before {
  position: fixed;
  top: 0; bottom: 0; right: 0;
  width: 12px;
  background: linear-gradient(180deg, #E30613 0%, #B30410 100%);
  z-index: 3;
  opacity: 0.8;
}
```

### 2. The "red icon │ red divider │ label" signature
Every value/spec is presented as: `[red icon] [thin red vertical line]
[label]`. Used in KPI card headers and panel titles throughout the admin:

```html
<div class="kpi-row">
  <Icon class="ic" />        <!-- red, 22×22 -->
  <div class="sep"></div>     <!-- red, 1.5×22px -->
  <span class="lbl">VENDAS · MÊS</span>
</div>
```

### 3. Italic uppercase Barlow Black headlines
All hero titles, section headers, panel titles, CTAs, and key numerics
follow the same heavy italic treatment.

```css
.hero-title, .page-head h1, .panel-hd .ttl h3, .btn-pri, .cta {
  font-family: "Barlow", system-ui, sans-serif;
  font-weight: 900;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: -.025em;
}
```

---

## Screens / Views

### 1. Login (`/`)

Split-screen layout, full viewport. Authentication handled by Clerk.

**Layout (grid):** `grid-template-columns: 1.08fr 1fr`. Mobile (<920px):
art panel hides, form takes full width.

**LEFT — Brand art panel (`.login-art`)**
- Dark gradient background `linear-gradient(135deg, #1A1A1D 0%, #0A0A0B 100%)`
- Red diagonal wedge at right edge: `clip-path: polygon(40% 0%, 100% 0%, 100% 100%, 55% 100%)` — serves as visual divider between panels
- Subtle 60px-grid pattern overlay (`repeating-linear-gradient`)
- Soft red radial glow at 30%/70%

**Content stack (top-to-bottom):**
1. **Header row** (flex space-between):
   - Logo (top-left): dealership wordmark in white Barlow Black Italic Uppercase, accent word in red. Small mono caption beneath: e.g. "COMÉRCIO DE AUTOMÓVEIS"
   - PT plate (top-right): inline-flex pill with blue "PT" prefix and mono text plate sample
2. **Eyebrow line**: mono uppercase "● PAINEL INTERNO" (red dot)
3. **Car SVG**: positioned absolute `left: -4%; top: 34%; width: 88%`. Grey gradient body, dark glass greenhouse, white left headlight, red right taillight, two wheels with hub detail, drop shadow.
4. **Quote / tagline block** (margin-top: auto): optional editorial space — short Barlow Black Italic line in 36px, mono eyebrow above it.
5. **Stats grid** (3 columns, max-width 420px, divided by vertical white-15% lines): three placeholder stats with Barlow Black Italic 26px numbers and mono 9.5px tracking .2em labels. In production these can be hardcoded or pulled from dashboard data.

**RIGHT — Form panel (`.login-form-side`)**
- Dark canvas matching app theme (`var(--bg-0)`: `#0A0A0B`)
- Soft red radial glow top-right corner
- Theme toggle (sun/moon) absolute top-right corner — 38×38px outlined icon button

**Form card (max-width: 400px, vertically centered):**

Use Clerk's `<SignIn />` component but **style it to match this design** via
Clerk's `appearance` API (or wrap with custom CSS). The visual target:

1. Red eyebrow with line: "── ACESSO · PAINEL INTERNO"
2. h1 (44px, Barlow Black Italic Uppercase): "Bom dia,\n*de volta ao stand.*" (red italic on second line)
3. Subtitle (15px, muted)
4. Email field — mono uppercase label, input with mail icon prefix
5. Password field — same pattern, lock icon, eye/eye-off toggle on right
6. Row: "Manter sessão iniciada" checkbox (red check) + "Esqueceu a palavra-passe?" link
7. Primary CTA (full-width, red, Barlow Italic Uppercase): "ENTRAR NO PAINEL →"
8. Footer (mono uppercase, space-between): copyright / "2FA · ATIVO"

**Interactions:**
- Submit handled by Clerk; show loading state on the CTA
- Theme toggle swaps `data-theme` attribute on `<html>` (dark/light), persists in `localStorage.app-theme`

---

### 2. Dashboard (`/dashboard`)

**Layout (grid):** `grid-template-columns: 240px 1fr`. Sidebar left, main
content right.

#### Sidebar (`.sidebar`)
- Width 240px, sticky, full height, dark gradient `linear-gradient(180deg, #0A0A0B 0%, #0E0E10 100%)`
- Right border 1px var(--border)

**Sections (top-to-bottom):**
1. **Brand block** (24px padding, bottom border):
   - Wordmark logo (Barlow Black Italic Uppercase, red accent word)
   - Mono caption "COMÉRCIO DE AUTOMÓVEIS"
   - Version tag "PAINEL · v1.0"
2. **Nav sections** (separator headers in mono uppercase 9.5px):
   - **Operação**: Dashboard / Viaturas / Clientes / Tarefas
   - **Finanças**: Financeiro / Lucro por Viatura
   - **Recursos**: Guia de Fluxo / Definições
3. **User footer** (avatar, name, role, logout icon):
   - 36×36 avatar circle, red gradient background, italic Barlow initial, green online dot
   - Name and role from Clerk session
   - Logout icon button → Clerk sign-out → returns to login

**Nav item states:**
- Default: muted text, transparent bg
- Hover: bg `rgba(255,255,255,.02)`, text white, icon red
- Active: bg `rgba(227,6,19,.08)`, text white, **2px red left rail** with red glow shadow `box-shadow: 0 0 10px rgba(227,6,19,.5)`. Icon red. Bold weight.

#### Topbar (`.topbar`)
- Transparent background (lets the red gradient backdrop show through)
- 76–84px tall, padding 22–24px
- No bottom border (clean fade into content)

**Content (flex row):**
1. **Breadcrumbs**: red 6×6px tick + "PAINEL / **DASHBOARD**" (mono uppercase)
2. **Search box**: 540px max, 44px tall, ⌘K shortcut hint, frosted nearly-transparent bg, magnifier icon. Focus state: red border + 4px red 12% glow halo. *(Phase 1: visual only — wire to global command palette in Phase 2.)*
3. Spacer
4. **Actions row** (gap 8px):
   - Theme toggle (sun/moon, 44×44 outlined)
   - Download icon button (exports current page list to PDF/CSV)
   - Bell icon button (44×44, red ping dot top-right when smart alerts active)
   - **Primary CTA "Adicionar Viatura"** — red bg, italic uppercase Barlow, plus icon

#### Header zone gradient
Soft red ambient backdrop covering the top 360px of `.main`:
```css
.main::before {
  position: absolute; top: 0; left: 0; right: 0;
  height: 360px;
  background:
    radial-gradient(1000px 420px at 15% -20%, color-mix(in oklab, #E30613 18%, transparent), transparent 60%),
    radial-gradient(800px 380px at 92% -10%, color-mix(in oklab, #E30613 10%, transparent), transparent 65%),
    linear-gradient(180deg,
      color-mix(in oklab, #E30613 4%, var(--surface)) 0%,
      color-mix(in oklab, #E30613 1.5%, var(--bg)) 45%,
      transparent 100%);
}
```

#### Page header
- "Bom dia, **{Nome}**." in Barlow Black Italic Uppercase 38px (red emphasis on name, pulled from Clerk user)
- Subtitle (mono uppercase): full date in pt-PT format, e.g. "QUINTA · 30 ABRIL 2026" (red dot prefix)
- Right side actions: "Exportar" (outlined) + "Adicionar Viatura" (red CTA)

#### Smart Alerts banner (when applicable)
Conditional row at the top of dashboard content. Each alert is a slim card
using the brand DNA pattern (red icon │ divider │ message). Alerts:
- Vehicles in stock > 60 days
- Tasks due today or overdue
- Tasks with reminderDate = today

Click an alert → navigates to filtered list view.

#### KPI cards (4-column grid)
Each card (`.kpi`):
- Subtle 180deg gradient bg `linear-gradient(180deg, #131316 0%, #101012 100%)`
- 14×16px padding (compact density)
- Header: brand DNA pattern (red icon │ divider │ mono uppercase label)
- Big italic value (Barlow Black Italic 38px, tabular-num JetBrains Mono)
- Delta line with green/red arrow + "vs. mês anterior"
- Sparkline SVG bottom-right (50% width, 36px tall, 15% opacity red fill + line)
- Hover: red 2px left rail fades in

**The four KPIs for this dashboard (matching the spec):**
1. **Vendas · Mês** — count of vehicles sold this month, car icon
2. **Faturação · Mês** — monthly revenue (€), receipt icon
3. **Lucro · Mês** — monthly profit (€), chart icon
4. **Margem Média** — average margin %, gauge icon

#### Sales chart panel (8 cols)
- Panel header with brand DNA (red chart icon │ divider │ "VENDAS MENSAIS")
- Chip group: Semana / **Mês** (selected, red) / Trim.
- Chart totals row: total sold YTD / total revenue YTD / average margin %
- Line/bar chart, 12 months Jan–Dez:
  - Sold series: solid red line, 2.2px stroke, with gradient fill underneath (red 40% to 0)
  - Y-axis: mono labels
  - X-axis: months (uppercase, mono)
  - Current month: red square dot 5px + red callout badge "{N} CARROS" floating above

#### Best Selling Cars panel (4 cols)
- Panel header: red car icon │ divider │ "MAIS VENDIDOS · 12M"
- 4 rows, each:
  - 38×38 ranked badge (mono number 01–04 inside a red-outlined square)
  - Model name (Barlow Bold Italic) + sub (mono uppercase, faint): units sold
  - Chevron right arrow (red)
  - Hover: red 4% tinted bg
- Footer: "Ver detalhes →"

#### Stock-aging table — "Em Stock 60+ Dias" (7 cols)
- Panel header: red car icon │ divider │ "EM STOCK 60+ DIAS" / count badge
- Table: Viatura / Ano / Km / Preço (red) / Dias em Stock / actions
- Each row: 44×32 thumbnail (subtle gradient bg, red car icon placeholder), italic Barlow car name, mono VIN below, mono ages/prices, red days-in-stock badge
- Hover: red 5% tinted row
- "VER STOCK COMPLETO →" outlined button right of header

#### Today's Tasks panel (5 cols)
- Panel header: red calendar icon │ divider │ "TAREFAS · HOJE" / "{count} ATIVAS"
- Rows, each with grid: priority dot (color-coded) │ red vertical divider │ task title + assignee │ status chip
- Priority colors: LOW (faint), MEDIUM (info blue), HIGH (warning amber), URGENT (red)
- Click row → opens task detail in modal
- Footer: "VER TODAS →"

#### Recent Activity feed (4 cols, optional placement below)
- Panel header: red bolt icon │ divider │ "ATIVIDADE RECENTE"
- Last 10 events: vehicle added, status changed, sale registered, task completed, expense logged
- Each row: small icon + mono timestamp + Barlow Bold action verb + entity name

---

### 3. Viaturas / Vehicles (`/viaturas`)

List view + detail view.

**List view:**
- Page header same pattern as dashboard (italic title "VIATURAS", subtitle mono with count and date)
- Filter bar: Marca / Modelo / Combustível / Ano / Quilometragem / Estado (chip-style filters, red when active)
- Table or card grid toggle
- Export PDF/CSV button top-right
- Each row/card uses the same thumbnail + Barlow Bold Italic name + mono VIN + state badge pattern from the dashboard inventory table

**Detail view:**
- Two-column layout
- Left: photo gallery (large primary photo + thumbnail strip), uploaded via Supabase Storage
- Right: spec panel using the brand DNA pattern (red icon │ divider │ spec) — 4 rows: Ano / Km / Preço / Motor
- Below: tabs for "Despesas" (per-vehicle expense log), "Histórico" (status changes), "Documentos pendentes" (the 4 sub-flags)
- **Real Profit card**: prominent KPI-style block showing salePrice − purchasePrice − expenses − VAT (23%)

State badges: Disponível (green) / Reservado (gold) / Vendido (graphite) / Entregue (blue) / Documentos Pendentes (red).

---

### 4. Clientes / Customers (`/clientes`)

- List with filter bar (name, phone, vehicle purchased)
- Detail view: customer info card + linked vehicles (Sale relation) + free-form notes field (Description)
- Export PDF/CSV

---

### 5. Tarefas / Tasks (`/tarefas`)

Kanban board.

- Three columns: TODO / Em Curso / Concluído
- Column headers use brand DNA pattern (colored dot │ divider │ label │ mono count)
- Task cards:
  - Barlow Bold Italic title
  - Description preview (2 lines max, faint)
  - Footer row: priority color dot + assignee avatar pill + due date (mono) + 🔁 badge if recurring
  - Hover: red border + 1px lift
- Drag-and-drop between columns (use a Svelte-compatible dnd lib like `svelte-dnd-action`)
- Filters above board: by person / importance / due date
- Export PDF/CSV

---

### 6. Financeiro / Financial (`/financeiro`)

- Tabs: Receitas & Despesas / Lucro por Viatura
- Receitas & Despesas tab: table of operational expenses by category (Rent / Bills / Services / Other), filter by date range and category
- Lucro por Viatura tab: per-vehicle profit table (vehicle / purchase / sale / expenses total / VAT / real profit), sortable
- Export PDF/CSV on both tabs

---

### 7. Guia de Fluxo / Workflow Guide (`/guia`)

Static page. Onboarding aid for new employees.

- Hero: "FLUXO PÓS-ENTREGA" in Barlow Black Italic Uppercase
- 4 cards in a row, each representing a stage:
  1. Financiamento Pendente
  2. IMT / Processo de Importação
  3. Registo Pendente
  4. Documentação em Falta
- Each card: large step number (Barlow Black Italic, red), title, body description of what to do at this stage, "completed" criteria
- Arrows between cards (red SVG chevrons)
- No data fetching — pure static content

---

## Design Tokens

### Colors

```css
/* Brand */
--red:        #E30613;  /* primary brand red */
--red-soft:   #FF3B49;  /* hover red */
--red-deep:   #A8030D;  /* deep red (gradient stop) */

/* Dark theme (default) */
--bg-0: #0A0A0B;        /* page */
--bg-1: #131316;        /* cards */
--bg-2: #1B1C20;        /* elevated cards */
--bg-3: #25262B;        /* surface-2 */
--border:        rgba(255, 255, 255, .12);
--border-strong: rgba(255, 255, 255, .22);
--text:          #F4F4F2;
--text-muted:    #A8A8A4;
--text-faint:    #6E6F73;

/* Light theme */
--bg-0: #F4F2EE;        /* warm cream page */
--bg-1: #FFFFFF;
--bg-2: #FAF8F2;
--bg-3: #EEEBE3;
--border:        rgba(15, 15, 17, .08);
--border-strong: rgba(15, 15, 17, .18);
--text:          #0F0F11;
--text-muted:    #5A5C61;
--text-faint:    #8A8C92;

/* Semantic */
--success: #34C480;  /* light: #1A7A4F */
--warning: #E0A040;  /* light: #B26B00 */
--info:    #5C8DEF;  /* light: #1E5BC2 */
```

### Typography

```css
--font-display: "Barlow", system-ui, sans-serif;
--font-sans:    "Inter", system-ui, sans-serif;
--font-mono:    "JetBrains Mono", monospace;
```

Weight scale (Barlow): 400, 500, 600, 700, 800, 900 (italic available 600–900)
Weight scale (Inter): 400, 500, 600, 700
Weight scale (JetBrains Mono): 400, 500, 600

**Type recipes:**
- **Hero title** — Barlow Black Italic Uppercase, 56px, line-height .92, letter-spacing -.025em
- **Page heading** — Barlow Black Italic Uppercase, 38px, line-height .95, letter-spacing -.025em
- **Panel title** — Barlow Bold Italic Uppercase, 18px, letter-spacing -.01em
- **KPI value** — Barlow Black Italic, 38px, letter-spacing -.025em, line-height .95 (OR JetBrains Mono w/ tabular-num)
- **Eyebrow / label** — JetBrains Mono, 10px, letter-spacing .25em, uppercase, red OR text-faint
- **Body / nav** — Inter 500, 13.5px
- **Mono numerics** — JetBrains Mono with `font-feature-settings: "tnum" 1`

### Spacing

Compact density:
- Main padding: 22px horizontal
- Card padding: 14px (panel-bd) / 12–16px (panel-hd)
- KPI padding: 14px 16px

### Radii

User's chosen scale is **2.2×** the base. Resolved values:
- Cards (.kpi, .panel, .hero, table): ~6–7px (3px × 2.2)
- Buttons (.btn-pri, .btn-out, .cta, .icbtn): ~4–5px (2px × 2.2)
- Other (badges, chips): 0 (sharp)

### Shadows / depth

Mostly flat. Used sparingly:
- KPI card inset highlight: `inset 0 1px 0 rgba(255,255,255,.04)` (dark) / `rgba(255,255,255,.85)` (light)
- Active nav item: red glow `0 0 10px color-mix(in oklab, #E30613 50%, transparent)` on the left rail
- Search focus: `0 0 0 4px color-mix(in oklab, #E30613 12%, transparent)`
- Car SVGs: `drop-shadow(0 30px 40px rgba(0,0,0,.6))`

### Border emphasis

Crisp:
- `--border: rgba(255,255,255,.12)` (dark) / `rgba(15,15,17,.08)` (light)

---

## Interactions & Behavior

### Auth flow
- Default: not logged in → Login screen (Clerk `<SignIn />`)
- After Clerk sign-in → render Dashboard
- Sidebar footer logout button → Clerk sign-out → return to login
- Backend verifies Clerk JWT on every API call
- On first sign-in, a Clerk webhook creates a matching `User` row in Prisma

### Theme switching
- Default: dark
- Sun/moon toggle in topbar AND on login page swaps `document.documentElement.setAttribute("data-theme", ...)`
- Persists in `localStorage.app-theme`

### Notifications
- In-app toasts only (use a Svelte toast lib like `svelte-french-toast` or `svelte-sonner`)
- Triggered on every action (saved, deleted, status changed, exported)
- Smart alerts surface as both a dashboard banner AND a toast on first dashboard load

### Kanban
- Cards have `cursor: grab`. Use `svelte-dnd-action` for drag-and-drop between columns
- When a recurring task is moved to "Concluído", a server action creates the next occurrence (see spec)

### Search
- `Cmd+K` / `Ctrl+K` opens a global command palette — **Phase 2**. Phase 1 ships the visual hint only.

### Animations / transitions
- All transitions: `cubic-bezier(.2,.8,.2,1)` ease curve, 0.12–0.25s duration
- Standard hover/focus state transitions on borders, backgrounds, colors

---

## State Management

Per page (loaded SSR where useful):

```
- auth:  handled by Clerk SDK + Clerk session
- theme: "dark" | "light" (localStorage)
- user:  { id, clerkId, name, role } from Prisma User (joined via Clerk session)
- dashboard data: KPIs, sales chart, best sellers, stock 60+, today's tasks, recent activity
```

All dashboard data fetched server-side via Prisma (SvelteKit `+page.server.ts`):
- KPIs: aggregate queries on Sale, Vehicle
- Sales chart: 12-month aggregate of Sale grouped by month
- Best sellers: Sale grouped by Vehicle.model, last 12 months
- Stock 60+: Vehicle WHERE status=AVAILABLE AND acquisitionDate < now-60d
- Today's tasks: Task WHERE assigneeId=current AND (dueDate=today OR reminderDate=today)
- Recent activity: last 10 events from an activity log

Use SSR for initial load, then progressive enhancement / form actions for mutations. Use optimistic updates for kanban drag-and-drop and status changes.

---

## Assets

### In `assets/`
- `logo.png` — dealership logo (red accent word + black wordmark italic + tagline)

### In `reference/`
- `01_brand_logo.png` — full logo + tagline
- `02_social_media_layout.jpg` — social post showing brand DNA: deep near-black background, red diagonal wedge on the right, "red icon │ vertical line │ value" spec list pattern, red circular checkmarks for value props, italic uppercase logo lockup. **Canonical brand DNA reference — match its energy.**

### Fonts
Loaded from Google Fonts CDN. Production set: **Barlow + Inter + JetBrains Mono**.

In SvelteKit, prefer `@fontsource/barlow`, `@fontsource/inter`, `@fontsource/jetbrains-mono` for self-hosting (avoids Google Fonts third-party request, better LCP).

### Icons
Inline SVG icons (24×24, stroke-based). Production: use `lucide-svelte` for the closest matching style.

Required icon set for Phase 1: Dashboard, Car, Calendar, Gauge, Tag, Engine, Task, Doc, Bolt, Users, Chart, Settings, Search, Bell, Plus, Sun, Moon, Mail, Lock, Eye, EyeOff, More, Filter, Download, Right, ChevronRight, Up, Down, Check, Receipt, Logout, Phone, Camera.

The car silhouette in the login hero is a hand-drawn SVG — replace with a real photo placeholder slot in production, populated from `Vehicle.photos[0]`.

---

## Files in this bundle

- `index.html` — the full hi-fi prototype
- `assets/logo.png` — brand logo
- `reference/01_brand_logo.png` — brand reference
- `reference/02_social_media_layout.jpg` — brand DNA reference

> Note: the runtime "Tweaks · Refinement" panel that appeared in the original prototype was a **development-only tool** used during design iteration. All final values are baked into the design tokens above. **Do not include it in production.**

---

## Implementation priorities (recommended order)

1. **Set up the project**: SvelteKit + TypeScript + Tailwind, install fonts via `@fontsource/*`, define the color tokens and type recipes from this README as Tailwind theme extensions and CSS variables. Set up Clerk Auth on both frontend and backend (Express). Wire Prisma to Supabase Postgres.
2. **Build the design primitives**: KPI card component, Panel component (with brand DNA header pattern), the "red icon │ divider │ label" spec row, button variants (primary red, outlined), badge variants (status colors), table component, toast wrapper.
3. **Build the Login page**: use Clerk's `<SignIn />` with `appearance` overrides to match the design. The art panel on the left is custom-built.
4. **Build the Dashboard shell**: sidebar + topbar + main grid, red edge wedge, header zone gradient. Wire Clerk session into the user footer.
5. **Hydrate dashboard widgets**: KPIs → Sales chart → Best Sellers → Stock 60+ table → Today's Tasks → Recent Activity → Smart Alerts banner.
6. **Build secondary pages in spec order**: Viaturas → Clientes → Sales (modal flow from Viatura detail) → Tarefas (kanban) → Financeiro → Guia de Fluxo (static).
7. **Add PDF/CSV export** to every list view (pdf-lib for PDF, papaparse or manual CSV).

The "Tweaks" panel and alternate font presets are **not** part of production. They were development tools used to converge on the final design tokens specified here.
