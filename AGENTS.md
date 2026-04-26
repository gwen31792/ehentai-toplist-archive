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

# 仓库内 Nx 命令约定

- 在本仓库中执行 Nx 相关命令时，统一使用 `pnpm nx`，例如 `pnpm nx run web:build`

# 代码注释规范

- 对较长函数、非显而易见的生命周期/状态同步/持久化逻辑，至少在函数入口或关键代码块前保留一行说明性注释，说明这段代码解决什么问题或为什么需要这样做
- 函数内部如果出现类似较长或复杂的分支、异步守卫、跨环境兼容逻辑，也应添加一行说明；避免只复述代码字面行为的空注释

# Git Commit Message 规范

- 优先使用 Conventional Commits 格式：`type(scope): summary`
- 默认使用仓库里已经在用的类型：`feat`、`fix`、`refactor`、`chore`、`docs`；仅在明确是性能优化时使用 `perf`
- 当改动明确只涉及某个项目或模块时，建议加上 scope。仓库里常见的 scope 包括 `crawler`、`web`、`db`、`nx`、`date-picker`
- `summary` 尽量使用简体中文，产品名、库名、框架名和技术关键词保留原文
- `summary` 保持单行，描述要具体、直接、偏动作导向，通常不加句号
- 一个 commit 只表达一个主要意图；如果包含几处相关改动，优先概括最核心的用户可见变化或架构变化
- 如果需要补充上下文，可以在标题下空一行，再用简短正文说明原因、影响范围或后续注意事项
- 推荐使用具体表达，例如 `feat(crawler): 增加 gallery 详细信息解析`、`fix(web): 修复表格列设置切换无效及状态不同步问题`、`chore: 升级 Next.js 至 16.0.7`
