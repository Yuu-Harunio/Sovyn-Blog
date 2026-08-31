---
title: GitHub 使用教程（小白版）
date: 2026-08-23
tags: [Git, 编程, GitHub]
summary: 面向零基础用户，讲解如何注册 GitHub、安装配置 Git、将本地项目上传到远程仓库，并附常用 Git 命令清单与常见问题排障。它是本知识库多个 Skill 文档共同依赖的基础工具教程。
publish: true
---

# GitHub 使用教程（小白版）

> **开篇摘要**：本教程面向零基础用户，教你如何将本地项目上传到 GitHub，并列出日常开发中最常用的 Git 命令。无论后续学习任何 Skill 或参与项目开发，Git/GitHub 都是最基础的版本控制能力。

---

## 一、准备工作

### 1. 注册 GitHub 账号
- 访问 [github.com](https://github.com)
- 点击 **Sign up**，按提示完成注册

### 2. 安装 Git
<!-- 修改说明：原「[[Git - 安装 Git](外部链接)]」混用了内部链接与外部链接语法，已修正为标准外部链接。 -->
- 下载地址：[Git - 安装 Git](https://git-scm.com/book/zh/v2/起步-安装-Git)
- 安装时全部保持默认选项即可
- 安装完成后，在桌面右键选择 **Git Bash Here**，输入以下命令检查是否安装成功：

```bash
git --version
```

### 3. 配置用户名和邮箱（本地身份标识）
打开命令行（或 Git Bash），执行：

```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的注册邮箱"
```

> 注意：这两条信息会记录在你每次提交的版本中，必须和 GitHub 账号一致。

---

## 二、将本地项目上传到 GitHub（完整流程）

### 步骤 1：在 GitHub 上创建仓库
- 登录 GitHub，点击右上角 **+** → **New repository**
- 填写仓库名称（如 `my-project`）
- 可选择添加描述，仓库类型选 **Public**（公开）或 **Private**（私有）
- **不要勾选** “Add a README file”（避免后续冲突）
- 点击 **Create repository**

创建后会得到一个远程仓库地址，例如：
```
https://github.com/你的用户名/仓库名.git
```

---

### 步骤 2：在本地项目文件夹中初始化 Git
打开命令行，进入你的项目文件夹：

```bash
cd 你的项目路径
git init
```

此时该文件夹下会出现一个隐藏的 `.git` 文件夹，表示 Git 仓库初始化成功。

---

### 步骤 3：添加文件到暂存区
将当前目录下所有文件添加到 Git 暂存区：

```bash
git add .
```

如果只想添加某个文件：

```bash
git add 文件名
```

---

### 步骤 4：提交到本地仓库
给本次提交添加一个说明信息：

```bash
git commit -m "首次提交项目"
```

---

### 步骤 5：绑定远程仓库
将本地仓库与 GitHub 上的远程仓库关联：

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
```

> 如果之前绑定错误，可以先删除：`git remote remove origin`

---

### 步骤 6：推送到 GitHub
首次推送需要指定分支（默认是 `main` 或 `master`）：

```bash
git push -u origin main
```

如果提示 `main` 不存在，试试 `master`：

```bash
git push -u origin master
```

之后每次更新只需执行：

```bash
git push
```

---

## 三、VS Code 可视化操作（可选）

如果你使用 VS Code，可以更直观地操作：

1. 打开项目文件夹
2. 点击左侧 **源代码管理** 图标（第三个）
3. 点击 **初始化仓库**（如果还未初始化）
4. 在 **更改** 区域点击 **+** 暂存文件
5. 输入提交说明，点击 **✓** 提交
6. 点击 **···** → **Remote** → **Add Remote**，填入远程仓库地址
7. 点击底部状态栏的 **发布分支** 或使用推送按钮上传

---

## 四、常用 Git 命令清单

**基础配置与初始化**

```bash
git init                        # 在当前目录初始化 Git 仓库
git config --global user.name "用户名"   # 设置全局用户名
git config --global user.email "邮箱"    # 设置全局邮箱
```

**日常操作**

```bash
git status                      # 查看当前文件状态
git add <文件>                  # 将指定文件添加到暂存区
git add .                       # 将所有改动添加到暂存区
git commit -m "说明"            # 提交暂存区内容到本地仓库
git log                         # 查看提交历史记录
git diff                        # 查看未暂存的修改差异
```

**远程仓库操作**

```bash
git remote add origin <地址>    # 绑定远程仓库
git remote -v                   # 查看已绑定的远程仓库地址
git remote remove origin        # 删除已绑定的远程仓库
git push -u origin <分支名>     # 首次推送并关联远程分支
git push                        # 推送本地提交到远程仓库
git pull                        # 从远程仓库拉取最新代码到本地
git clone <地址>                # 克隆远程仓库到本地
```

**分支操作**

```bash
git branch                      # 查看本地分支列表
git branch <分支名>             # 创建新分支
git checkout <分支名>           # 切换到指定分支
git merge <分支名>              # 将指定分支合并到当前分支
```

**撤销与恢复**

```bash
git reset HEAD <文件>           # 撤销暂存区的文件（保留修改）
git checkout -- <文件>          # 丢弃工作区的修改（危险操作）
```

---

## 五、常见问题与解决

### 1. 推送时提示 `fatal: remote origin already exists`
说明已绑定远程仓库，可以先删除再重新添加：

```bash
git remote remove origin
git remote add origin 新地址
```

### 2. 推送被拒绝（rejected）
通常是远程仓库有新的提交而本地没有拉取，先执行：

```bash
git pull origin main --allow-unrelated-histories
```

解决冲突后再推送。

### 3. 忘记 `-u` 参数
首次推送如果没有加 `-u`，之后每次都要写完整命令，建议首次使用：

```bash
git push -u origin main
```

---

## 六、学习建议

- 多用 `git status` 查看当前状态，避免出错
- 提交说明尽量写清楚本次做了什么
- 建议每次开发新功能前先 `git pull` 拉取最新代码
- 遇到问题先复制错误信息去搜索引擎查找，大部分问题都有现成答案

---

**祝你顺利上手 GitHub！** 🚀

---

## 相关笔记

- 返回知识库首页 → [[知识库首页]]

- 依赖 Git 的软件安装/破解教程 → [[Typora的安装和破解]]
- 多个 Agent Skill 的下载与安装都依赖 GitHub → [[Firecrawl]]、[[Graphify]]、[[Grill-Me]]
- Hermes 培养手册中会用到 Git 日常操作 → [[Hermes Agent 培养手册（从 0 到全栈工程师）]]