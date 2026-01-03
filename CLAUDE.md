# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

E-Hentai Toplist 历史数据展示网站。Next.js 15 + React 19，Nx monorepo，部署到 Cloudflare Workers，D1 数据库。

## 开发命令

所有命令在根目录执行，格式 `pnpm nx <target> <project>`：

```bash
# Web 应用
pnpm nx dev web              # 开发服务器（Turbopack）
pnpm nx build web            # 生产构建
pnpm nx lint web             # Lint 检查
pnpm nx typecheck web        # 类型检查

# Crawler
pnpm nx dev crawler          # 爬虫开发服务器
pnpm nx deploy crawler       # 部署到 Cloudflare

# 数据库包（修改 schema 后必须执行）
pnpm nx build db

# Web 特定命令（apps/web 目录下）
cd apps/web
pnpm cf-typegen              # 生成 Cloudflare 环境类型
pnpm preview                 # 预览构建
pnpm deploy                  # 部署
```

## 项目架构

```
apps/web/        → Next.js 前端（Edge Runtime）
apps/crawler/    → Cloudflare Worker 爬虫
packages/db/     → 共享数据库 schema、类型、Zod 验证
```

技术栈：React 19 + Next.js 15 | Tailwind + shadcn/ui | Drizzle ORM + D1 | next-intl | @opennextjs/cloudflare

## 数据库

### 表结构
- `galleries`: 画廊信息
- `toplist_items_YYYY`: 按年分区的排行榜数据（2023、2024、2025...）

### 数据访问
```typescript
import { createDbClient } from '@ehentai-toplist-archive/db'
const db = createDbClient(getCloudflareContext().env)
```

### 添加新年份分区
1. `packages/db/src/schema/toplist-items.ts` 扩展 `SUPPORTED_TOPLIST_YEARS`
2. `toplistItemsTables` 添加新年份映射
3. `pnpm nx build db` 重新构建

## 数据验证

项目使用 Zod 进行数据验证，schema 统一在 `packages/db/src/zod/` 定义并导出：
- `dateStringSchema` - 日期字符串验证（YYYY-MM-DD 格式）
- `periodTypeSchema` - 周期类型验证
- `galleryInsertSchema` - Gallery 插入数据验证（drizzle-zod 生成）

Web 应用的参数验证在 `apps/web/src/lib/validators/`。

### Zod 使用原则

**边界层**（接触 unknown 的地方）用 schema 解析/校验：
- HTTP 请求参数（API route 入口）
- URL 查询参数（`searchParams.get()` 返回 unknown）
- 外部 HTML 解析结果（Cheerio 解析）
- 第三方 API 响应（GitHub API 等）

**业务层**拿到已校验的数据后，使用 TypeScript 类型，不要反复 parse：
```typescript
// ✅ 正确：边界层验证一次，后续用类型
const result = schema.safeParse(unknownData)
if (result.success) {
  doSomething(result.data)  // result.data 已有类型，不再 parse
}

// ❌ 错误：业务层反复 parse
function processData(data: ValidatedType) {
  schema.parse(data)  // 多余，data 已经是校验过的类型
}
```

## 开发约定

### 组件
- 不要修改 `src/components/ui/` 下的 shadcn/ui 组件，需要自定义时创建包装组件
- 表格使用 `@tanstack/react-table`，`TableHeaderControls` 提供 OR/AND tag 过滤
- 列设置持久化在 localStorage

### API
- 数据查询只在 API 路由中实现，不在组件中直接访问数据库
- API: `GET /api/data?list_date=YYYY-MM-DD&period_type=day|month|year|all`
- 客户端使用 `{ cache: 'force-cache' }`，优先在服务端做缓存失效

### URL 参数
- 路由: `/[locale]?date=YYYY-MM-DD&period_type=day|month|year|all`
- `useSearchParams` 必须包裹在 Suspense 边界中（Next.js 15）
- 默认值：`date` = 今天（UTC），`period_type` = `'day'`
- 日期范围：2023-11-15 至今天

### i18n
- 翻译文件：`apps/web/messages/{en,zh}.json`
- Locale 导航使用 `lib/navigation` 的 `Link`
- `LanguageSelector` 同步 `NEXT_LOCALE` cookie 和 localStorage

### 类型安全
- 修改 `packages/db` 后必须 `pnpm nx build db`
- 绑定变更后运行 `pnpm cf-typegen` 更新 `cloudflare-env.d.ts`
- 远程图片只允许 `ehgt.org`（配置在 `next.config.ts` 的 `remotePatterns`）

### Next.js 15 注意
- `page.tsx` 使用 async `cookies()`/`headers()`
- `[locale]/layout.tsx` 必须 await `params`（现在是 Promise）
- OpenNext 配置在 `apps/web/open-next.config.ts`

## Crawler 工作原理

- 入口：`apps/crawler/src/index.ts`，通过 Cloudflare Queue 触发
- 定时任务：1:00 抓 toplist、10:00 更新 gallery 详情、13:00 抓 tags 翻译
- 外部请求通过 `FetchProxy` Durable Object 代理，强制 APAC 出口
- 遇到 451 + GB trace 时抛出 `AbortCrawlError` 停止运行
- 使用 Cheerio 解析 HTML，批量 upsert 到 D1

## 运行时约束

- Cloudflare Workers Edge Runtime：禁止 Node.js API（fs, crypto 回调等）
- 数据库绑定名称 `DB`（配置在 `wrangler.toml`）
- 始终用 `createDbClient(getCloudflareContext().env)` 创建数据库客户端

## 常见问题

- **数据为空**: 检查年份是否有对应分区表，确认 `period_type` 拼写
- **TypeScript 报错**: `pnpm cf-typegen` 更新 Cloudflare 环境类型
- **db 包修改后未生效**: `pnpm nx build db`
- **ESLint 配置**: `eslint.config.js`

## 关键文件

- Web API: `apps/web/src/app/api/data/route.ts`
- 数据表格: `apps/web/src/components/data-table.tsx`
- i18n: `apps/web/src/i18n/*`, `apps/web/messages/`
- 数据库 schema: `packages/db/src/schema/*`
- Zod 验证: `packages/db/src/zod/*`
- 爬虫: `apps/crawler/src/{index,crawl-toplist,update-gallery}.ts`

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors


<!-- nx configuration end-->