---
title: "Greedy Algorithms"
date: 2026-10-16
category: "Algorithms"
tags: [Greedy, Two Pointers, LeetCode]
description: "Greedy decisions, candidate elimination, interval expansion, and correctness proofs."
---

## 0. Greedy Basics

A **Greedy Algorithm** makes locally optimal or safe decisions without exhaustively exploring every possible solution.

The goal is to obtain a globally optimal solution through a sequence of decisions that can be proven safe.

Common uses:
- Maximum / minimum optimization
- Interval selection and expansion
- Minimum number of operations or jumps
- Candidate elimination
- Resource allocation under local constraints
- Reachability and feasibility

The most important question is:

> **Why is this greedy choice safe? What possibilities can we discard without losing the optimal answer?**

### Greedy vs. Dynamic Programming

Both Greedy and DP can solve optimization problems, but they use different strategies.

| | Greedy | Dynamic Programming |
|---|---|---|
| Main idea | Make provably safe local decisions | Solve and reuse overlapping subproblems |
| Explores alternatives? | Eliminates or compresses unnecessary choices | Compares relevant transitions |
| State | Often a few variables | Often an array/table |
| Correctness | Greedy-choice property / exchange argument | Optimal substructure / recurrence |
| Typical complexity | Often O(n) or O(n log n) | Depends on number of states and transitions |

DP asks:

> What is the best solution among all possible previous states?

Greedy asks:

> Can we prove that some choices never need to be considered?

**Important:** Greedy is not automatically correct just because a problem asks for a maximum or minimum.

A locally appealing choice can still lead to a globally suboptimal result.

### Common Greedy Proof Techniques

**1. Candidate Elimination**

Prove that a certain candidate cannot improve the answer, so it can be safely discarded.

Example: Container With Most Water.

**2. Exchange Argument**

Show that an optimal solution can be transformed to include the greedy choice without making the solution worse.

**3. Staying Ahead**

Prove that the greedy algorithm is always at least as good as competing choices according to some progress measure.

Example: maintaining the farthest reachable index.

**4. Invariant**

Define a property that remains true after every iteration.

Example: after completing a BFS-like layer, all positions reachable within that many jumps have been accounted for.

> 贪心的关键不是“凭直觉选择最好的一步”，而是证明这个选择不会错过全局最优解。

---

## Pattern 1: Candidate Elimination / Two Pointers

Use this pattern when some candidate boundaries can be proven incapable of improving the current answer.

The general idea:

```text
initialize candidate boundaries

while search space remains:
    evaluate current candidate
    eliminate a boundary that cannot lead to a better solution
```

The key is to eliminate candidates **with proof**, rather than trying arbitrary movements.

### 11. Container With Most Water

Given heights, find two vertical lines that contain the maximum amount of water.

Area:

$$
A(l,r)=(r-l)\cdot\min(h_l,h_r)
$$

Two factors determine the area:

- Width: `r - l`
- Height: `min(height[l], height[r])`

Moving either pointer inward decreases the width.

Therefore, to possibly improve the area, the effective height must increase.

**Greedy decision: Move the shorter boundary.**

```python
l, r = 0, len(height) - 1
max_area = 0

while l < r:
    area = (r - l) * min(height[l], height[r])
    max_area = max(max_area, area)

    if height[l] < height[r]:
        l += 1
    else:
        r -= 1
```

**Why move the shorter boundary?**

Suppose:

$$
h_l\leq h_r
$$

The current area is:

$$
A(l,r)=(r-l)h_l
$$

For any new right boundary `j` with `l < j < r`:

$$
A(l,j)=(j-l)\min(h_l,h_j)
$$

Because:

$$
j-l<r-l
$$

and:

$$
\min(h_l,h_j)\leq h_l
$$

we have:

$$
A(l,j)<A(l,r)
$$

Therefore, keeping the current shorter left boundary while moving the right boundary cannot improve the result.

The left boundary can be safely eliminated.

**Important distinction:**

Moving the shorter boundary does not guarantee a larger area in the next step.

It only guarantees that we are not discarding any potentially better answer.

**Complexity:**
- Time: O(n)
- Space: O(1)

> 宽度一定减少，所以只有突破短板的高度限制才可能让面积增加。移动短板不是保证下一步更好，而是证明可以安全排除当前短板。

---

