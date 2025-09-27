## AI Coding Agent Guide (Concise, Project‑Specific)

Next.js 15 + React 19 app archiving E‑Hentai toplists with bilingual UI (en/zh). Deployed to Cloudflare Workers via `@opennextjs/cloudflare`; data in D1 (SQLite) via Drizzle. Nx monorepo; main app is `apps/web`.

### 1) Environment & Hard Rules
- Cloudflare Workers runtime only; D1 bound as `DB` (see `apps/web/wrangler.toml`).
- Server DB pattern: `const db = createDbClient(getCloudflareContext().env)` from the shared DB package.
- Do NOT edit shadcn/ui primitives in `src/components/ui/**`; add wrappers/new components.
- Remote images must match `apps/web/next.config.ts` (`ehgt.org`). Avoid other domains.
- Edge runtime: avoid Node APIs (fs, crypto callbacks, etc.).

### 2) Dev Workflow (apps/web)
- Start dev: `pnpm dev`; build: `pnpm build`; lint fix: `pnpm lint:fix`.
- Legacy mock seeding was removed; rely on fresh D1 snapshots from `apps/web/scripts/` when needed.
- Generate Cloudflare env types -> `cloudflare-env.d.ts`: `pnpm cf-typegen`.
- Preview Worker build: `pnpm preview`; deploy: `pnpm deploy`.
- Optional via Nx (from repo root): `nx dev web | nx build web | nx lint web`.

### 3) Data Model & Query Pattern
- Tables: `galleries` + yearly `toplist_items_2023|2024|2025`, defined in `@ehentai-toplist-archive/db`.
- API (`src/app/api/data/route.ts`) obtains the correct table via `getToplistItemsTableByYear(list_date)` and strips `list_date`/`period_type` before selecting; joins `galleries` on `gallery_id`, filters by `list_date` & `period_type`, orders by `rank`.
- Response merges gallery fields + `rank`. Domain types (`Gallery`, `QueryResponseItem`, `ToplistType`) live in the shared DB package and are re-exported through `apps/web/src/lib/types.ts`.
- `period_type` enum: `all|year|month|day`.

### 4) API Contract
GET `/api/data?list_date=YYYY-MM-DD&period_type=day|month|year|all` → JSON array. Client fetch uses `{ cache: 'force-cache' }`.

### 5) UI, i18n & State
- Root `src/app/page.tsx` (server) detects/canonicalizes locale then redirects to `/${locale}`.
- `src/app/[locale]/page.tsx` is client; orchestrates date/type state, fetches `/api/data`, persists language via `LanguageSelector` (cookie `NEXT_LOCALE` + localStorage).
- i18n: `next-intl` with plugin in `next.config.ts`; messages in `apps/web/messages/{en,zh}.json`.

### 6) Adding a New Year Partition
1. Extend `SUPPORTED_TOPLIST_YEARS` (and tables map) in `packages/db/src/schema/toplist-items.ts`.
2. Rebuild the shared package: `pnpm nx build db` (or rely on Nx graph tasks).
3. Confirm `apps/web/src/app/api/data/route.ts` handles the new year via `getToplistItemsTableByYear`.

### 7) Conventions & Gotchas
- Year strictly from `list_date` prefix (YYYY-); validate upstream if extending.
- Always strip `list_date`/`period_type` to avoid duplicate keys in select.
- Keep caching outside UI (edge cache/KV) if expanded; current UI relies on fetch caching.
- Respect image remotePatterns or runtime fetch will fail.

### 8) Key Files (apps/web/src)
- API: `app/api/data/route.ts`  | DB schema/types: `@ehentai-toplist-archive/db`
- Types: `lib/types.ts`  | i18n: `i18n/{routing.ts,request.ts}`, `messages/*.json`
- App pages: `app/page.tsx` (redirect), `app/[locale]/page.tsx` (client UI)
- UI primitives (do not modify): `components/ui/**`

When data seems empty: ensure the year’s table exists, seed has the date+period row, and `period_type` is spelled correctly.
