# 待开发事项
## 高优先级

## 中优先级
- [ ] 对数据库查询的缓存，从 F12 看，相同内容还是会重发请求
- [ ] 重构后端爬虫，从 AWS Lambda 迁移到 Cloudflare Workers
- [ ] 定制列
- [ ] 筛选 tags
- [ ] skeleton 时列宽收窄
- [ ] 里站排行榜

## 低优先级
- [ ] hover card 点击时会闪烁，用各种 ai 试了，都不行，以后慢慢研究，chakra-ui 的 hover card 似乎点击不会闪烁
- [ ] No Data 不居中，不过这个情况也没几个人能看到
- [ ] 重新选择表格库，Tanstack Table?
- [ ] 解决 dark mode 下刷新的闪烁问题 FOUC
- [ ] 多月整合的排行榜，推荐系统
- [ ] 集成 Cloudflare Turnstile
- [ ] SEO 优化，see also: https://vercel.com/blog/how-core-web-vitals-affect-seo
- [ ] 检查 CLS 问题，see also: https://liudon.com/posts/fix-blog-cls/
- [ ] 检查 ipv6 支持
- [ ] 迁移到 @opennextjs/cloudflare，see also: https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/
- [ ] tag 中文翻译
- [ ] 等 eslint-plugin-tailwindcss 支持 Tailwind CSS v4 后重新添加到项目中

## 实在闲得没事再做
- [ ] 国际化路由，see also: https://blog.cloudflare.com/cloudflare-radar-localization-journey/, 没尝试只是看了一下，性价比不高，未来没有添加更多语言的计划，目前硬编码也挺好

# 专项
## 图片加载速度解决方案
这个其实不急，因为后来想了一下，后台空闲时加载图片已经能解决绝大部分的问题了，响应基本够用，开直连检测了一下，速度也还行

首先要有一个可以检测响应的做法，确定当前的延迟，切换到 WebP Cloud Services 后，切换到 Cloudflare R2 后的速度的变化

可能需要一个前端可观测性的框架，这里没有了解过，可以研究一下，说不定有成熟的库可以用

然后详细研究一下 Nextjs Image 的各种情况，说不定顺便把 skeleton 尺寸抖动的问题也一起解决了，注意 Header `x-nextjs-cache`

WebP Cloud Services 这里感觉可以不做了，公网连接怎么也不会有内网快的

- [ ] WebP Cloud Services
- [ ] 图片从 cloudflare r2 中读取
- [ ] skeleton 尺寸抖动

# 已完成
- [x] 限流器，防止额度被刷没了，用 durable object 写令牌桶太麻烦了，直接用 cloudflare 自带的 waf 了
- [x] 日历关闭后再打开的默认月份
- [x] 图片在空闲时后台加载
- [x] shadcn/ui 升级，试了一下，tailwind css 升级到 v4 本身不复杂，但是需要在 `globals.css` 里面改一堆，而且没有什么收益，先不管了