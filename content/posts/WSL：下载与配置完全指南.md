---
title: Windows Subsystem for Linux (WSL)：下载与配置完全指南
date: 2026-08-23
tags: [WSL, 编程, Linux]
summary: WSL（Windows Subsystem for Linux）是 Windows 内置的轻量级 Linux 运行环境，让你无需虚拟机即可在 Windows 中运行 Linux 命令行和应用程序。本教程从 WSL 核心概念、系统要求、一键安装与手动配置、WSL 2 切换、常用命令、发行版管理迁移、高级配置到常见问题，覆盖 WSL 从入门到上手的完整流程，是后端开发和容器化开发的基础工具。
publish: true
---

# Windows Subsystem for Linux (WSL)：下载与配置完全指南

> 适合零基础读者，读完即可在 Windows 上拥有一个完整的 Linux 开发环境。
> 参考视频资料：[Windows跑AI Agent，WSL才是终极答案，别羡慕Mac了， WSL保姆级全攻略，海量实战教程，一期视频精通_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1pYNm69EPm/?)

> **开篇摘要**：WSL（Windows Subsystem for Linux）是 Windows 内置的 Linux 运行环境，让你无需安装虚拟机或双系统，就能在 Windows 中直接运行 Linux 命令行工具和应用程序。本教程从 WSL 的核心概念讲起，覆盖系统要求、一键安装与手动安装、WSL 2 配置、常用命令、发行版管理与迁移备份，帮助你快速上手。


## 一、WSL 是什么？为什么需要它？

在 Windows 上做开发，经常会遇到这样的困境：**项目需要 Linux 环境，但装虚拟机太笨重，装双系统又太麻烦**。Docker 需要 Linux 内核支持（详见 [[Docker 从零到上手：新手小白教程]]），很多后端工具（如 Redis、Nginx）在 Linux 上表现更好，但日常工作又离不开 Windows。

WSL（Windows Subsystem for Linux）就是为解决这个问题而生的。它是微软官方提供的**轻量级 Linux 运行环境**，让你在 Windows 系统中直接运行 Linux 命令行工具和应用程序，而无需安装虚拟机或双系统。WSL 2 采用了完整的 Linux 内核，相比 WSL 1 在文件访问速度上提升了约 20 倍，并支持完整的系统调用。

简单来说：**WSL 让 Windows 和 Linux 可以"和平共处"**，你可以在同一个系统中同时使用两者的优势。


## 二、核心概念：WSL 1 与 WSL 2

WSL 有两个主要版本，理解它们的区别有助于你选择合适的配置：

| 特性 | WSL 1 | WSL 2 |
|------|-------|-------|
| 架构 | 翻译层（将 Linux 系统调用转换为 Windows 系统调用） | 轻量级虚拟机（运行完整 Linux 内核） |
| 文件性能 | 跨系统文件访问较快 | Linux 文件系统性能大幅提升 |
| 系统调用兼容性 | 部分系统调用不支持 | 完整系统调用支持 |
| Docker 支持 | 不支持 | 完美支持 |
| 适用场景 | 需要频繁访问 Windows 文件的场景 | 大多数开发场景（推荐） |

**建议**：除非有特殊需求，否则直接使用 **WSL 2** 即可。现代 WSL 一般都指 WSL 2。


## 三、系统要求

在安装 WSL 之前，请确认你的系统满足以下要求：

- **Windows 10**：版本 2004 或更高（内部版本 19041 或更高）
- **Windows 11**：所有版本均支持
- **硬件**：需要在 BIOS/UEFI 中启用虚拟化技术（VT-x / AMD-V）

> **如何查看系统版本**：按 `Win + R`，输入 `winver`，点击确定即可查看。


## 四、安装 WSL

### 方法一：一键安装（最推荐）

这是最简单的方式。以**管理员身份**打开 PowerShell 或 Windows 命令提示符，执行：

```powershell
wsl --install
```

这条命令会自动完成以下所有操作：

- 启用 WSL 和虚拟机平台等必要组件
- 下载并安装最新的 Linux 内核
- 将 WSL 2 设置为默认版本
- 下载并安装 Ubuntu Linux 发行版（可能需要重启）

安装完成后，**重启电脑**，然后首次启动 Ubuntu 时会提示你设置用户名和密码。

### 方法二：安装其他 Linux 发行版

**步骤一：仅安装 WSL 核心功能**

1. 右键点击“开始”菜单，选择 **“Windows PowerShell (管理员)”** 或 **“终端 (管理员)”**。

2. 在弹出的用户账户控制窗口中，点击“是”。

3. 在命令行中，输入以下命令并回车：

   ```powershell
   wsl --install --no-distribution
   ```

   这个命令会只安装 WSL 2 所需的核心组件和最新的 Linux 内核，而不会自动下载任何 Linux 发行版。

**步骤二：重启电脑**

安装完成后，**请务必重启你的电脑**。重启是让所有组件生效的关键一步。

