# 个人主页 + 博客施工计划（Hexo + Stellar）

> 这是给 **Claude Code** 的施工蓝图。目标：搭一个 Hexo + Stellar 主题的「个人主页 + 技术/学习博客」二合一站点，部署到 GitHub Pages。
> 策略：**先做到与参考站同款的骨架并跑通上线，再做个性化风格定制。** 不要一上来就大改，先让最简版本能在本地和线上正常跑。

---

## 0. 项目概览

- **站点性质**：个人主页 + 博客二合一
- **框架**：Hexo + 主题 [hexo-theme-stellar](https://github.com/xaoxuu/hexo-theme-stellar)（作者 xaoxuu）
- **托管**：GitHub Pages，**user page** 模式 —— 仓库名必须为 `<GITHUB_USERNAME>.github.io`，网址为 `https://<GITHUB_USERNAME>.github.io`
- **部署方式**：GitHub 官方 Pages via Actions（push 到 main 自动构建发布，源码与产物分离）
- **语言**：中文为主，保留英文支持（`language: [zh-CN, en]`）

### 参考站（先抄结构，再改风格）
- `https://sunchaoyi923.github.io/` —— Stellar，部署在 github.io，导航结构含 **Myself / Blog / Favorite / Notes**，是本项目最接近的参照（同为 user page）
- `http://skyzhou.top/` —— Stellar，自定义域名版，分类组织（Algorithm / Research / CUHKSZ / Life 等）可参考

---

## 1. 开工前需确认的参数（占位符）

文档中所有 `<GITHUB_USERNAME>` 必须统一替换为真实用户名。以下若未提供，先用占位值跑通骨架，后续再替换：

| 参数 | 说明 | 值 |
|---|---|---|
| `GITHUB_USERNAME` | 决定仓库名与网址 | **待填** |
| 站点标题 / 副标题 | 顶部展示 | 待填 |
| 头像图片 | 放 `source/img/avatar.jpg` | 待填 |
| 主题色 / 风格偏好 | 定制阶段用 | 待填 |
| 评论系统 | 推荐 giscus（GitHub 登录，免后端） | 可选 |

---

## 2. 环境要求

- **Node.js LTS**（建议 ≥ 18；记下主版本号，例如 20，部署 workflow 的 `node-version` 要与之对齐）
- 全局安装 CLI：`npm install -g hexo-cli`

---

## 3. 施工阶段

### Phase 1 — 初始化 Hexo 站点
```bash
hexo init blog
cd blog
npm install
```
- 确认根目录 `.gitignore` 含：`node_modules/`、`public/`、`db.json`、`.DS_Store`（**public/ 不上传，由 Actions 在云端构建**）
- `npm run server` 能打开默认页即视为初始化成功

### Phase 2 — 安装并启用 Stellar
```bash
npm install hexo-theme-stellar --save
```
- 修改站点配置 `_config.yml`：`theme: stellar`
- 在**项目根目录**创建主题配置 `_config.stellar.yml`：把 `node_modules/hexo-theme-stellar/_config.yml` 的内容整份复制过来，再在此文件上修改（**不要直接改 node_modules 里的文件**）
- 推荐安装渲染相关插件（按需）：代码高亮、数学公式（mathjax/katex）已由主题支持，在 `_config.stellar.yml` 对应字段开启即可

### Phase 3 — 站点基础配置（`_config.yml`）
关键字段：
```yaml
title: <站点标题>
author: <作者名>
avatar: /img/avatar.jpg
language: [zh-CN, en]
timezone: Asia/Shanghai

url: https://<GITHUB_USERNAME>.github.io
root: /                       # user page 用根路径
permalink: :year/:month/:day/:title/   # 与参考站 URL 风格一致
```
- 确认 `package.json` 的 scripts 含 `"build": "hexo generate"`（官方 workflow 用 `npm run build`）；若无则补上，或在 workflow 里改用 `npx hexo generate`

### Phase 4 — 主题配置（`_config.stellar.yml`）
重点改两块：

1. **导航菜单**（参考 sunchaoyi 的结构）：
```yaml
sidebar:
  menu:
    post: '[btn.blog](/)'
    notes: '[笔记](/notes/)'
    about: '[关于](/about/)'
    friends: '[友链](/friends/)'
```
2. **侧边栏组件**：在 `_config.stellar.yml` 的 `sidebar.widgets` 里配置各页面（home / blog_index 等）显示哪些组件（search / welcome / recent / tagcloud / timeline）。自定义组件需在 `source/_data/widgets.yml` 声明。
3. **footer**：站点信息、备案（如无可删）、统计代码（可选）。
4. **评论**（可选）：giscus 最省心，在主题配置的 comments 段填 giscus 的 repo / category / id。

### Phase 5 — 内容结构与页面
```bash
hexo new page about       # 关于页
hexo new page friends     # 友链页（用 Stellar 的 friends 组件）
hexo new page notes       # 笔记/导航页
```
- **分类设计**（参考用户实际内容）：`Research` / `Algorithm` / `Notes` / `Project` / `Life`
- 用 Stellar 的 **wiki/notes 系统**承载结构化笔记：在 `source/` 下建对应目录，在 `source/_data/` 下用 `projects.yml` 等配置（参考官方文档「文档系统」章节）
- 写 **2–3 篇占位文章**，front-matter 模板：
```markdown
---
title: 示例文章
date: 2026-06-30
categories: Research
tags: [AI, Notes]
---
正文。演示一下数学公式 $E=mc^2$、代码块和标签组件是否正常渲染。
```

### Phase 6 — 个人风格定制（**重点，在骨架跑通后再做**）
- 主题色 / 字体 / 圆角：改 `source/css/_custom.styl`
- 首页布局：在 `sidebar.widgets.home` 里增减组件
- 自定义侧边栏组件：`source/_data/widgets.yml`（如欢迎语、个人卡片）
- 可选彩蛋：参考 sunchaoyi 站右下角的小组件（运势 / mini 工具），做一个个人化的小挂件
- **铁律**：每改一处先 `hexo clean && hexo s` 本地预览确认，再继续；保持「同款跑通 → 渐进替换为个人风格」的节奏，避免一次性大改难以定位问题

### Phase 7 — 部署（GitHub 官方 Pages Actions）
1. 在 GitHub 建仓库 `<GITHUB_USERNAME>.github.io`
2. 把 Hexo **源码**（不含 public/）push 到默认分支 `main`
3. 仓库 **Settings → Pages → Source** 改为 **GitHub Actions** 并保存
4. 新建 `.github/workflows/pages.yml`（Node 版本与 Phase 2 对齐）：
```yaml
name: Pages

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"        # ← 改成你本地的 Node 主版本
      - name: Cache NPM dependencies
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache
          restore-keys: |
            ${{ runner.OS }}-npm-cache
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public
  deploy:
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
5. push 触发 Actions，跑绿后访问 `https://<GITHUB_USERNAME>.github.io`

> 说明：本方案用 npm 安装主题（在 `node_modules`，由 `npm install` 在云端自动还原），所以 checkout 不需要 `submodules`。若后续改为把主题以 git submodule 放进 `themes/`，需给 checkout 步骤加 `with: submodules: recursive`。

### Phase 8 — 收尾：生成项目级 `CLAUDE.md`
骨架与部署跑通后，在仓库根**生成一个 `CLAUDE.md`**（区别于本 PLAN），内容包括：
- 常用命令：`hexo new`、`hexo clean`、`hexo s`、`hexo g`、push 触发部署
- 目录结构说明（`source/_posts`、`source/_data`、`_config.stellar.yml`、`source/css/_custom.styl`）
- 写文章的 front-matter 规范与分类约定
- 部署机制（push main → Actions → Pages）
- 个人风格 token（主色、字体），方便以后维护时保持一致

---

## 4. 验收清单（Definition of Done）

- [ ] `hexo s` 本地无报错；首页 / 分类 / 标签 / 归档 / about / 友链均可访问
- [ ] 数学公式、代码高亮、Stellar 标签组件渲染正常
- [ ] push 后 GitHub Actions 通过，`https://<GITHUB_USERNAME>.github.io` 可正常打开
- [ ] 导航结构与参考站骨架一致（Blog / 笔记 / 关于 / 友链）
- [ ] 至少 1 篇正式文章 + about 内容已填
- [ ] 仓库根已生成 `CLAUDE.md`

---

## 5. 内容草稿（专业素材，占位待用户最终确认）

> 以下为草稿示例，方便先把页面填满跑通，最终文案由用户定。**公开站点不要放成绩、学号、GPA 等隐私信息。**

**About**：CUHK-Shenzhen 计算机科学本科；研究兴趣方向 LLM-based Agents for Software Engineering（AI4SE）；算法竞赛背景 ICPC / OI（C++）。

**Projects / Research（做成卡片）**：
- Personalized DP-SGD —— 差分隐私相关实验
- PR Review Agent —— 手写 ReAct loop + DeepSeek API
- RepoRAG —— 基于 LangGraph 的仓库问答（目标 pydantic 代码库）
- EEG Foundation Models 阅读笔记 —— LUNA / REVE 等

**分类参考**：Research / Algorithm / Notes / Project / Life

---

## 6. 参考链接

- Stellar 官方文档：https://xaoxuu.com/wiki/stellar/
- Stellar 仓库：https://github.com/xaoxuu/hexo-theme-stellar
- Hexo 官方 GitHub Pages 部署：https://hexo.io/docs/github-pages
