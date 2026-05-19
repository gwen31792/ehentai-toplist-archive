-- 为 galleries 表增加详情页平均评分字段。
--
-- 使用方法：
-- 1. 在 Cloudflare Dashboard D1 控制台中执行此 SQL
-- 2. 运行 pnpm nx run @ehentai-toplist-archive/db:build
-- 3. 重新部署 crawler；已有 gallery 会随 update-gallery 的月度重扫自然补齐评分

ALTER TABLE galleries ADD COLUMN rating REAL;
