---
title: "Dynamic Programming (DP)"
date: 2026-10-14
category: "Algorithms"
tags: [Dynamic Programming, LeetCode]
description: "Recognizing DP patterns, defining states, deriving transitions, and handling base cases."
---

## 0. DP Basics

把问题拆成会重复出现的子问题，把结果存下来。

- **Optimal Substructure:** 最优解能由更小的最优解拼出来。
- **Overlapping Subproblems:** 同一个子问题会被反复用到。

Top-down 是递归加缓存，bottom-up 是按依赖顺序填表。

写之前先回答：

1. **State:** `dp[i]` 或 `dp[i][j]` 到底表示什么。
2. **Choices:** 当前能做哪些决定。
3. **Transition:** 做完这个决定，剩下的子问题是哪个，这一步贡献或代价是多少。
4. **Base Case:** 最小的那些情况答案是什么。
5. **Order:** 依赖的状态要先算好。

> 转移要自己推：这一步选了什么，剩下哪一块，这一步加多少。不要单独背 `i-1`、`j-1`。

| Pattern | 在干什么 | Problems |
|---|---|---|
| Linear Recurrence | 由前几个状态拼出来 | 70 |
| Take / Skip | 选或不选当前这个 | 198, 213 |
| Unbounded Choices | 同一种选择可以反复用 | 322 |
| Previous Compatible State | 接到某个更早的合法状态后面 | 300 |
| Grid DP | 从相邻格子转移 | 62, 64 |
| Two Strings DP | 比较两个串的前缀 | 1143, 72, 583 |

---

## Pattern 1: Linear Recurrence

当前状态只依赖前面固定的几个状态。

### 70. Climbing Stairs 🟢

`dp[i]` = 爬到第 `i` 阶的方法数。最后一步要么从 `i-1` 爬 1 阶，要么从 `i-2` 爬 2 阶。

```python
dp[i] = dp[i-1] + dp[i-2]
dp[0] = dp[1] = 1
```

Time: O(n). Space: O(1)，只留前两项。

> 这是计数，所以相加，不是取 max。`dp[0] = 1` 表示「还没爬」也算一种做法。

---

## Pattern 2: Take or Skip

每个元素选一次或不选。要看选了之后，哪个旧状态还合法。

### 198. House Robber 🟢

`dp[i]` = 只考虑前 `i` 个房子（含 i）能偷到的最多钱。

```python
dp[i] = max(dp[i-1], dp[i-2] + nums[i])
dp[0] = nums[0]
dp[1] = max(nums[0], nums[1])
```

长度为 1 的数组单独处理。

Time: O(n). Space: O(1)。

> 不偷当前，就继承 `dp[i-1]`。偷当前，就不能要 `i-1`，所以接 `dp[i-2] + nums[i]`。

### 213. House Robber II 🟡

房子围成圈，第一间和最后一间相邻，不能同时偷。

```python
return max(rob_linear(nums[1:]), rob_linear(nums[:-1]))
```

`rob_linear` 就是 198。只有一间房子时单独返回。

Time: O(n). Space: O(1)，不算切片拷贝。

> 合法方案至少会放弃首或尾的一间。两次线性各放弃一端，最优解一定落在其中一次里。不用在环上直接写转移。

---

## Pattern 3: Unbounded Choices / Minimum Cost

同一组选择可以重复用，要的是总代价最小。

### 322. Coin Change 🟡

`dp[i]` = 凑出金额 `i` 的最少硬币数。

```python
dp = [float("inf")] * (amount + 1)
dp[0] = 0

for i in range(1, amount + 1):
    for coin in coins:
        if coin <= i:
            dp[i] = min(dp[i], dp[i - coin] + 1)

# dp[amount] 仍是 inf 就返回 -1
```

Time: O(amount × len(coins)). Space: O(amount)。

> 假设最后一枚是 `coin`，前面必须已经凑出 `i - coin`，再 `+1`。每种面额都试一次当最后一枚，取最小。不能贪心先拿最大的，最大面额不一定凑得出最少枚数。`dp[0] = 0`，其余先设成 `inf`，表示还不知道或到不了。

