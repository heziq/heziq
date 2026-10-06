---
title: "DFS(Depth-First Search)"
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

> 想清楚 `dfs(node)` 到底代表什么，然后及时 mark visited，防止重复访问或死循环。

---

## Pattern 1: Count Connected Components

Use this pattern when the graph/grid contains separate connected groups and we need to count how many there are.

The general idea:

```text
for every node:
    if node is unvisited:
        count += 1
        dfs(node)
```

Each DFS call completely explores one connected component, so the next unvisited node must belong to a new component.

### 200. Number of Islands

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

The DFS does not need to return anything. Its job is simply to visit the entire island.

> 每发现一个新的 `1`，就发现了一座新岛；先 `count += 1`，再 DFS 把整座岛标记掉。

---

## Pattern 2: Compute a Connected Component

Sometimes we do not only want to find a component — we need to calculate something about it.

A common recursive form is:

```text
dfs(node):
    if invalid:
        return 0

    mark visited

    return current contribution + dfs(neighbors)
```

### 695. Max Area of Island

Instead of counting how many islands exist, calculate the size of each island and keep the maximum.

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

`1` represents the current land cell.

Then:

```python
area = dfs(i, j)
max_area = max(max_area, area)
```

The important difference from Number of Islands is what DFS means:

```text
200: dfs(cell) marks the whole component
695: dfs(cell) returns the size of the whole component
```

> 和 200 一样找 component，但这里 DFS 还要返回这个岛一共有多少格。

---

## Pattern 3: Reverse Search / Reachability

Sometimes searching from every node toward a target causes repeated work.

Instead of:

```text
every node → target
```

reverse the question:

```text
target → all nodes that can reach the target
```

This is especially useful when there are only a few target/boundary locations but many possible starting nodes.

### 130. Surrounded Regions

Instead of checking whether every `"O"` is surrounded, find the `"O"` cells that are definitely **not** surrounded.

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

The boundary acts as the starting point of the reverse search.

> 反着想：不直接找“被包围的 O”，而是从边界找所有“不可能被包围的 O”。

### 417. Pacific Atlantic Water Flow

The direct approach is to start from every cell and ask whether water can reach both oceans. This repeats a lot of work.

Instead, start from the oceans and search backward.

Original direction:

```text
high → low
```

Reverse direction:

```text
ocean / low → same height or higher
```

So when searching backward:

```python
neighbor_height >= current_height
```

Run DFS twice:

- From the Pacific borders → `pacific`
- From the Atlantic borders → `atlantic`

The answer is the intersection:

```text
pacific ∩ atlantic
```

These are exactly the cells that can reach both oceans in the original direction.

> 从两个 ocean 反向 DFS，记录各自能到达的 cell，最后取两个 reachable set 的交集。

---

## Pattern 4: DFS + Node Mapping

When DFS is used to **rebuild or copy a graph**, `visited` may need to store more than just whether a node was seen.

A hashmap can store:

```text
original node → new / processed node
```

This both prevents repeated work and preserves relationships between objects.

### 133. Clone Graph

We need to copy:

- Every node
- Every neighbor relationship

Use:

```python
old_to_new = {}
```

where:

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

The mapping must be stored **before** exploring neighbors.

Otherwise, if the graph contains a cycle, DFS could recursively return to the same node before knowing that it has already been cloned.

> 一边 DFS，一边维护 `old → new`；先存 mapping，再递归 neighbors，避免 cycle 无限递归。

---

## Common Mistakes

### 1. Wrong Boundary Check

```python
i >= n      # correct
i > n       # wrong
```

`i == n` is already outside the valid index range.

### 2. Mixing Rows and Columns

```python
n = len(grid)
m = len(grid[0])

# valid:
i < n
j < m
```

### 3. Marking Visited Too Late

Usually:

```text
validate node
→ mark visited
→ visit neighbors
```

Do not wait until after recursion to mark the node, or neighboring nodes may recursively visit each other.

### 4. Assignment vs. Comparison

```python
board[i][j] = "X"     # assignment
board[i][j] == "X"    # comparison
```

### 5. Checking the Input Type

Some problems use:

```python
1 / 0
```

while others use:

```python
"1" / "0"
```

### 6. Not Defining What DFS Means

Before writing the recursion, ask:

> **What exactly should `dfs(node)` do or return?**

Examples:

- `200`: mark the whole component
- `695`: return component size
- `130`: mark nodes connected to the boundary
- `417`: mark nodes reachable from an ocean in reverse
- `133`: return the cloned node

> 总结：DFS 题最值得先想的是 **从哪里开始、什么时候 mark visited、`dfs()` 代表什么、能不能反向搜索**。
