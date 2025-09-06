# AI Coding Agent Guide

This repo is a React 19 + Next.js 15 app on Cloudflare Pages (Edge). It archives E‑Hentai toplists with bilingual UI (en/zh).

## Non‑negotiables
- Edge only: every page and API route exports `export const runtime = 'edge'` (see `src/app/**` and `src/app/api/data/route.ts`).
- Worker environment: no Node APIs (fs, net). Use `@cloudflare/next-on-pages` and `getRequestContext().env.DB` for D1.
- Do not edit base shadcn/ui in `src/components/ui/**`; add or wrap via `src/components/**`.

## Run, build, deploy
- Dev (recreates local DB and CF types): `pnpm dev`
- Fix lint: `pnpm lint:fix`
- Preview Cloudflare build locally: `pnpm preview`
- Deploy to Cloudflare Pages: `pnpm deploy`
- One‑offs: `pnpm generate-db` (executes `src/db/mock.sql` to D1 local), `pnpm generate-types` (Workers types), `pnpm pages:build` (adapter build)

## Data model and queries
- Cloudflare D1 (SQLite) + Drizzle ORM.
- Year‑partitioned toplist tables: `toplist_items_2023|2024|2025`; gallery master: `galleries`.
- API picks the toplist table by year from `list_date` (YYYY‑MM‑DD) via `tableMap` and joins `galleries` on `gallery_id`.
- Use `getTableColumns(table)` to spread columns; exclude `list_date`/`period_type` from select when joining; order by `rank`.
	- Reference: `src/app/api/data/route.ts`, `src/db/schema.ts`.

## API contract (read‑only)
- GET `/api/data?list_date=YYYY-MM-DD&period_type=day|month|year|all`
- Returns array of `{...Gallery, rank}` (see `src/lib/types.ts`: `Gallery`, `QueryResponseItem`).
- Responses are cached on the client fetch with `{ cache: 'force-cache' }`.

## App data flow and UI
- Client components only (no SSR for listing). `src/app/page.tsx` stores `language` in `localStorage`, fetches data on date/type change, and renders `DataTable`.
- Key components: `DatePicker`, `TypeSelect`, `DataTable`, `LanguageSelector`, `ThemeToggle`, `GitHubLink`, `ImageWithSkeleton`.
- Tailwind CSS v4 + shadcn/ui. Remote images allowed: `https://ehgt.org` (`next.config.mjs`).

## Add support for a new year
1) Add `toplistItems{YEAR}Table` in `src/db/schema.ts`.
2) Add that table to `tableMap` in `src/app/api/data/route.ts`.
3) Seed local dev by extending `src/db/mock.sql`, then run `pnpm generate-db`.

## File map to start from
- API: `src/app/api/data/route.ts` (Edge handler; D1 via `drizzle(getRequestContext().env.DB)`)
- Schema and seed: `src/db/schema.ts`, `src/db/mock.sql`
- Types: `src/lib/types.ts` (`Language`, `ToplistType`, `Gallery`, `QueryResponseItem`)
- App shell and pages: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/about/page.tsx`
- UI: `src/components/**` (business) vs `src/components/ui/**` (base)

Tip: if data appears empty, ensure the year in `list_date` maps to a defined toplist table and the mock data covers that date.
