---
title: "Dynamic Programming (DP)"
date: 2026-10-14
category: "Algorithms"
tags: [Dynamic Programming, LeetCode]
description: "Recognizing DP patterns, defining states, deriving transitions, and handling base cases."
---

## 0. DP Basics

Dynamic Programming solves a problem by breaking it into overlapping subproblems and storing their results to avoid repeated computation.

Two important properties:

- **Optimal Substructure**: The optimal solution can be constructed from optimal solutions to smaller subproblems.
- **Overlapping Subproblems**: The same subproblems are solved repeatedly.

Two common implementations:

- **Top-down (Memoization)**: Recursion + cache.
- **Bottom-up (Tabulation)**: Iteratively fill a DP table.

### The 5 Steps of DP

Before writing code, always answer:

1. **State**: What exactly does `dp[i]` or `dp[i][j]` represent?
2. **Choices**: What decisions can we make at the current state?
3. **Transition**: After each choice, what smaller subproblem remains?
4. **Base Case**: What are the simplest subproblems whose answers are known?
5. **Computation Order**: Which states must be calculated first?

Typical structure:

```python
# 1. Define DP state
dp = [...]

# 2. Initialize base cases
dp[0] = ...

# 3. Compute transitions
for i in range(...):
    dp[i] = ...

# 4. Return answer
return dp[...]
```

**The most important step is deriving the transition.**

Do not memorize `i-1`, `j-1`, or `+1` without understanding their meanings.

Instead, ask:

> What choice am I making? What subproblem remains after this choice? What is the cost or contribution of this choice?

### Recognizing Common DP Patterns

| Pattern | Key Idea | Problems |
|---|---|---|
| Linear Recurrence | Combine previous states | 70 |
| Take / Skip | Choose or skip current element | 198, 213 |
| Unbounded Choices | Reuse available choices | 322 |
| Previous Compatible State | Extend an earlier valid solution | 300 |
| Grid DP | Transition from neighboring cells | 62, 64 |
| Two Strings DP | Compare prefixes of two strings | 1143, 72, 583 |

---

## Pattern 1: Linear Recurrence

Use this when the current state depends on a small number of previous states.

### 70. Climbing Stairs 🟢

We can climb either 1 or 2 steps at a time. Count the number of ways to reach step `n`.

**State:**

`dp[i]` = number of ways to reach step `i`.

To reach step `i`, the last move must be:

- From step `i-1` using 1 step.
- From step `i-2` using 2 steps.

**Transition:**

```python
dp[i] = dp[i-1] + dp[i-2]
```

**Base Case:**

```python
dp[0] = 1
dp[1] = 1
```

`dp[0] = 1` represents one way to do nothing.

Time: `O(n)`  
Space: `O(n)`, optimizable to `O(1)`.

> 当前台阶的方法数 = 从前一个台阶走来的方法数 + 从前两个台阶走来的方法数。注意这里是计数，所以用加法。

---

## Pattern 2: Take or Skip

Use this when each element creates a decision:

- Take the current element.
- Skip the current element.

The important part is determining which previous states are compatible with each choice.

### 198. House Robber 🟢

We cannot rob two adjacent houses.

**State:**

`dp[i]` = maximum money obtainable from houses `0` through `i`.

For house `i`:

1. **Skip**: Keep the best result through house `i-1`.
2. **Rob**: Take `nums[i]`, plus the best result through house `i-2`.

**Transition:**

```python
dp[i] = max(
    dp[i-1],              # Skip
    dp[i-2] + nums[i]     # Rob
)
```

**Base Case:**

```python
dp[0] = nums[0]
dp[1] = max(nums[0], nums[1])
```

Handle arrays of length 1 separately.

Time: `O(n)`  
Space: `O(n)`, optimizable to `O(1)`.

> 每个房子只有两个选择：偷或不偷。偷当前就不能偷前一个；不偷当前就继承前一个的最优解。

### 213. House Robber II 🟡

Same as House Robber, but the houses form a circle.

**Key Constraint:** The first and last houses are adjacent, so they cannot both be robbed.

Instead of handling circular dependencies directly, split the problem into two linear cases:

1. Exclude the first house.
2. Exclude the last house.

**Transition:**

```python
return max(
    rob_linear(nums[1:]),
    rob_linear(nums[:-1])
)
```

`rob_linear()` uses the same recurrence as LC 198.

Remember to handle the single-house case.

