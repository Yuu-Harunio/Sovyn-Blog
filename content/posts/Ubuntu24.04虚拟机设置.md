---
title: Ubuntu24.04虚拟机设置
date: 2026-08-22
tags: [Ubuntu, 编程, Linux]
summary: Ubuntu 24.04 虚拟机（VMware）的设置教程：系统安装、常用编程环境配置（软件源、Node、Python、Docker）、共享文件夹挂载与虚拟机共享宿主机网络代理。是外卖系统等 WSL2 + Docker 开发环境的基础。
publish: true
---

# Ubuntu24.04虚拟机设置

## 一、系统安装

### 1.1 VMware中创建虚拟机

根据我3060、14内核12代i7、16G内存、6G显存，我就选择了4核、6144MB内存、100GB**SATA**单一硬盘立刻分配。

### 1.2 虚拟机安装Ubuntu

1. 开启虚拟机后，类似BIOS界面回车选第一个。然后进入Ubuntu之后，右上角设置断网再进行配置。
2. 然后一路正常默认配置下去即可，等待10分钟之后系统重启
3. 重启后完成配置，设置电源休眠时间从不。
4. 在终端下载vm-tools（命令在下面）
5. 下载后登出然后在登录界面的右下角切换为Xrog

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install open-vm-tools open-vm-tools-desktop -y
```

---



## 二、常用编程环境配置

### 2.1 基础系统配置

Ubuntu 24.04 开始使用新的 `DEB822` 格式源配置文件，路径是 `/etc/apt/sources.list.d/ubuntu.sources`。

建议先备份再替换。下面的命令会将软件源切换为**华中科技大学镜像站**，你也可以将 `mirrors.hust.edu.cn` 替换为 `mirrors.aliyun.com`（阿里云）或 `mirrors.huaweicloud.com`（华为云）。

```bash
# 1. 备份原有配置
sudo cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak

# 2. 替换为国内镜像源（以华中科技大学为例）
sudo sed -i.bak -E -e "s|^URIs: .*archive.ubuntu.com.*|URIs: https://mirrors.hust.edu.cn/ubuntu/|g" /etc/apt/sources.list.d/ubuntu.sources

# 3. 更新软件包列表
sudo apt update
```

### 2.2 基础开发工具

这些是几乎所有开发工作都依赖的基石。

```bash
# build-essential 包含了 gcc/g++/make 等编译工具
# 安装其他常用工具：curl, wget, git, vim, gdb
sudo apt install -y build-essential curl wget git vim gdb
```

### 2.3 Node.js环境

国内的GitHub不稳定，nvm指令没法稳定克隆。所以我们转用gitee克隆

```bash
# 1. 从 gitee 克隆 nvm
git clone https://gitee.com/mirrors/nvm.git ~/.nvm
cd ~/.nvm
git checkout v0.39.7

# 2. 配置环境变量
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
source ~/.bashrc

# 3. 安装 Node.js LTS
nvm install --lts

# 4. 配置 npm 国内镜像
npm config set registry https://registry.npmmirror.com

# 5. 验证安装
node --version
npm --version
nvm --version
npm config get registry
```

当然如果gitee也波动，那就配置nvm镜像源。

```bash
# 设置 NVM 使用淘宝镜像
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node

# 如果想永久生效，把这行加到 ~/.bashrc
echo 'export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node' >> ~/.bashrc

# 清理可能存在的缓存（可选，但建议执行）
nvm cache clear

# 重新下载安装
nvm install --lts

# 验证下载成功
node --version
npm --version

# 配置 npm 使用国内源
npm config set registry https://registry.npmmirror.com
```

### 2.4 Python环境

我推荐安装 **Python 3.11.11**：安装配置pyenv环境变量，配置国内镜像源，安装 Python 3.11.11，配置 pip 国内镜像源。

#### 2.4.1 安装配置pyenv，配置国内镜像源

```bash
# 1. 安装编译 Python 所需的依赖
sudo apt update
sudo apt install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev \
libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev python3-openssl git

# 2. 安装 pyenv
curl https://pyenv.run | bash

# 3. 将 pyenv 配置写入 ~/.bashrc
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc

# 4. 让配置立即生效
source ~/.bashrc

