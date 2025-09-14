## AI Coding Agent Guide (Concise, Project‑Specific)

Edge‑deployed Next.js 15 + React 19 app archiving E‑Hentai toplists with bilingual (en/zh) UI. Runs on Cloudflare Workers via `@opennextjs/cloudflare`; data in D1 (SQLite) accessed through Drizzle.

### 1. Environment & Hard Rules
- Always assume Cloudflare Workers runtime; D1 bound as `DB` (see `wrangler.toml`).
- DB access pattern (server only): `const db = drizzle(getCloudflareContext().env.DB)`.
- Never edit base shadcn/ui primitives in `src/components/ui/**`; add wrappers/new components beside them.
- Remote images must match `next.config.ts` (`ehgt.org`). Reject/avoid other domains.
- Edge runtime only: avoid Node APIs (fs, crypto random callbacks, etc.).

### 2. Dev Workflow
- Start dev (OpenNext adapter + Next): `pnpm dev`.
- Lint & autofix (src only): `pnpm lint:fix`.
- Seed / reset local D1 from `src/db/mock.sql`: `pnpm generate-db` (idempotent for dev refresh).
- Generate Cloudflare env types -> `cloudflare-env.d.ts`: `pnpm cf-typegen` (run after binding changes).
- Preview Worker build locally: `pnpm preview`.
- Deploy (Cloudflare Worker): `pnpm deploy`.

### 3. Data & Query Pattern
- Tables: master `galleries`; year‑partitioned `toplist_items_2023|2024|2025` (one per calendar year for toplist rows).
- Query (see `src/app/api/data/route.ts`): derive year from `list_date`; switch to select correct table; destructure columns to omit duplicate join keys:
  `const { list_date, period_type, ...rest } = getTableColumns(toplistItemsTable)` then join with `galleries` on `gallery_id`, filter by `list_date` & `period_type`, order by `rank`.
- Returned shape merges gallery fields plus `rank`; types: `Gallery`, `QueryResponseItem` in `src/lib/types.ts`.

### 4. API Contract
Endpoint: `GET /api/data?list_date=YYYY-MM-DD&period_type=day|month|year|all` → JSON array of merged records. Client fetch uses `{ cache: 'force-cache' }` in `src/app/page.tsx` for light caching.

### 5. UI / State Flow
- `page.tsx` is client component orchestrating: selected date, toplist type, language (persisted in `localStorage`).
- Core components: `DatePicker`, `TypeSelect`, `DataTable` (TanStack), `LanguageSelector`, `ThemeToggle`, `GitHubLink`, `ImageWithSkeleton`, plus table helpers (`table-header-controls`, `table-pagination`).
- Do not embed DB logic in components; keep data access inside API routes.

### 6. Adding a New Year Partition
1. Add `toplistItems{YEAR}Table` in `src/db/schema.ts` mirroring existing shape.
2. Extend switch in `src/app/api/data/route.ts` for that year.
3. Append seed rows to `src/db/mock.sql`; run `pnpm generate-db`.
4. (Optional) Backfill production D1 separately (manual / external ingestion not in this repo).

### 7. Conventions & Gotchas
- Year derived strictly from `list_date` string prefix (YYYY-); ensure input validation upstream if extending API.
- `period_type` limited to `all|year|month|day`; keep enum in sync if introducing new period types.
- Avoid leaking `list_date` / `period_type` duplicates in select: always strip them when spreading toplist columns.
- Keep any future caching layer outside UI first (edge cache / KV) — current code trusts simple fetch caching.
- For new image handling, respect remotePatterns; otherwise build will warn/fail at runtime fetch.

### 8. Key Files
- API route: `src/app/api/data/route.ts`
- DB schema & seed: `src/db/schema.ts`, `src/db/mock.sql`
- Types: `src/lib/types.ts`
- Root layout & main page: `src/app/layout.tsx`, `src/app/page.tsx`
- UI primitives (do not modify): `src/components/ui/**`

### 9. When Data Seems Empty
Check: (a) `list_date` year has corresponding partition table; (b) seed contains that date+period row; (c) correct `period_type` spelling.

---
If adding tooling, infra bindings, or a new period granularity, document it here after implementation so future agents remain accurate.
