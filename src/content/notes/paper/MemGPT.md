---
title: "MemGPT: Towards LLMs as Operating Systems"
date: 2026-10-14
category: "Paper Reading"
tags: [AI, Systems, LLM, Memory Management, Agents]
description: "An OS-inspired memory management system that enables LLMs to access information beyond their limited context windows."
---

> Paper: [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)  
> Authors: Charles Packer et al. · Year: 2023

## 1. Paper Overview

**Main Idea:** MemGPT introduces an OS-inspired virtual memory architecture that allows LLMs to manage information beyond their fixed context windows.

Instead of increasing the model's context length, MemGPT uses a **memory hierarchy**, **self-directed function calls**, and **event-driven control flow** to move relevant information between the active context and external storage.

The goal is to provide the *illusion of infinite context* without modifying the underlying LLM.

**Key Insight:** Rather than keeping everything in context, let the LLM decide what to remember, retrieve, and evict.

---

## 2. Background & Concept Clarification

### 2.1 Context vs. Memory vs. Model Knowledge

These concepts are closely related but refer to different things.

| Concept | Definition | Example |
|---|---|---|
| **Model Knowledge** | Knowledge encoded in model parameters during training | Knowing Python syntax |
| **Context Window** | Maximum number of tokens the LLM can process in a single inference context | Current prompt and conversation |
| **Long-term Memory** | Persistently stored information that can be reused across interactions | User preferences, historical facts |
| **External Context** | Information stored outside the current context window | Historical messages, documents, databases |

**Important distinctions:**

- **Context is not the same as memory.** Context refers to the information currently accessible to the LLM during inference.
- **Long-term memory is not necessarily stored in model weights.** In LLM applications, it is typically implemented using external databases, files, or persistent memory records.
- **External context is not a new capability of the underlying model.** It is an external storage layer accessed through retrieval and tool calls.
- Information in external storage must be brought into the active context before the LLM can directly reason over it.

A typical long-term memory system involves four decisions:

1. **What to remember?** — Select important information.
2. **When to remember?** — Decide when to persist it.
3. **How to retrieve?** — Find relevant memories when needed.
4. **How to update or forget?** — Handle outdated or contradictory information.

MemGPT is one particular approach to long-term memory and context management, emphasizing LLM-directed memory operations.

### 2.2 Conversation History vs. Persistent Application State vs. KV Cache

These represent three different types of state in an LLM agent system.

| | Conversation History | Persistent Application State | KV Cache |
|---|---|---|---|
| **Meaning** | Records past interactions | Represents the actual state of an application | Stores intermediate attention computations |
| **Example** | Chat messages and tool results | Database updates, confirmed reservations | Cached Keys and Values from previous tokens |
| **Can discard?** | Can remove from active context | Generally cannot discard arbitrarily | Yes |
| **Can reconstruct?** | From preserved logs; summaries are lossy | Read from durable storage; not necessarily reproducible by replay | Recompute from the original token sequence |
| **Can share safely?** | With authorized agents | Through controlled APIs and permissions | Only with compatible model/context and proper isolation |

**Conversation History — What happened?**

Records previous user messages, assistant responses, and tool interactions.

Old messages can be summarized or evicted from the active context. If full history is preserved in external storage, it can be retrieved later.

**Persistent Application State — What is true now?**

Represents real changes to the application or environment.

For example, if an agent creates a reservation, the reservation remains valid even after the conversation history is cleared.

It must be preserved reliably. Replaying a tool call is not always safe because it may create duplicate side effects, such as repeated payments or reservations.

**KV Cache — What computations can be reused?**

During autoregressive inference, Transformer models cache previously computed Attention Keys and Values to avoid redundant computations.

For input hidden states $X$:

$$
Q = XW_Q,\quad K = XW_K,\quad V = XW_V
$$

The KV cache is an **inference optimization**, not a semantic long-term memory system.

- It can be discarded and recomputed from the original tokens and compatible model configuration.
- Recomputing introduces additional GPU computation and latency.
- It can only be safely reused when the model, token prefix, positional configuration, and security boundaries are compatible.

**Key distinction:**

- Conversation History = Historical record
- Persistent Application State = Durable application truth
- KV Cache = Reusable computation

MemGPT primarily manages conversational and external context, **not the Transformer's internal KV cache or transactional application state**.

### 2.3 Operating System Concepts

MemGPT borrows several concepts from traditional operating systems.

| OS Concept | Meaning | MemGPT Analogy |
|---|---|---|
| **RAM (Main Memory)** | Fast, limited working memory | Main Context / Context Window |
| **Disk (Secondary Storage)** | Larger, slower persistent storage | External Context |
| **Virtual Memory** | Abstraction allowing programs to use a larger virtual address space than available RAM | Illusion of a larger context |
| **Paging** | Moving pages between RAM and secondary storage | Loading and evicting context information |
| **Eviction** | Removing data from limited fast storage to free capacity | Removing old messages from the FIFO Queue |
| **Memory Pressure** | Limited available memory triggers management actions | Context usage warning |
| **Interrupt / Event** | Triggers system processing | User messages, warnings, scheduled events |