---

## Pattern 4: Extend a Previous Compatible State

当前位置去接某个更早、而且接得上的状态。

### 300. Longest Increasing Subsequence 🟢

`dp[i]` = **以 `nums[i]` 结尾** 的最长严格递增子序列长度。不是前缀里任意位置的最长。

```python
dp = [1] * n

for i in range(n):
    for j in range(i):
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)

return max(dp) if n else 0
```

Time: O(n²). Space: O(n)。另有二分的 O(n log n)，那是另一套做法。

> 单个元素长度就是 1。只有 `nums[j] < nums[i]` 才能接在后面。最长的不一定结束在最后一个下标，所以答案是 `max(dp)`，不是 `dp[-1]`。

---

## Pattern 5: Grid DP

每个格子依赖已经算过的邻居，常见是上面和左边。

### 62. Unique Paths 🟢

`dp[i][j]` = 走到 `(i, j)` 的方法数。只能从上面或左边来。

```python
dp[i][j] = dp[i-1][j] + dp[i][j-1]
# 第一行、第一列都是 1
```

Time: O(mn). Space: O(n)，可以只留一行。

> 计数，上面的方法数和左边的方法数相加。第一行只能一直向右，第一列只能一直向下，所以是 1。

### 64. Minimum Path Sum 🟢

`dp[i][j]` = 走到 `(i, j)` 的最小路径和。

```python
dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
dp[0][0] = grid[0][0]
# 第一行只能从左边来，第一列只能从上面来
```

Time: O(mn). Space: O(n)。

```text
62: 上面 + 左边
64: 当前格子 + min(上面, 左边)
```

> 走法一样，目标不一样。62 数路径条数用加法；64 求最小花费，先取 min，再加上当前格子。

---

## Pattern 6: Two Strings DP / Prefix Matching

比较的是两个串的前缀，不是任意子串。

```text
dp[i][j] = word1 的前 i 个字符 和 word2 的前 j 个字符 的答案
word1[i-1], word2[j-1] 才是这两个前缀的最后一个字符
```

表开 `(n+1) × (m+1)`，第 0 行第 0 列表示空前缀。循环从 1 开始，循环里面就不用再特判空串。

```python
dp = [[0] * (m + 1) for _ in range(n + 1)]

for i in range(1, n + 1):
    for j in range(1, m + 1):
        ...
```

三个方向没有统一含义，要看这题的状态：

| 方向 | 状态 | Edit Distance 里表示 |
|---|---|---|
| 上 | `dp[i-1][j]` | 删掉 word1 的一个字符 |
| 左 | `dp[i][j-1]` | 插入 word2 还缺的那个字符 |
| 对角 | `dp[i-1][j-1]` | 两个末尾字符匹配，或替换 |

> `i` 是前缀长度，字符下标是 `i-1`。多出来的一行一列是空串，不是第 0 个字符。

### 1143. Longest Common Subsequence 🟡🟢

`dp[i][j]` = 两个前缀的 LCS 长度。子序列不用连续。

```python
if text1[i-1] == text2[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1
else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])

# dp[i][0] = dp[0][j] = 0
# 答案是 dp[n][m]
```

Time: O(nm). Space: O(nm)。

> 末尾相同，两个都收进 LCS，对角 `+1`。不同的话不能同时当结尾，只能丢掉其中一个，取上和左的 max。空串的 LCS 是 0。

### 72. Edit Distance 🟡

`dp[i][j]` = 把 word1 的前 i 个变成 word2 的前 j 个，最少操作数。插入、删除、替换都是 1。

```python
dp[i][0] = i   # 目标是空的，全删
dp[0][j] = j   # 源是空的，全插

if word1[i-1] == word2[j-1]:
    dp[i][j] = dp[i-1][j-1]
else:
    dp[i][j] = 1 + min(
        dp[i-1][j],      # 删 word1 末尾
        dp[i][j-1],      # 插入 word2 末尾，剩下的目标更短
        dp[i-1][j-1],    # 替换，两个末尾一起处理
    )
```

