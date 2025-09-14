# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 E-Hentai 排行榜存档网站，用于展示 E-Hentai 排行榜的历史数据。项目使用 React 19 + Next.js 15 构建，通过 @opennextjs/cloudflare 适配器部署在 Cloudflare Workers 上。

## 技术栈

- **前端框架**: React 19 + Next.js 15 (Edge Runtime)
- **样式**: Tailwind CSS v4 + shadcn/ui 组件
- **类型系统**: TypeScript
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **适配器**: @opennextjs/cloudflare
- **部署**: Cloudflare Workers + Wrangler
- **包管理器**: pnpm

## 常用开发命令

```bash
# 开发环境启动（使用 Turbopack 加速）
pnpm dev

# 代码检查和修复
pnpm lint:fix

# 生成数据库模拟数据
pnpm generate-db

# 生成 Cloudflare Workers 类型定义
pnpm cf-typegen

# 构建项目
pnpm build

# 本地预览 Cloudflare Workers 构建版本
pnpm preview

# 部署到 Cloudflare Workers
pnpm deploy
```

## 核心架构约束

- **必须在 Cloudflare Workers 环境下运行**：`wrangler.toml` 将 D1 数据库绑定为 `DB`
- **服务端数据库访问**：使用 `drizzle(getCloudflareContext().env.DB)` 访问 D1 数据库（参考 `src/app/api/data/route.ts`）
- **shadcn/ui 组件规则**：**严禁修改** `src/components/ui/**` 下的基础组件，新组件应创建在 `src/components/**` 下
- **图片资源约束**：图片 URL 必须符合 `next.config.ts` 中的远程模式配置（仅允许 `ehgt.org`）
- **静态资源处理**：通过 wrangler.toml 中的 assets 配置管理静态文件

## 代码架构

### 目录结构
```
src/
├── app/                    # Next.js App Router
│   ├── api/data/          # API 路由（数据查询）
│   ├── about/             # 关于页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/                # shadcn/ui 基础组件
│   ├── data-table.tsx     # 数据表格组件
│   ├── date-picker.tsx    # 日期选择器
│   └── ...                # 其他功能组件
├── db/                    # 数据库相关
│   ├── schema.ts          # Drizzle ORM 数据库表结构
│   └── mock.sql           # 模拟数据
└── lib/                   # 工具库
    ├── types.ts           # TypeScript 类型定义
    └── utils.ts           # 工具函数
```

### 数据库结构
- **galleries**: 画廊主表，存储画廊的基本信息（ID、标题、类型、标签、发布时间、上传者等）
- **toplist_items_2023/2024/2025**: 按年份分表的排行榜记录表，存储每日/月/年/全部排行榜数据

### 关键组件说明
- **DataTable**: 主要的数据展示组件，使用 @tanstack/react-table，支持分页和多语言
- **DatePicker**: 日期选择器，用于选择查看特定日期的排行榜
- **TypeSelect**: 排行榜类型选择器（日/月/年/全部）
- **LanguageSelector**: 语言切换器（中英文）
- **TablePagination**: 独立的分页控制组件
- **TableHeaderControls**: 表格头部控制组件（包含日期选择和类型选择）

## 数据库操作模式

使用 Drizzle ORM 配合 `drizzle-orm/d1`，数据结构为 `galleries`（主表）+ 按年份分表的 `toplist_items_2023/2024/2025`。

### 标准查询模式（参考 `src/app/api/data/route.ts`）

```javascript
// 1. 根据 list_date 年份选择对应的排行榜表
const yearPart = list_date_param.slice(0, 4)
let toplistItemsTable = tableMap[yearPart] // 2023/2024/2025

// 2. 使用 getTableColumns 展开列，排除连接时的重复字段
const { list_date, period_type, ...rest } = getTableColumns(toplistItemsTable)

// 3. 连接查询
const result = await db.select({ ...rest, ...getTableColumns(galleriesTable) })
  .from(toplistItemsTable)
  .where(and(
    eq(toplistItemsTable.list_date, list_date_param),
    eq(toplistItemsTable.period_type, period_type_param)
  ))
  .innerJoin(galleriesTable, eq(toplistItemsTable.gallery_id, galleriesTable.gallery_id))
  .orderBy(toplistItemsTable.rank)
```

## API 契约

- **端点**: `GET /api/data?list_date=YYYY-MM-DD&period_type=day|month|year|all`
- **返回**: `{...Gallery, rank}[]` 数组（类型定义见 `src/lib/types.ts`）
- **缓存**: 客户端使用 `{ cache: 'force-cache' }` 简单缓存

## 应用数据流

- **状态管理**: `src/app/page.tsx` 管理客户端状态，`language` 存储在 `localStorage`
- **数据获取**: 日期/类型变化时重新获取 `/api/data`
- **核心组件**: `DatePicker`、`TypeSelect`、`DataTable`（TanStack Table）、`LanguageSelector`

## 添加新年份支持

1. 在 `src/db/schema.ts` 中定义新的 `toplistItems{YEAR}Table`
2. 在 `src/app/api/data/route.ts` 的 switch 语句中添加对应的 case
3. 扩展 `src/db/mock.sql` 模拟数据，然后运行 `pnpm generate-db`

## 重要参考文件

- **API 实现**: `src/app/api/data/route.ts`
- **数据库模式**: `src/db/schema.ts`
- **类型定义**: `src/lib/types.ts` (`Language`, `ToplistType`, `Gallery`, `QueryResponseItem`)
- **应用入口**: `src/app/layout.tsx`, `src/app/page.tsx`