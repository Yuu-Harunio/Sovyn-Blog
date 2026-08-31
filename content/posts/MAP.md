---
title: 手搓的 Skill——MAP
date: 2026-08-22
tags: [agent-skill, 项目地图, 项目维护]
summary: MAP 是作者自编写的 Skill：通过 /map 召唤 agent 生成项目结构地图 MAP.md，用于快速了解项目结构、定位模块并指导后续开发。它是面向人阅读的项目地图，与面向代码的 Graphify 互补。
publish: true
---

# 手搓的 Skill——MAP

> **开篇摘要**：MAP 是作者自编写的 Skill，通过 `/map` 让 agent 生成 `MAP.md` 项目结构地图，帮助接手者快速了解项目架构与模块、审核描述准确性，并在功能开发前后评估改动影响、同步更新地图。它面向"人阅读"，与面向"代码"的 Graphify 互补。

## 一、MAP简介

在你刚开始接手一个项目的时候，你对项目一无所知，这时候召唤出/map来让它生成一个map.md文件，对这个项目的结构和功能进行了解。后续也可以通过MAP.md文件进行agent开发。



---

## 二、MAP使用

### **第一次接触项目**：

请使用 project-map-architect 分析这个项目，并生成 MAP.md。   （/map)

### 生成MAP.md文件后：

请作为项目维护者审核这个 MAP.md。
找出：
1. 错误描述
2. 缺失模块
3. 可能误导未来开发的信息

### 开始需求开发:

请先阅读 MAP.md。
我要开发 XXX 功能。
请分析：
1. 涉及哪些模块
2. 修改哪些文件
3. 是否影响数据库
4. 是否影响权限
5. 是否需要更新 MAP.md

### 完成功能后

请检查这次代码修改是否改变项目结构。
如果改变，请更新 MAP.md文件。

### 与Graphify配合

据chatgpt大王所说，MAP文档是给人看比较好，给代码方面比较好的还是[[Graphify]]。所以在生成使用MAP.md文件后可以考虑再配合使用Graphify这个skill来让agent进行项目迭代与维护。


---

## 三、后续优化方向

### 注意更新MAP.md文件

agent使用MAP.md文件来进行项目开发的过程中，总会有以下流程：

```
代码
 ↓
变化
 ↓
MAP.md过期    
```

所以要有更新map文件意识： **重大变化后更新！！！**

### 大型项目注意生成多级MAP.md文件

```
MAP.md

docs/maps/
backend-map.md
payment-map.md
user-map.md

```

因为项目有时候过大，就得区分开多个地图，然后用总地图来索引下级地图。

---

## 相关笔记

- 返回知识库首页 → [[知识库首页]]

- 代码级知识图谱（面向 agent 的升级版）→ [[Graphify]]
- 抓取外部文档/数据配合使用 → [[Firecrawl]]
- 返回技能清单首页 → [[SKILL 推荐清单]]
- 依赖 Git/GitHub 基础 → [[GitHub]]