同样的转移可以写成 `@lru_cache` 的 `edit(i, j)`，空串边界是 `i == 0 → j`、`j == 0 → i`。

Time: O(nm). Space: O(nm)。

> 末尾相同就不用操作，对角直接拿过来，不要 `+1`。不同时才在三种操作里选最便宜的。Delete 消耗 word1 一个字符；Insert 把目标的最后一个字符补上，子问题是更短的 word2；Replace 两个末尾一起处理掉。

### 583. Delete Operation for Two Strings 🟡

`dp[i][j]` = 让两个前缀变得一样，最少删几个字符。只能删，而且两个串都可以删。

```python
dp[i][0] = i
dp[0][j] = j

if word1[i-1] == word2[j-1]:
    dp[i][j] = dp[i-1][j-1]
else:
    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1])
```

也可以不建这张表：留下一份 LCS，其余都删掉，`n + m - 2 * LCS`。

Time: O(nm). Space: O(nm)。

> 末尾相同就都留下，对角不加。不同就只能删掉其中一个末尾。不能写成对角 `+1`：那一笔只付了一次代价，却把两个不同的字符都处理掉了，这题没有替换。两个都删是两次操作，由连续两次单删覆盖到。

---

## Two Strings 对照

| Problem | 末尾相同 | 末尾不同 | 目标 |
|---|---|---|---|
| 1143 LCS | 对角 + 1 | max(上, 左) | 最长 |
| 72 Edit Distance | 对角，不加 | 1 + min(上, 左, 对角) | 最少操作 |
| 583 Delete | 对角，不加 | 1 + min(上, 左) | 最少删除 |

> 表长得像，转移不一样。先看允许什么操作，再看要最大还是最小。`+1` 来自这一步的贡献或代价，不是「字符相同就加」。LCS 相同才 `+1`；编辑距离和删除题相同反而是 `+0`。

---

## Common Mistakes

### 1. 状态说得太松

`dp[i] = 到目前为止最好` 经常不够。198 是「房子 0..i 的最多钱」，300 是「以 i 结尾的最长」。两种定义，最后取答案的方式也不同：一个直接看 `dp` 末尾，一个要 `max(dp)`。

### 2. Base case 不是都填 0

```text
LCS:          dp[i][0] = dp[0][j] = 0
Edit / 583:   dp[i][0] = i, dp[0][j] = j
Coin Change:  dp[0] = 0，其余 inf
LIS:          dp[i] = 1
```

### 3. 前缀长度和字符下标

`dp[i][j]` 是前 i、前 j 个字符，比较的是 `word1[i-1]` 和 `word2[j-1]`。`i` 对 word1 / 行，`j` 对 word2 / 列。

### 4. min、max、加法

```text
数方法:     +
最小代价:   min
最大长度:   max
选或不选:   max(take, skip)
```

仍然要以状态为准，这只是常见样子。

### 5. 答案不在你以为的那一格

```text
Coin Change:   dp[amount]，inf 则 -1
Unique Paths:  dp[m-1][n-1]
LCS:           dp[n][m]
LIS:           max(dp)
```

### 6. 计算顺序

依赖还没算出来的格子不能先用。爬楼梯从左到右；网格从左上到右下；LIS 的 `i` 递增，里面看 `j < i`；双串 `i`、`j` 都递增，因为用到上、左、对角。

---

## 看到题时

先写一句 `dp[...]` 表示什么，再列当前能做的选择。每个选择对应剩下的哪个子问题、要加多少，然后才是 base case、用 min 还是 max 还是相加、答案是某一格还是所有格子里挑。只依赖固定的前几项时，可以不留整张表。

```text
70   前两个状态相加
198  max(不偷, 偷当前 + 隔一个)
213  两次 198，各丢掉首或尾
322  最后一枚硬币：min(dp[i-coin] + 1)
300  接到某个更小的 j 后面，答案 max(dp)
62   上 + 左
64   当前值 + min(上, 左)
1143 相同对角+1，不同 max(上, 左)
72   相同对角，不同 1+min(三种)
583  相同对角，不同 1+min(上, 左)
```

> 先把子问题定义清楚，再写选择和 base case。公式是推出来的。
