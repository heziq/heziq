---
title: "Hash Table"
date: 2026-10-07
category: "Algorithms"
tags: [Hash Table, Hash Map, Hash Set, LeetCode]
description: "Using hash tables for fast lookup, grouping, frequency counting, duplicate detection, and O(1) indexing."
---

## 0. Hash Table Basics

A **hash table** stores data so that lookup, insertion, and deletion are usually very fast.

In Python, the two main hash-table structures are:

```python
dict   # key -> value
set    # store unique values
```

Typical operations:

```python
freq = {}

freq[x] = 1
freq[x] += 1

if x in freq:
    ...

del freq[x]
```

For a set:

```python
seen = set()

seen.add(x)

if x in seen:
    ...

seen.remove(x)
```

Average time complexity:

```text
lookup      O(1)
insert      O(1)
delete      O(1)
```

The main reason to use a hash table is:

> **I want to quickly know whether something has appeared before, or quickly retrieve information associated with a key.**

Before solving a hash-table problem, ask:

```text
What should be the key?
What information should the value store?
```

Examples:

```text
number -> index
word signature -> list of words
number -> frequency
value -> position in array
```

> Hash Table 题的核心通常不是“怎么遍历”，而是 **我要用什么作为 key，以及 key 对应存什么信息**。

---

## Pattern 1: Fast Lookup / Complement

Use this pattern when the problem asks:

```text
Have I seen some required value before?
```

Instead of searching the previous elements again, store useful information in a hash map.

### 1. Two Sum

For each number `nums[i]`, we need another number:

```text
target - nums[i]
```

So while scanning the array, store:

```text
number -> index
```

Example:

```python
seen = {}

for i, num in enumerate(nums):
    complement = target - num

    if complement in seen:
        return [seen[complement], i]

    seen[num] = i
```

Instead of checking every pair:

```text
O(n²)
```

we ask the hash table whether the required number already exists:

```text
O(1) average lookup
```

so the total becomes:

```text
O(n)
```

### Important

Usually we check the complement **before** inserting the current element.

Otherwise, for cases like:

```text
nums = [3, 3]
target = 6
```

we need to make sure we are not accidentally using the same index twice.

> Two Sum 的关键不是“把数字存进 hashmap”，而是：当前看到 `x` 时，我真正想快速查找的是 `target - x`。

---

## Pattern 2: Canonical Key for Grouping

Sometimes different inputs should be considered equivalent.

The idea is to convert each input into the same **canonical representation** and use that representation as the hash-map key.

### 49. Group Anagrams

Words like:

```text
eat
tea
ate
```

contain exactly the same characters.

If we sort their characters:

```text
eat -> aet
tea -> aet
ate -> aet
```

they get the same key.

In Python:

```python
key = "".join(sorted(s))
```

Here:

```python
sorted(s)
```

breaks the string into characters and returns them in sorted order:

```python
sorted("eat")
# ['a', 'e', 't']
```

Then:

```python
"".join(...)
```

joins the characters back together:

```python
"".join(['a', 'e', 't'])
# "aet"
```

We can store:

```text
canonical key -> all strings with this key
```

For example:

```python
groups = {}

for s in strs:
    key = "".join(sorted(s))

    if key not in groups:
        groups[key] = []

    groups[key].append(s)
```

Conceptually:

```text
"aet" -> ["eat", "tea", "ate"]
"ant" -> ["tan", "nat"]
```

> 当多个不同 input 本质上属于同一类时，可以先把它们转成同一个 **canonical key**，再用 hashmap 分组。

---

## Pattern 3: Hash Set for Membership + Sequence Start

Use a `set` when we only care about:

```text
Does this value exist?
```

and do not need an associated value.

### 128. Longest Consecutive Sequence

Suppose:

```text
nums = [100, 4, 200, 1, 3, 2]
```

Put everything into a set:

```python
nums_set = set(nums)
```

Now checking:

```python
x in nums_set
```

takes average `O(1)` time.

The important idea is:

> Do not start scanning a consecutive sequence from every number.

A number `x` is the start of a sequence only when:

```text
x - 1 does not exist
```

So:

```python
for x in nums_set:
    if x - 1 not in nums_set:
        # x is the start of a sequence
```

Then scan forward:

```python
length = 1

while x + length in nums_set:
    length += 1
```

Example:

```text
1 -> start because 0 does not exist

1 -> 2 -> 3 -> 4
```

But:

```text
2
3
4
```

do not start another scan because their previous values exist.

### Why Is It O(n)?

The code looks like:

```text
for
    while
```

which may look like `O(n²)`.

But each sequence is scanned only from its starting point.

For:

```text
1, 2, 3, 4
```

only `1` starts the `while` loop.

So each number participates in the forward scan at most once.

Therefore the total work is:

```text
O(n)
```

rather than:

```text
O(n²)
```

> `for` 套 `while` 不一定是 `O(n²)`。这里因为只从 sequence 的起点开始扫描，每个元素总共只会被向前扫描一次。

