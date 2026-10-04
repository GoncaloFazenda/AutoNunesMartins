# Independent applications

Before any public website launch/readiness review, consult [publication-readiness.md](publication-readiness.md). Legal fields and contact/service confirmations remain pending; the manual readiness check is separate from builds and does not certify compliance.

## Local commands

| Application | Workspace | Development URL |
| --- | --- | --- |
| Public website | `@anm/website` | http://localhost:5173/ |
| CRM | `@anm/crm` | http://localhost:5174/ |
| Backend | `@anm/backend` | http://localhost:4000 |

Run `yarn dev` for all three, or `yarn dev:website` / `yarn dev:crm` individually. The official website serves `/`, `/viaturas`, `/viaturas/[slug]`, `/quem-somos` and `/politica-de-privacidade`. The former `/stand-orbit` routes were removed without aliases or redirects because the site is not public yet. Existing catalog query normalization remains unchanged. Canonical, Open Graph, JSON-LD and photo URLs use the new paths and the existing request origin; no production domain or DNS was changed.

Alternative designs, card comparisons and `/stand-orbit/referencias` remain in the independent sibling project `AutoNunesMartins-DesignArchive` (local port 5180). Retained fictional cars use `/demo/[id]`, and the Porsche reference uses `/demo/porsche-lab`; both retain `noindex` and emit no commercial JSON-LD. Existing prepublication indexing settings remain unchanged. There is no sitemap in the website. See `design-archive-audit.md` for the archive scope and earlier validation.

Route migration validation (2026-10-04): website suite 226 tests passed; Svelte check 0 errors, 1 existing warning. HTTP checks confirmed the new pages, published detail and photo proxy return 200; removed prefixed paths return 404 without a Location header. Catalog pagination and brand/model queries retain their canonical parameters. Published detail canonical, Open Graph, JSON-LD offer and image URLs use `/viaturas/...`. Browser checks covered homepage navigation, page 2 and brand filtering. CRM, backend, archive and production domain settings were not changed.

## Configuration and security boundaries

- CRM owns ClerkProvider, Clerk server middleware, session types, admin helpers, CRM fonts and styles. Its existing `.env` was moved with it, not copied to the website.
- Website owns public layouts, stand components and public API parsers/proxy. Its only configured backend origin is `PUBLIC_BACKEND_URL`. Public requests omit credentials and use allowlisted response schemas; never reuse the CRM API helper.
- Backend remains shared and authenticated CRM routes remain protected. `FRONTEND_ORIGIN` is the CRM origin (locally port 5174), not a wildcard. Public website data and photos use the public server-side proxy.
- CRM `PUBLIC_WEBSITE_URL` points to the website so the publication preview opens the correct application. No sensitive data belongs in any `PUBLIC_` environment variable.
- Shared contracts remain in `shared/types` to avoid needless backend churn; moving them to a differently named folder provides no isolation or performance benefit.

## Deploy setup (not executed)

Create independent Vercel projects rooted at `apps/crm` and `apps/website`, with repository files outside the root available. Configure separate domains, environment variables and promotion/rollback. The existing local Vercel output/linkage moved with the CRM and is historical; re-link deliberately before any deployment, not by reusing it for the website.

Both configurations contain an ignored-build command that checks changes since the last successful deployment. A CRM-only change does not deploy the website, and vice versa. Root dependency/pipeline changes conservatively trigger both. Missing or shallow Git history defaults to proceeding, never silently skipping. Manual redeploys/environment-only changes must explicitly bypass the ignored step when needed.

Reference: [Vercel ignored build step](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel).

No build or external deployment was executed for this migration. These configurations must be validated in the deployment environment when publication is authorized. Shared API/schema changes still require backward-compatible rollout; independent frontends do not isolate backend failures.

## Performance implementation

- No CRM authentication or Google Fonts stylesheet in the public root document. Orbit retains the local font faces and critical preloads; legacy concepts keep locally hosted public fonts.
- Responsive CDN image candidates and display-size hints on hero/cards, interior panorama and contact/editorial backgrounds. Real private-storage/public API photo paths are deliberately not rewritten or exposed as storage URLs. Their image-resizing pipeline is a separate backend concern.
- Parser-time Orbit startup is isolated in `static/orbit-startup.js`, not embedded as a large HTML block. Keep its geometry formulas in sync with `scrollTiming.ts`.
- Off-screen scenes are filtered before descendant/style measurements; hidden tabs stop scheduling animation frames. SVG path length is cached. Effects and reduced-motion behavior are retained.

The public form remains a demo and does not send messages. No demo content was silently promoted to production. Low observed CLS is not a Lighthouse performance score or a field Core Web Vitals guarantee.