**Virtual Memory vs. Physical Memory**

- **Physical Memory:** Actual RAM available to a system.
- **Virtual Memory:** An address-space abstraction managed by the OS, allowing programs to access memory without requiring everything to reside in physical RAM simultaneously.

MemGPT uses this analogy:

$$
\text{Limited Main Context}
+
\text{External Storage}
\rightarrow
\text{Virtual Context}
$$

However, MemGPT does not implement hardware-level virtual memory. Its "paging" is implemented through LLM function calls, database operations, and context management.

---

## 3. Motivation

### Problem: Limited Context Windows

LLMs have fixed context windows, which restrict their ability to handle:

- Long conversations spanning multiple sessions.
- Documents larger than the available context.
- Tasks requiring retrieval of old or distant information.

Simply increasing context length has limitations:

1. **Computational overhead:** Standard self-attention scales quadratically with sequence length, $O(n^2)$.
2. **Information utilization:** Models may struggle to effectively use information located in the middle of long contexts (*Lost in the Middle*).
3. **Information loss:** Truncation and summarization can discard important details.

**Motivation:** Instead of requiring the LLM to hold all information simultaneously, design a system that intelligently manages which information remains in the active context.

---

## 4. MemGPT Architecture

This is the central contribution of the paper.

MemGPT consists of two memory levels, coordinated by a Queue Manager, Function Executor, and event-driven control flow.

### 4.1 Memory Hierarchy

**Level 1: Main Context**

The information currently included in the LLM prompt.

| Component | Purpose |
|---|---|
| **System Instructions** | Read-only instructions defining memory tools and control flow |
| **Working Context** | Fixed-size, editable memory containing important facts and preferences |
| **FIFO Queue** | Rolling conversation history, including messages and function results |

The FIFO Queue also maintains a **recursive summary** of older messages that have been evicted.

**Level 2: External Context**

Information stored outside the active context window.

| Component | Purpose |
|---|---|
| **Recall Storage** | Persistent database of historical conversation messages |
| **Archival Storage** | Persistent storage for documents and other long-term textual information |

External information is not directly visible to the LLM. It must be retrieved through functions and inserted into the active context.

### 4.2 Queue Manager

The Queue Manager manages conversation history and context capacity.

Its responsibilities include:

- Appending incoming messages to the FIFO Queue.
- Saving messages and model outputs to Recall Storage.
- Monitoring context window usage.
- Triggering memory-pressure warnings.
- Evicting old messages and updating recursive summaries.

**Memory Pressure and Eviction**

MemGPT uses two example thresholds:

| Threshold | Example | Action |
|---|---|---|
| Warning Token Count | 70% | Warn the LLM and allow it to preserve important information |
| Flush Token Count | 100% | Evict part of the FIFO Queue and regenerate its recursive summary |

These thresholds are illustrative settings rather than universally fixed values.

**Important:** Eviction does not necessarily mean permanent deletion. Evicted messages remain in Recall Storage and can be retrieved later.

### 4.3 Function Executor & Self-directed Memory Management

The LLM cannot directly modify databases. Instead, it generates function calls that the Function Executor validates and executes.

Example memory operations:

```python
working_context.append("User prefers Python")

recall_storage.search("previous conversation")

archival_storage.search("relevant documents")
```

The LLM decides when and what to retrieve or update, while the Function Executor performs the actual operations.

Memory transfers occur through two mechanisms:

**1. LLM-directed operations**

The model actively decides to retrieve, store, or modify information using function calls.

**2. System-triggered management**

The Queue Manager monitors capacity, issues warnings, and performs eviction and summarization when necessary.

Thus, MemGPT combines model-driven decisions with system-level management.

### 4.4 Event-driven Control Flow & Function Chaining

Traditional LLM applications often follow:

$$
\text{User Input} \rightarrow \text{LLM} \rightarrow \text{Response}
$$

MemGPT supports multiple execution steps within a single task:

$$
\text{Event}
\rightarrow
\text{LLM}
\rightarrow
\text{Function Call}
\rightarrow
\text{Result}
\rightarrow
\text{LLM}
$$

Events can include:

- User messages
- Memory-pressure warnings
- Application events
- Scheduled events

**Function Chaining**

MemGPT uses a special function-call argument:

```python
request_heartbeat=True
```

This requests another LLM inference immediately after the function finishes.

Without the heartbeat request, MemGPT may yield control and wait for the next external event.