Why does this work?

Any valid solution must exclude at least one of the two endpoints. Therefore, the optimal solution is covered by one of these two cases.

Time: `O(n)`  
Space: `O(1)` auxiliary space with a rolling-state helper, excluding Python slice copies.

> 环形 DP 不一定要直接处理环。只要保证首尾不能同时选，就可以拆成两次线性 House Robber。

---

## Pattern 3: Unbounded Choices / Minimum Cost

Use this pattern when we can repeatedly select from a set of available choices and want to minimize the total cost.

### 322. Coin Change 🟡

Given unlimited coins of different denominations, find the minimum number of coins needed to make `amount`.

**State:**

`dp[i]` = minimum number of coins needed to form amount `i`.

**Choices:**

Suppose the last coin used is `coin`.

Before adding it, we must already have formed `i-coin`.

Therefore:

```python
dp[i] = min(dp[i], dp[i-coin] + 1)
```

The `+1` represents the coin we just selected.

**Base Case:**

```python
dp[0] = 0
```

All other amounts initially have an unknown or unreachable result:

```python
dp = [float("inf")] * (amount + 1)
dp[0] = 0
```

**Typical Transition:**

```python
for i in range(1, amount + 1):
    for coin in coins:
        if coin <= i:
            dp[i] = min(dp[i], dp[i-coin] + 1)
```

If `dp[amount]` remains infinity, return `-1`.

Time: `O(amount × len(coins))`  
Space: `O(amount)`.

**Common Confusion:**

Why is it `dp[i-coin] + 1`, rather than choosing the largest coin greedily?

Because choosing the largest coin may not lead to the minimum total number of coins.

Each possible last coin creates a candidate solution, and DP chooses the best one.

> 把问题反过来想：如果最后使用的硬币是 coin，那么之前必须凑出 i-coin。遍历所有可能的最后一枚硬币，取最小值。

---

## Pattern 4: Extend a Previous Compatible State

Use this when each position can extend a solution ending at an earlier compatible position.

### 300. Longest Increasing Subsequence 🟢

Find the length of the longest strictly increasing subsequence.

**State:**

`dp[i]` = length of the longest increasing subsequence **ending exactly at index i**.

This distinction is important. It is not the longest subsequence anywhere in the prefix.

**Base Case:**

```python
dp = [1] * n
```

Every individual element forms an increasing subsequence of length 1.

**Transition:**

For every previous index `j < i`:

```python
if nums[j] < nums[i]:
    dp[i] = max(dp[i], dp[j] + 1)
```

The condition is necessary because the sequence must remain strictly increasing.

**Answer:**

```python
return max(dp)
```

For an empty input, return 0.

Time: `O(n²)`  
Space: `O(n)`.

An `O(n log n)` solution also exists using binary search, but it is a different approach.

**Common Confusion:**

Why not return `dp[-1]`?

Because the longest increasing subsequence does not necessarily end at the last element.

> `dp[i]` 必须以 nums[i] 结尾。向前找所有比 nums[i] 小的数，看看接在哪个后面最长。最终取 max(dp)。

---

## Pattern 5: Grid DP

Use this pattern when the problem involves paths through a grid and each cell depends on previously visited neighboring cells.

Typical dependencies:

- From above: `dp[i-1][j]`
- From left: `dp[i][j-1]`

### 62. Unique Paths 🟢

A robot moves only right or down. Count the number of ways to reach the bottom-right cell.

**State:**

`dp[i][j]` = number of ways to reach cell `(i,j)`.

The last move must come from:

- Above.
- Left.

**Transition:**

```python
dp[i][j] = dp[i-1][j] + dp[i][j-1]
```

**Base Case:**

```python
dp[0][j] = 1
dp[i][0] = 1
```

Every cell in the first row or first column has only one possible path from the start.

Time: `O(mn)`  
Space: `O(mn)`, optimizable to `O(n)` for an `m × n` grid.

> 走到当前位置，只能从上面或左边过来。因为求路径总数，所以把两边的方法数相加。

### 64. Minimum Path Sum 🟢

Find the path from the top-left to the bottom-right with the minimum total sum.

Movement is limited to right and down.

**State:**

`dp[i][j]` = minimum path sum to reach cell `(i,j)`.

**Transition:**

```python
dp[i][j] = grid[i][j] + min(
    dp[i-1][j],
    dp[i][j-1]
)
```

**Base Case:**

