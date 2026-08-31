---
title: Ventoy 使用全解：一个 U 盘装遍所有系统
date: 2026-08-28
tags: [Ventoy, 工具, Kali]
summary: Ventoy 是一款开源免费的多系统启动盘制作工具，支持 ISO/WIM/IMG/VHD/EFI 等多种镜像格式，一次安装后无需反复格式化 U 盘，只需拷贝镜像文件即可启动。本文覆盖 Ventoy 的下载、安装、使用、高级功能（插件/主题/自动安装）及常见问题解决，是「Kali Linux 三路部署与无线安全实战」中 Ventoy 部分的完整展开。
publish: true
---

# Ventoy 使用全解：一个 U 盘装遍所有系统

> Ventoy 是一款国产开源的多系统启动盘制作工具[reference:0]。它的核心理念是 **“一次安装，无限复用”**——你只需要把 ISO/WIM/IMG/VHD/EFI 等镜像文件直接拷贝进 U 盘，Ventoy 就会在启动时自动生成一个菜单供你选择[reference:2]。从此告别每次换系统都要重新格式化 U 盘的烦恼[reference:3]。

---

## 一、Ventoy 是什么？为什么需要它？

传统制作启动盘的方式主要有两种痛点[reference:4]：

- **烧录类工具（如 Rufus、UltraISO）**：每换一个系统镜像就要重新格式化 U 盘再写入一次，非常麻烦[reference:5]。
- **PE 工具箱（如老毛桃、大白菜）**：虽然一次制作后可以换镜像，但大多捆绑推广软件和广告[reference:6]。

**Ventoy 完美解决了这些问题**[reference:7]：

| 特性               | 说明                                                         |
| :----------------- | :----------------------------------------------------------- |
| **免格式化**       | 安装一次 Ventoy 后，后续只需拷贝/删除镜像文件，无需重新格式化[reference:8] |
| **多镜像共存**     | 可同时存放 Windows、Linux、WinPE 等多个镜像，启动时菜单选择[reference:9] |
| **格式支持广**     | 支持 ISO、WIM、IMG、VHD(x)、EFI 等格式[reference:11]         |
| **兼容性强**       | 支持 x86 Legacy BIOS、IA32 UEFI、x86_64 UEFI、ARM64 UEFI、MIPS64EL UEFI |
| **跨平台**         | Windows 和 Linux 均可使用，提供图形界面和命令行两种方式[reference:13] |
| **开源免费无捆绑** | 完全开源，无广告无捆绑[reference:14]                         |
| **升级无损数据**   | 新版本直接升级，不影响 U 盘中已有的镜像文件[reference:15]    |

目前 Ventoy 已测试支持 **超过 1300 个** ISO 镜像文件[reference:17]，涵盖 Windows、Linux、Unix、ChromeOS、VMware、WinPE 等主流系统[reference:19]。

---

## 二、下载 Ventoy

### 2.1 官方下载地址