For example, answering a question might require multiple searches:

```text
User Question
    ↓
Search Recall Storage
    ↓
Retrieve Relevant History
    ↓
Search Archival Storage
    ↓
Generate Final Answer
```

This enables multi-step retrieval without requiring new user input at every step.

### 4.5 Why the Virtual Memory Analogy Is Not Perfect

Although MemGPT resembles virtual memory, several costs are not captured well by the analogy:

- **Token Cost:** Retrieved information consumes context tokens.
- **Inference Cost:** Deciding what to retrieve may require additional LLM calls.
- **Retrieval Latency:** Database queries and repeated function calls introduce delays.
- **Information Loss:** Summarization may remove important details.
- **Retrieval Errors:** The LLM may select irrelevant information or stop searching too early.

Unlike conventional OS memory paging, MemGPT relies partly on uncertain, semantic decisions made by an LLM.

---

## 5. Contributions

The paper's main contributions are:

1. **Virtual Context Management:** An OS-inspired approach that extends the effective information accessible to fixed-context LLMs.

2. **Hierarchical and Self-directed Memory:** A memory architecture allowing the LLM to manage information through function calls.

3. **Event-driven Execution:** Memory-pressure warnings and function chaining enable dynamic context management and multi-step retrieval.

The contribution is primarily a **systems architecture**, rather than a new neural network architecture or training method.

---

## 6. Experiments

The authors evaluate MemGPT in two domains.

### 6.1 Conversational Agents

**Goal:** Test whether agents can remember and use information across multiple conversation sessions.

Two tasks:

- **Deep Memory Retrieval (DMR):** Answer questions requiring information from previous conversations.
- **Conversation Opener:** Generate personalized opening messages using historical persona information.

**DMR Results:**

| Model | Baseline Accuracy | With MemGPT |
|---|---:|---:|
| GPT-3.5 Turbo | 38.7% | 66.9% |
| GPT-4 | 32.1% | 92.5% |
| GPT-4 Turbo | 35.3% | 93.4% |

MemGPT substantially improves historical fact retrieval, compared with baselines that receive lossy summaries of earlier conversations.

The Conversation Opener experiment also shows improved use of previously stored persona information, evaluated through similarity metrics.

### 6.2 Document Analysis

**Multi-document Question Answering**

MemGPT answers questions over large Wikipedia document collections using archival storage and iterative retrieval.

Compared with fixed-context baselines, MemGPT can access more documents without requiring them all to fit into a single prompt.

**Nested Key-Value Retrieval**

The model must perform multiple dependent lookups.

Example:

```text
A → B
B → C
C → D
```

The correct final answer for `A` is `D`.

MemGPT uses Function Chaining to retrieve intermediate values until the terminal value is found.

The paper shows that MemGPT with GPT-4 maintains strong performance across the tested nesting depths, while fixed-context baselines degrade as nesting increases.

**Main Finding:** Dynamic retrieval and function chaining can extend the effective context and improve multi-step information access.

---

## 7. Limitations

### 7.1 Dependence on LLM Decisions

Memory management relies on the LLM's ability to decide what information is important and when to retrieve it.

Incorrect decisions may lead to missing information, unnecessary searches, or premature termination.

### 7.2 Additional Latency and Computation

Memory operations introduce extra inference steps, database queries, and token-processing costs.

The paper does not provide a comprehensive analysis of the resulting accuracy–cost trade-off.

### 7.3 Memory Reliability

Summaries may lose details, and automatically maintained memories may become outdated or inconsistent.

The experiments do not comprehensively evaluate long-term memory correctness, contradiction handling, or forgetting policies.

### 7.4 Limited Evaluation Scope

The experiments primarily cover conversation recall, document question answering, and synthetic multi-hop retrieval.

These results do not guarantee reliability in complex, real-world agents with persistent side effects or changing external environments.

---

## 8. Key Takeaways

**MemGPT does not make the underlying LLM's context window infinite.** Instead, it provides the illusion of larger context by managing information across memory tiers.

The core design can be summarized as:

$$
\boxed{
\text{Memory Hierarchy}
+
\text{Self-directed Functions}
+
\text{Event-driven Control}
}
$$

Important distinctions:

- **Long-term Memory** is a general concept; MemGPT is one implementation approach.
- **External Context** is outside the current prompt, not inside the model's weights.
- **Memory Management** determines what to preserve, retrieve, update, and evict.
- **KV Cache** is a computational optimization, not persistent semantic memory.
- **Persistent Application State** must be handled separately from conversation context because actions can have real-world side effects.

**Final Insight:** MemGPT shifts the focus from *making an LLM remember everything at once* to *enabling an LLM-based system to manage what it needs to remember and retrieve*. Its main innovation lies in applying operating-system-inspired resource management to LLM context and memory.