# 5. 验证 pyenv 是否安装成功
pyenv --version

# 6. 设置 Python 源码下载镜像（使用淘宝镜像）
echo 'export PYTHON_BUILD_MIRROR_URL="https://npmmirror.com/mirrors/python/"' >> ~/.bashrc
source ~/.bashrc
```

#### 2.4.2 安装python3.11.11，配置国内镜像源

```bash
# 查看可安装的 3.11 版本（可选）
pyenv install --list | grep "3.11"

# 安装 Python 3.11.11
pyenv install 3.11.11

# 设置为全局默认版本
pyenv global 3.11.11

# 验证安装
python --version
# 应该输出: Python 3.11.11

# 配置 pip 使用清华镜像源（永久生效）
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config set global.trusted-host pypi.tuna.tsinghua.edu.cn

# 验证配置
pip config list

# 升级 pip 本身
pip install --upgrade pip
```

#### 2.4.3 可选：配置其他镜像源

如果你觉得清华镜像不够快，也可以选择其他镜像：

| 镜像源 | 配置命令                                                     |
| :----- | :----------------------------------------------------------- |
| 阿里云 | `pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/` |
| 豆瓣   | `pip config set global.index-url https://pypi.douban.com/simple/` |
| 中科大 | `pip config set global.index-url https://pypi.mirrors.ustc.edu.cn/simple/` |

#### 2.4.4 验证最终环境，常用 pyenv 命令速查

```bash
# 确认 Python 版本
python --version   # Python 3.11.11

# 确认 pip 版本
pip --version

# 确认 pip 镜像配置
pip config get global.index-url
# 应该显示: https://pypi.tuna.tsinghua.edu.cn/simple

# 测试下载一个包看看速度
pip install requests

# 查看已安装的 Python 版本
pyenv versions

# 查看所有可安装的版本
pyenv install --list

# 切换到其他版本（临时）
pyenv shell 3.10.0

# 取消临时切换
pyenv shell --unset

# 卸载某个版本
pyenv uninstall 3.11.11
```

### 2.5 容器化环境：Docker

依旧是国内不好连海外。使用国内镜像源安装，阿里云提供了官方安装脚本的国内镜像。

1. 使用阿里云的镜像脚本安装 Docker：

   ```bash
   curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   ```

2. 添加阿里云的 Docker 软件源（根据你的Ubuntu版本，如22.04 Jammy）：

   ```bash
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

3. 最后，更新并安装：

   ```bash
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

为了你后续使用 `docker` 命令时不用每次都输入 `sudo`，强烈建议执行：

```bash
# 将当前用户加入 docker 用户组
sudo usermod -aG docker $USER

# 使组变更立即生效（或者重新登录）
newgrp docker
```

### 2.6 Docker配置镜像源

配置 Docker 国内镜像源的核心是修改 `daemon.json` 配置文件，在里面指定可用的镜像加速地址。

由于近两年很多高校和公共镜像源已陆续停止服务，下面给你一份**截至 2026 年 8 月仍被验证有效**的配置方案。

1. **创建或编辑配置文件**：在终端中执行以下命令，用 `vim` 打开 Docker 的配置文件（如果文件不存在，这个命令会自动创建它）：

   ```bash
   sudo vim /etc/docker/daemon.json
   ```

2. **添加镜像源**：按 `i` 进入编辑模式，粘贴以下内容。这里推荐了目前比较稳定和快速的几个源，你可以根据实际速度选择。

   > **小贴士**：`registry-mirrors` 是一个数组，Docker 会按顺序尝试。建议把最稳定、最快的放在第一位。

   ```json
   {
     "registry-mirrors": [
       "https://docker.xuanyuan.me",
       "https://docker.1ms.run",
       "https://docker.m.daocloud.io"
     ]
   }
   ```

   **各镜像源说明**：

   - `https://docker.xuanyuan.me`：轩辕镜像（公益版），个人使用首选，速度和稳定性都不错。
   - `https://docker.1ms.run`：毫秒镜像（商业），金融级SLA，企业生产环境推荐。
   - `https://docker.m.daocloud.io`：DaoCloud 老牌镜像源。

   按 `Esc` 键退出编辑模式，输入 `:wq` 保存并退出文件。