**步骤三：验证安装**

电脑重启后，可以再次打开 PowerShell（无需管理员权限），输入以下命令来确认 WSL 核心功能已安装成功：

```powershell
wsl --list --verbose
```

如果看到类似 `Windows Subsystem for Linux has no installed distributions.` 的提示，就说明 WSL 已安装，但还没有安装任何 Linux 发行版，这正是我们想要的结果。

**如果你不想用 Ubuntu，可以先查看可用的发行版列表：**

```powershell
wsl --list --online
# 或简写为
wsl -l -o
```

**然后指定安装：**

```powershell
wsl --install -d <发行版名称>
```

例如安装 Ubuntu-24.04：`wsl --install -d Ubuntu 24.04`。

我个人电脑使用的指令就是：

```powershell
wsl --install Ubuntu 24.04 --location D:\wsl\ubuntu
```

==**记得在安装前创建好对应要安装的文件目录。**==

### 方法三：手动安装（适用于旧版 Windows 或特殊需求）

如果你的 Windows 版本较旧，或需要更精细的控制，可以按照以下步骤手动安装：

**步骤 1：启用 WSL 功能**

以管理员身份打开 PowerShell，执行：

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

**步骤 2：启用虚拟机平台（WSL 2 需要）**

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

**步骤 3：重启电脑**

**步骤 4：将 WSL 2 设置为默认版本**

```powershell
wsl --set-default-version 2
```

**步骤 5：安装 Linux 发行版**

可以从 Microsoft Store 搜索并安装你喜欢的 Linux 发行版（如 Ubuntu、Debian、Kali 等）。

### 常用安装选项说明

| 选项                | 说明                                       |
| :------------------ | :----------------------------------------- |
| `--distribution`    | 指定要安装的 Linux 发行版                  |
| `--no-launch`       | 安装完成后不自动启动该发行版               |
| `--web-download`    | 从网络下载安装包，而非 Microsoft Store     |
| `--location`        | 自定义安装目录（适合系统盘空间紧张的情况） |
| `--no-distribution` | 仅安装 WSL 内核，不附带任何发行版          |

## 五、首次启动与基本配置

安装完成后，可以通过以下方式启动 Ubuntu：

```powershell
# 在 PowerShell 中直接输入
wsl
```

或者从开始菜单中找到并点击 Ubuntu 图标。

**首次启动时**，系统会提示你创建一个 Linux 用户名和密码：

- **用户名**：建议使用简短的全小写英文名（如 `yanzi`）
- **密码**：输入时屏幕不会有任何显示，这是 Linux 的安全策略，正常输入后回车即可

> **注意**：这个用户名和密码是**独立于 Windows 的**，用于管理这个 Linux 发行版。

## 六、更换软件源（国内用户必看）

Ubuntu 默认的软件源在国外，下载速度可能很慢。推荐更换为国内镜像源。

### 方法一：一键脚本（最省心）

```bash
# GNU/Linux 更换系统软件源
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
```

该脚本会自动检测系统发行版并匹配最优镜像站。

### 方法二：手动更换（以 Ubuntu 24.04 为例）

```bash
# 备份原有配置
sudo cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak

# 替换为清华镜像源
sudo sed -i "s|http://.*archive.ubuntu.com|https://mirrors.tuna.tsinghua.edu.cn|g" /etc/apt/sources.list.d/ubuntu.sources
sudo sed -i "s|http://.*security.ubuntu.com|https://mirrors.tuna.tsinghua.edu.cn|g" /etc/apt/sources.list.d/ubuntu.sources

# 更新软件包列表
sudo apt update
```

> Ubuntu 24.04 及更高版本的源配置文件位于 `/etc/apt/sources.list.d/ubuntu.sources`；旧版本位于 `/etc/apt/sources.list`。

## 七、WSL 常用命令速查

以下命令在 PowerShell 或 Windows 命令提示符中执行：

### 发行版管理

| 命令                                    | 说明                                  |
| :-------------------------------------- | :------------------------------------ |
| `wsl --install`                         | 安装 WSL 和默认的 Ubuntu 发行版       |
| `wsl --list --online` 或 `wsl -l -o`    | 列出可在线安装的 Linux 发行版         |
| `wsl --list --verbose` 或 `wsl -l -v`   | 列出已安装的发行版及其状态和 WSL 版本 |
| `wsl --set-default <发行版名称>`        | 设置默认发行版                        |
| `wsl --set-version <发行版名称> <1或2>` | 切换发行版的 WSL 版本                 |
| `wsl --unregister <发行版名称>`         | 注销（删除）发行版及其所有数据        |
| `wsl --shutdown`                        | 立即关闭所有 WSL 发行版               |
| `wsl --terminate <发行版名称>`          | 终止指定的发行版                      |

### 发行版操作

