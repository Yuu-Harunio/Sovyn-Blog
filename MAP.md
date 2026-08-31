# 项目架构与核心代码索引地图

> 本文档用于快速定位代码、排查问题、理解系统架构。修改本项目前请先读此文档。

---

## 一、项目全局概览

**这是什么：** 一个纯静态个人博客系统。无登录、无评论、无数据库、无动态增删改查。内容源是 Obsidian 原生 Markdown 笔记，构建为静态 HTML，托管在 Cloudflare Workers 静态资源上（免费计划，无需绑卡）。

**核心链路：**

```
content/posts/*.md（Obsidian 原生语法）
        │  npm run build（scripts/build.mjs）
        ▼
dist/（纯静态 HTML/CSS/JS）
        │  git push → GitHub Actions 自动构建部署
        ▼
Cloudflare Worker（静态资源托管，绑定自定义域名）
```

**技术栈：**

| 层 | 选型 | 说明 |
| :--- | :--- | :--- |
| 构建器 | Node.js ESM + marked + gray-matter | 仅 2 个运行时依赖，无静态站点框架 |
| 前端 | 手写 HTML/CSS/JS | 暖色人文风（Warm Editorial），无前端框架 |
| 托管 | Cloudflare Workers Static Assets | `wrangler.jsonc` 指向 `dist/`，不写任何 Worker 代码 |
| CI/CD | GitHub Actions + wrangler-action | push 到 main 自动构建部署 |

**设计约束（不可破坏的规则）：**

- 笔记保持 Obsidian 原生写法，构建器负责适配，**不为发布改笔记语法**
- 未标记 `publish: true` 的笔记完全不存在于公开站，`[[双链]]` 引用它们时降级为纯文本（不产生死链）
- **只有被已发布文章引用的图片才会进入 `dist/assets/img/`**——下线一篇文章，它的附件（含 `.assets` 文件夹）也随之从公开站消失（隐私保护机制）
- 无任何动态功能：不引入 D1 / KV / R2 / 登录 / 评论
- 移动端 TOC 隐藏（`@media max-width 860px`），桌面端 TOC 宽度 ≤ 屏幕的 1/4
- 页脚为粘性布局（body flex + `margin-top: auto`），内容不满一屏时贴视口底部；改 body/容器布局时注意不要破坏它

---

## 二、仓库结构与文件索引

```
Sovyn/
├── MAP.md                              # 本文档（注意：content/posts/MAP.md 是另一篇文章「手搓的 Skill——MAP」，与本文件无关）
│
├── content/                            # 【内容源】Obsidian 拷入，保持原生语法
│   ├── posts/                          # 文章目录（每篇一个 .md，当前 22 篇 / 发布 18 篇）
│   │   ├── 知识库首页.md               #   知识库入口笔记（pinned: true，首页置顶）
│   │   ├── hello-world.md 等 3 篇      #   项目初期占位示例，已设 publish: false（草稿）
│   │   ├── Typora的安装和破解.md       #   已下线（publish: false），其 .assets 截图不进公开站
│   │   └── 笔记名.assets/              #   Typora 图片文件夹（与 .md 同名，整体拷贝）
│   ├── assets/                         # 图片附件的另一种放法（构建时统一拷到 /assets/img/）
│   │   └── diagram.svg
│   └── about.md                        # 关于页内容（不需要 publish 字段，始终构建）
│
├── scripts/                            # 【构建器】全部核心逻辑
│   ├── build.mjs                       # 主流程：加载 → 语法转换 → 渲染 → 产出页面
│   └── templates.mjs                   # 页面模板部件：layout / hero / 文章页 / callout 等
│
├── assets/                             # 【站点自身资源】与文章附件无关，整目录拷入 dist/assets/
│   ├── css/style.css                   # 全站唯一样式表（设计系统变量 + 组件样式）
│   ├── js/site.js                      # 交互：代码块一键复制 + TOC 高亮滚动
│   └── img/                            # 站点自身图片：icon.png（favicon+导航 logo）/ hero.png（首页插图）
│
├── site.json                           # 站点配置：标题 / hero 文案+插图 / 域名 url / 页脚
├── wrangler.jsonc                       # Cloudflare Worker 静态资源配置
├── package.json                        # npm scripts：build / dev / deploy
├── .github/workflows/deploy.yml        # push main → 自动构建 + wrangler deploy
├── design-preview.html                 # 样式定稿审查页（开发期产物，不参与构建）
├── map/                                # MAP 技能的 skill 定义（工具文档，与博客无关）
│
├── dist/                               # 【构建产物】gitignore，部署目标
└── node_modules/                       # gitignore
```

