# Orbit public vehicle API

Integrated in the main checkout. **Both public-catalogue migrations applied on 2026-09-20**, after explicit
user authorization; Prisma Client generated. The Orbit catalogue and slug details use
the public API through a credential-free server-side BFF and no-store photo proxy.
The homepage deliberately retains its five demo vehicles and never queries CRM stock.

CRM create is a two-step flow: save privately, optionally upload photos, then explicitly approve
public content. Edit uses the same publication panel. Availability remains independent.
Publication requires a nonempty approved description; price and photos are optional.
Unknown price is NULL, never zero, displayed as “Preço sob consulta”. Empty photos display
“Imagem indisponível”. Create/edit show an accessible confirmation before publishing with
no selected photograph. Transmission may remain unknown (null).

Latest explicit product policy: CRM values are authoritative. Do not analyze or validate
printed text, plates or commercial information inside photographs. Only technical file
association/access/type checks apply. **Final rollout: 14 published — 13 AVAILABLE and
1 RESERVED; 13 without photos and 1 with unknown price.** Dacia is published with its
associated image. RESERVED appears labelled “Reservada”; AVAILABLE has no status badge.
Only a factual brand/model/year sentence was generated; internal notes were not copied.

## Routes

| Method and route                               | Authentication       | Result                              |
| ---------------------------------------------- | -------------------- | ----------------------------------- |
| `GET /api/public/vehicles`                     | None                 | Paginated catalogue and facets      |
| `GET /api/public/vehicles/:slug`               | None                 | One public vehicle or 404           |
| `GET /api/public/vehicles/:slug/photos/:index` | None                 | Approved image bytes or 404         |
| `PATCH /api/vehicles/:id/web-publication`      | Existing Clerk ADMIN | Explicit web approval/unpublication |

The public router is mounted before Clerk middleware and has no write routes.
The existing CRM endpoints and authentication are unchanged. The existing CRM
`POST /api/vehicles/:id/publish` (DRAFT → AVAILABLE in the newer main checkout)
does **not** grant website approval.

Every public query, including detail, photo access, counts and facets, requires
`webPublished=true`, a persisted slug, an AVAILABLE or
RESERVED state, no sold date and no Sale relation. Hidden, sold, draft and absent
vehicles all return the same 404 from detail/photo endpoints. New and existing
vehicles default to unpublished. Unpublishing retains the slug and approved
content for deliberate republication; it does not change CRM status.

## Public DTO

```json
{
  "slug": "bmw-serie-1-2019-<12-hex-id-hash>",
  "brand": "BMW",
  "model": "Série 1",
  "year": 2019,
  "fuel": "DIESEL",
  "mileage": 75000,
  "price": "21900.25",
  "currency": "EUR",
  "description": "Explicitly approved public text",
  "transmission": "MANUAL",
  "availability": "AVAILABLE",
  "photos": ["/api/public/vehicles/<slug>/photos/0"]
}
```

This is the exhaustive JSON allowlist. The example is illustrative, not seeded
inventory. No CRM DTO is spread into the response. No internal ID, VIN, plate,
purchase/sale transaction amounts, profits, expenses, customer records, documents,
internal description or flags, storage paths or signed URLs are returned.
`price` is a separate, explicitly approved EUR decimal string or null, never a fallback
to CRM `salePrice`. Description is separate, nullable plain text; escape it in
the frontend rather than rendering HTML. Transmission is optional, explicitly
entered MANUAL/AUTOMATIC, not inferred from fuel or model. No power, category,
trim, equipment or historical claims are invented from the demo data.

## Catalogue query

Uses the current Orbit URL parameter names, so the frontend can forward only
this allowlist. Omit cleared/empty filters entirely. Unknown keys, repeated keys,
arrays, nested objects, invalid ranges and invalid enum/numeric values return 400.

