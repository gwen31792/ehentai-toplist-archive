# AI Coding Agent Instructions (Repo-Specific)

## Big picture
- Nx monorepo: `apps/web` (Next.js App Router on Cloudflare Workers), `apps/crawler` (scheduled/queue Worker), `packages/db` (Drizzle schema + shared Zod/types).
- Data flow: crawler writes `galleries` + yearly partitions `toplist_items_YYYY`; web serves `GET /api/data` to join and render in a TanStack table.

## Cloudflare runtime guardrails
- Workers runtime only (web + crawler): avoid Node.js APIs; prefer Web Platform APIs.
- Never cache cross-request bindings/clients: in the crawler always build DB/DO stubs from the current `env` (see `apps/crawler/src/utils.ts`).

## Database access patterns
- Web (API routes): always use `createDbClient(getCloudflareContext().env)` (see `apps/web/src/app/api/data/route.ts`).
- Crawler: use `getDbClient(env)` (wraps `createDbClient(env)`), and keep writes batched to reduce D1 timeouts.
- Year partitions: resolve with `getToplistItemsTableByYear(list_date)`; inputs are date strings like `YYYY-MM-DD`.

## Crawler networking + scheduling
- External requests MUST go through the Durable Object proxy (`FETCH_DO`) for APAC egress: use `cfFetch`/`ehentaiFetch` in `apps/crawler/src/utils.ts`.
- Scheduler enqueues queue messages; consumers run handlers (see `apps/crawler/src/index.ts`).
- Toplist crawl runs 16 URLs (4 pages × 4 periods) with 5s gaps; temporary ban triggers a delayed retry (see `apps/crawler/src/crawl-toplist.ts`).

## Web app conventions
- Locale entrypoint: root redirects by `NEXT_LOCALE` cookie → `Accept-Language` (see `apps/web/src/app/page.tsx`).
- Next 15: `[locale]/layout.tsx` must `await params` and calls `setRequestLocale` (see `apps/web/src/app/[locale]/layout.tsx`).
- OpenNext on Workers: config in `apps/web/open-next.config.ts`, dev wiring via `initOpenNextCloudflareForDev()` in `apps/web/next.config.ts`.
- i18n strings live in `apps/web/messages/en.json` + `apps/web/messages/zh.json`.
- Remote images are restricted to `https://ehgt.org/**` (see `apps/web/next.config.ts`).
- `apps/web/src/components/ui/**` is shadcn vendor code—wrap it instead of editing directly.

## Validation & types

**Web 应用**：使用简单函数验证 URL/API 参数（`apps/web/src/lib/url-params.ts`），无效参数静默 fallback 到默认值。不使用 Zod，因为 URL 参数需要"宽容"处理。

**Crawler**：使用 Zod 验证外部 HTML 解析结果（`apps/crawler/src/schemas.ts`），解析失败抛出明确错误。

添加新年份需要更新：
- `packages/db/src/schema/toplist-items.ts`（`SUPPORTED_TOPLIST_YEARS` + `toplistItemsTables`）
- 然后运行 `pnpm nx build db`

## Dev workflows
- Prefer Nx targets from repo root: `pnpm nx dev web`, `pnpm nx build web`, `pnpm nx lint web`, `pnpm nx typecheck web`, `pnpm nx dev crawler`, `pnpm nx deploy crawler`, `pnpm nx build db`.
- If Cloudflare bindings change, regenerate types in `apps/web`: `pnpm cf-typegen`.
