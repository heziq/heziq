---
title: "Heap / Priority Queue"
date: 2026-10-05
category: "Algorithms"
tags: [Heap, Priority Queue, LeetCode]
description: "Using heaps for top-k selection, priority-based processing, merging sorted sources, and streaming medians."
---

## 0. Heap / Priority Queue Basics

Heap 用来反复取出当前最小或最大的元素。Python 的 `heapq` 是 **min-heap**。

```python
import heapq

heap = []
heapq.heappush(heap, x)   # O(log n)
heapq.heappop(heap)       # O(log n)
heap[0]                   # 最小值，O(1)
```

Heap 不是排好序的数组，只保证 `heap[0]` 最小。`heap[:k]` 不是最小的 k 个。

元组从左往右比：

```python
heapq.heappush(heap, (priority, data))
```

第一个值相同才比后面的。适合同时存优先级和数据。

Max-heap 用负数模拟：

```python
heapq.heappush(heap, -num)
largest = -heapq.heappop(heap)
```

> `heapq` 是最小堆，`-heap[0]` 才是当前最大值。只保证根最小，整个 list 不必有序。

---

## Pattern 1: Fixed-Size Heap for Top K

只要最大或最小的 k 个，不必全排序。

```text
push
if size > k:
    pop 掉不想留的那个
```

根上放的应该是「留着也没用、可以踢掉」的那个。

### 215. Kth Largest Element in an Array

大小为 `k` 的 min-heap。超过 `k` 就弹出最小的，最后堆里是最大的 k 个数，`heap[0]` 就是第 k 大。

Time: O(n log k). Space: O(k)。

> 踢掉的是当前最大 k 个里最小的那个。最后根就是第 k 大，不用把这 k 个再排序。

---

## Pattern 2: Heap with Priority

每个元素有优先级，每次要当前最好的那个。存 `(priority, data)`，`heappop` 取出 priority 最小的。

### 973. K Closest Points to Origin

```python
dist = x * x + y * y
heapq.heappush(heap, (dist, x, y))
```

不用开方，顺序不变。要按距离取出，就反复 `heappop`，不要切 `heap[:k]`。

Time: 全部入堆再弹 k 次是 O(n log n)。Space: O(n)。

> 根只保证是最近的一个。前 k 个格子不是最近的 k 个点。

---

## Pattern 3: Merge Sorted Sources

多路已经有序时，下一个最小的一定在每路当前的队头里。堆里每路只放一个候选。

```text
每路的第一个放进堆
pop 最小的，加入结果
把这一路的下一个再 push 进去
```

### 23. Merge K Sorted Lists

```python
heapq.heappush(heap, (node.val, i, node))

val, i, node = heapq.heappop(heap)
if node.next:
    heapq.heappush(heap, (node.next.val, i, node.next))
```

Time: O(N log k)，N 是节点总数。Space: O(k)。

> 堆里最多 k 个，每条链表一个当前节点。`i` 是 tie-breaker：`val` 相同时 Python 会去比下一个元素，`ListNode` 不能比较，所以中间放一个下标。

---

## Pattern 4: Two Heaps

数据分成两半，随时要看交界处。

```text
smaller half | larger half
   max-heap  |   min-heap
```

### 295. Find Median from Data Stream

```python
self.small = []   # 较小的一半，存负数
self.large = []   # 较大的一半，最小堆
```

两个不变量：

```text
small 里的值都 <= large 里的值
len(small) == len(large) 或 len(small) == len(large) + 1
```

`small` 最多比 `large` 多一个。新数先放进 `small`，再把较小一半里最大的那个挪到 `large`，最后按大小把多出来的根挪回去。

```python
heapq.heappush(self.small, -num)
heapq.heappush(self.large, -heapq.heappop(self.small))

if len(self.large) > len(self.small):
    heapq.heappush(self.small, -heapq.heappop(self.large))
```

奇数个：

```python
median = -self.small[0]
```

偶数个：

```python
median = (-self.small[0] + self.large[0]) / 2
```

Time: 每次插入 O(log n)，取中位数 O(1)。Space: O(n)。

> `small` 存的是负数，`heappop(small)` 拿到的最小负数，取反后才是较小一半里最大的数，把它推进 `large`。中位数就在交界：`-small[0]` 和 `large[0]`。

---

## Common Mistakes

### 1. 把堆当成有序数组

`heap[:k]` 不可靠。只有 `heap[0]` 有保证。要有序就反复 `heappop`。

### 2. 忘记默认是最小堆

```python
heapq.heappush(heap, -num)
largest = -heapq.heappop(heap)
```

### 3. 元组没有可比较的 tie-breaker

`(node.val, node)` 在值相等时会去比 `ListNode`。用 `(node.val, i, node)`。

### 4. 所有元素都推进堆

- 215：只留 k 个
- 23：每条链表只留一个候选
- 295：拆成两堆

### 5. 没想清楚根代表什么

- 215：当前最大 k 个里最小的
- 973：距离最小的点
- 23：所有链表当前候选里最小的
- 295：较小一半的最大、较大一半的最小

> 先定 priority 是什么、堆里留谁、`heap[0]` 应该是谁。
