pnpm dlx wrangler d1 export ehentai-toplist-archive --remote --output ./dump.sql
grep "INSERT INTO toplist_items_2025 VALUES(.*,'2025-09-03',.*);" dump.sql > 1.sql
awk -F'[(),]' 'FNR==NR{if($0~/INSERT INTO toplist_items_2025/){id=$2;gsub(/ /,"",id);ids[id]=1}next}$0~/INSERT INTO galleries/{id=$2;gsub(/ /,"",id);if(id in ids)print}' 1.sql dump.sql > 2.sql