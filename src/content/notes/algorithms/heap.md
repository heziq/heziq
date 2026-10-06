---
title: "Heap / Priority Queue"
date: 2026-10-05
category: "Algorithms"
tags: [heap, priority-queue, leetcode]
description: "Using heaps for top-k, merging sorted streams, and maintaining dynamic order statistics."
---

## 0. Heap / Priority Queue Basics

A **heap** is a tree-based data structure that efficiently keeps track of the minimum or maximum element.

Python's `heapq` implements a **min-heap**.

```python
import heapq

heap = []

heapq.heappush(heap, 5)
heapq.heappush(heap, 2)

smallest = heapq.heappop(heap)
```

Important operations:

```python
heapq.heappush(heap, x)   # O(log n)
heapq.heappop(heap)       # O(log n)
heap[0]                   # minimum, O(1)
```

The heap does **not** keep the whole list sorted.

For example:

```python
heap = [1, 3, 2, 7, 5]
```

This can be a valid heap even though the array itself is not sorted.

The only guarantee is:

```text
heap[0] = minimum element
```

and every parent is no larger than its children.

> Python `heapq` 默认是 min-heap。最重要的是记住：**只保证 `heap[0]` 最小，不保证整个 array 有序。**

---

### Tuple Ordering

Python heaps can also store tuples:

```python
heapq.heappush(heap, (2, "B"))
heapq.heappush(heap, (1, "A"))
```

Tuples are compared lexicographically:

```text
(first value, second value, ...)
```

Python first compares the first element. If they are equal, it compares the second element.

This is useful when the heap needs both:

- a priority
- the actual object / data

Example:

```python
(priority, value)
```

> Heap 里经常放 tuple：第一位是 priority，后面保存真正的数据。

---

### Simulating a Max-Heap

Python does not directly use a max-heap with `heapq`.

A common trick is to negate values:

```python
heapq.heappush(heap, -num)
```

Then:

```python
largest = -heapq.heappop(heap)
```

Example:

```text
original:  10, 5, 2

stored:   -10, -5, -2

minimum stored value = -10
→ represents original maximum = 10
```

> 想要 max-heap，就存负数。`-heap[0]` 就是当前最大值。

---

## 215. Kth Largest Element in an Array

**Pattern: Top K with a Fixed-Size Min-Heap**

We want the `k` largest elements, but we only really care about the smallest element among those `k`.

Maintain a min-heap of size `k`.

For every number:

```text
push number into heap

if heap size > k:
    pop the smallest
```

At the end, the heap contains the `k` largest elements seen so far.

The smallest among these `k` elements is:

```python
heap[0]
```

which is exactly the **kth largest element**.

Example:

```text
nums = [3, 2, 1, 5, 6, 4]
k = 2

final heap contains:
[5, 6]

heap[0] = 5
```

So `5` is the second largest.

> 维护一个大小为 `k` 的 min-heap。太多了就把最小的踢掉，最后留下最大的 `k` 个，而 `heap[0]` 正好是 kth largest。

---

## 973. K Closest Points to Origin

**Pattern: Heap with a Priority**

Each point has a priority: its distance from the origin.

For point:

```text
(x, y)
```

distance is:

```python
x * x + y * y
```

There is no need to calculate the square root because square root preserves ordering.

Push the distance together with the point:

```python
heapq.heappush(heap, (dist, point))
```

or:

```python
heapq.heappush(heap, (dist, x, y))
```

The heap orders points by `dist`.

Then repeatedly pop:

```python
dist, point = heapq.heappop(heap)
```

Each pop returns the currently closest point.

### Important

A heap is **not a sorted list**.

You cannot assume:

```python
heap[:k]
```

contains the `k` smallest elements in sorted order.

The heap only guarantees:

```python
heap[0]
```

is the minimum.

To retrieve the smallest elements, use `heappop()` repeatedly.

> Heap 是 tree structure，不是 sorted array。不能直接觉得前 `k` 个就是最小的 `k` 个；只保证 root 最小，每次 `pop` 才拿到当前最小值。

---

## 23. Merge K Sorted Lists

**Pattern: Merge Multiple Sorted Streams**

Each linked list is already sorted.

Therefore, at any moment, the next smallest value must be among the **current heads** of the `k` lists.

Instead of comparing all `k` heads manually every time, put them into a min-heap.

```python
heapq.heappush(heap, (node.val, i, node))
```

Then:

```python
val, i, node = heapq.heappop(heap)
```

The popped node is the smallest current node among all lists.

