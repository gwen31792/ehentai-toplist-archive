# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 E-Hentai 排行榜存档网站，用于展示 E-Hentai 排行榜的历史数据。项目使用 React 19 + Next.js 15 构建，部署在 Cloudflare Pages 上。

## 技术栈

- **前端框架**: React 19 + Next.js 15 (Edge Runtime)
- **样式**: Tailwind CSS v4 + shadcn/ui 组件
- **类型系统**: TypeScript
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **部署**: Cloudflare Pages + Wrangler
- **包管理器**: pnpm

## 常用开发命令

```bash
# 开发环境启动（包含数据库和类型生成）
pnpm dev

# 生成数据库模拟数据
pnpm generate-db

# 生成 Cloudflare Workers 类型
pnpm generate-types

# 代码检查和修复
pnpm lint:fix

# 构建 Cloudflare Pages 版本
pnpm pages:build

# 本地预览部署版本
pnpm preview

# 部署到 Cloudflare Pages
pnpm deploy
```

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
- `galleries`: 画廊主表，存储画廊的基本信息
- `toplist_items_[year]`: 各年份的排行榜记录表，按年份分表存储

### 关键组件说明
- **DataTable**: 主要的数据展示组件，支持分页和多语言
- **DatePicker**: 日期选择器，用于选择查看特定日期的排行榜
- **TypeSelect**: 排行榜类型选择器（日/月/年/全部）
- **LanguageSelector**: 语言切换器（中英文）

## 开发注意事项

### Cloudflare 特殊配置
- 项目配置为 Edge Runtime，兼容 Cloudflare Workers
- 使用 `@cloudflare/next-on-pages` 进行适配
- 开发环境会自动设置 Cloudflare 开发平台

### 数据库操作
- 使用 Drizzle ORM 进行数据库操作
- 开发前需要运行 `pnpm generate-db` 初始化本地数据库
- 数据库连接通过 Cloudflare D1 binding

### 样式系统
- 使用 Tailwind CSS v4 最新版本
- 集成 shadcn/ui 组件库
- 支持暗色模式切换

### 多语言支持
- 支持中英文切换
- 语言状态存储在 localStorage
- 组件级别的多语言内容配置

### 类型安全
- 严格的 TypeScript 配置
- 完整的类型定义在 `src/lib/types.ts`
- 自动生成 Cloudflare Workers 类型定义