3. **重启 Docker 服务**：使配置生效。

   ```bash
   sudo systemctl restart docker
   ```

4. **验证配置是否成功**：

   ```bash
   sudo docker info | grep -A 1 "Registry Mirrors"
   ```

   如果输出结果中能看到你刚刚配置的镜像源地址，就说明配置成功了。

---



## 三、虚拟机文件夹共享和软件下载

### 3.1 虚拟机共享文件夹

#### 3.1.1 在 VMware 中设置共享文件夹（虚拟机需关机）

1. 关闭虚拟机。
2. 右键虚拟机 → 设置 → 选项 → 共享文件夹。

3. 选择 “总是启用”。

4. 点击 “添加”，选择你本机（Windows/Mac）的文件夹。

5. 给共享文件夹起一个英文名称（例如 share），不要勾选“只读”。

6. 点击确定，保存设置。


#### 3.1.2 在 Ubuntu 中挂载共享文件夹

**查看共享名称（可选）**

```bash
vmware-hgfsclient
# 输出即为你设置的共享名称（例如 share）。
```

**创建挂载点并挂载**

```bash
sudo mkdir -p /mnt/hgfs
sudo vmhgfs-fuse .host:/ /mnt/hgfs -o allow_other -o uid=1000 -o gid=1000
# 使用 vmhgfs-fuse，不需要 vmhgfs 内核模块。
# .host:/ 表示挂载所有共享文件夹。uid=1000,gid=1000 对应你的普通用户（用 id 命令确认）。

ls -la /mnt/hgfs
# 如果能列出你本机共享文件夹中的文件，说明挂载成功

ln -s /mnt/hgfs ~/shared
# 创建软链接（方便快速访问）

sudo nano /etc/fstab
# 设置开机自动挂载（可选但推荐）
```

**在文件末尾添加一行（假设共享名称为 share）：**

```text
.host:/share /mnt/hgfs fuse.vmhgfs-fuse defaults,allow_other,uid=1000,gid=1000,auto 0 0
```

**保存后，重新加载配置并测试：**

```bash
sudo systemctl daemon-reload
sudo mount -a
```

**验证双向同步**
从 Ubuntu → 本机

```bash
echo "Hello from Ubuntu" > ~/shared/ubuntu_test.txt
# 去本机共享文件夹查看文件是否出现。
```

从本机 → Ubuntu
在本机共享文件夹中创建一个文件（如 host_test.txt），然后在 Ubuntu 中查看：

```bash
ls -la ~/shared
cat ~/shared/host_test.txt
```

### 3.2 虚拟机共享本机网络代理

#### 3.2.1 宿主机（Windows）配置

**1. 确认虚拟机网络模式**

- VMware 虚拟机设置 → 网络适配器 → 选择 **NAT 模式**。

**2. 开启 Clash Verge 局域网共享**

- 打开 Clash Verge → Settings → 开启 **Allow LAN**（允许局域网连接）→ **重启 Clash Verge**。

**3. 记录 VMnet8 网关地址**

- 在 Windows 命令提示符（cmd）中执行：

  ```cmd
  ipconfig
  ```

- 找到 **"以太网适配器 VMware Network Adapter VMnet8"**，记录其 **IPv4 地址**（如 `192.168.19.1`）。

- **注意**：该地址通常以 `.1` 结尾，是宿主机在虚拟机网络中的固定地址。

**4. 配置 Windows 防火墙（入站规则）**

- 方法一（图形界面）：

  1. `Win + R` → 输入 `wf.msc` → 回车。
  2. 左侧点击 **"入站规则"** → 右侧 **"新建规则..."**。
  3. 规则类型：**"端口"** → 下一步。
  4. 协议：**TCP** → 特定本地端口：填写 Clash 端口（如 `7897`）→ 下一步。
  5. 操作：**"允许连接"** → 下一步。
  6. 配置文件：勾选 **"专用"** 和 **"公用"** → 下一步。
  7. 名称：输入（如 `Clash Allow 7897`）→ 完成。

- 方法二（命令行，管理员身份运行）：

  ```cmd
  netsh advfirewall firewall add rule name="Clash Allow 7897" dir=in action=allow protocol=TCP localport=7897
  ```

