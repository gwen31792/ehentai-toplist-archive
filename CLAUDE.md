# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 + React 19 的 E-Hentai Toplist 历史数据展示网站，使用 Nx monorepo 架构管理。项目部署在 Cloudflare Workers 上，使用 D1 数据库存储数据。

## 开发环境设置

### 根级别命令（使用 NX）
```bash
# 运行开发服务器
nx dev web

# 构建应用
nx build web

# 运行 lint 检查
nx lint web

# 类型检查
nx typecheck web
```

### Web 应用特定命令（在 apps/web 目录下）
```bash
# 开发模式（使用 Turbopack）
pnpm dev

# 构建生产版本
pnpm build

# Lint 并自动修复
pnpm lint:fix

# 预览 Cloudflare Worker 构建
pnpm preview

# 部署到 Cloudflare
pnpm deploy

# 生成 Cloudflare 环境类型
pnpm cf-typegen
```

## 项目架构

### Monorepo 结构
- 使用 Nx 管理 monorepo
- 主要应用在 `apps/web/`
- 项目配置在根目录的 `nx.json`

### 技术栈
- **前端**: React 19 + Next.js 15
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: React hooks + localStorage
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **国际化**: next-intl (支持中英文)
- **部署**: Cloudflare Workers (通过 @opennextjs/cloudflare)
- **构建工具**: Nx + Next.js + Turbopack

### 关键目录结构
```
apps/web/src/
├── app/              # Next.js App Router
├── components/       # React 组件
│   └── ui/          # shadcn/ui 基础组件（不要修改）
├── db/              # （已弃用）保留兼容层，实际 schema 位于 packages/db
├── i18n/            # 国际化配置
└── lib/             # 工具函数和类型定义
```

## 数据库架构

### 表结构
- `galleries`: 主要画廊信息表
- `toplist_items_YYYY`: 按年分区的排行榜数据表（如 `toplist_items_2023`, `toplist_items_2024`）

### 数据访问模式
`@ehentai-toplist-archive/db` 包提供 `createDbClient` helper：

```typescript
import { createDbClient } from '@ehentai-toplist-archive/db'

const db = createDbClient(getCloudflareContext().env)
```

### 添加新年份分区
1. 在 `packages/db/src/schema/toplist-items.ts` 中扩展 `SUPPORTED_TOPLIST_YEARS`
2. 更新 `packages/db/src/schema/toplist-items.ts` 中的表映射，并在必要时增加种子抓取脚本
3. 重新构建共享包：`pnpm nx build db`
4. 确认 `apps/web/src/app/api/data/route.ts` 能通过 `getToplistItemsTableByYear` 读取新年份

## 重要开发约定

### 组件开发
- 不要修改 `src/components/ui/` 下的 shadcn/ui 基础组件
- 需要自定义时，创建包装组件或新组件
- 遵循现有的组件结构和命名约定

### API 开发
- 数据查询逻辑只能在 API 路由中实现，不要在组件中直接访问数据库
- API 端点: `GET /api/data?list_date=YYYY-MM-DD&period_type=day|month|year|all`
- 使用 `{ cache: 'force-cache' }` 进行客户端缓存

### 类型安全
- 运行 `pnpm cf-typegen` 生成 Cloudflare 环境类型
- 类型定义在 `src/lib/types.ts`

### 图片处理
- 远程图片必须匹配 `next.config.ts` 中的 `remotePatterns` 配置
- 当前只允许 `ehgt.org` 域名

## 常见问题排查

### 数据为空
1. 检查 `list_date` 年份是否有对应的分区表
2. 检查种子数据是否包含该日期和周期的记录
3. 确认 `period_type` 拼写正确（all|year|month|day）

### 开发环境问题
- 如果 TypeScript 报错，运行 `pnpm cf-typegen` 更新类型定义

## 部署注意事项

- 项目部署在 Cloudflare Workers，只能使用 Edge Runtime
- 避免使用 Node.js 特定 API（如 fs, crypto 回调等）
- 数据库绑定名称为 `DB`（参见 `wrangler.toml`）