```python
dp[0][0] = grid[0][0]
```

The first row can only be reached from the left:

```python
dp[0][j] = dp[0][j-1] + grid[0][j]
```

The first column can only be reached from above:

```python
dp[i][0] = dp[i-1][0] + grid[i][0]
```

Time: `O(mn)`  
Space: `O(mn)`, optimizable to `O(n)`.

**Comparison:**

```text
62 Unique Paths:
    above + left

64 Minimum Path Sum:
    current value + min(above, left)
```

> 两道题的移动方式一样，但目标不同：62 统计方法数，用加法；64 求最小成本，用 min，再加当前格子的值。

---

## Pattern 6: Two Strings DP / Prefix Matching

This pattern is especially important for LCS, Edit Distance, and Delete Operation for Two Strings.

The main idea is to compare prefixes rather than arbitrary substrings.

### General State Definition

```text
dp[i][j] = answer for:
    first i characters of word1
    first j characters of word2
```

Notice:

```python
dp[i][j]           # Prefix lengths i and j

word1[i-1]         # Last character of the first prefix
word2[j-1]         # Last character of the second prefix
```

**Why use `(n+1) × (m+1)`?**

To represent empty prefixes and simplify the boundary conditions:

```python
dp = [[0] * (m + 1) for _ in range(n + 1)]
```

Then the main loop becomes:

```python
for i in range(1, n + 1):
    for j in range(1, m + 1):
        ...
```

There is no need for complicated checks inside the loop when `i == 0` or `j == 0`.

### Understanding the Three Directions

| Direction | State | Meaning in Edit Distance |
|---|---|---|
| Up | `dp[i-1][j]` | Delete a character from word1 |
| Left | `dp[i][j-1]` | Insert the last needed character of word2 |
| Diagonal | `dp[i-1][j-1]` | Match or replace the last characters |

These directions do **not** have universal meanings across all DP problems. Their interpretation depends on the state definition.

---

### 1143. Longest Common Subsequence 🟡🟢

Find the longest subsequence appearing in both strings in the same relative order.

A subsequence does not need to be contiguous.

**State:**

`dp[i][j]` = LCS length of the first `i` characters of `text1` and the first `j` characters of `text2`.

**Case 1: Last characters match**

We can extend a common subsequence by 1.

```python
if text1[i-1] == text2[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1
```

**Case 2: Last characters do not match**

They cannot both serve as the final character of the same subsequence.

Consider excluding one of them:

```python
else:
    dp[i][j] = max(
        dp[i-1][j],
        dp[i][j-1]
    )
```

**Base Case:**

```python
dp[0][j] = 0
dp[i][0] = 0
```

Any common subsequence involving an empty string has length 0.

**Answer:**

```python
return dp[n][m]
```

Time: `O(nm)`  
Space: `O(nm)`.

> 字符相同：两个字符一起加入 LCS，左上角 +1。字符不同：必须舍弃其中一个，取上方和左方的最大值。

---

### 72. Edit Distance 🟡

Find the minimum number of operations needed to transform `word1` into `word2`.

Allowed operations:

- Insert a character.
- Delete a character.
- Replace a character.

Each operation costs 1.

**State:**

`dp[i][j]` = minimum operations required to transform the first `i` characters of `word1` into the first `j` characters of `word2`.

**Base Case:**

```python
dp[i][0] = i
dp[0][j] = j
```

If the target is empty, delete every source character.

If the source is empty, insert every target character.

**Case 1: Last characters match**

No operation is needed for the matching characters.

```python
if word1[i-1] == word2[j-1]:
    dp[i][j] = dp[i-1][j-1]
```

**Case 2: Last characters differ**

Consider the final operation.

**Delete:**

Delete the last character of word1:

```python
delete = dp[i-1][j]
```

**Insert:**

Insert the last required character of word2:

```python
insert = dp[i][j-1]
```

Think backward: The insertion accounts for the target's last character, leaving the shorter target prefix as the subproblem.

**Replace:**

Replace word1's last character with word2's last character:

```python
replace = dp[i-1][j-1]
```

**Transition:**

```python
dp[i][j] = 1 + min(
    dp[i-1][j],       # Delete
    dp[i][j-1],       # Insert
    dp[i-1][j-1]      # Replace
)
```

The `+1` is the cost of the operation we choose.

Time: `O(nm)`  
Space: `O(nm)`.

