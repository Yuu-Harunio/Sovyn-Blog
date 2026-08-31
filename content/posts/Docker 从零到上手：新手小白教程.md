---
title: Docker 从零到上手：新手小白教程
date: 2026-08-23
tags: [教程, Docker, 容器化, 后端, 工具]
summary: Docker 零基础教程：讲解镜像、容器、仓库三大核心概念，安装方法，常用命令速查，Dockerfile 定制镜像与使用技巧。是外卖系统等项目使用容器化开发环境的基础。
publish: true
---

# Docker 从零到上手：新手小白教程

> 适合零基础读者，读完即可上手使用 Docker。

> **开篇摘要**：Docker 是一种容器化技术，将应用及其依赖打包，确保"在哪都能跑"。本教程从镜像、容器、仓库三大核心概念讲起，覆盖安装、常用命令、Dockerfile 定制镜像与实践技巧，帮助你快速上手。

---

## 一、Docker 是什么？为什么需要它？

在传统开发中，我们常常遇到这样的困境：**代码在本地跑得好好的，一部署到服务器就出问题**——环境不一致、依赖冲突、部署繁琐、回滚困难。

Docker 的出现就是为了解决这个问题。它是一种**容器化技术**，可以把应用程序及其所有依赖（代码、运行时、系统工具、库等）打包在一起，确保应用在任何环境中都能以相同的方式运行。简单来说：**Docker 让“在我的机器上能跑”变成“在哪都能跑”**。

---

## 二、核心概念：镜像、容器、仓库

Docker 有三大核心概念，理解它们就掌握了 Docker 的整个生命周期：

| 概念                   | 是什么                                 | 生活化比喻                                  |
| ---------------------- | -------------------------------------- | ------------------------------------------- |
| **镜像（Image）**      | 一个只读的模板，包含运行应用所需的一切 | 像一张 **光盘**，里面有完整的操作系统和软件 |
| **容器（Container）**  | 镜像的运行实例，是真正跑起来的进程     | 像一台 **播放器**，把光盘放进去就能播       |
| **仓库（Repository）** | 存放和分享镜像的地方                   | 像 **应用商店**，你可以下载别人做好的镜像   |

镜像和容器的关系，就像**面向对象编程中的类和实例**——镜像是静态的定义，容器是镜像运行时的实体。一个镜像可以创建无数个容器。

---

## 三、安装 Docker

### Linux（Ubuntu/Debian）

```bash
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker  # 设置开机自启
```

### Linux（CentOS/RHEL）

```bash
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

### Windows / macOS

访问 Docker 官网下载 **Docker Desktop** 安装包，双击安装即可。Windows 用户需要确保已启用 WSL 2 或 Hyper-V。

### 验证安装

```bash
docker --version          # 查看版本
docker run hello-world    # 运行测试容器
```

如果看到欢迎信息，说明安装成功！

---

## 四、实战：5 分钟部署你的第一个 Nginx 网站

> 参考自 CSDN 保姆式教程

### 步骤一：搜索并拉取 Nginx 镜像

```bash
docker search nginx      # 在 Docker Hub 中搜索 nginx 镜像
docker pull nginx        # 拉取最新版 nginx 镜像
```

`docker pull` 会从 Docker Hub（官方镜像仓库）下载镜像到本地。

### 步骤二：查看本地镜像

```bash
docker images            # 列出本地所有镜像
```

你应该能看到 `nginx` 镜像出现在列表中。

### 步骤三：运行容器

```bash
docker run -d -p 8080:80 --name my-nginx nginx
```

这条命令的含义：
- `-d`：后台运行（守护模式）
- `-p 8080:80`：将宿主机的 8080 端口映射到容器的 80 端口
- `--name my-nginx`：给容器起个名字
- `nginx`：使用 nginx 镜像

现在打开浏览器访问 `http://localhost:8080`，就能看到 Nginx 的欢迎页面了！

### 步骤四：查看和管理容器

```bash
docker ps                # 查看正在运行的容器
docker ps -a             # 查看所有容器（包括已停止的）
docker stop my-nginx     # 停止容器
docker start my-nginx    # 启动已停止的容器
docker rm my-nginx       # 删除容器
```