---

## Pattern 4: Frequency Counting

A hash map is often used to count how many times each value appears.

The general pattern is:

```python
freq = {}

for x in nums:
    freq[x] = freq.get(x, 0) + 1
```

After this:

```text
key   = value
value = frequency
```

For example:

```text
nums = [1, 1, 1, 2, 2, 3]

freq =
{
    1: 3,
    2: 2,
    3: 1
}
```

Once frequencies are known, we can sort, use a heap, bucket sort, or perform other processing.

### 347. Top K Frequent Elements

First count frequencies:

```python
freq = {}

for num in nums:
    freq[num] = freq.get(num, 0) + 1
```

Then one simple solution is to sort the `(number, frequency)` pairs:

```python
sorted_items = sorted(
    freq.items(),
    key=lambda x: x[1],
    reverse=True
)
```

Here:

```python
freq.items()
```

contains pairs:

```text
(number, frequency)
```

and:

```python
key=lambda x: x[1]
```

means:

```text
sort according to frequency
```

`reverse=True` means largest frequency first.

### `sort()` vs `sorted()`

```python
arr.sort()
```

modifies the original list.

But:

```python
new_arr = sorted(arr)
```

returns a new sorted list and leaves the original object unchanged.

For example:

```python
nums = [3, 1, 2]

new_nums = sorted(nums)

nums
# [3, 1, 2]

new_nums
# [1, 2, 3]
```

### Complexity

Building the frequency map:

```text
O(n)
```

If there are `m` unique values, sorting them costs:

```text
O(m log m)
```

with:

```text
m <= n
```

so worst case:

```text
O(n log n)
```

There are faster approaches using a heap or bucket sort, but the hash-table part stays the same:

```text
first count frequencies
then select the top k
```

> Frequency 题通常分两步：**hashmap 负责统计，另一个数据结构负责排序或选 top-k**。

---

## Pattern 5: Multiple Hash Sets for Constraints

Sometimes one element belongs to several different groups, and we need to verify multiple constraints at the same time.

Instead of repeatedly scanning each group, maintain separate hash sets.

### 36. Valid Sudoku

For each cell:

```text
board[r][c]
```

we need to check three things:

```text
same row
same column
same 3 × 3 box
```

A simple approach is to maintain:

```python
rows = [set() for _ in range(9)]
cols = [set() for _ in range(9)]
boxes = [set() for _ in range(9)]
```

For each number:

```python
num = board[r][c]
```

check:

```python
if num in rows[r]:
    return False

if num in cols[c]:
    return False

if num in boxes[box]:
    return False
```

Then insert it:

```python
rows[r].add(num)
cols[c].add(num)
boxes[box].add(num)
```

The box index can be calculated using:

```python
box = (r // 3) * 3 + c // 3
```

For example:

```text
rows 0-2, cols 0-2 -> box 0
rows 0-2, cols 3-5 -> box 1
rows 3-5, cols 0-2 -> box 3
```

### Important

We are still visiting every non-empty cell.

The optimization is not:

```text
avoid traversing the board
```

Instead, it is:

```text
while traversing once,
check all three constraints in O(1)
```

Without hash sets, we might repeatedly scan rows, columns, and boxes.

With hash sets:

```text
one traversal
+
constant-time membership checks
```

> Sudoku 确实还是全部遍历。优化点不是少遍历，而是 **在一次 traversal 中同时维护 row / column / box 状态，让每次检查变成 O(1)**。

---

## Pattern 6: Count One Half, Match the Other Half

When a problem involves several independent choices whose values must satisfy an equation, we can sometimes split them into two groups.

Instead of enumerating every combination, precompute the results from one half into a hash map.

### 454. 4Sum II

We want:

```text
a + b + c + d = 0
```

A brute-force solution tries every combination:

```text
a
 b
  c
   d
```

giving:

```text
O(n⁴)
```

Instead, rewrite:

```text
a + b = -(c + d)
```

First calculate every possible:

```text
a + b
```

and count how often each sum occurs:

```python
pair_sum = {}

for a in nums1:
    for b in nums2:
        s = a + b
        pair_sum[s] = pair_sum.get(s, 0) + 1
```

Then enumerate:

```text
c + d
```

and ask:

```text
Does -(c + d) exist?
```

```python
count = 0

for c in nums3:
    for d in nums4:
        target = -(c + d)
        count += pair_sum.get(target, 0)
```

Why store the **frequency** rather than only using a set?

Because the same sum may be generated by multiple `(a, b)` pairs.

For example:

```text
a + b = 3
```

might occur five times.

If:

```text
c + d = -3
```

then all five pairs produce valid combinations.

### Complexity

Building all `a + b` pairs:

```text
O(n²)
```

Checking all `c + d` pairs:

```text
O(n²)
```

Total:

```text
O(n²)
```

Space:

```text
O(n²)
```

> 多个变量组合时，可以尝试 **meet in the middle**：一半的结果存进 hashmap，另一半只做 O(1) lookup。