- **官网**：[https://www.ventoy.net](https://www.ventoy.net)[reference:20]
- **GitHub  Releases**：[https://github.com/ventoy/Ventoy/releases](https://github.com/ventoy/Ventoy/releases)[reference:21]

> **版本信息**：截至 2026 年 8 月，最新稳定版为 **1.1.17**（2026 年 7 月 24 日发布），优化了 Secure Boot 安全启动流程[reference:22]。

### 2.2 下载说明

Ventoy 是**绿色软件**，无需安装，下载后解压即可使用[reference:23]。根据你的操作系统选择对应版本：

- **Windows**：下载 `ventoy-xxx-windows.zip`
- **Linux**：下载 `ventoy-xxx-linux.tar.gz`

---

## 三、制作 Ventoy 启动盘（Windows）

> ⚠️ **警告**：制作过程会**格式化 U 盘**，U 盘上所有数据将被清除，请提前备份重要数据[reference:24][reference:25]。

### 3.1 操作步骤

1. **插入 U 盘**：建议使用容量 **16GB 以上**的 U 盘，优先 USB 3.0 规格[reference:26]。

2. **解压并运行程序**：解压下载的 zip 包，找到并**以管理员身份运行** `Ventoy2Disk.exe`（右键 → 以管理员身份运行）[reference:27][reference:28]。

   > 如果你使用的是 64 位 Windows，也可以选择 `altexe` 文件夹中的 `Ventoy2Disk_X64.exe`[reference:29]。

3. **选择目标 U 盘**：在“设备”下拉列表中确认选中的是目标 U 盘（**务必看清容量和盘符，千万别选错**）[reference:30][reference:31]。

4. **配置选项**（可选）：

   - **分区类型**：默认 **MBR** 即可，老电脑新电脑都能兼容。除非 U 盘大于 2TB，否则不用改[reference:32]。
   - **文件系统**：默认 **exFAT**，支持大于 4GB 的单个文件，兼容性好[reference:33]。
   - **安全启动支持**：建议勾选[reference:34]。

5. **点击“安装”**：弹出确认提示后点击“确定”，等待进度条走完（约 30 秒到 1 分钟）[reference:35]。

6. **安装成功**：出现“安装成功”提示后关闭窗口[reference:36]。

### 3.2 安装后的 U 盘结构

Ventoy 安装完成后，U 盘被分为两个分区[reference:37][reference:38]：

- **VTOYEFI 分区**（约 32MB，隐藏）：存放 Ventoy 的引导文件
- **数据分区**（剩余空间，exFAT 格式）：存放 ISO 镜像文件，在资源管理器中可见

> **关键点**：你只需要把镜像文件**直接拷贝到数据分区的根目录或任意文件夹**即可，无需解压[reference:39][reference:40]。Ventoy 会**递归搜索所有目录和子目录**，自动在启动菜单中列出所有镜像文件[reference:41]。

---

## 四、使用 Ventoy 启动盘

### 4.1 拷贝镜像文件

将你要使用的系统镜像（如 `ubuntu-24.04-desktop-amd64.iso`、`kali-linux-2026.3-installer-amd64.iso`、`Windows.iso` 等）**直接复制粘贴**到 U 盘的数据分区中[reference:42]。

> 建议按类别建立文件夹以便管理，例如：
> ```
> U盘根目录/
> ├── Linux/
> │   ├── ubuntu-24.04.iso
> │   └── kali-linux.iso
> ├── Windows/
> │   └── win11.iso
> └── PE/
>  └── firpe.iso
> ```

### 4.2 从 U 盘启动

1. 将制作好的 Ventoy U 盘插入目标电脑[reference:43]。
2. 开机时按启动项快捷键（常见的有 **F12、F11、Esc、F2**，不同品牌主板略有差异）进入启动菜单[reference:44]。
3. 选择 U 盘启动[reference:45]。
4. Ventoy 会自动加载并显示一个图形菜单，列出 U 盘里的所有镜像文件[reference:46]。
5. 用方向键选择要启动的镜像，按回车确认即可进入对应系统的安装/运行界面[reference:47]。

> **小贴士**：在 Ventoy 启动菜单中按 **`F5`** 可调出更多高级选项[reference:48]；按 **`L`** 键可切换中英文菜单语言[reference:49]。

---

## 五、高级功能

### 5.1 Ventoy 插件系统

Ventoy 提供了强大的插件系统，允许用户自定义启动菜单外观、实现自动化安装等[reference:50]。所有插件配置通过 `ventoy.json` 文件管理[reference:51][reference:52]。

**配置文件位置**：
- 在 U 盘**数据分区（存放 ISO 的分区）** 根目录下创建 `ventoy` 文件夹[reference:53]
- 在 `ventoy` 文件夹内创建 `ventoy.json` 配置文件[reference:54]

> ⚠️ **注意**：
> - 目录名和文件名必须**全小写**（`ventoy` / `ventoy.json`），不要写成 `Ventoy` 或 `VENTOY`[reference:55]
> - 配置文件必须放在**数据分区**，不是那个 32MB 的 VTOYEFI 分区[reference:56]
> - 文件必须为 **UTF-8** 编码，不支持注释[reference:57][reference:58]

**推荐使用 VentoyPlugson 工具**进行可视化配置，无需手动编辑 json 文件[reference:59][reference:60]。在 Windows 中运行 `VentoyPlugson.exe` 后，会在浏览器中打开一个 Web 界面，左侧菜单可配置各类插件[reference:61][reference:62]。

### 5.2 自动安装插件（无人值守安装）

Ventoy 支持操作系统的**无人值守自动安装**[reference:63]。你只需要使用原版 ISO 文件，然后在 U 盘中放入对应的自动安装脚本即可[reference:64]。

支持的脚本格式[reference:65]：

| 发行版                | 脚本格式         |
| :-------------------- | :--------------- |
| Windows               | Unattend XML     |
| RHEL/CentOS/Fedora    | Kickstart script |
| Debian/Ubuntu         | Preseed script   |
| Ubuntu Server (20.x+) | cloud-init       |
| SUSE                  | autoYast XML     |
| Deepin/UOS            | INI              |

配置示例（在 `ventoy.json` 中）[reference:66]：

```json
{
  "auto_install": [
    {
      "image": "/ISO/centos.iso",
      "template": "/ventoy/script/centos_kickstart.cfg"
    }
  ]
}
```

### 5.3 主题自定义

Ventoy 支持启动菜单主题自定义。你可以在 [GNOME-Look](https://www.gnome-look.org/browse?cat=109&ord=latest) 等网站下载 Ventoy 主题，将其配置到 `ventoy.json` 中。

### 5.4 命令行操作（Windows）

从 1.0.86 版本开始，Ventoy 提供了命令行支持：

```cmd
# 安装 Ventoy 到指定磁盘
Ventoy2Disk.exe -i /dev/sdX

# 升级 Ventoy
Ventoy2Disk.exe -u /dev/sdX

# 查看磁盘中的 Ventoy 信息
Ventoy2Disk.exe -l /dev/sdX
```

------

## 六、常见问题与解决

### 6.1 启动失败 / 无法进入 Ventoy 菜单

| 问题                           | 解决方法                                                     |
| :----------------------------- | :----------------------------------------------------------- |
| **安全启动导致无法启动**       | 进入 BIOS/UEFI 设置，关闭 Secure Boot（安全启动）            |
| **USB 接口不识别**             | 尝试不同 USB 接口，优先使用 USB 2.0 端口（兼容性更好）       |
| **U 盘在启动顺序中不靠前**     | 进入 BIOS，将 Ventoy 设备设置为启动顺序第一位                |
| **MBR check failed 报错**      | U 盘的 MBR 被修改过。解决方法：升级到最新版本，或重新安装 Ventoy |
| **在其他电脑上正常，本机不行** | 主板兼容性问题，尝试关闭 Secure Boot                         |

### 6.2 无损修复（保留 ISO 文件）

如果 Ventoy 启动盘出现问题但不想丢失已存放的 ISO 文件，可以执行**无损修复**：

**Windows 操作**：

1. 运行 `Ventoy2Disk.exe`
2. 选择正确的 U 盘设备
3. 勾选 **“保留数据”** 选项
4. 点击“安装/更新”按钮

**Linux 操作**：

```bash
sudo ./Ventoy2Disk.sh -I /dev/sdX --keep-data
```

> ⚠️ 操作前务必通过 `lsblk` 确认 U 盘设备路径（通常是 `/dev/sdb`），错误操作可能导致硬盘数据丢失。

### 6.3 其他常见问题

| 问题                        | 解决方法                                                     |
| :-------------------------- | :----------------------------------------------------------- |
| **ISO 文件大于 4GB**        | Ventoy 默认 exFAT 格式支持大于 4GB 的文件                    |
| **如何恢复 U 盘为普通状态** | 运行 Ventoy2Disk.exe → 配置选项 → 清除 Ventoy                |
| **MBR 还是 GPT 怎么选**     | 在 cmd 中运行 `diskpart` → `list disk`，看 Gpt 下方是否有星号 |

------

## 七、与 Kali Linux 三路部署的关联

在 [[Kali Linux 三路部署与无线安全实战（WSL + Ventoy 可移动 U 盘 + WiFi 抓包）]] 中，我使用 Ventoy 制作了包含启动盘与系统盘的 U 盘可移动 Kali 物理系统【第二部分】。

具体操作回顾：

1. 使用 Ventoy 将 U 盘制作为启动盘
2. 将 Kali Linux ISO 拷贝至 Ventoy 引导分区
3. 从 U 盘启动，进入 Ventoy 菜单选择 Kali ISO
4. 在 Kali 安装向导中，将系统安装到 U 盘的剩余空闲空间

安装完成后，我**将 U 盘上原 Ventoy 引导分区（存放 ISO 的分区）格式化了**。这个操作清理了启动盘痕迹，但**不影响已安装在 U 盘另一分区上的 Kali 系统**（因为引导已由 UEFI/BIOS 指向了系统分区）。

------

## 相关笔记

- 返回知识库首页 → [[知识库首页]]
- Kali 三路部署（含 Ventoy 实操历程） → [[Kali Linux 三路部署与无线安全实战（WSL + Ventoy 可移动 U 盘 + WiFi 抓包）]]
- WSL 基础安装与命令大全 → [[WSL：下载与配置完全指南]]
- VMware 虚拟机 Ubuntu 环境配置 → [[Ubuntu24.04虚拟机设置]]
- 软件清单与常用说明 → [[软件清单与常用说明]]