---

## 五、Docker 常用命令速查

### 镜像操作

| 命令                             | 说明                   |
| -------------------------------- | ---------------------- |
| `docker images`                  | 列出本地所有镜像       |
| `docker pull <镜像名>:<标签>`    | 拉取镜像               |
| `docker rmi <镜像ID或名称>`      | 删除镜像               |
| `docker rmi $(docker images -q)` | 删除所有镜像（谨慎！） |
| `docker search <关键词>`         | 在 Docker Hub 搜索镜像 |

### 容器操作

| 命令                          | 说明                 |
| ----------------------------- | -------------------- |
| `docker run -d <镜像>`        | 创建并后台运行容器   |
| `docker ps`                   | 查看运行中的容器     |
| `docker ps -a`                | 查看所有容器         |
| `docker start <容器>`         | 启动容器             |
| `docker stop <容器>`          | 停止容器             |
| `docker restart <容器>`       | 重启容器             |
| `docker rm <容器>`            | 删除容器             |
| `docker logs <容器>`          | 查看容器日志         |
| `docker logs -f <容器>`       | 实时跟踪日志         |
| `docker exec -it <容器> bash` | 进入容器内部执行命令 |

### Docker 服务管理（Linux）

| 命令                       | 说明             |
| -------------------------- | ---------------- |
| `systemctl start docker`   | 启动 Docker 服务 |
| `systemctl stop docker`    | 停止 Docker 服务 |
| `systemctl restart docker` | 重启 Docker 服务 |
| `systemctl status docker`  | 查看服务状态     |
| `systemctl enable docker`  | 设置开机自启     |

---

## 六、Dockerfile：定制自己的镜像

如果你需要构建自己的镜像，就需要编写 **Dockerfile**——一个没有扩展名的文本文件，里面写满了构建指令。

### 一个简单的 Dockerfile 示例

```dockerfile
# 指定基础镜像
FROM ubuntu:22.04

# 设置工作目录
WORKDIR /app

# 复制文件到镜像中
COPY . /app

# 运行命令（安装依赖等）
RUN apt update && apt install -y python3

# 容器启动时执行的命令
CMD ["python3", "app.py"]
```

### 常用指令

| 指令      | 说明                   |
| --------- | ---------------------- |
| `FROM`    | 指定基础镜像           |
| `WORKDIR` | 设置工作目录           |
| `COPY`    | 从宿主机复制文件到镜像 |
| `RUN`     | 构建时执行的命令       |
| `CMD`     | 容器启动时执行的命令   |
| `ENV`     | 设置环境变量           |

### 构建并运行自己的镜像

```bash
docker build -t my-app .   # 构建镜像（-t 指定名称和标签）
docker run -d my-app       # 运行自己的镜像
```

---

## 七、常用技巧与注意事项

1. **清理空间**：长期使用后，可以用 `docker system prune` 清理未使用的镜像、容器和网络。
2. **数据持久化**：容器删除后数据会丢失，需要使用 **数据卷（Volume）** 或 **挂载（Bind Mount）** 来持久化数据。
3. **国内加速**：如果拉取镜像太慢，可以配置国内镜像加速器（如阿里云、中科大镜像源）。
4. **不要在生产环境使用 `latest` 标签**：建议指定具体版本号，避免意外升级导致不兼容。

---

## 八、总结

Docker 的核心流程可以用一句话概括：

> **从仓库拉取镜像 → 用镜像创建并运行容器 → 在容器中运行应用**

掌握以下 5 个命令，你就已经可以开始使用 Docker 了：

```bash
docker pull <镜像>      # 下载镜像
docker images           # 查看镜像
docker run -d <镜像>    # 运行容器
docker ps               # 查看容器
docker stop <容器>      # 停止容器
```

剩下的命令，边用边查就好。

---

## 相关笔记

- 返回知识库首页 → [[知识库首页]]

- 外卖系统使用 Docker Compose 搭建开发环境 → [[外卖系统_Master_Spec_v2.0]]、[[外卖系统开发文档]]
- Docker 常运行在 WSL2 / Ubuntu 虚拟环境中 → [[Ubuntu24.04虚拟机设置]]