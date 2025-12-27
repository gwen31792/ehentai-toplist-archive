## AI Coding Agent Guide (Concise, Project-Specific)

Next.js 15 + React 19 archive for E-Hentai toplists with bilingual UI, deployed through `@opennextjs/cloudflare` onto Cloudflare Workers; data persists in D1 via the shared Drizzle package.
### Architecture snapshot
- Nx workspace hosting `apps/web` (Next App Router edge site), `apps/crawler` (scheduled worker), and `packages/db` (Drizzle schema/types).
- Daily crawler writes toplist rows into per-year tables (`toplist_items_2023|2024|2025|2026`) plus `galleries`; UI fetches `/api/data` to join and render via a TanStack table.
- OpenNext config (`apps/web/open-next.config.ts`) enables Cloudflare incremental cache; remote bindings activate in `next.config.ts` through `initOpenNextCloudflareForDev`.
### Runtime guardrails
- Cloudflare Workers runtime only: no Node.js APIs (fs, crypto callbacks, etc.); database binding is `env.DB`.
- Always create the server client with `createDbClient(getCloudflareContext().env)`; never instantiate Drizzle directly.
- Remote images must match `https://ehgt.org/**`; extend `next.config.ts` before adding new hosts.
- shadcn primitives under `src/components/ui/**` are vendor code—wrap or extend them elsewhere.
### Build & dev workflows
- Root Nx targets: `pnpm nx dev web`, `pnpm nx build web`, `pnpm nx lint web`, `pnpm nx typecheck web`; append `crawler` or `db` for other projects.
- App-local scripts (`apps/web/package.json`): `pnpm dev`, `pnpm build`, `pnpm lint:fix`, `pnpm preview`, `pnpm deploy`, `pnpm cf-typegen` (regenerate `cloudflare-env.d.ts` when bindings change).
- Crawler worker: `pnpm nx dev crawler` (wrangler dev) and `pnpm nx deploy crawler`.
- After touching `packages/db`, run `pnpm nx build db` so downstream packages pick up the updated types.
### Web app implementation notes
- `src/app/page.tsx` uses Next 15 async `cookies()`/`headers()` to detect locale and redirect to `/${locale}`; respect this dynamic entrypoint.
- `src/app/[locale]/layout.tsx` awaits `params` (now a Promise) and wires `NextIntlClientProvider`; locale routing lives in `src/i18n`.
- API route `app/api/data/route.ts` validates `list_date`/`period_type`, resolves the yearly table via `getToplistItemsTableByYear`, strips duplicate columns with `getTableColumns`, and inner-joins `galleries`.
- `components/data-table.tsx` drives filtering/pagination via `@tanstack/react-table`, persists column sizing/visibility and page size in `localStorage`, and provides OR/AND tag filtering through `TableHeaderControls`.
### i18n & UI conventions
- Locale-aware navigation uses the helper `Link` from `lib/navigation`; `LanguageSelector` syncs `NEXT_LOCALE` cookie plus `localStorage`.
- Copy lives in `apps/web/messages/{en,zh}.json`; add new keys in both files and update component translation namespaces.
- Styling relies on Tailwind + shadcn tokens; utility `cn` from `lib/utils` merges classes.
### Database package
- Schema files reside in `packages/db/src/schema`; supported years are hard-coded in `SUPPORTED_TOPLIST_YEARS`.
- Adding a new partition year requires updating that array, extending `toplistItemsTables`, rebuilding the package, and ensuring seeds exist.
- Shared types (`Gallery`, `QueryResponseItem`, `ToplistType`) are exported here and re-exported via `apps/web/src/lib/types.ts`.
### Crawler worker specifics
- `apps/crawler/src/index.ts` schedules 16 toplist page fetches (per period + pagination) with 1 s gaps; hitting a 451 with GB trace throws `AbortCrawlError` to stop the run.
- External requests route through the `FetchProxy` Durable Object (`FETCH_DO` binding) so `cfFetch` forces APAC egress and disables cache.
- `crawler.ts` parses HTML with Cheerio, batches upserts into `galleries`, and batches inserts into the year-specific toplist table (re-derived from `list_date`).
### Troubleshooting & gotchas
- Empty responses usually mean the D1 snapshot lacks that date/year or `period_type`; confirm the crawler populated the corresponding table.
- Update `cloudflare-env.d.ts` whenever bindings change (`pnpm cf-typegen`); stale types cause TS errors.
- Client fetches use `{ cache: 'force-cache' }`; prefer server/API-side invalidation rather than tweaking UI state caching.
- ESLint ignores generated/vendor folders; add new lint exclusions in `eslint.config.js` if needed.
### Key references
- Web API/data flow: `apps/web/src/app/api/data/route.ts`, `apps/web/src/components/data-table.tsx`
- i18n + routing: `apps/web/src/i18n/*`, `apps/web/src/app/[locale]/**`
- Database schema/types: `packages/db/src`
- Worker crawler: `apps/crawler/src/{index,crawler,utils}.ts`
