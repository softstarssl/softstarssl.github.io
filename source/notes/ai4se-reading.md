---
title: AI4SE 论文阅读
layout: page
wiki: notes
---

用来演示笔记内页的一篇占位笔记，主题为 **LLM-based Agents for Software Engineering**。

## 阅读清单

{% checkbox checked:true ReAct: Reasoning + Acting %}
{% checkbox 手写 PR Review Agent（ReAct loop + DeepSeek API） %}
{% checkbox RepoRAG：基于 LangGraph 的仓库问答 %}

## 备注

正文可以正常使用代码块与 Stellar 标签组件：

```python
# 一个最小 ReAct 循环骨架
while not done:
    thought = llm(prompt)
    action = parse(thought)
    obs = run(action)
    prompt += obs
```
