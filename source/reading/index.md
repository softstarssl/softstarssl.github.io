---
title: 阅读与研究
layout: page
menu_id: wiki
comments: false
rightbar:
---

{% raw %}
<section class="reading-wall">
  <header class="reading-hero">
    <span class="reading-kicker">READING LOG</span>
    <h2>把读过的内容，变成可以复用的知识。</h2>
    <p>这里记录论文、研究方向与实践计划。重点不是收藏数量，而是留下自己的判断。</p>
    <div class="reading-stats" aria-label="阅读统计">
      <div><strong>4</strong><span>条目</span></div>
      <div><strong>2</strong><span>已整理</span></div>
      <div><strong>3</strong><span>研究方向</span></div>
    </div>
  </header>

  <nav class="reading-filters" aria-label="筛选阅读条目">
    <button class="active" type="button" data-reading-filter="all" aria-pressed="true">全部</button>
    <button type="button" data-reading-filter="finished" aria-pressed="false">已整理</button>
    <button type="button" data-reading-filter="reading" aria-pressed="false">进行中</button>
    <button type="button" data-reading-filter="planned" aria-pressed="false">计划中</button>
  </nav>

  <p class="reading-result" aria-live="polite">显示 4 个条目</p>

  <div class="paper-grid">
    <article class="paper-card" data-reading-status="finished">
      <div class="paper-meta"><span class="paper-type">PAPER</span><span class="paper-status">已整理</span></div>
      <h3>LUNA</h3>
      <p class="paper-subtitle">拓扑无关的高效 EEG 基础模型</p>
      <p class="paper-takeaway">用可学习 query 将不同通道数压缩到固定潜空间，以少量精度代价换取数量级的效率提升。</p>
      <div class="paper-tags"><span>EEG</span><span>Foundation Model</span></div>
      <a class="paper-link" href="/2026/07/02/LUNA/">查看阅读笔记 <span>→</span></a>
    </article>

    <article class="paper-card" data-reading-status="finished">
      <div class="paper-meta"><span class="paper-type">PAPER</span><span class="paper-status">已整理</span></div>
      <h3>ReAct</h3>
      <p class="paper-subtitle">Reasoning + Acting</p>
      <p class="paper-takeaway">把推理轨迹与外部行动交错组织，让智能体能够依据环境反馈持续修正下一步。</p>
      <div class="paper-tags"><span>Agent</span><span>Reasoning</span></div>
      <a class="paper-link" href="/notes/ai4se-reading/">查看相关笔记 <span>→</span></a>
    </article>

    <article class="paper-card" data-reading-status="reading">
      <div class="paper-meta"><span class="paper-type">TOPIC</span><span class="paper-status">进行中</span></div>
      <h3>AI4SE Agents</h3>
      <p class="paper-subtitle">面向软件工程的大模型智能体</p>
      <p class="paper-takeaway">关注代码理解、评审与生成中的工具调用、反馈闭环和仓库级上下文组织。</p>
      <div class="paper-tags"><span>AI4SE</span><span>LLM Agent</span></div>
      <a class="paper-link" href="/notes/ai4se-reading/">打开研究清单 <span>→</span></a>
    </article>

    <article class="paper-card" data-reading-status="planned">
      <div class="paper-meta"><span class="paper-type">PROJECT</span><span class="paper-status">计划中</span></div>
      <h3>RepoRAG</h3>
      <p class="paper-subtitle">面向代码仓库的检索增强问答</p>
      <p class="paper-takeaway">探索如何组合结构化索引、相关文件检索与智能体工作流，减少仓库级问答中的上下文噪声。</p>
      <div class="paper-tags"><span>RAG</span><span>Repository</span></div>
      <a class="paper-link" href="/notes/ai4se-reading/">查看计划 <span>→</span></a>
    </article>
  </div>
</section>
{% endraw %}
