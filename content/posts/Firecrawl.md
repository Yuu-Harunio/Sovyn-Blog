---
title: Firecrawl
date: 2026-08-22
tags: [agent-skill, 爬虫, 网页数据, OpenCode]
summary: Firecrawl 是一个开源的网页数据抓取与提取 API，可将整个网站转换为 LLM 就绪的 Markdown 或结构化数据，适合 AI 知识库构建、竞品监控和自动化研究。
publish: true
---

<!-- 修改说明：新增 frontmatter（tags/alias/related/summary）与开篇摘要；正文结构保留。 -->
<!-- 修改说明：尾部新增「相关笔记」双向链接区块。 -->

# Firecrawl

> **开篇摘要**：Firecrawl 是一个开源的网页数据抓取与提取 API，能将整个网站转换为 LLM 就绪的 Markdown 或结构化数据。它解决了动态渲染、反爬与 JS 执行等传统爬虫痛点，让 AI 代理轻松获取实时网页上下文。本文档介绍其五大核心功能、OpenCode 部署方法、常用命令与最佳实践。

## 一、功能简介

**Firecrawl** 是一个开源的网页数据抓取与提取 API，专为 AI 应用、知识库和数据管道设计。它的核心价值在于：**将整个网站转换为 LLM 就绪的 Markdown 或结构化数据**。

它解决了传统爬虫的痛点——动态内容渲染、反爬机制、JavaScript 执行——让 AI 代理能够轻松获取实时的网页上下文。Firecrawl 提供五大核心功能：

- **Scrape（抓取）** ：从任意 URL 提取内容，支持 Markdown、HTML、结构化 JSON、截图等格式
- **Crawl（爬取）** ：一次请求爬取网站的所有 URL，无需站点地图
- **Map（地图）** ：极速发现网站上的所有 URL
- **Search（搜索）** ：搜索网络并从结果中获取完整页面内容
- **Extract（提取）** ：使用 AI 从单个页面、多个页面或整个网站提取结构化数据

---

## 二、Skill 仓库与下载

> 关于Github的知识请查看[[GitHub]]