## Pattern 2: Reachability / Farthest Boundary

Use this pattern when the problem involves moving forward through an array and the reachable positions form continuous intervals.

Instead of enumerating paths, maintain the farthest reachable boundary.

### 55. Jump Game

Each `nums[i]` represents the maximum forward jump length from position `i`.

Determine whether the last index is reachable.

**Forward Greedy:**

Maintain:

```python
farthest = 0
```

For each reachable position:

```python
farthest = max(farthest, i + nums[i])
```

If:

```python
i > farthest
```

the current position cannot be reached, so the last position is unreachable.

Alternatively, use **Backward Greedy**:

Start from the last index as the goal.

If position `i` can reach the current goal:

```python
if i + nums[i] >= goal:
    goal = i
```

Finally, check whether:

```python
goal == 0
```

**Why does backward greedy work?**

If position `i` can reach `goal`, and `goal` can reach the end, then `i` can also reach the end.

Therefore, the problem becomes finding an earlier position that can reach the current goal.

**Complexity:**
- Time: O(n)
- Space: O(1)

> Jump Game I 只判断能不能到达，不要求最少步数。可以从前往后维护 farthest，也可以从后往前更新 goal。

### 45. Jump Game II

Unlike Jump Game I, the goal is to find the **minimum number of jumps** to reach the last index.

A natural DP approach is:

$$
dp[i]=\text{minimum jumps needed to reach index }i
$$

For any `j` that can reach `i`:

$$
dp[i]=\min(dp[i],dp[j]+1)
$$

A basic DP solution takes O(n²) time.

However, the Greedy approach can solve it in O(n).

**Key idea: BFS Level Expansion without a Queue.**

Rather than committing to a specific landing position, process all positions reachable with the same number of jumps.

Maintain three variables:

| Variable | Meaning |
|---|---|
| `jumps` | Number of completed jump layers |
| `currentEnd` | Farthest boundary reachable within the current number of jumps |
| `farthest` | Farthest boundary reachable by expanding the current layer one more jump |

```python
jumps = 0
currentEnd = 0
farthest = 0

for i in range(len(nums) - 1):
    farthest = max(farthest, i + nums[i])

    if i == currentEnd:
        jumps += 1
        currentEnd = farthest
```

**Why does this work?**

Consider:

```text
nums  = [2, 3, 1, 1, 4]
index =  0  1  2  3  4
```

BFS-like layers:

```text
Layer 0 (0 jumps): [0]
Layer 1 (1 jump ): [1, 2]
Layer 2 (2 jumps): [3, 4]
```

While scanning a layer, calculate:

```python
farthest = max(farthest, i + nums[i])
```

When:

```python
i == currentEnd
```

all positions in the current layer have been examined.

We can finish this layer and move to the next one.

**Important:**

`i` is the index currently being examined, not necessarily an actual landing position.

The algorithm does not greedily jump to one specific index.

It examines the entire current reachable interval before deciding the next boundary.

Since each index is scanned at most once, a queue or heap is unnecessary.

Do not process the last index:

```python
range(len(nums) - 1)
```

Once the destination is reached, no additional jump is needed.

The problem guarantees that the last index is reachable.

**Complexity:**
- Time: O(n)
- Space: O(1)

> Jump Game II 不是每次真的跳到最远的位置，而是把所有相同步数能到达的 index 当作一层。扫描完整层后才 jumps + 1，因此不会遗漏可能更好的路径。

---

## Pattern 3: Candidate Elimination / Reset on Failure

Use this pattern when failure at a particular position allows an entire range of candidate starting positions to be eliminated.

Instead of restarting the simulation from every candidate, prove which candidates cannot work.

### 134. Gas Station

At station `i`:

```python
diff[i] = gas[i] - cost[i]
```

A positive value means excess gas; a negative value means a deficit.

The goal is to find a starting station from which a complete circular trip is possible.

Maintain:

| Variable | Meaning |
|---|---|
| `total` | Net gas across all stations |
| `tank` | Accumulated gas from the current candidate start |
| `start` | Current candidate starting position |

```python
total = 0
tank = 0
start = 0

for i in range(len(gas)):
    diff = gas[i] - cost[i]

    total += diff
    tank += diff

    if tank < 0:
        start = i + 1
        tank = 0

return start if total >= 0 else -1
```

**Why reset the starting position when `tank < 0`?**

