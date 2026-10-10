---
title: "Backtracking"
date: 2026-10-09
category: "Algorithms"
tags: [Backtracking, DFS, Recursion, LeetCode]
description: "Exploring decision trees through choose, recurse, and undo; understanding states, choices, pruning, and recursion flow."
---

## 0. Backtracking Basics

Backtracking is a DFS-based search technique that explores all possible solutions by making choices, recursively exploring them, and undoing those choices.

Common uses:
- Generate subsets / combinations
- Generate permutations
- Partition strings
- Construct valid sequences
- Constraint satisfaction problems

### Core Idea: Decision Tree

Backtracking explores an **implicit Decision Tree**.

- **Node / State:** Current partial solution
- **Edge / Choice:** One possible next decision
- **Leaf:** A completed solution or a dead end
- **Pruning:** Skip branches that cannot produce valid solutions

Unlike ordinary graph DFS, Backtracking usually explores a decision tree rather than an explicitly given graph.

**General Template:**

```python
def backtrack(state, path):
    if is_complete(state):
        output.append(path.copy())
        return

    for choice in valid_choices(state):
        path.append(choice)     # Choose
        backtrack(next_state, path)  # Explore
        path.pop()              # Undo
```

### How Recursion and For Loop Work Together

This is the most important part.

- **For Loop → Width:** Try different choices at the current level.
- **Recursion → Depth:** Explore the subtree corresponding to one choice.
- **Pop → Backtrack:** Restore the previous state and try the next choice.

Execution order:

```text
for loop: choice A
    append A
    recursion:
        explore all possibilities under A
    pop A

for loop: choice B
    append B
    recursion:
        explore all possibilities under B
    pop B
```

**Important:** When recursion is called, the parent `for loop` is paused. After recursion returns, execution continues immediately after that recursive call.

Each recursive call has its own local variables and loop position, but `path` is usually the same shared mutable list.

> `for` 控制同一层的不同选择，recursion 负责深入探索，`pop()` 恢复现场。递归返回后，上一层的 `for loop` 会从暂停的位置继续，而不是重新开始。

### Why Backtracking Works

Every complete solution corresponds to a sequence of choices from the root to a leaf.

If the algorithm:

1. Enumerates all possible valid next choices
2. Recursively explores each choice
3. Restores the state before trying another choice

then all valid solutions can be explored.

Pruning is safe only when the removed branch cannot lead to a valid answer.

### How to Design Backtracking

Before writing code, answer four questions:

| Question | Meaning |
|---|---|
| State | What has already been decided? |
| Choices | What can I choose next? |
| Constraints | Which choices are valid? |
| Base Case | When is a solution complete? |

Also define the meaning of the recursive function:

> `backtrack(state, path)` explores all valid completions extending the current partial solution.

---

## Pattern 1: Include / Exclude

Use this pattern when each element can either be selected or skipped.

Each level makes a binary decision:

```text
Include current element
Exclude current element
```

### 78. Subsets

For each element, decide whether to include it.

```python
def backtrack(index, path):
    if index == len(nums):
        output.append(path.copy())
        return

    # Include
    path.append(nums[index])
    backtrack(index + 1, path)
    path.pop()

    # Exclude
    backtrack(index + 1, path)
```

State: `index, path`

Choices: Include or Exclude `nums[index]`.

Why `index + 1`?

Each number is processed exactly once. After deciding whether to include the current number, move to the next number.

The second recursive call requires no `append()` because the current element is excluded. The preceding `pop()` has already restored the path.

For `n` elements, there are `2^n` subsets.

> Subsets 的核心是每个数字都做一次“选 / 不选”。两条分支都要探索，否则会遗漏结果。

---

## Pattern 2: Choose From Remaining Elements

Use this pattern when each position can be filled by any unused element.

Unlike Subsets, we do not simply move through the original array in order.

### 46. Permutations

Each level chooses which unused element to place next.

```python
def backtrack(path):
    if len(path) == len(nums):
        output.append(path.copy())
        return

    for num in nums:
        if num in path:
            continue

        path.append(num)
        backtrack(path)
        path.pop()
```

State: `path` (which also determines the used elements).

Choices: All elements not already used.

For `[1,2,3]`:

