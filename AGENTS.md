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

# 仓库内 Nx 命令约定

- 在本仓库中执行 Nx 相关命令时，统一使用 `pnpm nx`，例如 `pnpm nx run web:build`

# Git Commit Message 规范

- 优先使用 Conventional Commits 格式：`type(scope): summary`
- 默认使用仓库里已经在用的类型：`feat`、`fix`、`refactor`、`chore`、`docs`；仅在明确是性能优化时使用 `perf`
- 当改动明确只涉及某个项目或模块时，建议加上 scope。仓库里常见的 scope 包括 `crawler`、`web`、`db`、`nx`、`date-picker`
- `summary` 尽量使用简体中文，产品名、库名、框架名和技术关键词保留原文
- `summary` 保持单行，描述要具体、直接、偏动作导向，通常不加句号
- 一个 commit 只表达一个主要意图；如果包含几处相关改动，优先概括最核心的用户可见变化或架构变化
- 如果需要补充上下文，可以在标题下空一行，再用简短正文说明原因、影响范围或后续注意事项
- 推荐使用具体表达，例如 `feat(crawler): 增加 gallery 详细信息解析`、`fix(web): 修复表格列设置切换无效及状态不同步问题`、`chore: 升级 Next.js 至 16.0.7`
