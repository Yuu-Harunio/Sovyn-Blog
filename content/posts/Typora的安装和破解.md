---
title: Typora 的安装和破解
date: 2026-08-22
tags: [Typora, 工具, GitHub]
summary: Typora 的安装与激活教程：解压安装包 → 运行补丁程序生成序列号 → 激活。配套补丁程序见附件/Typora安装包及补丁.zip，本项目已上传至 GitHub。注意仅支持 Typora 1.9.5 及以前版本。
publish: true
---

# Typora 的安装和破解

> 本项目已上传至 [[GitHub]] 上的 [Yuu-Harunio/Typora](https://github.com/Yuu-Harunio/Typora)

## 1.解压zip并安装程序

首先先解压文件，解压完文件后选择最下面的typora-setup-x64.exe文件进行安装

![image-20260719163232631](image-20260719163232631.png)

安装完成后自动打开软件，先不要关闭也不要激活。

![image-20260719163420609](image-20260719163420609.png)

窗口最小化当前软件页面。

## 2.进行激活准备

回到刚刚的压缩包解压好的文件夹下面，会发现上面还有两个exe文件，找到并将这两个软件复制。

![image-20260719163652667](image-20260719163652667.png)

然后打开Typora的安装文件所在地址，将刚刚复制的两个exe文件粘贴到Typora的安装文件夹下

![image-20260719163817371](image-20260719163817371.png)

复制粘贴好之后不要关闭当前文件夹，在当前文件目录下进入命令行，如下图

![image-20260719163941142](image-20260719163941142.png)

然后输入“node_inject.exe”，回车。

```cmd
node_inject.exe
```



![image-20260719164043010](image-20260719164043010.png)

不要关闭当前命令行窗口，继续输入“license-gen.exe“，回车，等待输出结果。

```cmd
license-gen.exe
```



![image-20260719164158500](image-20260719164158500.png)

执行成功后，会出现一串序列号，复制下来，这就是我们等会要激活的时候输入的序列号。

## 3.激活Typora

这时候我们将刚刚没有关闭的Typora程序关闭，然后重新打开回到激活界面。

![image-20260719164341655](image-20260719164341655.png)

输入邮箱（可以随便输，但是要符合邮箱格式，例如：123@123.com 都可以）

然后输入我们刚才生成的序列号。

**点击激活，会弹出窗口“激活成功”**

![image-20260719164605691](image-20260719164605691.png)

## 4.常见问题

### 提示序列号无效

安装后，破解完成后，没有关闭软件重新打开，如果第一次提示序列号无效，关闭 Typora 重新打开，重新输入邮箱和序列号即可（注意：不需要重新执行[补丁程序](https://zhida.zhihu.com/search?content_id=262555905&content_type=Article&match_order=1&q=补丁程序&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3ODQ2MjIxNjcsInEiOiLooaXkuIHnqIvluo8iLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoyNjI1NTU5MDUsImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.tncX7ap5iuZc0df2FvD-J1mrAK7D9QPyE-qd4AGx3tk&zhida_source=entity)）

### cmd 执行出现错误

如果你 cmd 执行 node_inject.exe 出现以下错误
```cmd
nodeinject 结果 thread 『main』 panicked at 『called `Result::unwrap()` on an `Err` value: IoError(Os { code: 5, kind: PermissionDenied, message: 「拒绝访问。」 })
```

说明你不是管理员用户，可以用管理员权限打开 cmd，cd 到 Typora 的安装目录下再执行，或者直接右键选中 node_inject.exe，以管理员身份运行

### 关闭软件后，重新打开，还是一直报序列号无效

确定下自己的 Typora 版本对不对，目前此教程只支持 Typora1.9.5 及以前的版本，1.10.x 之后的版本不支持

---

## 相关笔记

- 返回知识库首页 → [[知识库首页]]

- 本项目已上传至 GitHub → [[GitHub]]
- 配套安装包资源在 `附件/` 目录 → [[附件/Typora安装包及补丁.zip]]
- 与其他常用软件的安装与破解说明汇总 → [[软件清单与常用说明]]
