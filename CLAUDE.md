# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 + React 19 的 E-Hentai Toplist 历史数据展示网站，使用 Nx monorepo 架构管理。项目部署在 Cloudflare Workers 上，使用 D1 数据库存储数据。

## 开发环境设置

所有命令都在根目录执行，使用 `pnpm nx <target> <project>` 格式：

```bash
# Web 应用开发
pnpm nx dev web              # 运行开发服务器（使用 Turbopack）
pnpm nx build web            # 构建生产版本
pnpm nx lint web             # 运行 lint 检查
pnpm nx typecheck web        # 类型检查

# Crawler 应用开发
pnpm nx dev crawler          # 运行爬虫开发服务器
pnpm nx deploy crawler       # 部署爬虫到 Cloudflare

# 数据库包
pnpm nx build db             # 构建 db 包（修改 schema 后必须执行）

# Web 应用特定命令（需要在 apps/web 目录下执行）
cd apps/web
pnpm cf-typegen              # 生成 Cloudflare 环境类型
pnpm preview                 # 预览 Cloudflare Worker 构建
pnpm deploy                  # 部署到 Cloudflare
cd ../..
```

## 项目架构

### Monorepo 结构
- 使用 Nx 管理 monorepo，所有命令使用 `pnpm nx <target> <project>` 格式
- `apps/web/`: Next.js 前端应用
- `apps/crawler/`: Cloudflare Worker 爬虫应用
- `packages/db/`: 共享数据库 schema 和客户端（TypeScript 库）
- 项目配置在根目录的 `nx.json`

### 技术栈
React 19 + Next.js 15 | Tailwind CSS + shadcn/ui | Drizzle ORM + Cloudflare D1 | next-intl (中英双语) | 部署到 Cloudflare Workers (通过 @opennextjs/cloudflare)

## 数据库架构

### 表结构
- `galleries`: 主要画廊信息表
- `toplist_items_YYYY`: 按年分区的排行榜数据表（如 `toplist_items_2023`, `toplist_items_2024`）

### 数据访问模式
`@ehentai-toplist-archive/db` 包提供统一的数据库客户端和 schema：

```typescript
import { createDbClient } from '@ehentai-toplist-archive/db'

const db = createDbClient(getCloudflareContext().env)
```

注意：`packages/db` 是 TypeScript 库包，修改后需要运行 `pnpm nx build db` 重新编译才能在 web 和 crawler 应用中生效。

### 添加新年份分区
1. 在 `packages/db/src/schema/toplist-items.ts` 中扩展 `SUPPORTED_TOPLIST_YEARS` 数组
2. 在 `toplistItemsTables` 对象中添加新年份映射（如 `2026: createToplistItemsTable(2026)`）
3. 重新构建 db 包：`pnpm nx build db`
4. 确认 `apps/web/src/app/api/data/route.ts` 能通过 `getToplistItemsTableByYear` 读取新年份

## 重要开发约定

### 组件开发
- 不要修改 `src/components/ui/` 下的 shadcn/ui 基础组件，需要自定义时创建包装组件
- 表格使用 `@tanstack/react-table`，列设置持久化在 localStorage

### API 开发
- 数据查询逻辑只能在 API 路由中实现，不要在组件中直接访问数据库
- API 端点: `GET /api/data?list_date=YYYY-MM-DD&period_type=day|month|year|all`
- 客户端使用 `{ cache: 'force-cache' }` 缓存，优先在服务端/API 做失效处理

### URL 参数和状态管理
- 日期和周期类型通过 URL 参数管理: `/[locale]?date=YYYY-MM-DD&period_type=day|month|year|all`
- 参数验证工具: `apps/web/src/lib/url-params.ts`
- Next.js 15 要求 `useSearchParams` 必须包裹在 Suspense 边界中
- 参数默认值：`date` 默认为今天（UTC），`period_type` 默认为 `'day'`
- 日期范围：2023-11-15 至今天

### 类型安全
- 修改 `packages/db` 后必须运行 `pnpm nx build db` 重新构建
- Cloudflare 环境类型：在 `apps/web` 目录运行 `pnpm cf-typegen` 生成
- 远程图片只允许 `ehgt.org` 域名（配置在 `next.config.ts` 的 `remotePatterns`）

### Next.js 15 特殊处理
- `page.tsx` 使用 async `cookies()`/`headers()` 检测 locale
- `[locale]/layout.tsx` 必须 await `params`（现在是 Promise）
- OpenNext 配置在 `apps/web/open-next.config.ts`，开发时通过 `initOpenNextCloudflareForDev` 激活远程绑定

## Crawler 工作原理

- 通过 Cloudflare Queue 触发，入口在 `apps/crawler/src/index.ts`
- 三个定时任务：1:00 抓 toplist、10:00 更新 gallery 详情、13:00 抓 tags 翻译
- 外部请求通过 `FetchProxy` Durable Object (`FETCH_DO` 绑定) 代理，强制 APAC 出口并禁用缓存
- 遇到 451 + GB trace 时抛出 `AbortCrawlError` 停止运行
- 使用 Cheerio 解析 HTML，批量 upsert 到 `galleries` 和年份分区表

## 运行时约束

- Cloudflare Workers 环境，只能使用 Edge Runtime
- 禁止 Node.js 特定 API（fs, crypto 回调等）
- 数据库绑定名称为 `DB`（配置在各应用的 `wrangler.toml`）
- 始终使用 `createDbClient(getCloudflareContext().env)` 创建数据库客户端，不要直接实例化 Drizzle

## 常见问题排查

- **数据为空**: 检查 `list_date` 年份是否有对应分区表，确认 `period_type` 拼写正确
- **TypeScript 报错**: 运行 `pnpm cf-typegen` 更新 Cloudflare 环境类型
- **db 包修改后应用未生效**: 运行 `pnpm nx build db` 重新构建
- Nx 会自动处理构建依赖（`dependsOn: ["^build"]`）

## 关键文件

- Web API/数据流: `apps/web/src/app/api/data/route.ts`, `apps/web/src/components/data-table.tsx`
- i18n/路由: `apps/web/src/i18n/*`, `apps/web/src/app/[locale]/**`
- 数据库 schema: `packages/db/src/schema/*`
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