**Alternative: Top-down Memoization**

```python
@lru_cache(None)
def edit(i, j):
    if i == 0:
        return j
    if j == 0:
        return i

    if word1[i-1] == word2[j-1]:
        return edit(i-1, j-1)

    return 1 + min(
        edit(i-1, j),
        edit(i, j-1),
        edit(i-1, j-1)
    )
```

> 不要背三个方向。先想最后一步可以做什么：Delete 消耗 word1 一个字符；Insert 消耗目标 word2 一个字符；Replace 同时处理两个字符。

---

### 583. Delete Operation for Two Strings 🟡

Find the minimum number of deletions needed to make two strings identical.

Unlike Edit Distance, deletion is the only allowed operation, but we can delete from either string.

**State:**

`dp[i][j]` = minimum deletions needed to make the first `i` characters of word1 and the first `j` characters of word2 identical.

**Base Case:**

```python
dp[i][0] = i
dp[0][j] = j
```

If one string is empty, all characters from the other must be deleted.

**Case 1: Last characters match**

Keep both matching characters.

```python
if word1[i-1] == word2[j-1]:
    dp[i][j] = dp[i-1][j-1]
```

No deletion is necessary.

**Case 2: Last characters differ**

At least one last character must be deleted.

```python
else:
    dp[i][j] = 1 + min(
        dp[i-1][j],      # Delete from word1
        dp[i][j-1]       # Delete from word2
    )
```

**Why not `dp[i-1][j-1] + 1`?**

That would remove or resolve two different characters for the cost of one operation.

Unlike LC 72, replacement is not allowed.

Deleting both characters would cost 2 operations, and that possibility is already covered by successive one-character deletions.

Time: `O(nm)`  
Space: `O(nm)`.

**Alternative insight using LCS:**

The characters belonging to a longest common subsequence can be retained, while all others are deleted.

```python
answer = n + m - 2 * LCS(word1, word2)
```

> 和 Edit Distance 非常相似，但操作不同。字符相同直接保留，字符不同只能选择删除 word1 或 word2 的最后一个字符。

---

## Two Strings DP: Comparison

| Problem | Characters Match | Characters Differ | Goal |
|---|---|---|---|
| 1143 LCS | Diagonal + 1 | max(Up, Left) | Maximum length |
| 72 Edit Distance | Diagonal | 1 + min(Up, Left, Diagonal) | Minimum operations |
| 583 Delete Operation | Diagonal | 1 + min(Up, Left) | Minimum deletions |

### Why Do Their Transitions Differ?

The transition depends on the problem's allowed operations and objective.

**1143 — LCS**

We are selecting characters for a common subsequence.

- Match → extend the subsequence.
- Mismatch → exclude one character.

**72 — Edit Distance**

We can insert, delete, or replace characters.

- Match → no cost.
- Mismatch → choose the cheapest legal operation.

**583 — Delete Operation**

Only deletions are allowed.

- Match → keep both.
- Mismatch → delete one character and solve the remaining subproblem.

> 三道题的 DP Table 很像，但不能直接背公式。要先看题目允许什么操作、希望最大化还是最小化。

---

## Common Mistakes

### 1. Not Defining the State Precisely

Bad:

```text
dp[i] = best result so far
```

Better:

```text
dp[i] = maximum money robbed from houses 0...i
```

Or:

```text
dp[i] = longest increasing subsequence ending at i
```

These definitions lead to different transitions and different final answers.

Before writing code, ask:

> What exactly does this state represent, and does the final answer directly correspond to one state?

### 2. Memorizing Transitions Without Understanding Choices

For example:

```python
dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1])
```

Do not simply memorize the formula.

Instead:

```text
Choice A:
    Delete from word1
    → Remaining problem: (i-1, j)
    → Cost: +1

Choice B:
    Delete from word2
    → Remaining problem: (i, j-1)
    → Cost: +1
```

Then choose the minimum.

### 3. Incorrect Base Cases

Different DP objectives produce different initialization.

```text
LCS:
    dp[i][0] = 0
    dp[0][j] = 0

Edit Distance:
    dp[i][0] = i
    dp[0][j] = j

Coin Change:
    dp[0] = 0
    other states = infinity

LIS:
    dp[i] = 1
```

Never assume all DP tables should be initialized to zero.

### 4. Mixing Index and Prefix Length

For Two Strings DP:

