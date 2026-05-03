-- 创建 gallery_preview_assets 表
-- 用于保存 gallery 当前预览图资源的基础尺寸，前端只在 source_url 与 galleries.preview_url 一致时使用宽高。
--
-- 使用方法：
-- 1. 在 Cloudflare Dashboard D1 控制台中执行此 SQL
-- 2. 运行 pnpm nx build db
-- 3. 重新部署 web 和 crawler（cd apps/web && pnpm deploy; cd ../crawler && pnpm deploy）

CREATE TABLE IF NOT EXISTS gallery_preview_assets (
    gallery_id INTEGER PRIMARY KEY,
    source_url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    mime_type TEXT,
    byte_size INTEGER,
    sync_status TEXT NOT NULL DEFAULT 'synced',
    updated_at TEXT NOT NULL,

    CHECK (width IS NULL OR width > 0),
    CHECK (height IS NULL OR height > 0),
    CHECK (byte_size IS NULL OR byte_size > 0)
);