---

## 三、构建器核心：代码 → 功能映射

全部构建逻辑在 `scripts/build.mjs`（约 300 行），按数据流顺序：

| 函数 / 模块 | 位置 | 职责 |
| :--- | :--- | :--- |
| `loadPost(file)` | build.mjs | 解析单篇笔记：frontmatter（title/date/tags/summary/aliases/pinned/**publish**）+ 正文。date 兼容 YAML 无引号日期（gray-matter 会解析成 Date 对象，需 toISOString） |
| `buildContext(posts, images)` | build.mjs | 建两张索引表：①笔记名→文章（文件名 / title / aliases 都可作为 `[[]]` 引用键，大小写不敏感）②图片名→URL（带扩展名和不带都注册） |
| `collectImages(publishedPosts)` | build.mjs | **只收集被已发布文章引用的图片**：先从已发布文章正文提取全部 `![[...]]` / `![](...)` 引用，再按「文件名 / 不含扩展名 / 相对路径」三种键匹配 content/ 下的图片文件。未发布文章的附件不进 dist（隐私机制） |
| `transformInline(md, ctx)` | build.mjs | 行内语法转换。**先按 ```` ``` ```` 分段跳过代码块，再按 `` ` `` 分段跳过行内代码**，避免语法说明文字被误转换 |
| `wikilinkHtml(name, alias, ctx)` | build.mjs | `[[笔记]]` → 已发布则站内链接（`.wikilink`），未发布则降级虚线文本（`.wikilink-dead`） |
| `embedReplacer(target, ctx)` | build.mjs | `![[xxx]]` → 先按图片名匹配（`<img>`），再按笔记匹配（引用卡片），都没有则斜体纯文本 |
| `transformCallouts(md, ctx)` | build.mjs | `> [!type] 标题` 引用块 → callout 卡片 HTML。逐行状态机收集，支持 callout 内嵌 Markdown |
| `marked.use({ renderer.code })` | build.mjs | 自定义代码块渲染：包一层 `.code-block` 结构，含语言标签 + 复制按钮（按钮逻辑在 site.js） |
| `renderPost(post, ctx)` | build.mjs | 组合调用上述转换 → marked 渲染 → 给 h2/h3 加锚点 id 并收集 TOC → 计算阅读时长（400 字/分钟） |
| `main()` | build.mjs | 主流程：过滤 `publish: true` → 收集已发布文章引用的图片 → 渲染 → 清空 dist → 产出全部页面 → 拷贝静态资源 |

**模板部件**（`scripts/templates.mjs`）：

| 导出函数 | 产出 |
| :--- | :--- |
| `layout(site, opts)` | 页面骨架：head（含 favicon `/assets/img/icon.png`）/ 导航（logo 图标+站名 / 首页·标签·文章总览）/ 页脚（site.json 的 footer.left + footer.links + 关于）。`active` 参数控制导航高亮 |
| `heroHtml(site)` / `postItemHtml` / `postListHtml` / `postCardHtml` / `postGridHtml` | 首页 Hero 区（**左文右图** grid：hero-text + hero-art，配 site.json `hero.image` 后显示插图，移动端折叠单栏）、列表卡片、总览页 4 列网格卡片（带 data-* 供搜索过滤） |
| `articlePageHtml(post, tocHtml)` | 文章页网格：正文左 + TOC 右（sticky），与 design-preview 定稿一致 |
| `embedCardHtml` / `calloutHtml` | 引用卡片 / callout 卡片（8 种类型 → 3 种配色） |
| `archiveHtml` / `tagIndexHtml` / `aboutPageHtml` / `notFoundHtml` | 总览页（搜索框 + 按年分组网格）/ 标签云 / 关于页 / 404 |

---

## 四、页面产物映射

`npm run build` 后 `dist/` 的完整产物：

| URL 路径 | 源 | 生成函数 |
| :--- | :--- | :--- |
| `/` | site.json + 全部文章 | `buildHomePage` |
| `/posts/<slug>/` | content/posts/*.md | `renderPost` + `articlePageHtml` |
| `/tags/` | 全部标签聚合 | `buildTagPages` |
| `/tags/<标签名>/` | 单标签文章列表 | `buildTagPages` |
| `/archive/` | 全部文章按年分组 | `buildArchivePage` |
| `/about/` | content/about.md | `buildAboutPage` |
| `/404.html` | — | `notFoundHtml`（wrangler `not_found_handling`） |
| `/feed.xml` `/sitemap.xml` `/search.json` | 全部文章 | `buildFeed` / `buildSitemap`（search.json 在浏览器端被 site.js 消费：总览页搜索过滤 + 首页随机推荐） |
| `/assets/css/` `/assets/js/` `/assets/img/` | assets/ 目录（css / js / 站点自身图片 icon.png、hero.png） | 原样拷贝 |
| `/assets/img/<文章图片>` | **仅被已发布文章引用的图片**（含「笔记名.assets」） | 按引用名匹配收集，平铺拷贝，同名自动加目录前缀 |

---

## 五、配置文件速查

| 文件 | 控制什么 | 什么时候改它 |
| :--- | :--- | :--- |
| `site.json` | 站点标题（`title`，用于标签页标题 / 导航 logo 文字）、`description`（标签页副标题）、hero 文案与**插图**（`hero.image` / `hero.alt`）、**域名 url**（影响 feed.xml / sitemap.xml 里的绝对链接）、页脚（`footer.left` / `footer.links`） | 换 favicon/hero 图（替换 `assets/img/icon.png` / `hero.png`）；改页脚 GitHub 链接；上线前必须把 `url` 改成真实域名 |
| `wrangler.jsonc` | Worker 名称、assets 目录指向 dist、404 处理 | 改 Worker 名（影响 CF 控制台显示）时 |
| `package.json` | npm scripts（build / dev / deploy）、依赖版本 | 升级 marked / gray-matter 时 |
| `.github/workflows/deploy.yml` | CI/CD：Node 22 + npm ci + build + wrangler deploy | 部署流程变更时 |
| `content/posts/*.md` frontmatter | title / date / tags / summary / aliases / pinned / publish / slug | 每次写文章，见第八节 frontmatter 规范 |

**环境变量 / 密钥（不在仓库中）：**

| 密钥 | 配置位置 | 用途 |
| :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | GitHub 仓库 Secrets | Actions 部署凭证（CF Dashboard → My Profile → API Tokens，用 Workers 模板） |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub 仓库 Secrets | CF 账户 ID（Dashboard 右侧栏） |

---

## 六、Obsidian 语法兼容规则（核心业务规则）

| Obsidian 写法 | 网页渲染结果 | 实现位置 |
| :--- | :--- | :--- |
| `[[笔记名]]` | 站内链接（橙色渐变高亮） | `wikilinkHtml` |
| `[[笔记名\|别名]]` | 显示别名，跳转目标不变 | `wikilinkHtml` |
| `[[未发布笔记]]` | 虚线纯文本，悬停提示"该笔记未公开发布" | `wikilinkHtml` |
| `![[图片名.png]]` | `<img>`，按文件名全局索引定位（无论图片在哪个目录） | `embedReplacer` |
| `![](笔记名.assets/x.png)` | 标准 md 图片语法，按 md 所在目录解析相对路径（Typora 兼容） | `mdImageReplacer` |
| `![[笔记名]]` | 引用卡片（标题 + 摘要 + 链接），**不**展开对方内容 | `embedCardHtml` |
| `> [!note/tip/warning/...]` | 配色卡片（note/info/question/quote → 蓝，tip/hint → 绿，warning/caution → 橙黄） | `transformCallouts` + `calloutHtml` |
| `#标签` | 可点击标签，跳转标签聚合页 | `transformInline` 正则 |
| `` `[[行内代码]]` `` | **不转换**，原样显示（语法保护） | `transformInline` 的 `` ` `` 分段 |

---

## 七、常见排障

### 场景 1：`[[双链]]` 渲染成了纯文本（虚线）

1. 目标笔记是否在 `content/posts/` 目录下
2. 目标笔记 frontmatter 是否写了 `publish: true`
3. 引用名是否与目标文件名 / title / aliases 一致（大小写不敏感）

### 场景 2：`![[图片]]` 不显示

1. 图片文件是否在 `content/` 下（`.assets` 文件夹或 `content/assets/`）
2. 引用名是否与文件名（带或不带扩展名）一致
3. **所在文章是否 `publish: true`**——未发布文章引用的图片不会进入 `dist/assets/img/`（隐私机制）
4. 构建产物里是否有该文件：`dist/assets/img/`

### 场景 3：文章日期显示错误（如时区偏移一天）

- gray-matter 会把无引号的 `date: 2026-08-28` 解析为 UTC Date 对象
- `loadPost` 已做 `toISOString().slice(0,10)` 处理；若仍异常，在 frontmatter 中给日期加引号 `date: "2026-08-28"`

### 场景 4：代码块里/行内代码里的 `[[语法说明]]` 被误转换

- `transformInline` 已做双重保护（``` 分段 + `` ` `` 分段）
- 若再出现：检查该内容是否真的在代码环境内（如嵌套在 callout 里），callout 正文会**二次**经过 `transformInline`（`transformCallouts` 内部调用），属预期行为

### 场景 5：部署后页面 404

1. GitHub Actions 是否跑成功（Actions 标签页）
2. Secrets 是否配置：`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`
3. `wrangler.jsonc` 的 assets.directory 是否为 `./dist`
4. 自定义域名是否在 Worker 的 Domains & Routes 中绑定

### 场景 6：样式没更新

- CSS 在 `assets/css/style.css`，构建时原样拷贝
- 浏览器缓存：Cloudflare 边缘有缓存，强制刷新或等待 TTL 过期

---

## 八、扩展指南

### 新增一篇文章

1. 拷贝 .md 到 `content/posts/`，frontmatter 按统一规范书写（见下方 frontmatter 规范）
2. 图片附件放 `content/assets/` 或与 .md 同名的 `.assets` 文件夹
3. `git push` → Actions 自动构建部署

**frontmatter 统一规范（当前 18 篇已发布文章的标准格式）：**

```yaml
---
title: 文章标题（与主题一致；文章页大标题由它渲染，正文开头不要再写同名的 H1，否则重复显示）
date: 2026-08-30
tags: [核心知识, 大类别, 联动标签]   # 内联数组，三个为宜
summary: 一两句话摘要（单行；列表页和 RSS 直接展示纯文本，不要用 [[双链]] 语法）
publish: true                        # 必须有；false = 草稿/下线
---
```

**标签三件套约定**：一个自身核心知识（如 `Kali` / `Docker`）+ 一个大类别（`编程` / `工具` / `硬件` / `笔记方法`）+ 一个联动标签（`Agent` / `WSL` / `Linux` / `GitHub` 等，保证每个标签至少聚合 2 篇）。

**可选字段**：`pinned: true`（置顶，当前仅「知识库首页」使用）、`aliases: [别名]`（让 `[[别名]]` 也能命中）、`slug`（自定义 URL）。

### 新增一个页面类型（如"读书"页）

1. `scripts/templates.mjs` 加模板函数 + 导航项（`NAV` 数组）
2. `scripts/build.mjs` 的 `main()` 中加生成逻辑
3. 需要新 URL 路由时同步更新 `buildSitemap`

### 修改视觉样式

- 所有颜色 / 字体 / 圆角都在 `assets/css/style.css` 顶部的 `:root` CSS 变量，改一处全站生效
- 组件样式与 `design-preview.html`（定稿审查页）一一对应，可先用它预览

### 修改构建行为

- 入口都在 `scripts/build.mjs`，按第三节表格定位函数
- 模板 HTML 结构在 `scripts/templates.mjs`

---

## 九、当前站点状态速览（2026-08-30）

- 内容：22 篇笔记 / 18 篇发布；「知识库首页」置顶；3 篇初期示例 + Typora 文章为草稿
- 站点身份：Sovyn（favicon 与导航 logo 用 `assets/img/icon.png`，首页插图 `hero.png`）
- 域名：`https://sovyn.eu.cc`；仓库：`https://github.com/Yuu-Harunio/Sovyn-Blog`
- 已内置的隐私机制：①未发布文章的图片不进 dist；②未发布笔记的双链降级为纯文本
- 内容红线：文章发布前检查真实 BSSID / 设备 MAC / 内网 IP / 账户名 / 激活截图等隐私痕迹（用占位符替换）

---

## 十、Agent Quick Start

修改本项目前：

1. 先读 MAP.md（本文件）
2. 按第四节确认目标页面 / 第三节定位构建函数
3. 遵守第一节的设计约束（无动态功能 / Obsidian 原生语法 / publish 过滤 / 图片按引用收集）
4. 改动后运行 `npm run build` 验证，用本地服务器抽查产物 HTML
5. 涉及架构、语法规则、页面结构变更时，同步更新本文件

---

**文档版本：** v1.2（v1.2：品牌化——Sovyn 站名/favicon/导航 logo/页脚、hero 左文右图、粘性页脚、图片按引用收集的隐私机制、frontmatter 三标签规范、22 篇内容现状；v1.1：Typora `.assets` 图片支持、首页最新 3 篇 + 随机推荐、总览页 4 列网格 + 站内搜索）
**最后更新：** 2026-08-30
**维护者：** Yanzi