Suppose the current candidate start is `s`, and the tank becomes negative for the first time at `i`.

We know the accumulated net gas from `s` through every earlier stopping point was nonnegative.

For any intermediate candidate `k`, where:

```text
s < k <= i
```

starting from `k` would discard the nonnegative gas accumulated before `k`.

Therefore, starting from `k` cannot avoid the deficit at `i`.

All candidates from `s` through `i` can be eliminated.

We can directly choose:

```python
start = i + 1
tank = 0
```

**Why reset `tank` to zero?**

The previous starting point has already failed.

We are evaluating a new candidate from scratch, so earlier gas gains and losses should not carry over into the new candidate's tank.

**Why also check `total`?**

A complete circuit is impossible if total gas is less than total cost:

$$
\sum_{i=0}^{n-1}(gas[i]-cost[i])<0
$$

If the total is nonnegative, the final candidate found by the greedy scan can complete the circuit.

**Complexity:**
- Time: O(n)
- Space: O(1)

> tank 判断当前起点能不能继续；total 判断整个问题有没有解。某个起点失败时，可以一次排除从 start 到 i 的所有候选起点，不必逐个模拟。

---

## Pattern 4: Two-Pass Greedy / Local Constraints

Use this pattern when every element must satisfy constraints involving both its left and right neighbors.

A single directional scan may satisfy one side but violate the other.

The solution is to process each direction separately while preserving previously established constraints.

### 135. Candy

Each child has a rating.

Rules:

1. Every child receives at least one candy.
2. A child with a higher rating than an adjacent child must receive more candies.

Find the minimum total number of candies.

**Key observation:**

The constraints involve two directions:

```text
left neighbor → current child
current child ← right neighbor
```

A single left-to-right scan does not necessarily satisfy the right-neighbor constraints.

For example:

```text
ratings:  5  4  3  2  1
candies:  1  1  1  1  1
```

We need:

```text
candies:  5  4  3  2  1
```

**Greedy strategy: Two directional passes.**

Initialize:

```python
candies = [1] * n
```

First pass: left to right.

```python
for i in range(1, n):
    if ratings[i] > ratings[i - 1]:
        candies[i] = candies[i - 1] + 1
```

This satisfies the left-neighbor constraint.

Second pass: right to left.

```python
for i in range(n - 2, -1, -1):
    if ratings[i] > ratings[i + 1]:
        candies[i] = max(candies[i], candies[i + 1] + 1)
```

This satisfies the right-neighbor constraint without losing the necessary minimum from the first pass.

**Why use `max()`?**

Consider:

```text
ratings:  1  2  3  4  2
```

After the first pass:

```text
candies:  1  2  3  4  1
```

If we blindly overwrite rating 4's candy count using its right neighbor:

```python
candies[i] = candies[i + 1] + 1
```

we would get:

```text
candies:  1  2  3  2  1
```

This violates the left-neighbor constraint.

Instead:

```python
candies[i] = max(candies[i], candies[i + 1] + 1)
```

preserves the larger of the two necessary minimums.

**Why not simply `+= 1`?**

A child may need more than one additional candy.

For example, in a long decreasing sequence:

```text
ratings:  5  4  3  2  1
candies:  5  4  3  2  1
```

Each child's requirement depends on the already-computed candy count of the right neighbor.

Therefore:

```python
candies[i] = candies[i + 1] + 1
```

is the appropriate lower bound, rather than adding one to an arbitrary existing value.

**Why is the result minimal?**

The first pass computes the minimum candies needed for the left-side constraints.

The second pass ensures that each child also satisfies the right-side constraints.

Every child must receive at least the larger of these two lower bounds.

Choosing exactly that bound avoids unnecessary candies.

**Complexity:**
- Time: O(n)
- Space: O(n)

An advanced solution can use increasing/decreasing slope lengths to achieve O(1) extra space.

> Candy 的关键是左右约束分开处理。第一遍保证左边，第二遍保证右边，用 max 保留两个方向都必须满足的最小糖果数。不能直接 += 1，也不能直接覆盖。

---

## Pattern 5: Interval Boundary Expansion / Partitioning

Use this pattern when elements impose interval constraints and we want to divide a sequence into as many valid segments as possible.

The key is to maintain the minimum required right boundary for the current segment.

### 763. Partition Labels

