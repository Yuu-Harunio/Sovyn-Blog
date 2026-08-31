# Sovyn 博客使用指南（纯小白版）

> 目标读者：没用过 Git、Cloudflare、命令行的完全新手。
> 读完这篇，你能做到：把博客上线到自己的域名，并学会日常发文章。

---

## 目录

1. [先搞清楚这个博客是怎么运作的](#一先搞清楚这个博客是怎么运作的)
2. [上线前的准备](#二上线前的准备)
3. [第一次部署（只做一次）](#三第一次部署只做一次)
4. [绑定你自己的域名](#四绑定你自己的域名)
5. [日常发文章（最常用）](#五日常发文章最常用)
6. [常见问题](#六常见问题)

---

## 一、先搞清楚这个博客是怎么运作的

整个博客的运作流程可以用一张图说清：

```
你的 Obsidian 笔记（.md 文件 + 图片）
        │  拷贝进项目的 content/posts/ 文件夹
        ▼
GitHub 仓库（项目代码 + 文章存放地）
        │  git push 之后自动触发
        ▼
GitHub Actions（云端自动执行 npm run build，
        │  把 Markdown 编译成网页文件）
        ▼
Cloudflare Workers（免费托管网页，全球访问加速）
        │
        ▼
访客通过你的域名访问博客
```

**你日常只需要关心第一步**：写好笔记、拷进项目、push。剩下的全自动。

三个关键认知：

- **文章 = 一个 .md 文件**。放一篇就多一篇文章，删掉就下线
- **"发布"是个开关**。文件开头的 frontmatter 里写 `publish: true` 才会公开，不写就是草稿（拷进来也不怕）
- **全程免费**。Cloudflare 免费计划足够个人博客用，不需要绑定付款方式

---

## 二、上线前的准备

需要注册 / 安装三样东西：

### 1. 一个 GitHub 账号（存代码和文章）

访问 https://github.com → Sign up，邮箱注册即可。

### 2. 一个 Cloudflare 账号（托管网站）

访问 https://dash.cloudflare.com/sign-up → 注册免费计划即可。

**前提**：你的域名已经添加到 Cloudflare（你说域名已经托管在 CF 上，这步已完成）。

### 3. 本地装好三个软件

| 软件 | 用途 | 下载地址 / 安装方式 |
| :--- | :--- | :--- |
| Node.js（LTS 版本，22+） | 运行构建脚本 | https://nodejs.org 下载 LTS 安装包，一路下一步 |
| Git | 把代码推到 GitHub | https://git-scm.com/downloads 下载安装 |
| VS Code（可选但推荐） | 编辑文件、用终端 | https://code.visualstudio.com |

验证安装：打开终端（Windows 用 PowerShell），输入：

```bash
node -v
git --version
```

两个都能显示版本号就 OK。

---

## 三、第一次部署（只做一次）

### 第 1 步：把项目推到 GitHub

1. 在 GitHub 上新建仓库：右上角 **+** → New repository
   - 名称随意（比如 `sovyn-blog`）
   - 选 **Private**（私有）或 Public 都可以
   - **不要**勾选 README / .gitignore（项目里已有）
2. 在本地项目文件夹打开终端，执行：

```bash
cd 你的项目路径        # 例如 cd d:\Code\AAstudy\AAAdesktop\Sovyn
git init
git add .
git commit -m "init blog"
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

### 第 2 步：修改站点配置

用编辑器打开项目根目录的 `site.json`，把这几处换成你的信息：

```json
{
  "url": "https://你的域名.com",     ← 改成你的真实域名（注意有 https:// ，结尾不带 /）
  "hero": {
    "heading": "你的大标题",
    "intro": "你的个人介绍",
    "tags": ["你的", "标签"]
  }
}
```

改完再提交一次：

```bash
git add site.json
git commit -m "update site config"
git push
```

### 第 3 步：获取 Cloudflare 的两个钥匙

**Account ID（账户 ID）：**

1. 登录 https://dash.cloudflare.com
2. 任意进入一个域名的概览页，**右侧栏**往下找，有一行"账户 ID"，点击复制

**API Token：**

1. 点右上角头像 → **My Profile** → 左侧 **API Tokens**
2. 点 **Create Token**
3. 找到 **"Edit Cloudflare Workers"** 模板 → 点 **Use template** → 一路 Continue → Create Token
4. **立刻复制显示的 Token**（只显示一次！）

### 第 4 步：把钥匙配置到 GitHub

1. 打开你的 GitHub 仓库页面 → **Settings** → 左侧 **Secrets and variables** → **Actions**
2. 点 **New repository secret**，添加两条：

| Name（一字不差） | Secret（粘贴刚才复制的值） |
| :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | 那串很长的 Token |
| `CLOUDFLARE_ACCOUNT_ID` | 账户 ID |

### 第 5 步：触发首次部署

随便改点什么再 push 一次（或不用改，直接去仓库页面 → **Actions** 标签 → 左侧 **Deploy to Cloudflare** → 右侧 **Run workflow** 手动触发一次）。

等待 1-2 分钟，Actions 显示绿色 ✓ 就部署成功了。

此时网站已经有了一个临时测试地址：`https://sovyn-blog.你的子域.workers.dev`（在 Cloudflare Dashboard → Workers & Pages 里能看到）。**但我们的目标是自己的域名，继续下一步。**

---

## 四、绑定你自己的域名

1. 登录 Cloudflare Dashboard → 左侧 **Workers & Pages**
2. 点进 `sovyn-blog` 这个 Worker → **Settings** → **Domains & Routes**
3. 点 **Add** → **Custom domain**
4. 输入你的域名（如 `blog.yourdomain.com` 或直接 `yourdomain.com`）→ **Add domain**
5. 因为域名本来就在 Cloudflare 托管，DNS 记录会**自动创建**，等几分钟生效

打开浏览器访问你的域名，看到博客首页即上线成功。

> 提示：如果想用 `www.yourdomain.com` 之类的其他子域，重复第 3-4 步即可。

---

## 五、日常发文章（最常用）

### 发一篇新文章的完整流程

**第 1 步：在 Obsidian 里正常写笔记**（保持你平时的习惯，双链、callout、图片嵌入都能用）

**第 2 步：拷贝文件进项目**

| 拷什么 | 放到哪 |
| :--- | :--- |
| 笔记 .md 文件 | `content/posts/` 文件夹 |
| 笔记里的图片附件 | 跟着笔记一起拷贝即可：Typora 的「笔记名.assets」整个文件夹放到 .md 旁边（推荐，保持原样）；或放进 `content/assets/`。两种方式构建器都会自动收集 |

**第 3 步：在笔记开头加上"发布说明"（frontmatter）**

用文本编辑器打开拷进来的 .md，在最顶部加上这段：

```yaml
---
title: 文章标题
date: 2026-08-30
tags: [标签1, 标签2]
summary: 一两句话的文章摘要，会显示在首页列表里。
publish: true
---

（下面是你笔记原有的内容，一字不动）
```

各字段说明：

| 字段 | 必填 | 作用 |
| :--- | :--- | :--- |
| `title` | 推荐 | 显示的标题（不写则用文件名） |
| `date` | 推荐 | 排序依据，格式 `2026-08-30` |
| `tags` | 可选 | 标签列表，会自动生成标签聚合页 |
| `summary` | 可选 | 首页列表和引用卡片的摘要 |
| `publish: true` | **必须** | **不写这行 = 不发布，只是草稿** |
| `pinned: true` | 可选 | 置顶显示在列表最上面 |
| `aliases: [别名]` | 可选 | 让 `[[别名]]` 也能链接到这篇 |

**第 4 步：推送上线**

```bash
git add .
git commit -m "发布新文章：xxx"
git push
```

push 后等 1-2 分钟（GitHub Actions 自动构建部署），刷新网站就能看到新文章。

### 双向链接怎么写

在任意文章里写 `[[另一篇笔记的文件名]]`：

- 对方**已发布** → 网页上变成可点击的橙色链接
- 对方**未发布/不存在** → 显示为灰色虚线文字，不会出现死链

文末想列"相关文章"，直接写一个链接列表即可：

```markdown
相关文章：

- [[另一篇笔记]]
- [[笔记名|显示成别的名字]]
```

### 下线一篇文章

删掉 `content/posts/` 里对应的 .md 文件（或把 `publish: true` 改成 `publish: false`），push 即可。

### 改个人介绍 / 页脚

改 `site.json`，push。

### 改样式颜色

改 `assets/css/style.css` 最顶部的 `:root` 变量（颜色、字体、圆角都在这），push。

---

## 六、常见问题

### Q1：push 之后网站没变化？

1. 去 GitHub 仓库 → **Actions** 看构建记录是不是红色 ✗ 失败了，点进去看报错
2. 最常见失败原因：`CLOUDFLARE_API_TOKEN` 复制错了，去 Settings → Secrets 重新粘贴
3. 如果 Actions 是绿色 ✓ 但网站没变：浏览器缓存或 Cloudflare 边缘缓存，强制刷新（Ctrl+F5）或等几分钟

### Q2：文章里的 `[[链接]]` 显示成灰色虚线，点不了？

被链接的那篇笔记：① 不在 `content/posts/` 里；② 没写 `publish: true`；③ 文件名和你写的 `[[名字]]` 不一致（大小写不敏感，但字要一样）。

### Q3：图片不显示？

① 图片没拷进项目（`.assets` 文件夹要和 .md 一起拷）；② `![[图片名]]` 里的名字和文件名不一致；③ 标准写法 `![](路径)` 的路径不对。检查 `dist/assets/img/` 里有没有这张图。

### Q4：想本地预览效果再发布怎么办？

```bash
npm install       # 只需第一次
npm run build     # 构建到 dist/
npx -y serve dist # 本地起服务器
```

浏览器打开 http://localhost:3000 预览，确认没问题再 push。

### Q5：域名解析了但打不开？

1. 确认 Worker 的 Domains & Routes 里域名状态是 Active
2. 去 Cloudflare DNS 页确认有那条指向 Worker 的记录
3. 刚绑定等几分钟，全球 DNS 生效最长可能要几小时

### Q6：会花钱吗？

不会。Workers 免费计划：每天 10 万次请求，个人博客远远用不完。唯一的成本是你已经付过的域名年费。

---

**下一步建议**：现在就去完成第三、四节的首次部署，用示例的三篇文章跑通全流程，再替换成你自己的笔记。
