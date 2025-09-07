## AI Coding Agent Guide

This is a React 19 + Next.js 15 app running on Cloudflare Pages (Edge) via OpenNext Cloudflare. It archives E‑Hentai toplists with a bilingual UI (en/zh).

## Non‑negotiables
- Edge runtime only. Assume Cloudflare Workers environment; avoid Node built‑ins (fs, net). `wrangler.toml` binds D1 as `DB`.
- Use `@opennextjs/cloudflare` in server code. Access D1 with `drizzle(getCloudflareContext().env.DB)` (see `src/app/api/data/route.ts`).
- Do not modify base shadcn/ui in `src/components/ui/**`; add new components or wrappers in `src/components/**`.
- Images must match `next.config.ts` remote pattern (`ehgt.org`).

## Dev, build, deploy
- Start dev (OpenNext dev + Next): `pnpm dev`
- Lint fix (src only): `pnpm lint:fix`
- Seed local D1 from `src/db/mock.sql`: `pnpm generate-db`
- Generate Cloudflare Workers types to `cloudflare-env.d.ts`: `pnpm cf-typegen`
- Preview Cloudflare build locally: `pnpm preview`
- Deploy to Cloudflare Pages: `pnpm deploy`

## Data model and query pattern
- Storage: Cloudflare D1 (SQLite) + Drizzle ORM (`drizzle-orm/d1`).
- Tables: `galleries` (master) and year‑partitioned `toplist_items_2023|2024|2025`.
- Selection pattern (see `src/app/api/data/route.ts`):
	- Pick toplist table by year from `list_date` via `tableMap`.
	- Spread columns with `getTableColumns(toplistTable)` and drop `list_date`/`period_type` when joining:
		`const { list_date, period_type, ...rest } = getTableColumns(toplistTable)`.
	- Join `galleries` on `gallery_id`, filter by `list_date` and `period_type`, order by `rank`.

## API contract
- GET `/api/data?list_date=YYYY-MM-DD&period_type=day|month|year|all`
- Returns array of `{...Gallery, rank}` (`src/lib/types.ts`: `Gallery`, `QueryResponseItem`).
- Client fetch uses `{ cache: 'force-cache' }` for simple caching.

## App data flow and UI patterns
- Client‑only listing: `src/app/page.tsx` manages state, stores `language` in `localStorage`, and fetches `/api/data` on date/type changes.
- Key components: `DatePicker`, `TypeSelect`, `DataTable` (TanStack Table), `LanguageSelector`, `ThemeToggle`, `GitHubLink`, `ImageWithSkeleton`.
- Keep business components under `src/components/**`; don’t change primitives in `src/components/ui/**`.

## Add a new toplist year
1) Define `toplistItems{YEAR}Table` in `src/db/schema.ts`.
2) Add it to `tableMap` in `src/app/api/data/route.ts`.
3) Extend `src/db/mock.sql`, then run `pnpm generate-db`.

## Useful references
- API: `src/app/api/data/route.ts`
- Schema/seed: `src/db/schema.ts`, `src/db/mock.sql`
- Types: `src/lib/types.ts` (`Language`, `ToplistType`, `Gallery`, `QueryResponseItem`)
- App shell/pages: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/about/page.tsx`

Tip: If results are empty, check that `list_date` year maps to an existing table and the mock data covers that date.
