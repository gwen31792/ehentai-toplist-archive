# 待开发事项
## 高优先级
- [ ] 限流器，防止额度被刷没了
- [ ] 图片在空闲时后台加载
- [ ] shadcn/ui 升级
- [ ] WebP Cloud Services

## 中优先级
- [ ] 对数据库查询的缓存，从 F12 看，相同内容还是会重发请求
- [ ] 重构后端爬虫，从 AWS Lambda 迁移到 Cloudflare Workers
- [ ] 图片从 cloudflare r2 中读取
- [ ] 定制列
- [ ] 筛选 tags
- [ ] skeleton 时列宽收窄

## 低优先级
- [ ] 国际化路由，see also: https://blog.cloudflare.com/cloudflare-radar-localization-journey/
- [ ] hover card 点击时会闪烁，用各种 ai 试了，都不行，以后慢慢研究，chakra-ui 的 hover card 似乎点击不会闪烁
- [ ] No Data 不居中，不过这个情况也没几个人能看到
- [ ] 重新选择表格库，Tanstack Table?
- [ ] 解决 dark mode 下刷新的闪烁问题 FOUC
- [ ] 多月整合的排行榜，推荐系统
- [ ] 集成 Cloudflare Turnstile
- [ ] SEO 优化，see also: https://vercel.com/blog/how-core-web-vitals-affect-seo
- [ ] 检查 CLS 问题，see also: https://liudon.com/posts/fix-blog-cls/
- [ ] 检查 ipv6 支持