# E-Hentai Toplist Crawler

这是一个基于 Cloudflare Workers 的 E-Hentai 排行榜爬虫，用于定期抓取和处理排行榜数据。

## 功能特性

- **定时任务**: 每日自动执行爬取任务
- **队列驱动**: 定时任务仅向 Cloudflare Queue 写入消息，由自身消费执行抓取逻辑
- **多周期支持**: 支持全时期、年度、月度、日度排行榜
- **API 接口**: 提供 RESTful API 用于手动触发爬取
- **健康检查**: 提供健康检查端点
- **TypeScript**: 使用 TypeScript 开发，提供类型安全
- **纯爬取**: 当前版本仅进行数据爬取和日志输出，不发送数据到外部服务

## 项目结构

```
apps/crawler/
├── src/
│   ├── index.ts      # 主入口文件，处理 HTTP 请求和定时任务
│   └── crawler.ts    # 爬虫核心逻辑
├── package.json      # 项目依赖和脚本
├── wrangler.toml     # Cloudflare Workers 配置
├── tsconfig.json     # TypeScript 基础配置
├── tsconfig.app.json # 应用 TypeScript 配置
└── README.md         # 本文档
```

## API 端点

### POST /toplist
手动触发排行榜爬取任务

**响应**:
```json
{
  "message": "Toplist crawling completed"
}
```

### GET /health
健康检查端点

**响应**:
```json
{
  "status": "ok"
}
```

### GET /
默认端点，返回服务信息

**响应**:
```json
{
  "message": "E-Hentai Toplist Crawler"
}
```

## 开发

### 本地开发
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 类型检查
```bash
pnpm typecheck
```

### 构建
```bash
pnpm build
```

## 部署

```bash
# 部署到 Cloudflare Workers
pnpm deploy
```

## 定时任务

爬虫配置为每天 00:00 UTC 自动执行一次，会抓取以下排行榜：

- 全时期排行榜 (第1页和第2页)
- 年度排行榜 (第1页和第2页)
- 月度排行榜 (第1页和第2页)
- 日度排行榜 (第1页和第2页)

定时触发器现在只负责向 Cloudflare Queues (`ehentai-toplist-archive`) 投递一条消息，真正的抓取流程由队列消费者执行，以确保同一时间只有一个抓取任务在运行，并能够利用队列的重试机制处理瞬时错误。

## 数据处理

当前版本仅进行数据爬取和控制台日志输出，用于验证爬取功能的正确性。爬取到的数据包括：

- 图库基本信息（ID、名称、类型、标签等）
- 排行榜位置信息（排名、时间、周期类型等）

所有数据会在控制台输出，便于调试和验证。

## 技术栈

- **运行时**: Cloudflare Workers
- **语言**: TypeScript
- **构建工具**: Wrangler
- **部署平台**: Cloudflare