Github 仓库地址：[firecrawl/firecrawl](https://github.com/firecrawl/firecrawl)

官方文档：[docs.firecrawl.dev](https://docs.firecrawl.dev)

### 下载方式

**方式一：克隆仓库**

```bash
git clone https://github.com/firecrawl/firecrawl.git
```

**方式二（推荐）：直接安装 Firecrawl CLI**

Firecrawl 提供了专门的 CLI 工具，可以一键完成安装和配置：

```bash
# 全局安装 CLI
npm install -g firecrawl-cli

# 或使用 npx 一键初始化（推荐）
npx -y firecrawl-cli@latest init --all --browser
```

`--all` 会将 Firecrawl 技能安装到所有检测到的 AI 编码代理中；`--browser` 会自动打开浏览器完成身份验证。

---

## 三、部署到 OpenCode

Firecrawl 支持直接为 OpenCode 安装技能。

### 步骤一：安装 Firecrawl CLI 并配置技能

```bash
# 全局安装 CLI
npm install -g firecrawl-cli

# 为 OpenCode 安装技能（指定 --agent opencode）
firecrawl init --agent opencode
```

或者使用一键安装脚本：

```bash
curl -fsSL https://firecrawl.dev/install.sh | bash -s -- --agent opencode
```

### 步骤二：身份验证

首次使用时需要进行身份验证：

```bash
# 交互式登录（打开浏览器或提示输入 API 密钥）
firecrawl login

# 或直接使用 API 密钥登录
firecrawl login --api-key fc-YOUR-API-KEY
```

也可以直接通过环境变量设置：

```bash
export FIRECRAWL_API_KEY=fc-YOUR-API-KEY
```

> **免密钥使用**：部分 CLI 命令无需 API 密钥即可使用，按 IP 限流。注册 [Firecrawl](https://firecrawl.dev) 可获得 1,000 免费额度和更高限额。

### 步骤三：重启 OpenCode

安装完成后，**重启 OpenCode** 使其发现新技能。

### 自托管部署（可选）

如需自托管 Firecrawl 实例，可使用 Docker Compose：

```bash
# 克隆仓库并切换到指定版本
git clone https://github.com/firecrawl/firecrawl.git
cd firecrawl
git checkout v2.11.162

# 配置 .env 文件
cat > .env <<'EOF'
USE_DB_AUTHENTICATION=false
POSTGRES_USER=postgres
POSTGRES_PASSWORD=replace-with-at-least-32-random-characters
POSTGRES_DB=postgres
EOF

# 构建并启动
docker compose up -d
```

自托管实例默认运行在 `http://localhost:3002`。CLI 可通过 `--api-url` 指向自托管实例：

```bash
firecrawl --api-url http://localhost:3002 scrape https://example.com
```

> **资源建议**：API 服务至少配置 4 vCPU / 8 GB RAM，Playwright 至少 2 vCPU / 4 GB RAM。

---

## 四、使用方法

### 4.1 基本命令

安装并配置完成后，在 OpenCode 对话中或终端直接使用：

**抓取单个页面**

```bash
firecrawl scrape https://example.com
```

输出为 Markdown 格式。

**搜索网页**

```bash
firecrawl search "你的搜索词" --limit 5
```

可添加 `--scrape` 参数同时抓取搜索结果页面的完整内容。

**爬取整个网站**

```bash
firecrawl crawl https://example.com
```

一次请求爬取网站所有可访问的子页面。

**地图（发现所有 URL）**

```bash
firecrawl map https://example.com
```

极速获取网站的所有 URL。

### 4.2 在 OpenCode 中使用技能

安装 Firecrawl 技能后，OpenCode 代理会自动发现并使用以下技能分段：

- **CLI 技能**：教会代理如何使用 Firecrawl CLI 进行实时网页操作（搜索、抓取、交互、地图、爬取、代理任务）
- **构建技能**：教会代理如何将 Firecrawl 集成到应用代码中（选择端点、接入 SDK、设置 API 密钥）
- **工作流技能**：教会代理如何生成 Firecrawl 驱动的交付物，如研究报告、SEO 审计、QA 报告、潜在客户列表、知识库等

在 OpenCode 中，你可以直接对代理说：

> “用 Firecrawl 抓取 https://docs.example.com 的内容，转成 Markdown”

代理会自动调用相应的 Firecrawl 技能完成任务。

### 4.3 API 直接调用（可选）

Firecrawl 也支持通过 API 直接调用：

```bash
curl -X POST 'https://api.firecrawl.dev/v2/scrape' \
  -H 'Authorization: Bearer fc-YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://example.com"}'
```

Python SDK 示例：

```python
from firecrawl import Firecrawl
firecrawl = Firecrawl(api_key="fc-YOUR-API-KEY")
doc = firecrawl.scrape("https://example.com", formats=["markdown", "html"])
```

---

## 五、常用场景

| 场景 | 典型用法 |
|------|----------|
| **AI 知识库构建** | 爬取文档站点，将整站文档转为 Markdown 存入知识库 |
| **竞品监控** | 定时爬取竞品网站，通过 AI 提取新功能并发送摘要报告 |
| **SEO 内容挖掘** | 爬取行业博客，让 AI 发现未覆盖的主题，生成内容日历 |
| **价格追踪** | 提取产品价格数据，监控价格变化 |
| **自动化研究** | 使用 Firecrawl 的深度研究端点主动探索网络，跨多源收集信息 |
| **LLM 应用数据管道** | 为 AI 代理提供实时网页上下文，支持问答、摘要、分析等 |
| **文档转译/迁移** | 将旧版文档站完整抓取并转换为统一格式 |

---

## 六、最佳实践清单

1. **一次配置，长期使用**：通过 `firecrawl init --agent opencode` 完成安装和身份验证后，代理可直接调用
2. **善用免密钥档位**：小规模使用无需注册，按 IP 限流；大规模使用建议注册获取免费额度
3. **自托管场景注意资源**：Firecrawl 是资源密集型服务，生产环境建议 4 vCPU / 8 GB RAM 以上
4. **结合 MAP.md 使用**：先用 MAP.md 让代理了解项目结构，再用 Firecrawl 抓取外部文档或数据填充项目上下文
5. **技能更新**：如需更新 Firecrawl 技能，重新运行 `firecrawl setup skills --agent opencode`

---

## 七、常见问题

**Q：安装后 OpenCode 无法识别 Firecrawl 技能？**
A：检查是否已重启 OpenCode。如仍未生效，可手动运行 `firecrawl setup skills --agent opencode` 重新安装技能。

**Q：需要 API 密钥吗？**
A：部分命令无需密钥（按 IP 限流），但建议注册获取免费 API 密钥以获得更高限额。

**Q：自托管和云版本有什么区别？**
A：云版本开箱即用，无需运维；自托管适合需要掌控源代码或基础设施的场景，但需自行负责升级、安全、存储、监控和恢复。

**Q：Firecrawl 能处理 JavaScript 渲染的页面吗？**
A：可以。Firecrawl 内置 Playwright，能处理动态内容、JavaScript 渲染和反爬机制。

---

通过 Firecrawl，你的 AI 代理将获得实时访问和处理网页数据的能力，让知识库构建、竞品监控、自动化研究等工作流变得更加简单高效。

---

## 相关笔记

- 返回知识库首页 → [[知识库首页]]

- 依赖 Git/GitHub 基础 → [[GitHub]]
- 建议与项目结构地图配合使用 → [[MAP]]
- 与代码知识图谱结合形成"总览→定位→抓取"闭环 → [[Graphify]]
- 返回技能清单首页 → [[SKILL 推荐清单]]