```text
[]
├── [1]
│   ├── [1,2] → [1,2,3]
│   └── [1,3] → [1,3,2]
├── [2]
│   ├── [2,1] → [2,1,3]
│   └── [2,3] → [2,3,1]
└── [3]
    ├── [3,1] → [3,1,2]
    └── [3,2] → [3,2,1]
```

Why not `index + 1`?

Because permutations allow different orders. The next element is not necessarily the next element in the original array.

For larger inputs, a `used` array can avoid repeatedly scanning `path`.

> Subsets 是决定当前元素要不要；Permutations 是决定当前空位放哪个未使用的元素。两个问题的 Decision Tree 完全不同。

---

## Pattern 3: Construct Valid Sequences

Use Backtracking to construct sequences while maintaining constraints.

Instead of generating every sequence and validating afterward, reject invalid choices immediately.

### 22. Generate Parentheses

For `n` pairs of parentheses, construct a string of length `2*n`.

State:
- `l`: Number of left parentheses used
- `r`: Number of right parentheses used
- `path`: Current sequence

Invariant:

```text
0 <= r <= l <= n
```

```python
def backtrack(l, r, path):
    if len(path) == 2 * n:
        output.append("".join(path))
        return

    if l < n:
        path.append("(")
        backtrack(l + 1, r, path)
        path.pop()

    if r < l:
        path.append(")")
        backtrack(l, r + 1, path)
        path.pop()
```

Two constraints:

1. `l < n`: Cannot use more than `n` left parentheses.
2. `r < l`: Cannot add a right parenthesis without an unmatched left parenthesis.

When `len(path) == 2*n`, the invariant guarantees `l == r == n`, so the result is valid.

**Why does this generate all valid answers?**

Every valid parentheses sequence satisfies the invariant at every prefix. Therefore, no valid sequence is pruned.

Each sequence has exactly one corresponding path in the decision tree, so there are no duplicates.

> 核心不是事后检查整个字符串，而是保证每一步的 partial solution 都合法。只要 invariant 一直成立，最终结果就一定合法。

---

## Pattern 4: Partition by Choosing the End Position

Use this pattern when we need to split a string into segments, but the number and lengths of segments are unknown.

Each level decides:

> Where should the next substring end?

### 131. Palindrome Partitioning

Partition a string into substrings such that every substring is a palindrome.

Example:

```python
s = "aab"

# Valid partitions:
["a", "a", "b"]
["aa", "b"]
```

State:
- `start`: Starting index of the unprocessed part
- `path`: Substrings already selected

Choices: All possible non-empty substrings starting at `start`.

Constraint: The selected substring must be a palindrome.

```python
def backtrack(start, path):
    if start == len(s):
        output.append(path.copy())
        return

    for end in range(start + 1, len(s) + 1):
        substring = s[start:end]

        if substring == substring[::-1]:
            path.append(substring)
            backtrack(end, path)
            path.pop()
```

**Why does this work?**

Every partition can be described as:

```text
first substring + partition of the remaining string
```

The `for loop` enumerates every possible first substring, while recursion handles all possible partitions of the remainder.

We do not need to determine the total number of segments in advance.

### Understanding `start` and `end`

For:

```python
s = "aab"
#    012
```

When `start = 0`:

| end | substring |
|---|---|
| 1 | `s[0:1]` → `"a"` |
| 2 | `s[0:2]` → `"aa"` |
| 3 | `s[0:3]` → `"aab"` |

```python
range(start + 1, len(s) + 1)
```

- `start + 1`: Substring must contain at least one character.
- `len(s) + 1`: Python `range` excludes its upper bound, so we need `end == len(s)` to be possible.
- `s[start:end]`: Includes `start`, excludes `end`.

After selecting `s[start:end]`, recurse with `backtrack(end, path)` because the selected substring ends immediately before index `end`.

### Recursion Trace: `"aab"`

```text
backtrack(0, [])
│
├── end=1: "a"
│   backtrack(1, ["a"])
│   │
│   ├── end=2: "a"
│   │   backtrack(2, ["a","a"])
│   │   │
│   │   └── end=3: "b"
│   │       backtrack(3, ["a","a","b"])
│   │       → SAVE
│   │
│   └── end=3: "ab" → invalid
│
├── end=2: "aa"
│   backtrack(2, ["aa"])
│   │
│   └── end=3: "b"
│       backtrack(3, ["aa","b"])
│       → SAVE
│
└── end=3: "aab" → invalid
```

The exact execution order matters:

1. The outer loop chooses `"a"` and pauses.
2. Recursion explores all partitions starting with `"a"`.
3. Recursive calls return and `pop()` restores previous paths.
4. The outer loop resumes and chooses `"aa"`.
5. Finally, `"aab"` is rejected.

**Palindrome checking and Backtracking have different responsibilities:**

- Palindrome check → Is the current segment valid?
- Backtracking → Explore all valid combinations of segments.

> `start` 不是 substring 长度，而是剩余字符串的起点。`for end` 枚举下一块怎么切，recursion 继续处理剩余部分，`pop()` 回到分叉点。

---

## Common Mistakes

### 1. Not Defining State and Choices

Do not begin by writing `append()` and recursion.

First ask:

```text
What does one recursion level represent?
What choices are available at this level?
```

Examples:

```text
78: Choose whether to include nums[index]
46: Choose the next unused number
22: Choose "(" or ")" under constraints
131: Choose where the next substring ends
```

### 2. Confusing For Loop and Recursion

```python
for choice in choices:
    path.append(choice)
    backtrack(...)
    path.pop()
```

The recursive call explores the entire subtree before the loop continues to the next choice.

Every recursive call has its own loop execution position.

> 不是所有 `for loop` 同时跑，也不是 recursion 后从头运行。子递归结束，返回到调用它的那一行后面继续。

### 3. Forgetting to Undo Choices

```python
path.append(choice)
backtrack(...)
path.pop()
```

`pop()` restores the path before exploring the next branch.

It does not mean the previous choice was wrong.

Without restoring the state, later branches may inherit elements from earlier branches.

### 4. Forgetting an Entire Decision Branch

For Subsets:

```python
# Include
path.append(nums[index])
backtrack(index + 1, path)
path.pop()

# Exclude
backtrack(index + 1, path)
```

Only implementing Include does not enumerate all subsets.

### 5. Incorrect Index Movement

Different problems require different state transitions:

```text
Subsets:
    index + 1

Permutations:
    choose any unused element

Palindrome Partitioning:
    start = end
```

Do not automatically use `index + 1` in every recursive problem.

### 6. Saving a Mutable Path Without Copying

Wrong:

```python
output.append(path)
```

Correct:

```python
output.append(path.copy())
```

Because `path` is mutable and will continue changing during backtracking.

For strings built from characters:

```python
output.append("".join(path))
```

### 7. Wrong Base Case or Forgetting to Start Recursion

For partitioning:

```python
if start == len(s):
    output.append(path.copy())
    return
```

This means the entire string has been consumed, not merely that the current substring is valid.

After defining the recursive function, remember:

```python
backtrack(0, [])
return output
```

### 8. Confusing DFS Visited with Backtracking State

In ordinary graph DFS, `visited` often remains marked permanently to avoid revisiting nodes.

In Backtracking, choices are typically temporary and must be undone.

For example, in Permutations, an element is marked as used while exploring a branch, then becomes available again for another branch.

```text
Graph DFS: mark visited → usually stays visited

Backtracking: choose → explore → undo
```

### 9. Assuming Every Recursive Call Is an Answer

A partial path is not necessarily a completed solution.

Only save it when the problem's completion condition is satisfied.

For example:

```text
Permutations: path length == len(nums)
Parentheses: path length == 2*n
Partitioning: start == len(s)
```

Subsets can also use a different pattern that saves every partial path, because every subset is a valid answer.

---

## Summary: Recognizing Backtracking Patterns

| Problem | Decision at Each Level | State Transition |
|---|---|---|
| 78. Subsets | Include / Exclude | `index + 1` |
| 46. Permutations | Choose unused element | Update `path` / `used` |
| 22. Generate Parentheses | Add `(` or `)` | Update `l` or `r` |
| 131. Palindrome Partitioning | Choose substring end | `start = end` |

Before solving a new Backtracking problem:

1. **Define State:** What has already been decided?
2. **Define Choices:** What can this level choose?
3. **Define Constraints:** Which branches can be skipped?
4. **Define Base Case:** When should the answer be saved?
5. **Trace Recursion:** Choose → Explore → Undo → Next choice.

> 最重要的直觉：Backtracking 就是在一棵 Decision Tree 上做 DFS。真正的难点不是写 `append / pop`，而是想清楚每层在决定什么，以及下一层递归要完成什么任务。
