---
title: Obsidian 工作流：从笔记到网页
date: 2026-08-20
tags: [Obsidian, 建站]
summary: 保持 Obsidian 原生写法不动，构建器负责把双链、嵌入、callout 转换成网页元素。
publish: false
---

## 原则：笔记不动，构建器来适配

很多人把 Obsidian 笔记发布成博客时会破坏 vault 里的写法——专门为发布改语法，本末倒置。这个博客的构建器反着来：**笔记里怎么写，网页上就怎么渲染**。

![[diagram.svg]]

构建器处理一条 Markdown，大致经过四步：

1. 解析 frontmatter，过滤 `publish: true`
2. 转换行内语法（双链、嵌入、标签）
3. 转换 callout 引用块
4. 渲染 HTML，套模板，生成 TOC

## 双链的渲染规则

`[[笔记名]]` 在网页上有三种可能的呈现：

- **目标已发布**：渲染成站内链接，可点击跳转
- **目标未发布**：降级为虚线纯文本，悬停提示"该笔记未公开发布"
- **带别名**：`[[笔记名|显示文字]]`，显示文字但跳转目标不变

比如 [[hello-world|开工宣言]] 跳到第一篇文章，而 [[未发布的草稿]] 就是一段点不动的文字。

## 笔记嵌入

`![[笔记名]]` 不会把对方内容整个搬进来（避免内容重复），而是渲染成一张引用卡片：

![[cloudflare-workers-hosting]]

点击卡片即可跳转。图片嵌入则是另一种语法 `![[图片名]]`，直接渲染成 `<img>`，本文开头那张示意图就是这么写的。

## Callout

Obsidian 的 callout 语法原样支持：

> [!tip] 支持的类型
> note / info / tip / hint / warning / caution / question / quote，未识别的类型会回退到默认样式。

> [!question] 没有评论功能吗
> 刻意不加。这是一个纯输出的知识库，不打算做互动。

---

相关文章：

- [[hello-world|博客上线：从 Obsidian 到自己的域名]]
- [[cloudflare-workers-hosting|Cloudflare Workers 托管静态博客的实践]]
