---
title: "Heap / Priority Queue"
date: 2026-10-05
category: "Algorithms"
tags: [heap, leetcode]
description: "A compact reference for heap mental models, Python heapq, and common patterns."
---

## Mental model

A heap gives fast access to the smallest element without sorting the entire collection. Use it when the next item matters more than the full order.

| Operation | Typical cost |
| --- | ---: |
| Peek at minimum | `O(1)` |
| Push or pop | `O(log n)` |
| Build from a list | `O(n)` |

## Python `heapq`

Python's `heapq` is a min-heap. Negate numbers to model a max-heap.

```python
import heapq

values = [7, 2, 9]
heapq.heapify(values)
heapq.heappush(values, 4)
smallest = heapq.heappop(values)  # 2
```

## Problems

### 215. Kth Largest Element

Keep a min-heap of size `k`. Its root is the kth largest value seen so far.

### 973. K Closest Points

Keep the best `k` points in a max-heap keyed by distance, or heapify all points when memory is not a concern.

## Mistakes I made

> A heap is only partially ordered. Iterating over its backing list does not produce sorted values.
