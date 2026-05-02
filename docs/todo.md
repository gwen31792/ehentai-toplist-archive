# 待开发事项
## 高优先级

## 中优先级
- [ ] 等 @opennextjs/cloudflare 支持 Next 16 Adapters API 后，将 `apps/web/middleware.ts` 迁移为 `proxy.ts`；当前 1.19.4 + Next 16.2.4 使用 `proxy.ts` preview 会报 `File server/middleware.js does not exist`，see also: https://github.com/opennextjs/opennextjs-cloudflare/issues/972, https://github.com/opennextjs/opennextjs-cloudflare/issues/962
- [ ] 好好梳理一下对于 zod 的使用

## 低优先级
- [ ] 对数据库查询的缓存，从 F12 看，相同内容还是会重发请求
- [ ] hover card 点击时会闪烁，用各种 ai 试了，都不行，以后慢慢研究，chakra-ui 的 hover card 似乎点击不会闪烁
- [ ] 解决 dark mode 下刷新的闪烁问题 FOUC
- [ ] 多月整合的排行榜，推荐系统
- [ ] 集成 Cloudflare Turnstile
- [ ] SEO 优化，see also: https://vercel.com/blog/how-core-web-vitals-affect-seo
- [ ] 检查 CLS 问题，see also: https://liudon.com/posts/fix-blog-cls/
- [ ] 等 eslint-plugin-tailwindcss 支持 Tailwind CSS v4 后重新添加到项目中
- [ ] 使用 <Activity>: https://react.dev/reference/react/Activity
- [ ] 研究 Cloudflare Agent Readiness: https://blog.cloudflare.com/agent-readiness/

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
