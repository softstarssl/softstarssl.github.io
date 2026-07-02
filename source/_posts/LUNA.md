---
title: LUNA-Note
date: 2026-07-2
categories: Notes
tags: [EEG, ML]
---


# LUNA：拓扑无关的高效 EEG 基础模型

## TL;DR（一句话）

不同 EEG 数据集的电极排布（montage）各不相同，导致模型难以跨数据集迁移。LUNA 用 **一组可学习的 query 做 cross-attention**，把任意通道数的输入压缩到一个**固定大小的潜空间（Q 个槽）**，从而做到「拓扑无关」，并把后续时序注意力的复杂度**从随通道数二次方降到与通道数线性无关**。代价是：精度只是「有竞争力」，真正的卖点是**效率**（FLOPs ↓ ~300×，显存 ↓ 最多 10×）。

> 本质上是把 **Set Transformer 的 inducing points + Perceiver IO 的潜空间瓶颈** 这套「处理变长集合」的思路，专门适配到 EEG 的通道集合上。这是全文最值得拿走的设计模式。

---

## 1. 要解决的问题：拓扑异构（Topological Heterogeneity）

- 每个公开 EEG 数据集自己定义电极数量和位置，模型换数据集就掉点：跨数据集运动想象解码掉 ~14pp，情绪识别掉 13–15pp。
- 现有方案都不理想：
  - **按 montage 单独训练** → 不通用；
  - **只用共享通道** → 最多丢掉 80% 数据；
  - **把「通道 × 时间」展平成长序列做 self-attention** → 复杂度 $O((S\cdot C)^2)$（$S$ 时间 patch 数，$C$ 通道数），密集电极帽下根本算不动。

> 一句话：缺一个**既与 montage 无关、又能高效扩展**的统一架构。

---

## 2. 核心思想

把「不同通道数」这个变量从计算瓶颈里**摘出去**。
做法是在时序建模**之前**，先用 cross-attention 把 $C$ 个通道的特征投影到 $Q$ 个固定的可学习 query 上（$Q$ 很小，4–8 个）。投影对通道是**置换不变**的（→ 拓扑无关），而且这一步对 $C$ 是**线性**的。之后所有重活都在 $Q$（很小）和时间维 $S$ 上做，与 $C$ 解耦。

---

## 3. 方法（Encoder–Decoder）

### 3.1 Encoder（三个模块）

**① Patch 特征提取**
- 原始 EEG $x \in \mathbb{R}^{B\times C\times T}$，每个通道切成 $S=T/P$ 个不重叠 patch（$P=40$ 个采样点）。
- 双路并行嵌入后相加：
  - **时域**：1D 卷积网络（GroupNorm + GELU），抓局部时序特征（思路同 LaBraM / CBraMod）；
  - **频域**：每个 patch 做 FFT，取幅度+相位过 MLP。
- **通道位置编码**：对归一化的 **3D 电极坐标**做 NeRF 式正弦编码 → MLP，加到 patch 特征上。

**② Channel-Unification Module（核心）**
- $Q$ 个可学习 query $Q_{learn}\in\mathbb{R}^{Q\times E}$，**正交初始化**以鼓励多样性。
- 输入 reshape 成 $X'\in\mathbb{R}^{(B\cdot S)\times C\times E}$，把「每个 patch 时刻」当独立样本处理。
- Cross-attention（query 来自 $Q_{learn}$，K/V 来自通道特征）：
  $$A_{out} = \text{MultiHeadAttention}(Q, X', X') \in \mathbb{R}^{(B\cdot S)\times Q\times E}$$
- 再过 FFN + 残差，以及 $L$ 层只在 query 维 $Q$ 上跑的 Transformer encoder。
- 输出 $X_{unified}\in\mathbb{R}^{(B\cdot S)\times Q\times E}$ —— **从此与原始电极排布彻底解耦**。

**③ Patch-wise Temporal Encoder**
- reshape 成 $X'_{unified}\in\mathbb{R}^{B\times S\times(Q\cdot E)}$，用带 **RoPE** 的 Transformer encoder 建模时间依赖。
- 注意：二次方注意力只发生在**时间维 $S$ 和很小的 $Q$ 上**，不碰 $C$。

### 3.2 Decoder（两种）
- **重建头（预训练）**：$C$ 个可学习 decoder query 反过来 cross-attend $E_{out}$，线性投影还原出 patch 值 $\hat{x}$。注意——decoder 才把信息「解压」回具体通道。
- **分类头（微调）**：单个聚合 query 做 attention pooling 得到全局表征。

### 3.3 预训练目标
- **重建损失**：对 masked + 可见 patch 都算 Smooth L1，$L_{rec}=\bar{S}_M + \alpha\cdot\bar{S}_{\neg M}$（非 mask 区权重 $\alpha=0.05$，mask 比例 0.5）。
- **Query 特化损失**：惩罚 query–channel 亲和矩阵的**非对角相似度**，逼 query 学到互不重叠的空间分工（$\lambda_{spec}=0.8$）。可视化（Fig 4）能看到不同 query 自发分管额区 / 广域等不同脑区。

