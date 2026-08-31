---
title: Graphify
date: 2026-08-22
tags: [agent-skill, 知识图谱, 代码可视化, OpenCode]
summary: Graphify 是一个将任意文件夹（代码、文档等）转化为可导航知识图谱的工具，生成 HTML 可视化、GraphRAG 可用的 JSON 与自然语言报告。它比 MAP 更进一步，定位用图、落地读码，适合 AI Agent 对项目进行迭代与维护。
publish: true
---

# Graphify

> **开篇摘要**：Graphify 是 MAP 的代码升级版，通过 `/graphify` 命令自动扫描项目生成可导航知识图谱（HTML + JSON + GRAPH_REPORT）。图谱持久化跨会话保留，边标注 `EXTRACTED / INFERRED / AMBIGUOUS` 保证诚实审计，适合 agent 对项目进行查询、维护与迭代。

## 一、功能简介

在agent里面使用/graphify能够自动扫描项目生成关系图，可供agent查询，方便项目的维护和更新。它生成的是一个**知识图谱**不是一个单独的markdown文件。可以理解成MAP的代码升级版。



---

## 二、Skill仓库

> 关于Github的知识请查看[[GitHub]]

Github下载地址：[Graphtify](https://github.com/Graphify-Labs/graphify)

1. 先下载python到本地并且配置环境变量（python.exe安装时勾选）
2. 使用python来下载Graphify插件（终端命令运行）
3. 将下载好的Graphify插件配置到对应agent中去。
4. agent中使用/graphify 命令



---

## 三、搭配和使用场景

一般我是会搭配我自己的**MAP.md**文件来先给agent引入项目的概念，然后再配上这个graphify的skill来进行项目知识图谱的创建。关于MAP文件可以查看[[MAP]]来查看我的自编写skill。



---

## 四、Graphify Skill 使用演示与实践指南

> 本文基于 **HouseRentalMS 智能房屋租赁系统**（Spring Boot 3.x + Vue 3 前后端分离）的实际构建结果编写，所有数据均来自真实运行输出，可直接作为使用范例。

### 4.1、什么是 Graphify

Graphify 是一个将任意文件夹（代码、文档、论文、图片、视频）转化为**可导航知识图谱**的工具，核心价值：

- **持久化**：图谱跨会话保留，无需每次重建
- **诚实审计**：每条边标注 `EXTRACTED / INFERRED / AMBIGUOUS`，不虚构关系
- **社区发现**：自动聚类出模块边界，暴露跨文档的隐性关联
- **三大产物**：交互式 HTML 可视化、GraphRAG 可用的 JSON、自然语言 GRAPH_REPORT.md

### 4.2、核心机制：Fast-Path（快速路径）

```text
判断：graphify-out/graph.json 是否存在？
  └─ 存在 + 用户提出关于项目的自然语言问题
       → 跳过全部重建步骤，直接执行 /graphify query "<问题>"
```

**这是 agent 使用图谱的关键**：只要图谱已构建，后续任何"这个项目里 X 怎么工作"类的问题，都不会触发重新抽取，而是直接在图谱上做 BFS/DFS 遍历回答。**定位用图，落地读码**，二者结合。

### 4.3、通用使用流程

#### 1. 首次构建（一次即可）

```bash
/graphify .                          # 当前目录全量构建（生成 HTML + JSON + 报告）
/graphify <path>                     # 指定路径
/graphify <path> --mode deep         # 深度抽取，更多 INFERRED 边
/graphify <path> --directed          # 有向图（保留 源→目标 方向）
```

输出目录 `graphify-out/`：

| 文件              | 用途                                                         |
| ----------------- | ------------------------------------------------------------ |
| `graph.html`      | 交互式图谱，浏览器打开                                       |
| `graph.json`      | 原始图谱数据（nodes/links/hyperedges + 社区归属）            |
| `GRAPH_REPORT.md` | 审计报告（God Nodes、Surprising Connections、Suggested Questions） |
| `manifest.json`   | 增量缓存清单，供 `--update` 使用                             |

#### 2. 日常维护（无 LLM 成本）

| 命令                             | 场景                                  |
| -------------------------------- | ------------------------------------- |
| `/graphify query "<问题>"`       | BFS 遍历，宽泛上下文                  |
| `/graphify query "<问题>" --dfs` | DFS 遍历，追踪单条链路                |
| `/graphify path "A" "B"`         | 两个概念间的最短路径                  |
| `/graphify explain "节点名"`     | 单个节点的通俗解释                    |
| `/graphify --update`             | 代码变更后增量重建（仅重抽新/改文件） |

#### 3. 代码变更后的同步

```bash
/graphify --update    # 增量，依赖 manifest 缓存，秒级完成
```

> 务必在修改代码后运行 `--update`，否则图谱会过期，后续查询不准。

### 4.4、实际构建演示（以HouseRentalMS为例）

#### 4.4.1 语料检测结果

```text
Corpus: 137 files · ~47,002 words
  code:   126 files (.java .vue .js .sql .yml)
  docs:   11 files (.md)
```

#### 4.4.2 抽取结果

```text
AST:      1037 nodes, 2888 edges     # 代码结构化抽取（免费、确定性）
Semantic:   91 nodes,  122 edges     # 11 篇文档语义抽取
Merged:   1128 nodes, 3010 edges
Graph:    1128 nodes, 2418 edges, 66 communities
```

#### 4.4.3 社区聚类（66 个，按模块清晰分层）

- **后端**：`Authentication Module`、`House Service & Redis Cache`、`AI Chat Module`、`Contract Service & Rent Calculation`、`Rent Payment & Scheduling`、`Announcement Module`、`Repair Service & Repository`、`Security Filters & JWT`、`JPA Repositories`、`REST Controllers` 等
- **前端**：`Public House List UI`、`House Detail UI`、`AI Chat UI`、`Appointment Booking UI`、`Contract Management UI`、`Admin Layout UI`、`Frontend API Layer`、`Router Setup` 等
- **基建/文档**：`Database Schema & Caching Design`、`Deployment Architecture`、`Docker & Environment Config`、`Authentication & RBAC Design`、`Refactor & Security Decisions`

#### 4.4.4 God Nodes（核心抽象，改动影响面最大）

| 节点                                             | 连接数 | 说明                       |
| ------------------------------------------------ | ------ | -------------------------- |
| `ApiResponse`                                    | 85     | 全 REST 控制器统一返回格式 |
| `BusinessException`                              | 61     | 全局业务异常               |
| `request`                                        | 55     | 前端 Axios 拦截层          |
| `Contract` / `House` / `RentPayment` / `SysUser` | 23–45  | 核心实体                   |

#### 4.4.5 Surprising Connections（跨文档隐性关联）

- **Vite Dev Proxy ⟷ Nginx Reverse Proxy** — 开发/生产两套路由方案语义等价
- **敏感信息外部化改造 ⟷ Gitignore 密钥规则** — 安全改造的落地闭环
- **角色数据隔离 ⟷ 三角色 RBAC** — 概念互通
- **默认管理员账号 ⟷ 测试账号** — 文档间一致性校验

### 4.5、实战案例：更新前端公共平台 UI 标题

#### 任务

将公共平台标题"智能房屋租赁系统"改为"XX家园租赁平台"。

#### Agent 应执行的步骤

**Step 1 — 查图谱定位**

```text
/graphify query "前端公共平台的标题在哪些文件里定义"
```

图谱返回关键节点（真实数据）：

- `frontend_index_spa_entry` → `frontend/index.html`（社区 36：Deployment Architecture）
- `frontend_src_public_views_home_index` → `frontend/src/public/views/home/index.vue`（社区 21：Public House List UI）
- `frontend_src_router_index` → `frontend/src/router/index.js`（社区 42：Router Setup）

**Step 2 — 影响面检查**

```text
/graphify query "修改公共平台标题会连带影响哪些页面"
```

重点区分 **public 与 admin**：社区 44（Admin Layout）、社区 40（Admin Login）若含相同标题字符串，需明确告知用户"后台是否一并修改"，避免误改。

**Step 3 — 读定点文件实施修改**

| 位置                                          | 代码                                                         |
| --------------------------------------------- | ------------------------------------------------------------ |
| `frontend/index.html:6`                       | `<title>智能房屋租赁系统</title>`（浏览器标签）              |
| `frontend/src/public/views/home/index.vue:7`  | `<router-link to="/" class="logo">智能房屋租赁系统</router-link>`（导航 logo） |
| `frontend/src/public/views/home/index.vue:28` | `<h1 class="title">智能房屋租赁系统</h1>`（首页大标题）      |

**Step 4 — 增量同步图谱**

```bash
/graphify --update
```

#### 推荐提示词（直接复制可用）

```text
任务：更新前端公共平台首页的UI标题为"XX家园租赁平台"。
步骤要求：
1. 先运行 /graphify query "前端公共平台的标题在哪些文件里定义" 定位涉及的文件；
2. 再运行 /graphify query "修改公共平台标题会连带影响哪些页面" 检查影响面（注意区分 public 与 admin，admin 不要动）；
3. 然后才读这些文件、实施修改；
4. 修改后告诉我改动了哪些文件，并确认没有破坏路由和其他页面。
```

### 4.6、Bug 修复与功能开发模板

#### 修复类

```text
请修复 [现象描述]。
先用 /graphify query "处理[功能X]的调用链是什么样的" 走一遍调用链
（后端 Controller → Service → Repository，前端 API → 组件），
找到可能出问题的环节，再深入读代码定位根因。
```

#### 开发类

```text
请开发 [新功能]。
先用 /graphify query "现有的[相邻功能]是如何实现的" 了解既有模式，
再 /graphify query "[新功能]应该挂接在哪些模块上" 确认改动面，
最后按项目既有分层模式实施。
```

#### 影响面评估类

```text
我要重构 [某模块]。请先用 /graphify path "模块A" "模块B" 找出两者的依赖路径，
并用 /graphify query "依赖[某节点]的所有模块" 列出受影响的全部社区。
```

### 4.7、最佳实践清单

1. **一次构建，长期使用**：首次 `graphify .` 后，日常全靠 `query / path / explain`，几乎零成本
2. **改码必同步**：任何代码改动后运行 `graphify --update`
3. **用图谱词汇提问**：优先使用社区名与节点名（如 "Authentication Module"、"House Service & Redis Cache"），命中率更高
4. **跨层桥节点是重点**：`ApiResponse`、`BusinessException` 等 high-betweenness 节点连接多个社区，改动它们影响面最大
5. **多轮追问导航**：让 agent 沿边逐个探索（"这连接到 X，要深入吗？"），而非一次性问答
6. **诚实审计**：报告中的 INFERRED/AMBIGUOUS 边与 Graph Health 警告（如悬空边、折叠边）要如实查看，图有噪声但可用

### 4.8、演示项目的图谱速查卡

| 想了解什么    | 查什么节点/社区                                              |
| ------------- | ------------------------------------------------------------ |
| 认证与权限    | `Authentication Module`、`Security Filters & JWT`、`Authentication & RBAC Design` |
| 房源与缓存    | `House Service & Redis Cache`、`Database Schema & Caching Design` |
| AI 助手       | `AI Chat Module`、`AI Chat UI`、`DeepSeek LLM Integration`   |
| 合同/租金流程 | `Contract Service & Rent Calculation`、`Rent Payment & Scheduling` |
| 前端页面归属  | `Public House List UI`、`Contract Management UI`、`Admin Layout UI` |
| 部署链路      | `Deployment Architecture`、`Docker & Environment Config`、`Nginx` |
| 安全加固      | `Refactor & Security Decisions`、`Sensitive Info Externalization` |

---

## 相关笔记

- 返回知识库首页 → [[知识库首页]]

- 依赖 Git/GitHub 基础 → [[GitHub]]
- MAP 文档（面向人）与 Graphify（面向代码）互补 → [[MAP]]
- 抓取外部文档/数据可配合 Firecrawl → [[Firecrawl]]
- 返回技能清单首页 → [[SKILL 推荐清单]]

