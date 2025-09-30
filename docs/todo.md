# 待开发事项
## 高优先级

## 中优先级
- [ ] 爬虫 ip 被 ban 后自动调起一次新的执行，考虑是否完全改造成适配 cloudflare queues，自己做生产者和消费者


## 低优先级
- [ ] 对数据库查询的缓存，从 F12 看，相同内容还是会重发请求
- [ ] hover card 点击时会闪烁，用各种 ai 试了，都不行，以后慢慢研究，chakra-ui 的 hover card 似乎点击不会闪烁
- [ ] 解决 dark mode 下刷新的闪烁问题 FOUC
- [ ] 多月整合的排行榜，推荐系统
- [ ] 集成 Cloudflare Turnstile
- [ ] SEO 优化，see also: https://vercel.com/blog/how-core-web-vitals-affect-seo
- [ ] 检查 CLS 问题，see also: https://liudon.com/posts/fix-blog-cls/
- [ ] 等 eslint-plugin-tailwindcss 支持 Tailwind CSS v4 后重新添加到项目中
- [ ] galleries 表回扫详细数据，比如 Rating
- [ ] eslint, eslint-config-next, typescript 5.9 升级

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
- [x] 重新选择表格库，Tanstack Table?
- [x] No Data 不居中，不过这个情况也没几个人能看到
- [x] 定制列
- [x] skeleton 时列宽收窄
- [x] 迁移到 @opennextjs/cloudflare，see also: https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/
- [x] 筛选 tags
- [x] 使用远程绑定, see also: https://opennext.js.org/cloudflare/bindings#remote-bindings
- [x] i18n, next-intl
- [x] 重构后端爬虫，从 AWS Lambda 迁移到 Cloudflare Workers，增加爬取数量
- [x] 检查 ipv6 支持

# 不考虑做
- [ ] tag 中文翻译，因为没有官方的中文翻译，官方目前只有日语翻译
- [ ] 保持 tags 的过滤，这样能只看某个 tags 的所有的排行，如果做了，新 gallery 进来后，它们的 tags 是默认选中，还是默认不选中？引入太多复杂度了不好，每次切换 toplist 重置最好