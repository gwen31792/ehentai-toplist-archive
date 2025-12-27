-- 创建新年份的 toplist_items 表的模板
-- 使用前将 {YEAR} 替换为实际年份（如 2027）
--
-- 使用方法：
-- 1. 在 Cloudflare Dashboard D1 控制台中执行此 SQL
-- 2. 更新 packages/db/src/schema/toplist-items.ts 中的 SUPPORTED_TOPLIST_YEARS 和 toplistItemsTables
-- 3. 更新 .github/copilot-instructions.md 中的年份列表
-- 4. 运行 pnpm nx build db
-- 5. 重新部署 web 和 crawler（cd apps/web && pnpm deploy; cd ../crawler && pnpm deploy）

CREATE TABLE IF NOT EXISTS toplist_items_{YEAR} (
    gallery_id INTEGER,
    rank INTEGER,
    list_date TEXT,
    period_type TEXT,
    PRIMARY KEY (gallery_id, rank, list_date, period_type)
);

CREATE INDEX list_date_idx_{YEAR} ON toplist_items_{YEAR} (list_date);