---

## 4. 复杂度对比（全文的「胜负手」）

| 方法 | 瓶颈复杂度 | 与 $C$ 的关系 |
|---|---|---|
| **LUNA** | $O(B\cdot S^2\cdot Q\cdot E)$ 或 $O(B\cdot S\cdot Q\cdot C\cdot E)$ | **线性** |
| Full-Attention（LaBraM） | $O(B\cdot S^2\cdot C^2\cdot E)$ | 二次方 |
| Alternating（patch 维） | $O(B\cdot S^2\cdot C\cdot E)$ | 线性但 $S^2$ 重 |
| Alternating（channel 维） | $O(B\cdot S\cdot C^2\cdot E)$ | 二次方 |

> 关键：把昂贵时序注意力里的 $C$ 换成了固定的小 $Q$。
> 实测：通道数增大时计算近乎**常数**（Fig 3，密集帽下完胜 CBraMod）；patch 数增大时不会像 LaBraM 那样 OOM（Fig 2）。整体 FLOPs ↓ ~300×、显存 ↓ 最多 10×。

---

## 5. 实验结果（带诚实解读）

预训练数据：TUEG（21,787h，20/22 通道）+ Siena（141h，29 通道），共 >21,900h 原始 EEG，masked patch 重建。
三个规模：Base 7M / Large 43M / Huge 311M。

| 数据集 | 任务 | LUNA 最好成绩 | 真实定位 |
|---|---|---|---|
| **TUAB** | 异常检测（二分类） | Huge AUROC **0.8957** | ⚠️ 只是「有竞争力」，**低于** LaBraM-Huge(0.9162)、CBraMod(0.9156)，甚至略低于 LaBraM-Base(0.9022) |
| **TUAR** | 伪迹检测（多分类） | Large/Huge AUROC **0.92** | ✅ SOTA |
| **TUSL** | slowing 分类（4 类） | Huge AUROC **0.80** | ✅ SOTA |
| **SEED-V** | 情绪识别（5 类，**未见过的 62 通道**） | 落后 CBraMod 2–3pp | ❌ 对全新高密度 montage 的零样本泛化仍弱 |

> **诚实解读**：这其实更像一篇**效率论文**而非精度论文。
> - 在最主流、最常被引的 TUAB 上它**不是最强**，只是接近第一梯队；
> - 摘要里的「SOTA」来自 TUAR / TUSL 这两个**更小**的基准；
> - SEED-V 暴露了真正的软肋：**预训练的位置编码迁移不到差异很大的新 montage**。
> 所以正确的故事是：**用很小的精度代价换来数量级的效率和真正的拓扑无关**，而不是「全面碾压」。

---

## 6. 消融（LUNA-Base，TUAB / TUAR）

| 去掉的组件 | 影响 | 结论 |
|---|---|---|
| 可学习 query → 固定脑区（MMM 式） | AUROC −0.004 ~ −0.006 | 学出来的 query 比解剖先验更灵活 |
| 去掉 Query 特化损失 | AUROC −0.003 ~ −0.006 | query 多样性对复杂伪迹有帮助 |
| **去掉频域特征** | **AUROC 最多 −0.012（最大跌幅）** | 频域和时域**互补**，是最关键的一项 |

---

## 7. 局限性

- 对**未见过的高密度 montage（SEED-V 62 通道）敏感**，作者归因于预训练位置编码不够泛化；
- 改进方向：更强的空间泛化能力 / 混合（hybrid）位置嵌入；
- 体量上：ICML **workshop** 论文，结论偏初步，基准覆盖也有限。

---

## 8. 可借鉴的设计模式（对你做 Agent / 架构最有用的一点）

LUNA 的真正可迁移内核，和 EEG 没关系：

> **用一小撮可学习 query + cross-attention，把「变长 / 变结构的输入集合」压缩进固定大小的潜空间瓶颈，从而把下游计算复杂度与输入基数解耦。**

这套路出自 **Set Transformer（inducing points）** 和 **Perceiver IO（latent bottleneck + 任务化输出 query）**。任何「输入元素数量不固定、又想要置换不变 + 线性扩展」的场景都能套——比如处理变长工具集 / 变长检索结果 / 异构上下文片段。把它当成一个「集合 → 固定 token 池」的通用 adapter 来记会很有用。

---

## 速记卡

- **问题**：EEG montage 异构 → 跨数据集掉点 + 展平后 $O((SC)^2)$ 算不动。
- **解法**：cross-attention + 可学习 query → 固定 $Q$ 槽潜空间（拓扑无关 + 对 $C$ 线性）。
- **训练**：masked patch 重建（Smooth L1）+ query 特化损失。
- **结果**：TUAR/TUSL SOTA，TUAB 仅竞争力，SEED-V 泛化弱；FLOPs ↓~300×、显存 ↓~10×。
- **一句话评价**：效率换精度，思想来自 Perceiver/Set Transformer。
