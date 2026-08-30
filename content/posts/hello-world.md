---
title: 博客上线：从 Obsidian 到自己的域名
date: 2026-08-28
tags: [随笔, 建站]
summary: 这个博客是什么、为什么做、怎么运作的。一篇说明一切的开工宣言。
publish: true
pinned: true
---

## 为什么要自己搭一个博客

平台账号随时可能被封，内容可能被无故删除。个人网站才是真正属于自己的互联网资产——在自己的域名上，规则自己定。

> [!note] 这个博客是什么
> 一个纯静态的个人知识库站点：没有登录、没有数据库、没有评论系统，只有文章。全部内容从 Obsidian 笔记直接构建而来。

## 它是怎么运作的

写作和发布的完整流程只有三步：

1. 在 Obsidian 里写笔记，保持原生语法
2. 把要发布的笔记拷进仓库的 `content/posts/`，frontmatter 写上 `publish: true`
3. `git push`，几十秒后文章自动上线

> [!tip] 不想发布的笔记怎么办
> 不写 `publish: true` 就行。未发布的笔记被 `[[双链]]` 引用时，网页上会自动降级为一段普通文字，不会出现死链。

## 内容都会是些什么

技术笔记、读书摘录、一些随想。相关的文章会彼此链接，比如这篇 [[obsidian-workflow|Obsidian 工作流]] 讲了笔记是怎么变成网页的，部署的部分则放在 [[cloudflare-workers-hosting|Cloudflare Workers 托管实践]] 里。

计划中的长期栏目：

- **技术实践**：踩坑记录、工具链配置
- **读书笔记**：摘录与感想
- **随想**：不值得展开但想记下来的碎片

---

相关文章：

- [[cloudflare-workers-hosting|Cloudflare Workers 托管实践]]
- [[obsidian-workflow|Obsidian 工作流：从笔记到网页]]
