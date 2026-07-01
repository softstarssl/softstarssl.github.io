---
title: 从这里开始
layout: page
wiki: notes
---

这是「学习笔记」项目的说明页。笔记基于 Stellar 的 **wiki 文档系统**组织：

- 每篇笔记是一个 `layout: wiki` 的页面，放在 `source/notes/` 下
- 通过 front-matter 里的 `wiki: notes` 归属到本项目
- 项目信息在 `source/_data/wiki/notes.yml` 中维护，是否上架到 `/wiki/` 由 `source/_data/wiki.yml` 控制

{% note color:blue 想新增一个笔记项目，就在 source/_data/wiki/ 下再建一个 yml，并把 id 加进 source/_data/wiki.yml。 %}
