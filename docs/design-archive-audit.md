# Orbit consolidation and independent design archive

2026-10-03. No commit, push, deployment or database changes in this iteration.

## Independent project

Path: `C:/Users/Goncalo/Desktop/AI/AutoNunesMartins-DesignArchive`.

Run `npm ci`, then `npm run dev` in that folder. Open http://localhost:5180. `npm run build` and `npm run preview` provide a local production-build preview on port 5181. No deployment adapter is configured intentionally.

Left sidebar switches between isolated iframe previews. A full-width link opens each original route separately. At narrow widths the sidebar remains accessible; full-width mode is preferable for judging mobile layouts of legacy designs that were not designed for a 240px frame.

Preserved alternatives: `/stand`, `/stand-v2`, `/stand-1` through `/stand-5`, `/stand-fable-2`, `/stand-fable-3`, `/stand-atelier`, `/stand-atelier-signature`, `/stand-horizonte`, `/stand-flux`. Also preserved `/cards`, `/stand-orbit/referencias`, and `/component-studies` for two unused visual experiments. There are 16 menu destinations, including 13 complete design variants.

The archive has its own package manifest, npm lockfile and installed dependencies. Source copies contain no .env, .git, original node_modules, database, backend or CRM application. Only the public specifications contract was vendored from shared/types. All archive routes send X-Robots-Tag noindex, nofollow. Demo content remains demo; external photos/fonts referenced by old versions may require Internet. Historic links pointing outside the archived versions do not call the official site or backend.

## Verified removal from the main project

Source import closure was computed before copying. Original and archived SHA-256 were compared before each removal. The external `snapshot-manifest.json` records source paths, destination paths and hashes; `scripts/extraction-provenance.mjs` preserves the one-time extraction recipe (not a synchronization command).

36 files removed: 26 route/data files, 9 exclusive components/helpers and the old opaque logo asset:

- Concept.svelte, AtelierSignature.svelte, ScrollJourney.svelte, scrollMotion.ts
- ArchivedOrbitCinema.svelte, OrbitDetails.svelte, OrbitSpread.svelte
- DepthField.svelte and OrbitContactFooter.svelte (no live imports; preserved as component studies)
- `apps/website/static/logo.png`: only the old default of VisitInvitation remained; its default now matches the transparent logo already explicitly passed by every live caller. CRM's own assets are untouched.

All shared assets and package dependencies were retained where live Orbit consumers still exist. This avoids removing resources merely because they appeared in an alternative. No whole-repository dependency upgrade or removal was justified by this extraction.

Orbit home, catalog, company, privacy, public vehicle detail/photo proxy and both Porsche reference routes remain. CRM, backend, shared contracts and `ui-ux-pro-max-skill` remain intact. Existing local vehicle-story, scoped reveal and footer changes were preserved. FAQ/catalog edits and a later footer alignment change belong to the separate executor; this extraction did not overwrite their work.

## Small justified fixes

- Optional Orbit demo route now accepts known demo IDs only; arbitrary/removed study URLs return HTTP 404 instead of a soft-404 screen with status 200.
- Root redirect documentation identifies Orbit as the official website.
- `.vercel/` is ignored as generated output, alongside existing build exclusions.
- Real vehicle JSON-LD is centralized and defensively serialized; see `vehicle-structured-data.md`.

## Validation

- Independent archive: all 15 original destinations returned HTTP 200, as did one representative detail for every one of the 13 design variants. Added component-studies route also returned 200. Build succeeded; type check: 0 errors (legacy prototype warnings remain).
- Browser: menu switched Original to Flux and Grafite; Flux rendered with the persistent left menu. Mobile shell at 390px had no document overflow. A rapid batch of browser navigations exceeded the tool deadline; a fresh tab worked. This is not claimed as exhaustive interaction testing of every archived control.
- Main: 197 website tests, 110 backend tests and 7 CRM tests passed. Website and CRM type checks and backend TypeScript passed. After the template specialization, website check returned 0 errors and 1 warning.
- HTTP after extraction: Orbit, catalog, company, real Jogger, Porsche and Porsche lab returned 200. Removed `/stand` and `/stand-flux` returned 404. `/stand-orbit/referencias` and an unknown demo ID returned 404 after the route fix. CRM root returned 200; public API still returned 14 vehicles.
- Main client/server bundles compiled after extraction. Final Vercel packaging failed on Windows with EPERM creating the adapter's `index.func` symlink. The same limitation occurred before extraction. This is not a completed production build/deployment; validate the adapter in the deployment environment.

## Audit boundaries and remaining work

Reviewed route inventory, import consumers, public assets, dependency manifests, app/backend boundaries, type checks, unit suites and public HTTP paths. This is a consolidation audit, not a claim of exhaustive security, penetration, authenticated CRM end-to-end or live production testing.

Follow-up completed: both detail templates are now Orbit-only. Removed the edition prop from templates and callers, 83 statically known branches/expressions, all explicit Flux selectors (182 selector-list edits per template), dead filters/imports, and 318 unused CSS selectors per template. Compiler-proven unused selectors were removed from source, not just hidden. Runtime-added `.motion-on` is explicitly global in selectors so the live Orbit animations remain supported after replacing the formerly dynamic edition class with a fixed Orbit class. No Flux references remain in website source/static/package configuration.

Browser verification after specialization: homepage retained its hero transform and navigation; real Jogger and Porsche lab retained the 843.844px/324.562px desktop grid and sticky panel; cards were visible without reveal; Jogger retained vehicle story and exactly one JSON-LD block, while Porsche retained none. At 390px, the real detail had no overflow and the panel was static. Known demo data, public contracts, images, animation helpers and the separate Porsche lab remain because Orbit directly uses them. Full template deduplication is optional future maintenance, not a remaining alternate version.

For the Vercel limitation, inspected the adapter's actual fs.symlinkSync calls and checked the available Linux alternative: WSL is not installed on this host. Did not install system components, weaken Windows protections, patch node_modules, or replace the production adapter to mask the failure.

Demo contacts/forms, thin vehicle descriptions, missing approved photos/specifications, production-domain setup and other SEO tasks from the earlier audit were not silently filled with invented data or expanded into new features. Google indexing and rich-result eligibility are not guaranteed by JSON-LD.
