---

## title: "Skip-Gram: Probability, MLE, and Word Embeddings"
date: 2026-10-22
category: "Learn"
tags: [cse256, NLP, Skip-Gram, Word-Embeddings]
description: "Understanding Skip-Gram through conditional probability, maximum likelihood estimation, and word embedding construction."

# Skip-Gram: Probability, MLE, and Word Embeddings

## 1. Assignment: Understanding Skip-Gram

### Model Definition

Consider the Skip-Gram model:

$$
P(\text{context}=y\mid\text{word}=x)=\frac{\exp(v_x\cdot c_y)}{\sum_{y'}\exp(v_x\cdot c_{y'})}
$$

where $x$ is the **center word**, $y$ is the **context word**, and $v_x,c_y$ are $d$-dimensional vectors. Each word has two independent embeddings: a center vector and a context vector.

### Q1 (10 points)

Consider the sentences:

- `the dog`
- `the cat`
- `a dog`

Assume a window size $k=1$. The context vectors are fixed:

$$
c_{\text{dog}}=c_{\text{cat}}=(0,1),\quad c_a=c_{\text{the}}=(1,0)
$$

**3a.** What is the set of probabilities $P(y\mid\text{the})$ that maximize the data likelihood, independent of any particular Skip-Gram vectors?

**3b.** Can these probabilities be nearly achieved by choosing a word vector for `the`? Give a vector that produces probabilities within 0.01 of the optimum and explain why.

### Q2 (10 points)

Consider the sentences:

- `the dog`
- `the cat`
- `a dog`
- `a cat`

Assume $d=2$.

**3c.** List the training examples derived from these sentences.

**3d.** Give a set of word and context vectors that nearly optimizes the Skip-Gram objective, with probabilities within 0.01 of the optimum.

- **3a：** 根据训练数据，求理想的条件概率分布。
- **3b：** Context Vectors 已给定，设计 $v_{\text{the}}$，让 Softmax 接近理想概率。
- **3c：** 根据 Window Size 生成 Training Pairs。
- **3d：** 自己设计所有 Center / Context Vectors，使整体 Data Likelihood 尽可能大。

区别：**3a 优化 Probability Distribution；3b/3d 构造能够逼近该分布的 Embeddings。**

---

## 2. Core Concepts

### 2.1 Skip-Gram、Center Word 和 Context Word

Skip-Gram 的任务是：

> Given a center word, predict the words appearing in its context window.

例如 `the dog runs`，以 `dog` 为 Center：

- Center Word：`dog`
- Context Words：`the`, `runs`
- Training Pairs：`(dog, the)`, `(dog, runs)`

**Window Size** $k$ 决定向左右各看多少个词：

- $k=1$：左右各 1 个。
- $k=2$：左右各 2 个。

**Embedding Dimension** $d$ 决定向量有多少个分量：

- $d=2$：例如 $(0,10)$。
- $d=300$：300-dimensional word vector。

记忆：**$k$ = 看多远；$d$ = 向量有多少维。**

### 2.2 Center Vector vs. Context Vector

Skip-Gram 为每个词维护两套独立的 Embeddings：

| Vector | 作用 |
|---|---|
| $v_x$ — Center Vector | 输入词的表示，用于发起预测 |
| $c_y$ — Context Vector | 候选输出词的表示，用于计算预测分数 |

例如：

$$
(\text{the},\text{dog})\Rightarrow v_{\text{the}}\cdot c_{\text{dog}}
$$

$$
(\text{dog},\text{the})\Rightarrow v_{\text{dog}}\cdot c_{\text{the}}
$$

**同一个词的两套向量不必相同。** 因为它作为输入和作为候选输出时承担不同角色。

### 2.3 Probability、Likelihood 和 MLE

**Conditional Probability**

$$
P(y\mid x)
$$

给定 Center $x$，预测某一个 Context $y$ 的概率。它是单次预测的概率，不是整个数据集的概率。

