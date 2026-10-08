---
title: "Linked List"
date: 2026-10-07
category: "Algorithms"
tags: [Linked List, Two Pointers, Recursion, LeetCode]
description: "Linked list pointer manipulation, dummy nodes, fast/slow pointers, and recursion."
---

## 0. Linked List Basics

Unlike arrays, linked lists are connected through pointers (`next`), not indices.

Common patterns:
- **Dummy Node**: Simplify head deletion or list construction.
- **Fast / Slow Pointers**: Find middle nodes, detect cycles, or maintain a fixed gap.
- **Three Pointers**: Reverse a linked list.
- **Recursion**: Solve the rest of the list first, then handle the current node.
- **In-place Rewiring**: Change `next` pointers without creating a new list.

Basic traversal:

```python
curr = head
while curr:
    curr = curr.next
```

Important:
- `curr = curr.next` moves a pointer.
- `curr.next = prev` changes the actual linked list structure.
- Save `next_node = curr.next` before overwriting `curr.next`.
- `dummy = ListNode(0, head)` simplifies edge cases involving the head.

> Linked List 的核心不是 value，而是 **pointer 指向谁，以及修改后还能不能找到剩下的 nodes**。

---

## Pattern 1: Reverse a Linked List

### 206. Reverse Linked List 🟡

**Iterative approach:**

Use three pointers: `prev`, `curr`, and `next_node`.

```python
prev = None
curr = head

while curr:
    next_node = curr.next
    curr.next = prev
    prev = curr
    curr = next_node

return prev
```

**Recursive approach:**

Assume recursion has already reversed the remaining list.

```python
def reverseList(head):
    if not head or not head.next:
        return head

    new_head = reverseList(head.next)

    head.next.next = head
    head.next = None

    return new_head
```

Think from the last recursive call:

```text
Original: 1 → 2 → 3 → None

Assume recursion gives:
          3 → 2 → None

Current layer:
1.next.next = 1

Result:
          3 → 2 → 1 → None
```

> Recursion：**先假设后面的链表已经反转成功，当前这一层只负责把自己接回去。** 从最后一层开始理解。

---

## Pattern 2: Dummy Node / Building a List

Use a dummy node when the result's head might change or when constructing a new linked list.

### 21. Merge Two Sorted Lists 🟢

Maintain a `tail` pointer and repeatedly append the smaller node from the two lists.

```python
dummy = ListNode()
tail = dummy

# append smaller node
tail.next = selected_node
tail = tail.next
```

When one list becomes empty, connect the remaining nodes directly.

Return `dummy.next`, not `dummy`.

---

## Pattern 3: Fast / Slow Pointers

Two pointers can move at different speeds or maintain a fixed distance.

### 141. Linked List Cycle 🟢🟡

Use Floyd's cycle detection:

- `slow` moves one step.
- `fast` moves two steps.
- If they meet, a cycle exists.
- If `fast` reaches `None`, no cycle exists.

```python
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next

    if slow == fast:
        return True
```

### 19. Remove Nth Node From End 🟡

Maintain a gap of `n` nodes between `fast` and `slow`.

Use a dummy node and advance `fast` by `n + 1` steps. Then move both pointers until `fast` reaches `None`.

At that point, `slow` is immediately before the node to remove.

```python
slow.next = slow.next.next
```

> 倒数第 n 个不好直接找，但可以让两个指针保持固定距离，转化成从前往后的一次 traversal。

---

## Pattern 4: Split + Reverse + Merge

### 143. Reorder List 🟡

Target:

```text
L0 → L1 → L2 → L3 → L4

L0 → L4 → L1 → L3 → L2
```

Three steps:

1. **Find middle** using slow/fast pointers.
2. **Reverse** the second half.
3. **Merge** two halves alternately.

```python
# Find middle
slow = fast = head
while fast.next and fast.next.next:
    slow = slow.next
    fast = fast.next.next

# Split
second = slow.next
slow.next = None
```

After reversing the second half:

```python
while second:
    temp1 = first.next
    temp2 = second.next

    first.next = second
    second.next = temp1

    first = temp1
    second = temp2
```

> 这题本质是三个基础操作的组合：**找中点 → 反转后半段 → 交错合并**。

---

## Pattern 5: Digit-by-Digit Processing

### 2. Add Two Numbers 🟡

Traverse two lists simultaneously, adding corresponding digits and maintaining `carry`.

```python
total = x + y + carry
digit = total % 10
carry = total // 10
```

Use a dummy node to build the result. Continue while either list has nodes **or `carry` is nonzero**.

Missing nodes contribute `0`.

---

## Common Mistakes

### 1. Losing the Remaining List

Before changing `curr.next`, save the original next node.

```python
next_node = curr.next
curr.next = prev
```

Otherwise, the remaining list may become unreachable.

### 2. Forgetting to Disconnect Old Links

Reversing or merging can accidentally create cycles if old `next` relationships remain.

For example, in recursive reversal:

```python
head.next = None
```

This is necessary to terminate the reversed list.

### 3. Off-by-One Errors

When deleting a node, we often need its **previous node**, not the node itself.

A dummy node makes this easier, especially when removing the original head.

### 4. Confusing Pointer Movement with Modification

```python
curr = curr.next       # move pointer
curr.next = other      # modify structure
```

These operations are fundamentally different.

### 5. Forgetting Edge Cases

Always consider:

- Empty list: `head is None`
- Single-node list
- Even vs. odd list length
- Removing or replacing the head
- Remaining `carry` after processing all digits

---

## Summary

| Pattern | Problems | Key idea |
|---|---|---|
| Reversal | 206 | `prev`, `curr`, `next` / recursion |
| Dummy Node | 21 | Build list using `tail` |
| Fast / Slow | 141, 19 | Speed difference or fixed gap |
| Combined Operations | 143 | Split → Reverse → Merge |
| Carry Simulation | 2 | Digit + carry |

> **Linked List 做题前先想：**
> 1. 会不会修改 `head`？需要 `dummy` 吗？
> 2. 需要几个 pointers？各自代表什么？
> 3. 修改 `next` 前，是否保存了后续节点？
> 4. 如果用 recursion，能否假设后面的链表已经处理完成？