Partition a string into as many parts as possible such that each character appears in at most one part.

Return the lengths of the parts.

Example:

```text
s = "ababcbacadefegdehijhklij"
```

Partition:

```text
ababcbaca | defegde | hijhklij
```

Answer:

```python
[9, 7, 8]
```

**Key observation:**

If a character appears in the current partition, every occurrence of that character must remain in the same partition.

Therefore, we need to know the last occurrence of each character.

**Step 1: Record last occurrence.**

```python
last_pos = {}

for i, c in enumerate(s):
    last_pos[c] = i
```

Repeated assignments automatically preserve the last index of each character.

**Step 2: Expand the current partition boundary.**

Maintain:

| Variable | Meaning |
|---|---|
| `start` | Starting index of current partition |
| `curr_end` | Required right boundary of current partition |
| `i` | Current scanning position |

```python
output = []
start = 0
curr_end = 0

for i, c in enumerate(s):
    curr_end = max(curr_end, last_pos[c])

    if i == curr_end:
        output.append(i - start + 1)
        start = i + 1
```

**Why update the boundary using `max()`?**

Consider:

```text
s:      a  b  a  c  b
index:  0  1  2  3  4
```

Last occurrences:

```text
a → 2
b → 4
c → 3
```

Scan:

| i | Character | `last_pos[c]` | `curr_end` |
|---|---|---|---|
| 0 | a | 2 | 2 |
| 1 | b | 4 | 4 |
| 2 | a | 2 | 4 |
| 3 | c | 3 | 4 |
| 4 | b | 4 | 4 |

At index 0, it seems that index 2 might be a valid boundary.

But index 1 contains `b`, whose last occurrence is at index 4.

Therefore, the current partition must extend to index 4.

**Why can we cut when `i == curr_end`?**

By this point, every character encountered in the current partition has its final occurrence at or before `curr_end`.

No character from the current partition will appear later.

Therefore, cutting here is valid.

Since we cut at the earliest possible valid boundary, we maximize the number of partitions.

**Important connection to Jump Game II:**

Both problems maintain a boundary using `max()`.

However:

```text
Jump Game II:
    currentEnd = boundary of the current jump layer

Partition Labels:
    curr_end = required boundary of the current partition
```

In Jump Game II, reaching the boundary means finishing one BFS-like layer.

In Partition Labels, reaching the boundary means finishing one valid segment.

**Complexity:**
- Time: O(n)
- Space: O(k), where k is the number of distinct characters stored in the dictionary, plus output space.

For lowercase English letters, k ≤ 26, so the auxiliary dictionary uses O(1) space.

> 先记录每个字符最后出现的位置，再不断扩大当前分区的右边界。当 i == curr_end 时，当前所有字符都已经完整出现，可以安全切分。每次尽早切分，才能得到最多的 partition。

---

## Common Mistakes

### 1. Assuming Greedy Means Choosing the Largest Value

Greedy does not always mean selecting the largest, smallest, or farthest immediate option.

For example, in Jump Game II:

```text
nums = [2, 3, 1, 1, 4]
```

Jumping directly from index 0 to the farthest index 2 is not the optimal path.

The optimal path is:

```text
0 → 1 → 4
```

The correct Greedy algorithm expands the entire reachable layer instead of committing to a single landing point.

### 2. Confusing Scanning with Taking an Action

In Jump Game II:

```python
for i in range(len(nums) - 1):
```

`i` is just the position being inspected.

It does not mean that the algorithm physically jumps to every index.

The jump count increases only when the current layer has been fully scanned:

```python
if i == currentEnd:
    jumps += 1
```

### 3. Updating the Current Value Instead of Using the Neighbor

Incorrect for Candy:

```python
candies[i] += 1
```

Correct:

```python
candies[i] = candies[i - 1] + 1
```

or:

```python
candies[i] = max(candies[i], candies[i + 1] + 1)
```

When a constraint is relative to a neighbor, the updated value must account for the neighbor's actual value.

### 4. Overwriting Previous Greedy Results

In two-pass algorithms, a later pass must preserve necessary constraints from an earlier pass.

For Candy:

```python
candies[i] = max(candies[i], candies[i + 1] + 1)
```

Do not blindly overwrite a value that may already be required by the left-neighbor constraint.

### 5. Incorrect Initialization

For Gas Station:

```python
start = 0
tank = 0
total = 0
```

`start` must be initialized even if the tank never becomes negative.

For Jump Game II:

```python
jumps = 0
currentEnd = 0
farthest = 0
```

Initially, zero jumps can only reach index 0.

### 6. Wrong Boundary Conditions

Common boundary conditions:

```python
# Container With Most Water
while l < r:

# Jump Game II
for i in range(n - 1):

# Gas Station
if tank < 0:

# Partition Labels
if i == curr_end:
```

Each boundary has a specific meaning.

Especially:

- `tank == 0` is valid in Gas Station.
- The final index does not need another jump in Jump Game II.
- A partition ends only after all required character occurrences are included.

### 7. Ignoring Equal Values

For Candy:

```python
ratings[i] == ratings[i - 1]
```

does not impose any candy ordering requirement.

For Container With Most Water, equal-height boundaries allow either pointer to be moved safely.

Do not assume equality must always be handled like an increasing or decreasing case.

### 8. Greedy Without a Correctness Argument

A Greedy rule may work for examples but fail on edge cases.

Before accepting a Greedy algorithm, ask:

1. What exactly is the local decision?
2. What invariant is maintained?
3. Why is the decision safe?
4. What candidate solutions are eliminated?
5. Can an eliminated candidate still produce a better answer?
6. Why does the algorithm eventually reach a globally optimal solution?

> 如果只能解释“这样做看起来比较好”，但无法解释“为什么不会错过更好的答案”，那就还没有真正证明 Greedy 的正确性。

---

## Pattern Comparison

| Problem | Pattern | Core Greedy Decision |
|---|---|---|
| 11. Container With Most Water | Candidate Elimination + Two Pointers | Eliminate the shorter boundary |
| 55. Jump Game | Reachability | Maintain farthest reachable position or backward goal |
| 45. Jump Game II | BFS Level Expansion | Expand the entire reachable interval before counting a jump |
| 134. Gas Station | Candidate Elimination | On failure, skip all candidate starts through the failure point |
| 135. Candy | Two-Pass Greedy | Satisfy directional constraints independently using `max()` |
| 763. Partition Labels | Interval Boundary Expansion | Cut at the earliest valid boundary |

---

## Greedy Problem-Solving Checklist

When encountering a new Greedy problem:

**Step 1: Identify the objective**

Are we trying to:

- Maximize a value?
- Minimize a cost or number of operations?
- Determine reachability?
- Select the maximum number of valid intervals/segments?

**Step 2: Find the decision**

What choice needs to be made at each step?

Examples:

```text
Container: which pointer to move?
Jump Game II: when to complete one jump layer?
Gas Station: which start candidates to eliminate?
Candy: how many candies are minimally necessary?
Partition Labels: when can the current segment end?
```

**Step 3: Look for structural properties**

Common useful properties:

- Sorted order
- Continuous reachable intervals
- Monotonic boundaries
- Local neighbor constraints
- Prefix/suffix information
- Safe candidate elimination

**Step 4: Establish a proof**

Try one of:

```text
Candidate Elimination
Exchange Argument
Staying Ahead
Loop Invariant
```

**Step 5: Check edge cases**

Examples:

```text
n = 1
all equal values
strictly increasing
strictly decreasing
multiple local peaks
zero values
boundary reached exactly
```

**Step 6: Analyze complexity**

Remember to include auxiliary arrays, dictionaries, heaps, and repeated operations such as `sum()` inside loops.

---

## Final Takeaways

Greedy is not one universal implementation template.

Different Greedy problems use different structural properties to avoid unnecessary exploration.

The most useful patterns from these problems are:

**1. Eliminate impossible candidates**

Used in Container With Most Water and Gas Station.

Prove which candidates cannot produce a better answer, then skip them.

**2. Compress a search space into boundaries**

Used in Jump Game I, Jump Game II, and Partition Labels.

Track the farthest required or reachable boundary instead of enumerating every path.

**3. Satisfy local constraints with minimal resources**

Used in Candy.

Process constraints systematically and preserve the necessary minimum from each direction.

**4. Separate correctness from immediate improvement**

A Greedy step does not need to improve the answer immediately.

It only needs to preserve the possibility of reaching a globally optimal answer.

> **Greedy 的本质：不一定每一步都更好，而是每一步都能证明没有丢失最优解。**