After taking that node, push its next node:

```python
if node.next:
    heapq.heappush(heap, (node.next.val, i, node.next))
```

Repeat until the heap is empty.

### Why include `i`?

You might want to write:

```python
(node.val, node)
```

But if two nodes have the same value, Python would then try to compare:

```python
node1 < node2
```

`ListNode` objects are not orderable, which can cause an error.

So use:

```python
(node.val, i, node)
```

where `i` is the list index and acts as a tie-breaker.

> Heap 里永远只需要放每条 linked list 当前的 head。`i` 是 tie-breaker，避免两个 `node.val` 相同时 Python 去比较 `ListNode`。

---

## 295. Find Median from Data Stream

**Pattern: Two Heaps**

We need to continuously insert numbers and quickly find the median.

Split the numbers into two halves:

```text
small = smaller half
large = larger half
```

Use:

```text
small → max-heap
large → min-heap
```

Python implementation:

```python
self.small = []   # max-heap using negative values
self.large = []   # normal min-heap
```

### Invariant

We want:

```text
all values in small <= all values in large
```

and their sizes should stay balanced:

```text
len(small) == len(large)
```

or:

```text
len(small) == len(large) + 1
```

So `small` may contain at most one extra element.

---

### Adding a Number

Since `small` is implemented using negatives:

```python
heapq.heappush(self.small, -num)
```

A useful operation for moving the largest value from `small` into `large` is:

```python
heapq.heappush(
    self.large,
    -heapq.heappop(self.small)
)
```

Why?

```text
small stores negative values

heappop(small)
→ most negative value
→ represents the largest original value
```

Then negate it again before putting it into `large`.

After insertion, rebalance the two heaps so their size difference is at most `1`.

> 两堆：`small` 管较小的一半，但是用负数模拟 max-heap；`large` 管较大的一半，是正常 min-heap。

---

### Finding the Median

If the total number of elements is odd:

```python
median = -self.small[0]
```

because `small` contains one extra element.

If the total is even:

```python
median = (-self.small[0] + self.large[0]) / 2
```

These are the two middle values:

```text
max(small)
min(large)
```

> Median 就在两堆交界处：左边最大值 `-small[0]` 和右边最小值 `large[0]`。

---

## Heap Patterns Summary

| Problem | Pattern | Key Idea |
|---|---|---|
| 215 Kth Largest | Fixed-Size Min-Heap | Keep only the largest `k`; root is kth largest |
| 973 K Closest Points | Priority Heap | Use distance as heap priority |
| 23 Merge K Sorted Lists | Merge Sorted Streams | Keep one candidate from each list |
| 295 Find Median | Two Heaps | Max-heap for lower half + min-heap for upper half |

## Main Patterns

### 1. Top K

Maintain a heap of size `k`.

```text
push item

if size > k:
    pop
```

Example: `215`

---

### 2. Priority + Data

Store:

```python
(priority, data)
```

or:

```python
(priority, tie_breaker, data)
```

Example: `973`, `23`

---

### 3. Merge Sorted Sources

If there are multiple already-sorted sequences, only keep the **next possible candidate** from each sequence in the heap.

```text
pop smallest candidate
→ add it to answer
→ push the next item from that same source
```

Example: `23`

---

### 4. Maintain Two Halves

Use:

```text
max-heap | min-heap

smaller half | larger half
```

Keep the two heaps balanced.

Example: `295`

---

## Common Mistakes

### 1. Assuming the Heap Is Sorted

Wrong:

```python
heap[:k]
```

does not necessarily give the `k` smallest elements.

Only this is guaranteed:

```python
heap[0]
```

is the minimum.

---

### 2. Forgetting Python Uses a Min-Heap

For a max-heap:

```python
heapq.heappush(heap, -num)
```

and retrieve with:

```python
-num
```

---

### 3. Tuple Tie-Breaking

This can fail:

```python
(node.val, node)
```

if two values are equal and `node` objects cannot be compared.

Use:

```python
(node.val, i, node)
```

instead.

---

### 4. Keeping Too Much in the Heap

A heap is especially useful when we do **not** need to keep everything.

For top-k problems:

```text
heap size = k
```

is often enough.

---

Finally, before using a heap, ask:

> **What value should always be easiest for me to access?**

If the answer is:

```text
smallest / largest / next best candidate
```

a heap is often a good choice.

> 总结：Heap 题重点不是“把所有东西排序”，而是想清楚 **priority 是什么、heap 里需要保留哪些 candidate、root 应该代表什么**。