```python
dp[i][j]                # First i / j characters
word1[i-1]              # Last character in prefix i
word2[j-1]              # Last character in prefix j
```

Usually:

```python
dp = [[0] * (m+1) for _ in range(n+1)]

for i in range(1, n+1):
    for j in range(1, m+1):
        ...
```

Remember:

- `i` corresponds to word1 / rows.
- `j` corresponds to word2 / columns.

### 5. Incorrectly Adding or Subtracting Costs

Do not use `+1` just because two characters match or `-1` because they are already equal.

The value change must follow the meaning of the state.

Examples:

```text
LCS:
    Matching characters extend the answer.
    → +1

Edit Distance:
    Matching characters require no operation.
    → +0

Delete Operation:
    Matching characters require no deletion.
    → +0
```

> +1、-1 不是根据字符相同与否决定的，而是根据 State 的含义和当前选择的贡献或成本决定的。

### 6. Mixing Up Min, Max, and Addition

Different objectives imply different ways of combining states.

| Objective | Typical Operation |
|---|---|
| Count ways | `+` |
| Find minimum cost | `min()` |
| Find maximum value or length | `max()` |
| Choose current or skip | `max(take, skip)` |

But these are only patterns; always derive the transition from the state definition.

### 7. Returning the Wrong State

Examples:

```text
Coin Change:
    dp[amount]

Unique Paths:
    dp[m-1][n-1]

LCS:
    dp[n][m]

LIS:
    max(dp)
```

For LIS, `dp[-1]` is not necessarily the answer because the longest subsequence might end before the last index.

### 8. Incorrect DP Computation Order

A state must be calculated only after its dependencies are available.

Examples:

```text
Climbing Stairs:
    dp[i] depends on i-1 and i-2
    → left to right

Grid DP:
    dp[i][j] depends on above and left
    → top-left to bottom-right

LIS:
    dp[i] depends on earlier j < i
    → increasing i

Two Strings DP:
    dp[i][j] depends on up, left, diagonal
    → increasing i and j
```

### 9. Overcomplicating Boundaries

When the DP state is based on prefixes, an extra row and column usually make the solution easier.

Instead of individually handling every `i == 0` and `j == 0` inside the main loop, initialize the base cases first.

However, remember that the extra row and column represent **empty prefixes**, not actual characters.

---

## Final Review: How to Derive a DP Solution

When encountering a new DP problem, follow this checklist:

**Step 1 — Define the State**

Write one precise sentence:

```text
dp[...] represents ...
```

**Step 2 — Identify Choices**

Ask:

```text
What can happen at the current step?

Take or skip?
Choose the last coin?
Come from above or left?
Match, delete, insert, or replace?
```

**Step 3 — Derive Each Transition**

For every choice:

```text
Current choice
    ↓
Remaining smaller problem
    ↓
Cost or contribution
    ↓
Candidate answer
```

**Step 4 — Determine Base Cases**

Ask what happens when:

- The input is empty.
- Only one element remains.
- The target amount is zero.
- One string prefix is empty.
- The current cell is on the grid boundary.

**Step 5 — Choose Min / Max / Sum**

Determine whether the problem asks for:

- Number of ways.
- Minimum cost.
- Maximum score or length.

**Step 6 — Check the Final Answer**

Does the answer belong to a particular state, or must it be selected from all states?

**Step 7 — Consider Space Optimization**

If each state only depends on a fixed number of previous states, the full DP table may not be needed.

---

## Quick Pattern Recognition

```text
Climbing Stairs
→ Combine previous states
→ dp[i-1] + dp[i-2]

House Robber
→ Take / Skip
→ max(skip, take)

Coin Change
→ Choose last coin
→ min(previous amount + 1)

LIS
→ Extend a previous valid subsequence
→ max(dp[j] + 1)

Unique Paths
→ Count paths from above / left
→ above + left

Minimum Path Sum
→ Choose cheaper incoming path
→ grid[i][j] + min(above, left)

LCS
→ Match or exclude a character
→ diagonal + 1 / max(up, left)

Edit Distance
→ Match / Insert / Delete / Replace
→ diagonal / 1 + min(three directions)

Delete Operation
→ Match / Delete from either string
→ diagonal / 1 + min(up, left)
```

> **核心总结：** DP 最重要的不是记住 Transition，而是能够根据 State 和 Choices 独立推导 Transition。每次先定义子问题，再想当前决策，最后考虑 Base Case 和计算顺序。
