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

### Zod 使用场景

Zod schema 在 `packages/db/src/zod/` 定义，**仅用于 Crawler 解析外部数据**：
- `dateStringSchema` - 日期字符串验证（YYYY-MM-DD 格式）
- `periodTypeSchema` - 周期类型验证
- `galleryInsertSchema` - Gallery 插入数据验证（drizzle-zod 生成）

### Web 应用：简单函数优于 Zod

Web 的 URL/API 参数验证使用简单函数（`apps/web/src/lib/url-params.ts`），不使用 Zod。

**原因**：对于 URL 参数，"宽容"比"严格"更合适：
- 用户可能手动修改 URL、书签过期、时区不一致
- 这些是正常情况，不应该导致页面崩溃
- 无效参数静默 fallback 到默认值，用户体验不中断

```typescript
// ✅ Web 应用：宽容处理，无效就用默认值
const parsed = parseDate(dateParam)
const date = validateDateRange(parsed) ? parsed : getUtcToday()

// ❌ 避免：Zod 会把"无效参数"升级为"程序错误"
const result = schema.safeParse(dateStr)  // 验证失败需要额外处理
```

### Crawler：Zod 适合解析外部数据

Crawler 使用 Zod 解析 Cheerio 提取的 HTML 数据，因为：
- 外部数据格式可能变化，需要严格验证
- 解析失败应该抛出明确错误，便于调试

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
- Web 参数验证: `apps/web/src/lib/url-params.ts`
- 数据表格: `apps/web/src/components/data-table.tsx`
- i18n: `apps/web/src/i18n/*`, `apps/web/messages/`
- 数据库 schema: `packages/db/src/schema/*`
- Zod 验证（仅 Crawler 使用）: `packages/db/src/zod/*`
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