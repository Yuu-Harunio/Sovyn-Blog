---
title: Cloudflare Workers 托管静态博客的实践
date: 2026-08-26
tags: [Cloudflare, 部署]
summary: 零成本、零服务器、零登录。用 Workers 静态资源托管跑一个纯静态博客的全部要点。
publish: false
---

## 为什么选 Workers 静态资源托管

个人博客对托管的要求其实非常低：静态文件直出 + 全球 CDN + 免费额度够用。Cloudflare Workers 的 Static Assets 三样全占。

| 项目 | 免费额度 | 博客实际用量 |
| --- | --- | --- |
| 请求数 | 100,000 / 天 | 远远用不到 |
| 付款方式 | 不需要 | — |
| 服务器运维 | 不存在 | — |

> [!warning] 域名备案
> 域名托管在 Cloudflare 上，国内读者长期大量访问可能需要考虑备案问题，个人小站通常影响不大。

## 配置文件

核心配置只有几行，把构建产物 `dist/` 目录指给 Worker：

```jsonc
{
  "name": "sovyn-blog",
  "compatibility_date": "2026-08-30",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

不需要写任何 Worker 代码。纯静态资源模式下，Workers 就是一个部署在全球边缘的文件服务器。

## 构建和部署

构建是一条命令，部署也是一条命令：

```bash
# 构建静态站点
npm run build

# 部署到 Cloudflare
npx wrangler deploy
```

配合 GitHub Actions，push 到 main 分支就会自动构建部署。日常发布文章的体验是：Obsidian 写完 → 拷贝文件 → push，全程不超过一分钟。

## 成本

- Workers：免费计划内
- 域名：唯一的花销，一年几十块
- **其他一切：0 元**

---

相关文章：

- [[hello-world|博客上线：从 Obsidian 到自己的域名]]
- [[obsidian-workflow|Obsidian 工作流：从笔记到网页]]