**Data Likelihood**

假设训练样本独立，整个训练数据的 Likelihood 是：

$$
L=\prod_{(x,y)\in D}P(y\mid x)
$$

例如 `(the,dog)`、`(the,cat)`：

$$
L=P(\text{dog}\mid\text{the})P(\text{cat}\mid\text{the})
$$

没有观察到的 pair 不直接进入乘积，但所有候选 Context 的概率仍必须加起来等于 1。

**Maximum Likelihood Estimation (MLE)**

MLE 要寻找使 Data Likelihood 最大的参数：

$$
\hat{\theta}=\arg\max_\theta L(\theta)
$$

它不是寻找概率最大的某个单词，而是寻找**最能解释整个训练数据的概率分布或模型参数**。

如果允许自由选择条件概率，MLE 等于训练数据的 Empirical Distribution：

$$
\boxed{P_{\mathrm{MLE}}(y\mid x)=\frac{\operatorname{Count}(x,y)}{\sum_{y'}\operatorname{Count}(x,y')}}
$$

例如：

| Training Contexts | $P(\text{dog}\mid\text{the})$ | $P(\text{cat}\mid\text{the})$ |
|---|---|---|
| dog, cat | 1/2 | 1/2 |
| dog, dog, dog, cat | 3/4 | 1/4 |

注意：**Empirical Probability 不一定等于 True Probability**。有限训练样本可能不能准确反映真实数据分布。

### 2.4 Log-Likelihood 和 NLL

为什么题目使用 Log-Likelihood？

因为：

$$
\log(ab)=\log a+\log b
$$

所以：

$$
\log L=\sum_{(x,y)\in D}\log P(y\mid x)
$$

由于 log 严格递增：

$$
\arg\max_\theta L(\theta)=\arg\max_\theta\log L(\theta)
$$

取 log 使乘法变加法，提高 Numerical Stability，也方便优化。

训练 Neural Networks 时常使用：

$$
\mathcal{L}_{\mathrm{NLL}}=-\log L
$$

因此：

**Minimize NLL = Maximize Log-Likelihood。**

### 2.5 Dot Product 和 Softmax

Skip-Gram 用 Dot Product 产生 Score：

$$
s(x,y)=v_x\cdot c_y
$$

再用 Softmax 转成概率：

$$
P(y\mid x)=\frac{\exp(s(x,y))}{\sum_{y'}\exp(s(x,y'))}
$$

其中 $\exp(z)=e^z$。

例如四个候选词的 Scores 是：

$$
[10,10,0,0]
$$

Softmax 给出：

$$
[0.49998,0.49998,0.000023,0.000023]
$$

**更高的 Dot Product → 更高的预测概率。**

---

## 3. Q1: Understanding the Optimal Distribution

### 3a. Find the MLE Probabilities

原始句子：

```text
the dog
the cat
a dog
```

$k=1$，生成：

$$
\begin{aligned}
&(\text{the},\text{dog}),(\text{dog},\text{the})\\
&(\text{the},\text{cat}),(\text{cat},\text{the})\\
&(a,\text{dog}),(\text{dog},a)
\end{aligned}
$$

只考虑 Center = `the`：

$$
(\text{the},\text{dog}),\quad(\text{the},\text{cat})
$$

设：

$$
p_1=P(\text{dog}\mid\text{the}),\quad p_2=P(\text{cat}\mid\text{the})
$$

则：

$$
L=p_1p_2
$$

由于全部候选词概率之和为 1：

$$
p_1+p_2\leq1
$$

根据 AM-GM：

$$
p_1p_2\leq\left(\frac{p_1+p_2}{2}\right)^2\leq\frac14
$$

最大值在 $p_1=p_2=1/2$ 时取得。

所以：

