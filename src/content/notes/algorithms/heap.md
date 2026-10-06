---
title: "Heap / Priority Queue"
date: 2026-10-05
category: "Tech Notes"
topics: [Algorithms, Heap, Priority Queue, LeetCode]
formats: [Reference]
description: "Using heaps for top-k selection, priority-based processing, merging sorted sources, and streaming medians."
---

## 0. Heap / Priority Queue Basics

A **heap** is a tree-based data structure used when we repeatedly need quick access to the smallest or largest element.
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

A heap is **not a sorted array**.

For example:

```python
heap = [1, 3, 2, 7, 5]
```

can be a valid heap even though the whole list is not sorted.

The main guarantee is:

```text
heap[0] = minimum element
```

> Python `heapq` 默认是 min-heap。只保证 `heap[0]` 最小，不保证整个 array 有序。

### Tuple Ordering

Heap elements can also be tuples:

```python
heapq.heappush(heap, (2, "B"))
heapq.heappush(heap, (1, "A"))
```

Python compares tuples from left to right:

```text
(priority, data)
```

If the first values are equal, it compares the second values.

This makes tuples useful for storing both a **priority** and the actual data.

### Simulating a Max-Heap

A common way to simulate a max-heap is to store negative values:

```python
heapq.heappush(heap, -num)
```

Then:

```python
largest = -heapq.heappop(heap)
```

For example:

```text
original:  10, 5, 2
stored:   -10, -5, -2

minimum stored value = -10
→ original maximum = 10
```

> 想要 max-heap，就存负数；`-heap[0]` 是当前最大值。

---

## Pattern 1: Fixed-Size Heap for Top K

Use this pattern when we only care about the largest or smallest `k` elements rather than fully sorting everything.

The general idea:

```text
for each item:
    push item into heap

    if heap size > k:
        pop one item
```

The key is choosing the correct heap so that the element we **do not want to keep** stays at the root and can be removed efficiently.

### 215. Kth Largest Element in an Array

To find the kth largest element, maintain a **min-heap of size `k`**.

For every number:

```text
push number

if heap size > k:
    pop the smallest
```

At the end, the heap contains the largest `k` values.

Example:

```text
nums = [3, 2, 1, 5, 6, 4]
k = 2

final heap:
[5, 6]
```

The smallest value among the largest `k` values is:

```python
heap[0]
```

so it is exactly the kth largest element.

> 维护大小为 `k` 的 min-heap；太多了就踢掉最小的，最后 `heap[0]` 就是 kth largest。

---

## Pattern 2: Heap with Priority

Use this pattern when each item has a **priority**, and we repeatedly need the currently best item.

Store:

```python
(priority, data)
```

Then:

```python
priority, data = heapq.heappop(heap)
```

The heap automatically selects the item with the smallest priority.

### 973. K Closest Points to Origin

For each point:

```text
(x, y)
```

use its squared distance as the priority:

```python
dist = x * x + y * y
```

There is no need to calculate the square root because it does not change the ordering.

Store:

```python
heapq.heappush(heap, (dist, point))
```

or:

```python
heapq.heappush(heap, (dist, x, y))
```

Then repeatedly call:

```python
heapq.heappop(heap)
```

to retrieve the closest points.

### Important

Do not assume:

```python
heap[:k]
```

contains the `k` smallest elements.

The heap only guarantees:

```python
heap[0]
```

is the minimum.

To get elements in priority order, repeatedly use `heappop()`.

> Heap 是 tree structure，不是 sorted array；只保证 root 最小，不能直接拿前 `k` 个当作最小的 `k` 个。

---

## Pattern 3: Merge Sorted Sources

When multiple sequences are already sorted, the next smallest element must be among the **current front elements** of those sequences.

Instead of putting every element into the heap, keep only one current candidate from each source.

The general pattern:

```text
put the first item from every source into heap

while heap is not empty:
    pop smallest candidate
    add it to result

    push the next item from the same source
```