| 命令                                              | 说明                   |
| :------------------------------------------------ | :--------------------- |
| `wsl`                                             | 进入默认发行版的 Shell |
| `wsl -d <发行版名称>`                             | 进入指定发行版         |
| `wsl -u <用户名>`                                 | 以指定用户身份进入     |
| `wsl --export <发行版名称> <路径>.tar`            | 导出发行版为备份文件   |
| `wsl --import <新名称> <安装目录> <备份文件>.tar` | 从备份文件导入发行版   |

## 八、高级配置：wsl.conf 与 .wslconfig

WSL 提供了两个配置文件用于高级设置：

### wsl.conf（按发行版配置）

位置：发行版内部的 `/etc/wsl.conf`

用于配置单个发行版的设置，支持以下配置段：

```ini
# 示例：/etc/wsl.conf

# 用户设置 - 设置默认登录用户
[user]
default=你的用户名

# 网络设置
[network]
generateHosts = true
generateResolvConf = true

# 互操作设置 - 与 Windows 的交互
[interop]
enabled = true
appendWindowsPath = true

# 自动挂载设置
[automount]
enabled = true
root = /mnt/
options = "metadata,umask=22,fmask=11"
```

### .wslconfig（全局配置）

位置：Windows 用户目录 `%UserProfile%\.wslconfig`

用于配置所有 WSL 2 发行版的全局设置：

```ini
# 示例：C:\Users\你的用户名\.wslconfig

[wsl2]
memory=8GB
swap=8GB
processors=8
networkingMode=mirrored
dnsTunneling=true
firewall=false
```

> **配置生效规则**：修改配置文件后，需要完全关闭 WSL 并重新启动才能生效。关闭所有发行版后大约需要等待 8 秒。可以使用 `wsl --shutdown` 快速关闭所有发行版。

## 九、发行版迁移与备份

### 导出备份

将整个发行版导出为 `.tar` 文件（包含所有数据）：

```powershell
wsl --export <发行版名称> <备份文件路径>.tar
```

示例：将 Ubuntu 备份到 D 盘

```powershell
wsl --export Ubuntu D:\wsl\ubuntu.tar
```

### 导入恢复

将备份文件导入为新发行版：

```powershell
wsl --import <新发行版名称> <安装目录> <备份文件路径>.tar
```

示例：

```powershell
wsl --import Ubuntu D:\wsl\ubuntu D:\wsl\ubuntu.tar
```

> **注意**：导入后默认以 root 用户登录。如需恢复普通用户，需要在导入后配置 `/etc/wsl.conf` 中的 `default` 用户。

## 十、常见问题与技巧

### 1. 忘记 root 密码怎么办？

以管理员身份打开 PowerShell，以 root 身份进入发行版：

```powershell
wsl -d Ubuntu -u root
```

进入后执行 `passwd root` 重置密码。

### 2. WSL 2 提示需要启用虚拟化

确保在 BIOS/UEFI 中启用了虚拟化技术（VT-x / AMD-V）。同时确认"虚拟机平台"Windows 功能已启用。

### 3. `wsl --list --online` 无法获取列表

可能是网络问题导致无法访问 GitHub。可以尝试：

- 修改 DNS 设置
- 在 hosts 文件中映射 `raw.githubusercontent.com` 的 IP
- 使用 VPN 或代理

### 4. Windows 访问 WSL 文件

在 Windows 文件资源管理器中输入 `\\wsl$\Ubuntu\home\<用户名>` 即可访问。

### 5. WSL 访问 Windows 文件

在 WSL 内部，Windows 的 C 盘挂载在 `/mnt/c/`。

### 6. 清理空间

长期使用后可以使用以下命令清理：

```powershell
# 查看磁盘使用情况（在 WSL 内部）
df -h

# 清理未使用的 Docker 资源（如已安装 Docker）
docker system prune
```

## 十一、总结

WSL 的核心流程可以概括为：

> **安装 WSL → 安装 Linux 发行版 → 配置环境 → 在 WSL 中开发**

掌握以下 5 个命令，你就已经可以开始使用 WSL 了：

```bash
wsl --install              # 安装 WSL 和 Ubuntu
wsl --list --online        # 查看可用的发行版
wsl --list --verbose       # 查看已安装的发行版
wsl                        # 进入默认发行版
wsl --shutdown             # 关闭所有 WSL
```

剩下的命令和配置，边用边查就好。

WSL 为 Windows 用户提供了一个轻量、高效的 Linux 开发环境，是运行 Docker、进行后端开发、学习 Linux 命令的理想选择。
## 相关笔记

- 返回知识库首页 → [[知识库首页]]
- Docker 在 WSL 2 中运行效率更高 → [[Docker 从零到上手：新手小白教程]]
- Ubuntu 24.04 虚拟机设置参考 → [[Ubuntu24.04虚拟机设置]]
- 外卖系统使用 Docker Compose 搭建开发环境 → [[外卖系统_Master_Spec_v2.0]]、[[外卖系统开发文档]]
- 软件清单与常用说明 → [[软件清单与常用说明]]