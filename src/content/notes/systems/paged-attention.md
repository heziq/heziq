---
title: "PagedAttention"
date: 2026-10-02
category: "Tech Notes"
topics: [Systems, AI / Agents, LLM, Inference]
formats: [Study Notes]
description: "A short starting point for understanding paged KV-cache management."
---

## Why it matters

During autoregressive generation, the KV cache grows with each token. Reserving one continuous chunk per request can waste memory when request lengths vary.

## Core idea

PagedAttention organizes cache storage into blocks and maps a sequence's logical blocks to physical blocks. This allows allocation in smaller pieces as the sequence grows.

## Questions to revisit

- How does block size affect fragmentation and lookup overhead?
- Which cache blocks can be shared across sequences?