This is also called **k-way merge**.

### 23. Merge K Sorted Lists

Each linked list is already sorted.

At any moment, the next smallest node must be one of the current heads of the `k` lists.

Store them in the heap:

```python
heapq.heappush(heap, (node.val, i, node))
```

Then:

```python
val, i, node = heapq.heappop(heap)
```

After using that node, push its next node:

```python
if node.next:
    heapq.heappush(heap, (node.next.val, i, node.next))
```

The heap therefore contains at most one current candidate from each linked list.

### Why include `i`?

This can cause a problem:

```python
(node.val, node)
```

If two nodes have the same value, Python tries to compare the second elements:

```text
node1 vs node2
```

But `ListNode` objects are not orderable.

Using:

```python
(node.val, i, node)
```

gives Python an integer `i` as a tie-breaker.

> Heap 里只放每条 list 当前的 candidate；`i` 是 tie-breaker，避免相同 `node.val` 时比较 `ListNode`。

---

## Pattern 4: Two Heaps

Use two heaps when we need to maintain two ordered groups and quickly access the boundary between them.

A common structure is:

```text
smaller half | larger half
   max-heap  |   min-heap
```

The max-heap gives the largest value in the lower half, while the min-heap gives the smallest value in the upper half.

### 295. Find Median from Data Stream

Split all numbers into:

```text
small = smaller half
large = larger half
```

Use:

```text
small → max-heap
large → min-heap
```

In Python:

```python
self.small = []   # max-heap using negative values
self.large = []   # min-heap
```

We maintain two invariants:

```text
all values in small <= all values in large
```

and:

```text
len(small) == len(large)
```

or:

```text
len(small) == len(large) + 1
```

So `small` contains at most one extra value.

### Moving Between Heaps

Since `small` stores negative values:

```python
heapq.heappush(self.small, -num)
```

To move its largest original value into `large`:

```python
heapq.heappush(
    self.large,
    -heapq.heappop(self.small)
)
```

because:

```text
heappop(small)
→ smallest negative number
→ largest original number
```

After inserting, rebalance the two heaps so their size difference is at most `1`.

### Finding the Median

If the number of elements is odd:

```python
median = -self.small[0]
```

If it is even:

```python
median = (-self.small[0] + self.large[0]) / 2
```

These two values are exactly:

```text
max(smaller half)
min(larger half)
```

> 两堆把数据分成左右两半；median 就在交界处：`-small[0]` 和 `large[0]`。

---

## Common Mistakes

### 1. Assuming the Heap Is Sorted

This is not reliable:

```python
heap[:k]
```

Only this is guaranteed:

```python
heap[0]
```

is the minimum.

If you need values in order, use repeated `heappop()`.

### 2. Forgetting Python Uses a Min-Heap

Normal `heapq` behavior:

```python
heap[0]   # minimum
```

To simulate a max-heap:

```python
heapq.heappush(heap, -num)
largest = -heapq.heappop(heap)
```

### 3. Forgetting Tuple Tie-Breaking

This may fail:

```python
(node.val, node)
```

if equal priorities cause Python to compare non-orderable objects.

Use:

```python
(node.val, i, node)
```

with a comparable tie-breaker.

### 4. Treating Every Heap Problem as “Push Everything”

Sometimes the main optimization is deciding what actually needs to stay in the heap.

Examples:

```text
215: only keep k elements
23: only keep one candidate per list
295: divide elements between two heaps
```

### 5. Not Defining What the Root Represents

Before choosing a heap, ask:

> **What value should always be easiest for me to access?**

Examples:

- `215`: smallest among the current largest `k`
- `973`: point with smallest distance
- `23`: smallest current candidate across all lists
- `295`: largest lower-half value and smallest upper-half value

> 总结：Heap 题先想 **priority 是什么、heap 里要保留谁、`heap[0]` 应该代表什么**。