---

## Pattern 7: Hash Map + Array for O(1) Operations

Sometimes a hash table alone is not enough.

We can combine it with another data structure so each one handles the operation it is good at.

### 380. Insert Delete GetRandom O(1)

We need all three operations to be average `O(1)`:

```text
insert
remove
getRandom
```

A hash set can do:

```text
insert  O(1)
remove  O(1)
```

but getting a truly random element efficiently is difficult because a set does not support random indexing.

A list supports:

```text
random index -> O(1)
```

but deleting an arbitrary value normally costs:

```text
O(n)
```

because elements after it need to shift.

So combine:

```text
list + hash map
```

Store:

```text
array          -> values
hash map       -> value -> index in array
```

For example:

```text
nums = [10, 20, 30]

index = {
    10: 0,
    20: 1,
    30: 2
}
```

### Insert

Append to the end:

```python
index[val] = len(nums)
nums.append(val)
```

Both operations are `O(1)`.

### Get Random

Choose a random array index:

```python
random.choice(nums)
```

Array random access is `O(1)`.

### Remove

The difficult operation is removing an arbitrary element.

Suppose:

```text
nums = [10, 20, 30, 40]
```

and we want to delete:

```text
20
```

Removing index `1` directly would shift everything after it:

```text
[10, 30, 40]
```

which is `O(n)`.

Instead:

```text
swap the value with the last element
then pop the last element
```

So:

```text
[10, 20, 30, 40]
     ↑          ↑

swap:

[10, 40, 30, 20]

pop:

[10, 40, 30]
```

Then update the hash map:

```text
40 -> index 1
```

and delete:

```text
20
```

All operations remain `O(1)`.

### Core Idea

The two data structures solve different problems:

```text
hash map
    value -> index
    fast lookup

array
    index -> value
    fast random access
```

Together they support all three operations efficiently.

> 当一种数据结构不能同时满足所有操作时，可以组合数据结构。`380` 的核心是 **hashmap 找位置 + array 做 random access + swap-with-last 实现 O(1) 删除**。

---

## Common Mistakes

### 1. Using a Hash Map Without Defining the Meaning

Before creating:

```python
d = {}
```

ask:

```text
What does the key represent?
What does the value represent?
```

Examples:

```text
Two Sum:
number -> index

Group Anagrams:
canonical representation -> words

Top K Frequent:
number -> frequency

4Sum II:
pair sum -> number of ways to produce it

RandomizedSet:
value -> index
```

If this relationship is unclear, the hashmap usually becomes confusing.

---

### 2. Using a Dict When a Set Is Enough

If we only need to know:

```text
Does x exist?
```

use:

```python
seen = set()
```

instead of unnecessarily storing:

```python
{x: True}
```

Example:

```text
Longest Consecutive Sequence
Valid Sudoku
```

are mainly membership-checking problems.

---

### 3. Forgetting Frequency Matters

A set only tells us:

```text
exists / does not exist
```

but sometimes we need:

```text
how many times?
```

For example in `4Sum II`:

```text
sum = 5
```

may occur many times.

Therefore we need:

```python
sum_count[5] = frequency
```

not just:

```python
5 in sums
```

---

### 4. Seeing Nested Loops and Immediately Saying O(n²)

Analyze how many times elements are actually processed.

In `128 Longest Consecutive Sequence`:

```text
for + while
```

does not mean `O(n²)` because only sequence-start elements trigger the full scan.

Each number is scanned only a constant number of times overall.

---

### 5. Sorting When O(1) Lookup Is Enough

If the main question is:

```text
Does x exist?
```

sorting may introduce:

```text
O(n log n)
```

when a set can provide average:

```text
O(n)
```

total processing.

Examples:

```text
Two Sum
Longest Consecutive Sequence
```

---

### 6. Forgetting That Hash Tables Can Work Together With Other Structures

A hashmap is often only one part of the solution.

Examples:

```text
347:
hashmap + sorting / heap / buckets

380:
hashmap + array
```

So do not force the entire problem into one data structure.

---

## Final Mental Model

When you see a problem that might use a hash table, ask:

```text
1. Do I need fast existence checking?
2. Do I need to remember something I saw earlier?
3. Do I need to count frequencies?
4. Can multiple objects be mapped to the same canonical key?
5. Can I precompute one side of an equation and look it up later?
6. Do I need value -> index mapping to support another data structure?
```

Then decide what the hash table stores:

```text
Two Sum
number -> index

Group Anagrams
canonical key -> group

Longest Consecutive
set of existing numbers

Top K Frequent
number -> frequency

Valid Sudoku
sets of values already used in each group

4Sum II
pair sum -> frequency

Insert Delete GetRandom
value -> array index
```

> 总结：Hash Table 最重要的不是背 `dict` 的语法，而是想清楚：  
> **“我之后需要 O(1) 查什么？”**  
> 那个东西通常就应该成为你的 key。
