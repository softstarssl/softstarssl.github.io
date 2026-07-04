# CLAUDE.md — 项目维护手册

> 本文件是给「以后维护本仓库」的说明（区别于根目录的施工蓝图 `PLAN.md`）。
> 站点 = 个人主页 + 博客，基于 **Hexo + hexo-theme-stellar**，以 **GitHub Pages user page** 模式部署。

## 概览

- 框架：Hexo 8 + 主题 Stellar 1.33.x（npm 安装在 `node_modules`，不作为 submodule）
- 渲染器：`hexo-renderer-markdown-it-plus`（内置 KaTeX，用于数学公式）
- 托管：仓库 `softstarssl.github.io` → 网址 https://softstarssl.github.io
- 部署：push 到 `main` → GitHub Actions 自动构建并发布，**源码与产物分离**（`public/` 不提交）
- 本地 Node：24（部署 workflow 的 `node-version` 与之对齐）

## 常用命令

```bash
hexo new "文章标题"      # 在 source/_posts 下新建文章
hexo new page <name>     # 新建独立页面 source/<name>/index.md
hexo clean               # 清理缓存 db.json 和 public/
hexo server              # 本地预览 http://localhost:4000（改动实时刷新）
hexo generate            # 生成静态文件到 public/（= npm run build）
```

> 改配置（`_config.yml` / `_config.stellar.yml`）或增删插件后，务必 `hexo clean` 再 `hexo s`，否则可能读到旧缓存。

## 目录结构

```
_config.yml              # Hexo 站点配置（标题/作者/URL/permalink/渲染器等）
_config.stellar.yml      # Stellar 主题配置（导航/侧栏/页脚/评论/风格）——改这个，别动 node_modules
source/
  _posts/                # 博客文章（*.md）
  _data/
    links/friend.yml     # 友链数据（{% friends friend %} 读取）
    wiki.yml             # /wiki/ 索引上架的笔记项目 id 列表
    wiki/<id>.yml        # 每个笔记项目的元信息（标题/描述/图标/标签）
  notes/                 # 笔记文章（layout: page + wiki: <id>）
  about/index.md         # 关于页
  friends/index.md       # 友链页
  img/avatar.svg         # 头像（占位，可替换为真实头像）
.github/workflows/pages.yml  # 部署 workflow
```

## 写文章

放在 `source/_posts/`，front-matter 模板：

```markdown
---
title: 文章标题
date: 2026-06-30 10:00:00
categories: Notes          # 单选一个
tags: [AI, 笔记]           # 可多个
---
正文……
```

- **分类约定**：`Research` / `Algorithm` / `Notes` / `Project` / `Life`
- 数学公式：行内 `$E=mc^2$`，行间 `$$ ... $$`（KaTeX，含下标 `a_1` 也正常）
- 代码：用围栏 ```lang（Hexo 独立处理，带行号 + 复制按钮）
- Stellar 标签组件（本版本单行/块的区别要注意）：
  - 单行：`{% note color:blue 文本 %}`、`{% button color:theme 文本 url %}`、`{% checkbox checked:true 文本 %}`
  - 块：`{% timeline %} <!-- node 标题 --> 内容 {% endtimeline %}`、`{% tabs %} <!-- tab 标题 --> 内容 {% endtabs %}`

## 插件与侧边栏组件

- `hexo-generator-feed`：RSS 输出到 `/atom.xml`（配置在 `_config.yml` 的 `feed` 段）
- `hexo-generator-sitemap`：输出 `/sitemap.xml`，利于搜索引擎收录
- `hexo-filter-mermaid-diagrams`：文章 front-matter 加 `mermaid: true` 后，可用 ```` ```mermaid ```` 代码块画流程图
- 侧边栏组件（ghuser 名片 / tagcloud 标签云 / recent 的 RSS 入口等）在 `source/_data/widgets.yml` 覆盖配置，与主题默认合并；哪个页面显示哪些组件由 `_config.stellar.yml` 的 `site_tree.*.leftbar` 决定

## 笔记（wiki）系统

Stellar 的文档系统。新增一个笔记项目：

1. 建 `source/_data/wiki/<id>.yml`：`title` / `description` / `icon` / `tags`
2. 把 `<id>` 加进 `source/_data/wiki.yml`（决定是否在 `/wiki/` 索引展示）
3. 在 `source/notes/` 下写文章，front-matter：`layout: page` + `wiki: <id>`

> ⚠️ **坑**：不要用 `layout: wiki`。本主题没有 `wiki.ejs` 视图，且 Stellar 覆盖了 Hexo 的 page 生成器、去掉了 layout 回退链，导致 `layout: wiki` 渲染为空白页。
> 正确做法：`layout: page` + `wiki: <id>` —— 侧栏目录树的选择只看 `page.wiki` 字段，所以功能完全一致。

## 友链

编辑 `source/_data/links/friend.yml`（一个 YAML 列表）：

```yaml
- title: 站名
  url: https://example.com
  avatar: https://example.com/favicon.ico
```

> 友链数据只能放在 `source/_data/links/*.yml`；写在 `_config.stellar.yml` 里会被主题的 links 事件覆盖掉。

## 部署机制

1. push 到 `main` 触发 `.github/workflows/pages.yml`
2. workflow：`npm ci` → `npm run build`（= `hexo generate`）→ 上传 `public/` → `actions/deploy-pages`
3. 仓库 **Settings → Pages → Source** 必须设为 **GitHub Actions**
4. 跑绿后访问 https://softstarssl.github.io

## 风格 token（`_config.stellar.yml` 的 `style` 段）

- 主题色 theme：`hsl(192 98% 55%)`（青）
- 强调色 accent：`hsl(14 100% 57%)`（橙红）
- 链接色 link：`hsl(207 90% 54%)`（蓝）
- 正文字体：`system-ui, "Microsoft Yahei", "Segoe UI", Arial, sans-serif`
- 深度定制：改 `_config.stellar.yml` 的 `style` 段；或新建 `source/css/_custom.styl` 覆盖。