| Parameter                | Meaning / allowed values                                                                                                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `q`                      | Trimmed 1–120 characters; case-insensitive substring of brand, model or approved description only. `%`, `_` and `\` are literal. Accent matching follows PostgreSQL collation; unlike the old demo filter, this does not remove accents. |
| `marca`, `modelo`        | Case-insensitive exact values; max 60 / 80 characters                                                                                                                                                                                    |
| `preco_min`, `preco_max` | Inclusive EUR price bounds, 0–9999999999.99; decimal dot, max two decimal places                                                                                                                                                         |
| `ano_min`, `ano_max`     | Inclusive integer years, 1950–2200                                                                                                                                                                                                       |
| `km_min`, `km_max`       | Inclusive integer kilometres, 0–2000000                                                                                                                                                                                                  |
| `combustivel`            | GASOLINE, DIESEL, HYBRID, PLUGIN_HYBRID, ELECTRIC, LPG; current display labels Gasolina, Diesel, Híbrido, Híbrido Plug-in, Elétrico, GPL also accepted                                                                                   |
| `transmissao`            | MANUAL or AUTOMATIC; Manual or Automática also accepted                                                                                                                                                                                  |
| `ordem`                  | `relevancia` (default, stable alphabetical slug order), `preco_asc`, `preco_desc`, `ano` (descending), `km` (ascending)                                                                                                                  |
| `pagina`                 | Integer 1–1000, default 1                                                                                                                                                                                                                |
| `pageSize`               | Integer 1–30, default 9                                                                                                                                                                                                                  |

All sorts have an immutable ID tie-breaker; private columns cannot be ordered or
searched. `relevancia` does not imply a curated or paid ranking.

The list response has `items`, `total`, `page`, `pageSize`, `totalPages`, `facets`.
An empty catalogue returns 200, `items: []`, `total: 0`, `totalPages: 0`, empty
categorical facets and null numeric bounds. A valid page beyond the last page
returns empty items without silently moving the requested page.

Facets:

- `brands: [{value, count}]`, `models: [{brand, value, count}]`,
  `fuels: [{value, count}]`, `transmissions: [{value, count}]`.
- `year`, `mileage`, `price`: `{min, max}`; price bounds are decimal strings.
- Categorical counts ignore their own selected filter, so other options remain
  selectable. Brands also ignore the model filter; models respect the brand.
  Other filters and the publication gate always apply. Numeric bounds reflect
  the fully filtered set. Brand/model facets return at most 100 sorted entries.
- Pagination, totals and facets use a repeatable-read transaction for consistency.

## Explicit approval and SEO slugs

An existing authenticated ADMIN may deliberately submit:

```json
{
  "published": true,
  "price": "21900.25",
  "description": "Approved nonempty plain-text description",
  "photoPaths": ["<vehicle-cuid>/<photo-uuid>.jpg"],
  "transmission": null
}
```

All five keys are required when publishing. To unpublish submit exactly
`{"published":false}`. No client-supplied slug is accepted. The response is
`{"published":true,"slug":"..."}` (slug can be null when unpublishing a vehicle
that was never published). These are private management requests; never call
them from the public website or expose a Clerk/server key in browser code.
They write only the approved public fields and the existing audit log; they do
not change CRM availability or financial values. Review text and images for personal information,
documents and visible identifying plates before explicitly approving them.

First publication persists `<brand>-<model>-<year>-<id-hash>`. Normalization uses
Unicode NFKD, removes accent marks, lowercases, collapses non-ASCII-alphanumeric
runs to hyphens, and caps the readable prefix at 110 characters. The suffix is
the first 12 hex characters of SHA-256 of the immutable vehicle ID, never its VIN
or plate. A database unique index is authoritative; on collision the service
retries a 16-, 24- then 64-character suffix. Exhaustion returns 409. The first
persisted slug is reused on subsequent edits, title changes and unpublish/relist,
so URLs remain stable. Public detail accepts only this slug, not an internal ID.
Publication uses serializable transactions with bounded retries, so concurrent
first-publication requests re-read the persisted winning slug rather than
replacing it from a stale title snapshot.

## Photos and caching

Photos are optional; no image-content analysis or OCR is part of publication.

Only explicitly selected `publicPhotoPaths` that still belong to `Vehicle.photos`
and match that vehicle's `<cuid>/<uuid>.(jpg|jpeg|png|webp)` namespace are eligible.
Other vehicle paths, URLs, tokens, traversal/encoded separators, PDFs and SVGs
are rejected. Maximum 20 approved photos. Public JSON returns relative proxy
paths, and the server privately downloads each image using its existing Supabase
access. No bucket permissions are changed. The proxy accepts JPEG/PNG/WebP
content up to 10 MiB, uses `nosniff`, and permits cross-origin image embedding.

All public responses use `Cache-Control: no-store`. Each photo request rechecks
current publication/state and membership; unpublishing or removing a photo
revokes subsequent proxy reads. Already downloaded images cannot be recalled.
This deliberately does not reuse the CRM's cached one-hour signed URLs.

Public database failures return a generic 503 (including before deployment of the
migration), never a private inventory fallback, database detail or secret.
Existing CORS policy stays unchanged. Prefer SvelteKit server-side fetch/BFF for
the catalogue; configure permitted browser origins explicitly if deploying a
separate frontend origin. Resolve photo paths against the backend base URL or
proxy them unchanged through the frontend.

## Integration / deployment

1. Integrate only the new backend files, this migration, and the additive
   Vehicle fields / PublicTransmission enum / index and index.ts route mounts.
   The main checkout has newer CRM migrations/schema than this worktree: **do
   not overwrite its complete schema.prisma or index.ts with this older base**.
2. Migrations `20260919230000_add_public_vehicle_catalog` and
   `20260920010000_allow_public_vehicles_without_price` were applied to the configured
   CRM environment on 2026-09-20 using `prisma:migrate:deploy`, after confirming it
   each was the only pending migration. Migrations themselves publish nothing.
3. Regenerate the isolated/deployed client with
   `yarn workspace @anm/backend prisma:generate`, then restart the backend.
4. An ADMIN explicitly reviews and approves selected vehicles through the private
   PATCH route and shared create/edit publication panel. Existing internal CRM
   availability buttons do not approve the web.
5. Orbit catalogue (not its demo homepage) uses the public GET contract. Map `mileage→km`,
   decimal `price→display amount`, canonical fuel/transmission→Portuguese label,
   and `photos[0]→card image`; use a neutral placeholder if photos is empty.
   Remove demo-only invented fields/claims rather than filling absent data.
6. Detail URLs should use `/stand-orbit/viaturas/<slug>`; call the public detail
   endpoint by slug. Handle 404/unpublished, empty stock and 503 separately.
   Use `totalPages`, resetting page on filter changes; clamp empty-state UI to
   one disabled page if its pagination component requires at least one.

No email/contact endpoint was added.

## Validation performed

- Backend suite: 98 tests passed, including 66 public API/domain/publication
  tests (in-process HTTP, mocked Prisma/storage, no real stock mutation).
- Backend TypeScript check, Prisma schema validation and lint of changed source
  files passed. Full backend lint still reports the pre-existing type-only import
  error in `src/lib/server/dashboardService.ts` and an existing unused directive
  warning in `src/routes/vehiclePhotos.ts`; neither file was changed.
- Prisma Client generated in the main checkout after applying the authorized migration.
- Real authorized cycles passed for Dacia and the vehicle without price/photos: immediate
  list removal and detail 404 on unpublish, republication preserving slug and CRM status.
  Dacia photo access also returns 404 when unpublished. Final state is 14 published.
  Real filters: Audi=5, price-filtered=13, pages=9+5, unknown price sorted last.
- Frontend: 61 unit tests passed. The pre-existing nine type errors in CRM layout
  touch handling and stand-v2 remain outside this integration.
