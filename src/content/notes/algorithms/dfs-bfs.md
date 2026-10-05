---
title: "DFS & BFS"
date: 2026-10-04
category: "Algorithms"
tags: [graph, leetcode]
description: "Choosing a traversal and keeping visited-state bugs out of graph problems."
---

## Choosing a traversal

Use **BFS** for shortest paths in an unweighted graph. Use **DFS** when exploring a branch fully is natural, such as connected components or backtracking.

## BFS template

```python
from collections import deque

queue = deque([start])
seen = {start}
while queue:
    node = queue.popleft()
    for neighbor in graph[node]:
        if neighbor not in seen:
            seen.add(neighbor)
            queue.append(neighbor)
```

## Common mistake

Mark a node seen when adding it to the queue. Waiting until removal can enqueue it repeatedly.
