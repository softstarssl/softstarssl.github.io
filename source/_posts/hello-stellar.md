---
title: 建站说明 · Hexo + Stellar
date: 2026-06-30 10:00:00
categories: Notes
tags: [Hexo, Stellar, 建站]
---

这是本站的第一篇文章，用来验证 **Hexo + Stellar** 骨架是否正常工作。

{% note color:blue 本站基于 Hexo，主题为 Stellar，通过 GitHub Actions 自动部署到 GitHub Pages。 %}

## 常用命令

```bash
hexo new "文章标题"   # 新建文章
hexo clean           # 清理缓存与 public
hexo server          # 本地预览 http://localhost:4000
hexo generate        # 生成静态文件到 public/
```

## 写作约定

- 分类（categories）从：`Research` / `Algorithm` / `Notes` / `Project` / `Life` 中选一个
- 标签（tags）可多个，用于横向串联主题
- 文件放在 `source/_posts/` 下，文件名即 URL slug

## 数学公式

行内公式：质能方程 $E = mc^2$，以及带下标的 $a_1 + a_2 + \cdots + a_n$。

行间公式：

$$
\int_{-\infty}^{+\infty} e^{-x^2}\,\mathrm{d}x = \sqrt{\pi}
$$

更多细节见仓库根的 `CLAUDE.md`。
