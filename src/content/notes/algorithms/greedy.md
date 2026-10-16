---
title: "Greedy Algorithms"
date: 2026-10-16
category: "Algorithms"
tags: [Greedy, LeetCode]
description: "Greedy patterns, key decisions, and implementation notes."
---

## 0. Greedy Basics

Greedy makes a locally optimal or **provably safe decision** at each step to achieve a globally optimal result.

Core idea:
- 不一定每一步都让答案变好，而是保证不会错过最优解。
- 通过排除不可能更优的候选、扩展边界或维护局部约束，减少搜索。
- 关键是证明 **why the greedy choice is safe**。

**Greedy vs. DP**
- **DP:** Consider different possible transitions and reuse optimal subproblem results.
- **Greedy:** Find a safe decision rule that avoids exploring unnecessary alternatives.

> Greedy 不是简单地选最大的或最小的，而是找到一个不会丢失最优解的决策规则。

---

## Pattern 1: Candidate Elimination

Eliminate candidates that can no longer produce a better or valid solution.

### 11. Container With Most Water 🟡

Area:

$$
A=(r-l)\times\min(height[l],height[r])
$$

**Approach: Two Pointers**

- Start with `l = 0`, `r = n - 1`.
- Calculate the current area and update the maximum.
- Always move the **shorter boundary**.

```python
while l < r:
    ans = max(ans, (r - l) * min(height[l], height[r]))

    if height[l] < height[r]:
        l += 1
    else:
        r -= 1
```

**Key insight:** Width always decreases. Keeping the shorter boundary cannot produce a larger area, regardless of how tall the other boundary becomes.

> 每次丢弃较短边界时，所有因此不再考虑的组合，都不可能比已经计算过的组合更好。

### 134. Gas Station 🟡

**Approach: Greedy Reset**

Maintain:
- `total`: Net gas across all stations; determines whether a solution exists.
- `tank`: Current gas balance from the candidate start.
- `start`: Current candidate starting station.

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

**Key insight:** If starting at `start` first fails at `i`, every candidate between `start` and `i` also fails. Skip directly to `i + 1`.

- `tank < 0` → Reset candidate start.
- `total < 0` → Impossible to finish a full circuit.
- `tank == 0` is valid.

> 当前起点失败时，可以排除从 start 到 i 的全部候选。tank 判断当前起点，total 判断整体是否有解。

---

## Pattern 2: Reachability / Boundary Expansion

Maintain a reachable boundary instead of enumerating possible paths.

### 55. Jump Game 🟡

**Approach: Backward Greedy**

Start from the last index as the destination.

```python
dest = len(nums) - 1

for i in range(len(nums) - 2, -1, -1):
    if i + nums[i] >= dest:
        dest = i

return dest == 0
```

**Key insight:** If index `i` can reach the current destination, then `i` becomes the new destination.

> 从后往前找能到达终点的位置，不断把 dest 往前推，最后判断是否能推到 0。

### 45. Jump Game II 🟡

**Approach: Greedy + BFS Level Expansion**

Unlike Jump Game I, we need the **minimum number of jumps**.

Maintain:
- `currentEnd`: Farthest boundary of the current jump layer.
- `farthest`: Farthest position reachable from the current layer.
- `jumps`: Number of completed jump layers.

```python
jumps = currentEnd = farthest = 0

for i in range(len(nums) - 1):
    farthest = max(farthest, i + nums[i])

    if i == currentEnd:
        jumps += 1
        currentEnd = farthest

return jumps
```

**Key insight:** Do not actually choose one landing position. Scan every position in the current reachable layer, then expand to the next layer.

- `i` is the scanning position, not the actual landing position.
- `i == currentEnd` → Current layer completed, `jumps += 1`.
- Stop before the last index to avoid an extra jump.

> 把相同步数可以到达的 index 看成一层。先计算这一层能到达的最远边界，扫描完才增加 jumps，不会漏掉其他可能的落脚点。

---

## Pattern 3: Two-Pass Greedy

Use two directional passes when local constraints depend on both neighbors.

### 135. Candy 🟡

Every child gets at least one candy. Children with higher ratings than their neighbors must receive more.

**Approach: Left-to-Right + Right-to-Left**

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

**Key insight:**
- First pass: Satisfy the left-neighbor constraint.
- Second pass: Satisfy the right-neighbor constraint.
- Use `max()` to preserve requirements from the first pass.
- Use the neighbor's candy count, not simply `+= 1`.
- Equal ratings impose no ordering requirement.

> 两遍分别满足左右约束，第二遍用 max 保留两个方向要求的最小糖果数量，不能直接覆盖。

---

## Pattern 4: Interval Boundary Expansion

Track the required end of the current segment and cut as early as possible.

### 763. Partition Labels 🟡

Partition a string into the maximum number of parts, ensuring each character appears in only one part.

**Approach: Last Occurrence + Greedy Boundary**

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

**Key insight:**
- Record the last occurrence of every character.
- Expand `curr_end` when a character appears again farther ahead.
- `i == curr_end` → All characters in the current partition are complete; cut here.
- Cut at the earliest valid position to maximize the number of partitions.

> 当前分区必须包含所有已遇到字符的最后一次出现。当 i == curr_end，就可以安全切分。

---

## Pattern Summary

| Pattern | Problems | Core Idea |
|---|---|---|
| Candidate Elimination | 11, 134 | Safely discard impossible candidates |
| Reachability / Boundary | 55, 45 | Maintain reachable boundaries instead of paths |
| Two-Pass Greedy | 135 | Satisfy left and right constraints separately |
| Interval Partitioning | 763 | Expand boundary and cut at the earliest valid position |

## Common Mistakes

- **Greedy ≠ always choosing the largest value.** The choice must be safe.
- **Jump Game II:** `i` is a scanning index, not the actual landing position.
- **Gas Station:** Initialize `start = 0`; reset only when `tank < 0`.
- **Candy:** Use the neighbor's count and `max()`, not simply `+= 1`.
- **Partition Labels:** Use `max(curr_end, last_pos[c])`, not just the last position of the current character.
- **Container:** Moving the shorter pointer does not guarantee immediate improvement.

## Complexity Summary

| Problem | Time | Extra Space |
|---|---|---|
| 11. Container With Most Water | O(n) | O(1) |
| 55. Jump Game | O(n) | O(1) |
| 45. Jump Game II | O(n) | O(1) |
| 134. Gas Station | O(n) | O(1) |
| 135. Candy | O(n) | O(n) |
| 763. Partition Labels | O(n) | O(1)* |

*For 763, assuming a fixed lowercase English alphabet and excluding the output array.*

---

> **Greedy 复习重点：先识别 Pattern，再想清楚维护什么变量、什么时候更新，以及为什么这个选择不会错过最优解。**
