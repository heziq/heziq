---
title: "Greedy Algorithms"
date: 2026-10-16
category: "Algorithms"
tags: [Greedy, LeetCode]
description: "Greedy patterns, key decisions, and implementation notes."
---

## 0. Greedy Basics

Greedy makes a locally optimal or **provably safe decision** at each step to achieve a globally optimal result.

- 不一定每一步都让答案立刻变好，而是保证不会错过最优解。
- 通过排除不可能更优的候选、扩展边界或维护局部约束，减少搜索。
- 关键是证明 **why the greedy choice is safe**。

**Greedy vs. DP**

- **DP:** 把不同选择都算过，并复用子问题的最优解。
- **Greedy:** 找到一条安全的决策规则，不用把其他分支再搜一遍。

> Greedy 不是简单地选最大或最小，而是找到一个不会丢掉最优解的规则。

---

## Pattern 1: Candidate Elimination

丢掉已经不可能更好、也不可能合法的候选。

### 11. Container With Most Water 🟡

$$
A=(r-l)\times\min(height[l],height[r])
$$

左右指针从两端开始，每次移动较短的那一边。

```python
while l < r:
    ans = max(ans, (r - l) * min(height[l], height[r]))

    if height[l] < height[r]:
        l += 1
    else:
        r -= 1
```

Time: O(n). Space: O(1)。

> 宽度每次都在变小，所以只能指望高度变大。较短的那条边留着，另一边再高也没用，面积不会超过已经算过的。移动短边时，被跳过的那些组合都不可能更好。移动之后面积不一定马上变大，只是剩下的候选里还可能有更大的。

### 134. Gas Station 🟡

```python
start = 0
tank = total = 0

for i in range(len(gas)):
    diff = gas[i] - cost[i]
    total += diff
    tank += diff

    if tank < 0:
        start = i + 1
        tank = 0

return start if total >= 0 else -1
```

Time: O(n). Space: O(1)。

> `tank` 看当前起点能不能走到现在，`total` 看整圈油够不够。`tank < 0` 时，从 `start` 到 `i` 的每个起点都会在 `i` 之前或 `i` 这里失败，直接把起点改成 `i + 1`。`tank == 0` 仍然算走得过去。`start` 从 0 开始，只有失败了才重置。

---

## Pattern 2: Reachability / Boundary Expansion

维护能到达的边界，不把每条路径都枚举出来。

### 55. Jump Game 🟡

从最后一格往前看，能跳到当前终点的位置就变成新终点。

```python
dest = len(nums) - 1

for i in range(len(nums) - 2, -1, -1):
    if i + nums[i] >= dest:
        dest = i

return dest == 0
```

Time: O(n). Space: O(1)。

> 从后往前推 `dest`。`i` 能到当前终点，以后只要能到 `i`，就也能到原来的终点。最后看 `dest` 有没有被推到 0。

### 45. Jump Game II 🟡

这题要的是最少跳数。同一跳能覆盖的下标看成一层。

```python
jumps = currentEnd = farthest = 0

for i in range(len(nums) - 1):
    farthest = max(farthest, i + nums[i])

    if i == currentEnd:
        jumps += 1
        currentEnd = farthest

return jumps
```

Time: O(n). Space: O(1)。

> `i` 是在扫当前这一层，不是选好的落点。先把这一层里每个位置能到的最远距离记进 `farthest`，扫到 `i == currentEnd` 才 `jumps += 1`，再把边界扩过去。循环停在 `len - 1` 之前，否则会多算一次到达终点的跳。

---

## Pattern 3: Two-Pass Greedy

左右邻居各管一个方向的约束时，分两遍做。

### 135. Candy 🟡

每人至少 1 颗。评分比邻居高，糖果就必须更多。

```python
candies = [1] * len(ratings)

for i in range(1, len(ratings)):
    if ratings[i] > ratings[i - 1]:
        candies[i] = candies[i - 1] + 1

for i in range(len(ratings) - 2, -1, -1):
    if ratings[i] > ratings[i + 1]:
        candies[i] = max(candies[i], candies[i + 1] + 1)

return sum(candies)
```

Time: O(n). Space: O(n)。

> 从左到右只保证比左边高的人糖果更多，从右到左再补右边的约束。第二遍用 `max`，不能直接覆盖，否则左边已经要的数量会被改小。比的是邻居现在的糖果数，不是简单地 `+= 1`。评分相等没有大小要求。

---

## Pattern 4: Interval Boundary Expansion

当前这段必须覆盖到的右端先撑开，能切的时候尽早切。

### 763. Partition Labels 🟡

每个字母只能出现在一个分段里，分段数尽量多。

```python
last_pos = {}

for i, c in enumerate(s):
    last_pos[c] = i

ans = []
start = curr_end = 0

for i, c in enumerate(s):
    curr_end = max(curr_end, last_pos[c])

    if i == curr_end:
        ans.append(i - start + 1)
        start = i + 1

return ans
```

Time: O(n). Space: O(1)，小写字母固定，不算输出。

> 先记下每个字符最后一次出现的位置。当前段里出现过的字符，它的最后一次也必须算进这段，所以 `curr_end = max(curr_end, last_pos[c])`，不能只看当前这个字符。`i == curr_end` 说明这段里的字符都收齐了，在这里切是最早的合法位置。

---

## Pattern Summary

| Pattern | Problems | Core Idea |
|---|---|---|
| Candidate Elimination | 11, 134 | 安全地丢掉不可能的候选 |
| Reachability / Boundary | 55, 45 | 维护可达边界，不枚举路径 |
| Two-Pass Greedy | 135 | 左右约束分开满足 |
| Interval Partitioning | 763 | 撑开右端，尽早切 |

## Common Mistakes

- Greedy 不是每次都选当前最大的数，这个选择必须是安全的。
- Jump Game II：`i` 是扫描下标，不是落点。
- Gas Station：`start` 从 0 开始，只有 `tank < 0` 才重置。
- Candy：用邻居的糖果数和 `max`，不要直接 `+= 1` 或覆盖。
- Partition Labels：`curr_end` 取的是已出现字符的最远结尾，不是当前字符自己的位置。
- Container：移动短边只保证没丢掉最优，不保证这一步面积变大。

---

> 先认出是哪一种 pattern，再看维护哪个变量、什么时候更新，以及为什么这样选不会错过最优解。
