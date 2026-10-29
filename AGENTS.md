# AGENTS.md

本文件为 AI 编程助手在本仓库中工作提供指引。

## 项目概述

E-Hentai Toplist 历史数据展示网站。Next.js 16 + React 19，Nx monorepo，部署到 Cloudflare Workers，D1 数据库。

## 开发命令

所有命令在根目录执行，Nx 命令统一使用 `pnpm nx`，格式 `pnpm nx <target> <project>`（也可以写成 `pnpm nx run web:build`）：

```bash
# Web 应用
pnpm nx dev web              # 开发服务器（Turbopack）
pnpm nx build web            # 生产构建
pnpm nx lint web             # Lint 检查
pnpm nx typecheck web        # 类型检查

# Crawler
pnpm nx dev crawler          # 爬虫开发服务器
pnpm nx deploy crawler       # 部署到 Cloudflare
pnpm nx cf-typegen crawler   # 生成 Workers 类型（typecheck 会先自动执行）

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

技术栈：React 19 + Next.js 16 | Tailwind + shadcn/ui | Drizzle ORM + D1 | next-intl | @opennextjs/cloudflare

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

### 代码注释
- 对较长函数、非显而易见的生命周期/状态同步/持久化逻辑，至少在函数入口或关键代码块前保留一行说明性注释，说明这段代码解决什么问题或为什么需要这样做
- 函数内部如果出现类似较长或复杂的分支、异步守卫、跨环境兼容逻辑，也应添加一行说明；避免只复述代码字面行为的空注释

### 组件
- 不要修改 `src/components/ui/` 下的 shadcn/ui 组件，需要自定义时创建包装组件
- 表格使用 `@tanstack/react-table`，`TableHeaderControls` 提供 OR/AND tag 过滤
- 列设置持久化在 localStorage

### 前端 UI
- 默认不要新增 ARIA 相关属性或文案，例如 `aria-label`、`aria-describedby`；除非用户明确要求，否则保持界面实现中不包含 ARIA 相关内容

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
- Workers 类型（web 的 `cloudflare-env.d.ts`、crawler 的 `worker-configuration.d.ts`）由 `wrangler types` 根据 wrangler 配置和已安装的 wrangler 版本生成，不提交到 git
- `typecheck` 依赖 `cf-typegen`，每次先重新生成类型再检查；绑定、compatibility date 或 wrangler 版本变化后直接跑 typecheck 即可
- 远程图片只允许 `ehgt.org`（配置在 `next.config.ts` 的 `remotePatterns`）

### Next.js 注意
- `page.tsx` 使用 async `cookies()`/`headers()`
- `[locale]/layout.tsx` 必须 await `params`（现在是 Promise）
- OpenNext 配置在 `apps/web/open-next.config.ts`

## Crawler 工作原理

- 入口：`apps/crawler/src/index.ts`，通过 Cloudflare Queue 触发
- 定时任务：`scheduled()` 按 cron 向队列投递消息，由 `queue()` 消费执行；目前有 toplist 抓取、gallery 详情更新、tags 翻译抓取、预览图尺寸同步四类，触发时间以 `apps/crawler/wrangler.jsonc` 的 `triggers.crons` 为准
- 修改 `apps/crawler/wrangler.jsonc` 里的 cron 触发时间时，必须同步修改 `apps/crawler/src/index.ts` 中基于 `controller.cron` 的任务分发 `case`；否则 Wrangler 会按新时间触发 Worker，但代码不会把该 cron 映射到对应队列任务。
- 外部请求通过 `FetchProxy` Durable Object 代理，强制 APAC 出口
- 遇到 451 + GB trace 时抛出 `AbortCrawlError` 停止运行
- 使用 Cheerio 解析 HTML，批量 upsert 到 D1

## 运行时约束

- Cloudflare Workers Edge Runtime：禁止 Node.js API（fs, crypto 回调等）
- 数据库绑定名称 `DB`（配置在各应用的 `wrangler.jsonc`）
- 始终用 `createDbClient(getCloudflareContext().env)` 创建数据库客户端

## 常见问题

- **数据为空**: 检查年份是否有对应分区表，确认 `period_type` 拼写
- **TypeScript 报错**: `pnpm nx cf-typegen <project>` 重新生成 Cloudflare 类型
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

## Git 约定

- 修改代码时不要把进行中的修改自动加入 Git 暂存区；除非用户明确要求执行 Git 相关命令，否则不要运行 `git add`。

### Commit Message 规范
- 优先使用 Conventional Commits 格式：`type(scope): summary`
- 默认使用仓库里已经在用的类型：`feat`、`fix`、`refactor`、`chore`、`docs`；仅在明确是性能优化时使用 `perf`
- 当改动明确只涉及某个项目或模块时，建议加上 scope。仓库里常见的 scope 包括 `crawler`、`web`、`db`、`nx`、`date-picker`
- `summary` 尽量使用简体中文，产品名、库名、框架名和技术关键词保留原文
- `summary` 保持单行，描述要具体、直接、偏动作导向，通常不加句号
- 一个 commit 只表达一个主要意图；如果包含几处相关改动，优先概括最核心的用户可见变化或架构变化
- 如果需要补充上下文，可以在标题下空一行，再用简短正文说明原因、影响范围或后续注意事项
- 推荐使用具体表达，例如 `feat(crawler): 增加 gallery 详细信息解析`、`fix(web): 修复表格列设置切换无效及状态不同步问题`、`chore: 升级 Next.js 至 16.0.7`

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->