$$
\boxed{\begin{aligned}P(\text{dog}\mid\text{the})&=P(\text{cat}\mid\text{the})=0.5\\P(a\mid\text{the})&=P(\text{the}\mid\text{the})=0\end{aligned}}
$$

**为什么不是 1/4？**

Vocabulary 中有四种可能，不代表它们必须等概率。MLE 根据观察到的 Context Frequencies 分配概率。

### 3b. Construct the Center Vector

老师固定：

$$
c_{\text{dog}}=c_{\text{cat}}=(0,1)
$$

$$
c_a=c_{\text{the}}=(1,0)
$$

我们希望 dog/cat 的 Score 高，a/the 的 Score 低。

设：

$$
v_{\text{the}}=(0,t)
$$

则 Dot Products 为：

$$
s(\text{dog})=s(\text{cat})=t,\quad s(a)=s(\text{the})=0
$$

因此：

$$
P(\text{dog}\mid\text{the})=\frac{e^t}{2e^t+2}=\frac{1}{2+2e^{-t}}
$$

题目允许误差 0.01，即：

$$
P(\text{dog}\mid\text{the})\geq0.49
$$

所以：

$$
\frac{1}{2+2e^{-t}}\geq0.49
$$

解得：

$$
\boxed{t\geq\ln49\approx3.89}
$$

因此可以选择：

$$
\boxed{v_{\text{the}}=(0,10)}
$$

此时：

$$
P(\text{dog}\mid\text{the})=P(\text{cat}\mid\text{the})\approx0.49998
$$

其余两个概率约为 $0.000023$。

**为什么是 10？** 不是算出唯一答案为 10，而是选择一个足够大的数满足误差要求。精确达到零概率需要无限大的 Score Gap。

---

## 4. Q2: Constructing All Word Embeddings

### 3c. Generate Training Pairs

四个句子：

```text
the dog
the cat
a dog
a cat
```

每个句子长度为 2，且 $k=1$，因此每句生成两个有方向的 Pairs：

$$
\begin{aligned}
&(\text{the},\text{dog}),(\text{dog},\text{the})\\
&(\text{the},\text{cat}),(\text{cat},\text{the})\\
&(a,\text{dog}),(\text{dog},a)\\
&(a,\text{cat}),(\text{cat},a)
\end{aligned}
$$

总共 **8 Training Pairs**。

### 3d. Design Center and Context Vectors

这次老师只规定 $d=2$，没有固定 Context Vectors。

第一步：从训练数据确定理想分布。

| Center | Ideal Context Distribution |
|---|---|
| the | dog: 0.5, cat: 0.5 |
| a | dog: 0.5, cat: 0.5 |
| dog | the: 0.5, a: 0.5 |
| cat | the: 0.5, a: 0.5 |

第二步：设计 Context Vectors。

让 Determiners 和 Nouns 位于两个不同方向：

$$
c_{\text{the}}=c_a=(1,0)
$$

$$
c_{\text{dog}}=c_{\text{cat}}=(0,1)
$$

第三步：设计 Center Vectors。

`the` 和 `a` 应该预测 dog/cat，因此：

$$
v_{\text{the}}=v_a=(0,10)
$$

`dog` 和 `cat` 应该预测 the/a，因此：

$$
v_{\text{dog}}=v_{\text{cat}}=(10,0)
$$

最终：

| Word | Center $v$ | Context $c$ |
|---|---|---|
| the | (0,10) | (1,0) |
| a | (0,10) | (1,0) |
| dog | (10,0) | (0,1) |
| cat | (10,0) | (0,1) |

验证：Center 为 `the` 时，四个 Context Scores 按照 the、a、dog、cat 的顺序是：

$$
[0,0,10,10]
$$

因此 dog/cat 的概率各约为 0.49998。

Center 为 `dog` 时：

$$
[10,10,0,0]
$$

因此 the/a 的概率各约为 0.49998。

其他两个 Center 同理。所有概率都在最优分布的 0.01 以内。

