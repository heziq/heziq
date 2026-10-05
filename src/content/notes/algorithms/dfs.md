---
title: "DFS"
date: 2026-10-04
category: "Algorithms"
tags: [graph, leetcode]
description: "Choosing a traversal and keeping visited-state bugs out of graph problems."
---

## 0. DFS Basics

DFS explores one path as deeply as possible before backtracking.

Common uses:
- Traverse a connected component
- Count connected components
- Compute component size
- Find all reachable nodes
- Copy / rebuild graph structure

```python
def dfs(i, j):
    if i < 0 or j < 0 or i >= n or j >= m or invalid:
        return

    mark_visited(i, j)

    dfs(i + 1, j)
    dfs(i - 1, j)
    dfs(i, j + 1)
    dfs(i, j - 1)
```

Important:
- `n = len(grid)` → rows
- `m = len(grid[0])` → columns
- Valid range: `0 <= i < n`, `0 <= j < m`
- Boundary uses `>=`, not `>`
- Mark `visited` **before** visiting neighbors
- For graphs with cycles, always use `visited` or a hashmap

> 中文：DFS 最重要的是先想清楚 `dfs(node)` 到底代表什么，然后及时 mark visited，防止重复访问或死循环。

---

## 200. Number of Islands

**Pattern: Count Connected Components**

Each island is one connected component of `"1"` cells.

Traverse every cell. Whenever an unvisited land cell is found:
1. `count += 1`
2. Run DFS to mark the entire connected island as visited

```text
for each cell:
    if cell is unvisited land:
        count += 1
        dfs(cell)
```

The DFS itself does not need to return anything. Its job is simply to remove / mark the entire component.

> 中文：每发现一个新的 `1`，就说明发现了一座新岛；先 `count += 1`，再 DFS 把整座岛标记掉。

---

## 695. Max Area of Island

**Pattern: Compute Connected Component Size**

Very similar to 200, but instead of counting how many components exist, calculate the size of each component.

DFS returns the area of the island starting from the current cell:

```python
def dfs(i, j):
    if invalid:
        return 0

    mark_visited(i, j)

    return (
        1
        + dfs(i + 1, j)
        + dfs(i - 1, j)
        + dfs(i, j + 1)
        + dfs(i, j - 1)
    )
```

`1` represents the current cell.

Then:

```python
area = dfs(i, j)
max_area = max(max_area, area)
```

> 中文：和 200 一样找 component，但 DFS 不只是标记，而是返回这个岛一共有多少格。

---

## 130. Surrounded Regions

**Pattern: Reverse Search**

Instead of checking whether each `"O"` is surrounded, find all `"O"` cells that are definitely **not** surrounded.

Any `"O"` connected to the boundary cannot be captured.

Algorithm:
1. Start DFS from every boundary `"O"`
2. Mark all connected `"O"` cells as safe, e.g. `"*"`
3. Traverse the whole board
4. Remaining `"O"` → `"X"`
5. `"*"` → `"O"`

```text
boundary O
    ↓ DFS
all safe O → *

remaining O → X
* → O
```

> 中文：反着想——不直接找“被包围的 O”，而是先从边界找所有“不可能被包围的 O”。

---

## 417. Pacific Atlantic Water Flow

**Pattern: Reverse Reachability**

The direct approach is to start from every cell and ask whether water can reach both oceans. This repeats a lot of work.

Instead, reverse the search.

Original water flow:

```text
high → low
```

Reverse DFS:

```text
ocean → same height or higher
```

So when searching backward from an ocean:

```python
neighbor_height >= current_height
```

Run DFS twice:
- From the Pacific borders → `pacific`
- From the Atlantic borders → `atlantic`

Answer:

```text
pacific ∩ atlantic
```

> 中文：不要每个格子往 ocean 流；从两个 ocean 反向 DFS，最后取两个 reachable set 的交集。

---

## 133. Clone Graph

**Pattern: Graph DFS + HashMap**

We need to copy:
- Every node
- Every neighbor relationship

Use a hashmap:

```python
old_to_new = {}
```

Meaning:

```text
original node → cloned node
```

DFS:

```python
def dfs(node):
    if node in old_to_new:
        return old_to_new[node]

    copy = Node(node.val)
    old_to_new[node] = copy

    for nei in node.neighbors:
        copy.neighbors.append(dfs(nei))

    return copy
```

The mapping must be stored **before** exploring neighbors, because the graph may contain cycles.

> 中文：一边 DFS，一边维护 `old node → new node`；先存 mapping，再递归 neighbor，避免 cycle 无限递归。

---

# DFS Patterns Summary

| Problem | Pattern | Key Idea |
|---|---|---|
| 200 Number of Islands | Count Components | Find new land → `count += 1` → DFS entire component |
| 695 Max Area of Island | Component Size | DFS returns size of current component |
| 130 Surrounded Regions | Reverse Search | Start from boundary and mark safe cells |
| 417 Pacific Atlantic | Reverse Reachability | Search backward from both oceans |
| 133 Clone Graph | Graph DFS + HashMap | Store `old → new` while rebuilding graph |

## Main Patterns

### 1. Count Connected Components

```text
for every node:
    if unvisited:
        count += 1
        dfs(node)
```

Example: `200`

### 2. Compute Component Size

```text
dfs(node):
    if invalid:
        return 0

    mark visited

    return 1 + sum(dfs(neighbors))
```

Example: `695`

### 3. Reverse Search

Instead of:

```text
every node → target
```

try:

```text
target → all nodes that can reach target
```

Examples: `130`, `417`

### 4. Graph With Cycles

Use:

```text
visited / hashmap
```

before recursively exploring neighbors.

Example: `133`

---

## Common Mistakes

```python
# boundary
i >= n      # correct
i > n       # wrong
```

```python
# rows / columns
n = len(grid)
m = len(grid[0])

i < n
j < m
```

```python
# assignment vs comparison
board[i][j] = "X"
board[i][j] == "X"
```

Also check whether the input uses:

```python
1 / 0
```

or:

```python
"1" / "0"
```

Finally, before writing DFS, always ask:

> **What exactly should `dfs(node)` do or return?**

For example:
- `200`: mark the whole component
- `695`: return component size
- `130 / 417`: mark reachable cells
- `133`: return the cloned node

> 中文总结：DFS 题最值得记的不是完整代码，而是 **起点是谁、什么时候 mark visited、DFS 返回什么、有没有必要反向搜索**。