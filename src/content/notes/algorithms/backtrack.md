---
title: "Backtracking"
date: 2026-10-09
category: "Algorithms"
tags: [Backtracking, DFS, Recursion, LeetCode]
description: "Exploring decision trees through choose, recurse, and undo; understanding states, choices, pruning, and recursion flow."
---

## 0. Backtracking Basics

Backtracking 是在一棵决策树上做 DFS：做选择，递归进去，再撤销。

常见用途：子集、排列、切分字符串、构造合法序列。

- **State:** 已经决定的部分
- **Choice:** 这一层可以做的下一步
- **Leaf:** 一个完整答案，或者一条走不通的分支
- **Pruning:** 这条分支不可能合法，就不要进去

和普通图 DFS 不一样，这里通常没有现成的图，树是选择长出来的。

```python
def backtrack(state, path):
    if is_complete(state):
        output.append(path.copy())
        return

    for choice in valid_choices(state):
        path.append(choice)          # choose
        backtrack(next_state, path)  # explore
        path.pop()                   # undo
```

`for` 管同一层的不同选择，递归负责把这个选择下面的可能走完，`pop` 回到这一层再试下一个。

递归调用时，上一层的 `for` 停在这一次选择上。递归返回后，从 `pop` 后面继续，不会把这一层的循环重开。每一层有自己的循环位置；`path` 通常是同一份会被改的 list。

> `for` 是宽度，递归是深度，`pop` 是恢复现场。返回之后上一层从刚才那次调用的下一行继续。

写之前先定四件事：

| Question | Meaning |
|---|---|
| State | 已经决定了什么 |
| Choices | 下一步能选什么 |
| Constraints | 哪些选择不合法 |
| Base Case | 什么时候算做完，可以存答案 |

> `backtrack(state, path)` 的意思是：在当前这份部分答案上，把后面所有合法的补全都试一遍。剪枝只在这条分支不可能有答案时才安全。

---

## Pattern 1: Include / Exclude

每个元素只有选或不选。

### 78. Subsets

```python
def backtrack(index, path):
    if index == len(nums):
        output.append(path.copy())
        return

    path.append(nums[index])
    backtrack(index + 1, path)
    path.pop()

    backtrack(index + 1, path)
```

State: `index, path`。两条分支都是 `index + 1`，因为这个数的决定已经做完。不选的那次不用 `append`，前面的 `pop` 已经把路径恢复了。n 个元素有 `2^n` 个子集。

Time: O(n · 2^n). Space: O(n)，不算输出。

> 每个数都要走「选」和「不选」。只写选的那条，会漏掉没选它的子集。

---

## Pattern 2: Choose From Remaining Elements

这一层不是按数组顺序决定当前元素，而是给当前位置挑一个还没用的元素。

### 46. Permutations

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

State 就是 `path`，用过的数也能从它看出来。不能用 `index + 1`，因为下一个位置可以是任意还没用的数，不一定是原数组里的下一个。n 大一点时用 `used` 数组，避免每次扫 `path`。

Time: O(n · n!). Space: O(n)，不算输出。

> Subsets 是「当前这个数选不选」。Permutations 是「这个空位放哪个没用过的数」。决策树不是同一种。

---

## Pattern 3: Construct Valid Sequences

边构造边丢掉不合法的选择，不要先生成再检查整串。

### 22. Generate Parentheses

`n` 对括号，长度 `2 * n`。

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

一直维持 `0 <= r <= l <= n`。`l < n` 才能再放左括号；`r < l` 才能放右括号，否则右括号没有匹配的左括号。长度到 `2 * n` 时，这个条件已经保证 `l == r == n`。

合法括号的每个前缀都满足这个关系，所以不会把正确答案剪掉。每种合法串只有一条路径，也不会重复。

Time: 和第 n 个 Catalan 数同阶。Space: O(n)，不算输出。

> 检查的是当前这份部分答案，不是最后再扫整串。不变量每一步都成立，收尾就一定合法。

---

## Pattern 4: Partition by Choosing the End Position

段数和每段长度都不固定。每一层决定下一段切到哪里。

### 131. Palindrome Partitioning

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

`start` 是还没切的起点，不是段的长度。`end` 走 `start + 1` 到 `len(s)`：至少切一个字符，并且 `range` 右端开区间，所以要写到 `len(s) + 1`。`s[start:end]` 含 `start`、不含 `end`，所以下一层从 `end` 继续。

回文检查只管这一段合不合法，递归管剩下的字符串还能怎么切。不用事先决定切几段。

`"aab"` 只看一条走通的路径就够：`start=0` 选 `"a"`，停在这里；里面再选 `"a"`、`"b"`，`start` 到末尾就存下 `["a","a","b"]`。返回并 `pop` 之后，外层才继续试 `"aa"`，得到 `["aa","b"]`。`"ab"`、`"aab"` 不是回文，直接丢掉。

Time: 最坏和切分方案数同阶，每段还要 O(n) 判断回文。Space: O(n)，不算输出。

> `for end` 枚举这一刀切在哪，递归处理剩下的，`pop` 回到这个分叉再试下一刀。`start == len(s)` 才是整串切完，不是「当前这段是回文」就可以存。

---

## Common Mistakes

### 1. 没先定这一层在决定什么

```text
78:  nums[index] 选还是不选
46:  下一个没用过的数
22:  在约束下加 "(" 或 ")"
131: 下一段的结尾在哪
```

### 2. 把 for 和递归的顺序搞反

一次递归会把这棵子树走完，循环才进下一个选择。子递归结束，回到调用那一行的后面，不是把外层 `for` 重来。

### 3. 忘了撤销

```python
path.append(choice)
backtrack(...)
path.pop()
```

`pop` 是换下一条分支前把现场还原，不是说刚才的选择错了。不还原的话，后面的分支会带上前面的元素。

### 4. Subsets 少了一整条分支

只写 include、不写 exclude，就不是全部子集。

### 5. 下标移动抄错题

```text
Subsets:     index + 1
Permutations: 任意没用过的元素
Partition:   start = end
```

### 6. 存了还在变的 path

```python
output.append(path)        # 错，后面还会被改
output.append(path.copy())
output.append("".join(path))  # 字符路径先拼成新字符串
```

### 7. Base case 和启动调用

切分题里 `start == len(s)` 表示整串用完。函数写完要记得 `backtrack(0, [])`。部分路径不是答案，除非这题规定每个子集都要存，比如另一种 Subsets 写法会在每层都保存当前 path。

### 8. 图的 visited 和回溯状态

图 DFS 标记之后通常一直留着，避免回路。回溯里的选择是临时的：排列里一个数在这条分支用过，回来后别的分支还能再用。

```text
Graph DFS:    mark visited，一般不再撤销
Backtracking: choose → explore → undo
```

---

## Summary

| Problem | 这一层的决定 | 状态怎么走 |
|---|---|---|
| 78. Subsets | 选 / 不选 | `index + 1` |
| 46. Permutations | 选一个没用过的 | 更新 `path` / `used` |
| 22. Generate Parentheses | 加 `(` 或 `)` | 更新 `l` 或 `r` |
| 131. Palindrome Partitioning | 下一段切到哪 | `start = end` |

> 难点不是 `append / pop` 这三行，而是这一层到底在决定什么，以及递归进去之后要完成的是哪一块。