这也是 **Distributional Hypothesis** 的直观体现：上下文分布相同的词，可以使用相同的向量表示。

---

## 5. Key Takeaways

**整个 Part 3 的逻辑：**

$$
\boxed{\text{Training Data}\rightarrow\text{Training Pairs}\rightarrow\text{Likelihood}\rightarrow\text{MLE}\rightarrow\text{Embeddings}\rightarrow\text{Softmax}}
$$

- **3a：** 求理想概率分布，不受 Embedding 参数限制。
- **3b：** 固定 Context Vectors，构造一个 Center Vector。
- **3c：** 根据 $k$ 列出 Training Pairs。
- **3d：** 同时构造两套 Embeddings，使整个训练数据的 Log-Likelihood 接近最优。

最重要的区别：

$$
P(y\mid x)\neq L
$$

前者是单次预测的条件概率，后者是整个训练数据的 Likelihood。

---

## Appendix: Full Solutions (English)

### 3a. Optimal Conditional Probabilities

With $k=1$, the examples involving `the` as the center word are `(the,dog)` and `(the,cat)`. Their log-likelihood contribution is

$$
\log P(\text{dog}\mid\text{the})+\log P(\text{cat}\mid\text{the}).
$$

The likelihood is maximized by matching the empirical context distribution:

$$
\boxed{P(\text{dog}\mid\text{the})=P(\text{cat}\mid\text{the})=\frac12,\quad P(a\mid\text{the})=P(\text{the}\mid\text{the})=0.}
$$

### 3b. Nearly Optimal Center Vector

The fixed context vectors are

$$
c_{\text{dog}}=c_{\text{cat}}=(0,1),\quad c_a=c_{\text{the}}=(1,0).
$$

Let $v_{\text{the}}=(0,t)$. Then

$$
P(\text{dog}\mid\text{the})=P(\text{cat}\mid\text{the})=\frac{e^t}{2e^t+2}=\frac{1}{2+2e^{-t}}.
$$

To obtain probabilities within 0.01 of the optimum, it is sufficient to choose $t\geq\ln49\approx3.89$.

Taking $v_{\text{the}}=(0,10)$ gives

$$
P(\text{dog}\mid\text{the})=P(\text{cat}\mid\text{the})\approx0.49998,
$$

$$
P(a\mid\text{the})=P(\text{the}\mid\text{the})\approx0.000023.
$$

The two desired contexts share the same context vector and therefore receive equal probability. Increasing $t$ suppresses the remaining contexts. The exact optimum is approached as $t\to\infty$.

### 3c. Training Examples

The four sentences produce eight ordered training pairs:

$$
\begin{aligned}
&(\text{the},\text{dog}),(\text{dog},\text{the}),\\
&(\text{the},\text{cat}),(\text{cat},\text{the}),\\
&(a,\text{dog}),(\text{dog},a),\\
&(a,\text{cat}),(\text{cat},a).
\end{aligned}
$$

### 3d. Nearly Optimal Word and Context Vectors

The empirical conditional distributions assign equal probability to dog/cat given either determiner, and equal probability to the/a given either noun.

Choose the following two-dimensional vectors:

$$
\boxed{\begin{aligned}
c_{\text{dog}}=c_{\text{cat}}&=(0,1),\\
c_{\text{the}}=c_a&=(1,0),\\
v_{\text{the}}=v_a&=(0,10),\\
v_{\text{dog}}=v_{\text{cat}}&=(10,0).
\end{aligned}}
$$

For either determiner as the center, the context scores are $(0,0,10,10)$ for the, a, dog, cat, respectively. Thus dog and cat each receive probability approximately $0.49998$, while the and a each receive approximately $0.000023$.

For either noun as the center, the scores are reversed, assigning approximately $0.49998$ each to the and a.

All predicted conditional probabilities are within 0.01 of their empirical optima. Hence this construction nearly optimizes the Skip-Gram log-likelihood.