#### 3.2.2 虚拟机（Ubuntu）配置

**1. 配置图形界面应用（浏览器等）**

- 打开 Ubuntu **设置** → **网络** → **网络代理**。
- 选择 **"手动"**。
- HTTP 代理、HTTPS 代理：
  - **主机**：填写 3.2.1 中记录的 VMnet8 IP（如 `192.168.19.1`）
  - **端口**：填写 Clash 端口（如 `7897`）

**2. 配置终端命令行（临时生效）**

```bash
export http_proxy="http://192.168.19.1:7897"
export https_proxy="http://192.168.19.1:7897"
```

**3. 配置终端命令行（永久生效）**

```bash
echo 'export http_proxy="http://192.168.19.1:7897"' >> ~/.bashrc
echo 'export https_proxy="http://192.168.19.1:7897"' >> ~/.bashrc
source ~/.bashrc
```

**4. 配置 APT 包管理器**

```bash
sudo nano /etc/apt/apt.conf.d/proxy.conf
```

写入以下内容：

```
Acquire::http::Proxy "http://192.168.19.1:7897/";
Acquire::https::Proxy "http://192.168.19.1:7897/";
```

保存退出（`Ctrl+O`，`Ctrl+X`）。

**5. 自动适配 VMnet8 子网变化（可选）**
如果 VMnet8 的子网 IP 可能变化，可在 `~/.bashrc` 中添加以下内容实现自动适配：

```bash
# 自动获取宿主机在 VMnet8 子网的地址（取网关的网段 + .1）
export PROXY_IP=$(ip route | grep default | awk '{print $3}' | sed 's/\.[0-9]*$/.1/')
export http_proxy="http://$PROXY_IP:7897"
export https_proxy="http://$PROXY_IP:7897"
```

#### 3.2.3 验证连通性

在 Ubuntu 终端执行：

```bash
curl -v -x http://192.168.19.1:7897 http://www.google.com
```

（将 IP 和端口替换为你的实际值）

- ✅ **返回网页内容** → 配置成功。
- ❌ **Connection refused** → 检查防火墙规则或 Clash 的 Allow LAN 是否开启。
- ❌ **Connection timeout** → 检查 VMnet8 IP 是否正确，或虚拟机网络模式是否为 NAT。

**浏览器验证**：

- 如终端 `curl` 通但浏览器不通，需在浏览器内单独配置代理（Firefox：设置 → 网络设置 → 手动代理；Chrome：使用 Proxy SwitchyOmega 插件）。

#### 3.2.4 常见问题

| 问题                              | 解决方法                                                 |
| :-------------------------------- | :------------------------------------------------------- |
| 虚拟机无法连接代理                | 检查 Windows 防火墙入站规则是否放行 Clash 端口           |
| `netstat` 只显示 `127.0.0.1` 连接 | 检查 Clash 的 "Allow LAN" 是否开启，并重启 Clash         |
| `sudo apt update` 不走代理        | 确认 `/etc/apt/apt.conf.d/proxy.conf` 配置正确           |
| 更换 Clash 端口后失效             | 同步更新：防火墙规则、Ubuntu 代理配置、apt 配置          |
| 终端 `curl` 通但浏览器不通        | 在浏览器内单独配置代理（Firefox 手动代理或 Chrome 插件） |
| VMnet8 IP 变化导致配置失效        | 使用 3.2.2 步骤 5 的自动适配脚本                         |

------

> **注意**：以上 IP 和端口均为示例，请替换为你的实际 VMnet8 IP 和 Clash 端口。宿主机在 VMnet8 子网中通常为 `.1` 地址，可通过 `ipconfig` 确认。

### 3.3 软件下载

<!-- 待补充：本节内容为空，可在此列出虚拟内需安装的软件及下载方式。建议结合 [[软件清单与常用说明]] 一并整理。 -->

---

## 相关笔记

- 虚拟内常运行 Docker 容器化环境 → [[Docker 从零到上手：新手小白教程]]
- 外卖系统基于 WSL2 + Docker 的开发环境 → [[外卖系统_Master_Spec_v2.0]]、[[外卖系统开发文档]]
- 虚拟机所需的 VMware 等软件安装 → [[软件清单与常用说明]]

