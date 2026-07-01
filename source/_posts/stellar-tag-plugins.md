---
title: Stellar 标签组件演示
date: 2026-06-29 10:00:00
categories: Notes
tags: [Stellar, 组件]
---

演示 Stellar 主题常用的标签组件与代码高亮是否渲染正常。

## note 提示块

{% note color:green 这是一个绿色提示块，适合放小贴士。 %}

## button 按钮

{% button color:theme Stellar 文档 https://xaoxuu.com/wiki/stellar/ icon:solar:book-bold-duotone %}

## checkbox 清单

{% checkbox checked:true color:green 搭好 Hexo + Stellar 骨架 %}
{% checkbox checked:true color:green 配置导航 / 页脚 / 友链 %}
{% checkbox 接入评论系统（后续） %}

## timeline 时间线

{% timeline %}

<!-- node 2026-06 -->
初始化仓库，跑通本地骨架

<!-- node 计划中 -->
个性化风格定制 + 上线

{% endtimeline %}

## tabs 选项卡

{% tabs %}

<!-- tab 代码高亮 -->
```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

<!-- tab 说明 -->
上面的 Python 代码用于验证代码高亮（highlight.js）是否正常工作。

{% endtabs %}
