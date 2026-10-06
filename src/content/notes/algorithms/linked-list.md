---
title: "Linked List"
date: 2026-10-03
category: "Tech Notes"
topics: [Algorithms, Linked List, LeetCode]
formats: [Study Notes]
description: "Pointer patterns and a few invariants for linked-list problems."
---

## Start with the invariant

Draw the links before changing them. Keep a reference to the next node before overwriting `current.next`.

## Dummy nodes

A dummy head lets the first real node follow the same insertion and deletion rules as every other node.

## Fast and slow pointers

Moving one pointer twice as fast helps find a midpoint or detect a cycle. Write down what each pointer means before the loop.
