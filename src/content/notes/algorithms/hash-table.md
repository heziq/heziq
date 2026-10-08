---
title: "Hash Table"
date: 2026-10-07
category: "Algorithms"
tags: [Hash Table, Hash Map, Hash Set, LeetCode]
description: "Fast lookup, frequency counting, grouping, and combining hash tables with other data structures."
---

## 0. Hash Table Basics

Hash tables support average **O(1)** lookup, insertion, and deletion.

In Python:
- `dict`: key → value
- `set`: unique values, fast membership checking

```python
seen = set()
seen.add(x)
x in seen

freq = {}
freq[x] = freq.get(x, 0) + 1
```

Common mappings:

```text
number → index
number → frequency
canonical key → group
value → array index
```

> 核心问题：**之后需要快速查找什么？Key 和 Value 分别代表什么？**

---

## Pattern 1: Fast Lookup

### 1. Two Sum 🟢

Store `number → index`. For each number `x`, check whether `target - x` has appeared before.

**Check before inserting** to avoid using the same element twice.

Time: O(n).

---

## Pattern 2: Canonical Key / Grouping

### 49. Group Anagrams 🟢

Convert anagrams to the same key, then group them using a hashmap.

```python
key = "".join(sorted(s))
groups.setdefault(key, []).append(s)
```

- `sorted(s)` returns a sorted list of characters.
- `"".join(...)` combines them into a string.

---

## Pattern 3: Hash Set + Sequence Start

### 128. Longest Consecutive Sequence 🟢🟡

Use a set for O(1) membership checking.

**Only start scanning when `x - 1` does not exist.**

```python
nums_set = set(nums)

for x in nums_set:
    if x - 1 not in nums_set:
        length = 1
        while x + length in nums_set:
            length += 1
```

Why O(n)?

Although there is a `for` + `while`, each consecutive sequence is scanned only once, starting from its smallest element.

> Nested loops 不一定是 O(n²)。关键看每个元素总共被处理了几次。

---

## Pattern 4: Frequency Counting

### 347. Top K Frequent Elements 🟢🟡

First build `number → frequency`, then sort or use a heap to select the top K.

```python
sorted_items = sorted(
    freq.items(),
    key=lambda x: x[1],
    reverse=True
)
```

Python reminders:
- `freq.items()` → `(key, value)` pairs
- `key=lambda x: x[1]` → sort by frequency
- `list.sort()` → modifies original list
- `sorted()` → returns a new list

Sorting solution: O(n log n) worst case.

---

## Pattern 5: Multiple Sets / Constraints

### 36. Valid Sudoku 🟡

Maintain three groups of sets: `rows`, `cols`, `boxes`.

```python
rows = [set() for _ in range(9)]
cols = [set() for _ in range(9)]
boxes = [set() for _ in range(9)]

box = (r // 3) * 3 + c // 3
```

For each non-empty cell, check whether its value already exists in the corresponding row, column, or box, then insert it.

> 仍然需要遍历所有 cell。优化在于一次遍历中维护三种 constraint，每次检查都是 O(1)。

---

## Pattern 6: Meet in the Middle

### 454. 4Sum II 🟡

Instead of checking all four numbers together, split the equation:

```text
a + b + c + d = 0

a + b = -(c + d)
```

1. Count all `a + b` sums in a hashmap.
2. Enumerate `c + d`, look up `-(c + d)`.
3. Add the stored frequency to the answer.

```python
pair_sum[a + b] += 1

count += pair_sum.get(-(c + d), 0)
```

**Why hashmap instead of set?**

The same sum can come from multiple pairs, and each pair contributes to the answer.

Time: O(n²), Space: O(n²).

---

## Pattern 7: Hash Map + Array

### 380. Insert Delete GetRandom O(1) 🟡

Combine two data structures:

```text
array:   index → value
hashmap: value → index
```

- **Insert:** Append to array, record index in hashmap.
- **GetRandom:** `random.choice(nums)`.
- **Remove:** Swap the target with the last element, update the hashmap, then pop.

Example:

```text
Remove 20:

[10, 20, 30, 40]
     ↓ swap with last
[10, 40, 30, 20]
     ↓ pop
[10, 40, 30]
```

Update `index[40] = 1`, then remove `20` from the hashmap.

> 核心：**Hashmap 负责 O(1) 定位，Array 负责 O(1) random access，swap-with-last 避免 O(n) 删除。**

---

## Common Mistakes

### 1. Using a Set When Frequency Matters

```python
seen = set()   # existence
freq = {}      # count / associated information
```

If duplicate values represent multiple valid combinations, use a frequency map.

### 2. Incorrect Hashmap Updates

```python
freq[x] += 1             # KeyError if x missing
freq[x] = freq.get(x, 0) + 1
```

### 3. Assuming Hash Tables Always Guarantee O(1)

Lookup, insertion, and deletion are **average O(1)**, not guaranteed worst-case O(1).

### 4. Forgetting to Update Both Data Structures

When using a hashmap + array, any swap or deletion must keep their indices consistent.

---

## Summary

| Pattern | Problem | Key Idea |
|---|---|---|
| Fast Lookup | 1 | Complement |
| Grouping | 49 | Canonical key |
| Membership | 128 | Only scan sequence starts |
| Frequency | 347 | Count then select |
| Multiple Constraints | 36 | Row / Col / Box sets |
| Meet in the Middle | 454 | Pair sum frequency |
| Combined Structures | 380 | Map + Array + Swap |

> **Hash Table 最重要的三个问题：**
> 1. What do I need to look up quickly?
> 2. Should I use a `set` or a `dict`?
> 3. Can I combine hashing with another structure to improve complexity?
