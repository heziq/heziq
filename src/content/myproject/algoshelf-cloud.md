---
title: "AlgoShelf Cloud"
description: "A multi-user study agent that turns algorithm practice logs into weak-point tracking and a spaced-review queue, with human-approved updates."
tags: [AI agents, Algorithms]
order: 1
github: "https://github.com/heziq/algoshelf-a4-deploy"
role: "Independent course project"
stack: [Python, Streamlit, OpenAI Agents SDK, LiteLLM, Supabase, PostgreSQL]
---

## Overview

Coding practice is easy to lose in scattered notes. AlgoShelf gives each learner a place to record problems, concepts, and weak points, then return to older work through a review queue. Instead of filling out a form after every session, the learner can describe what happened in ordinary language. An agent proposes the structured changes.

## From a practice note to a review item

A message such as “I solved Two Sum with a hash map” can become a problem record linked to a concept. The agent uses domain-specific read and write tools to inspect existing data and suggest updates. A write pauses for approval before it changes the database, so the learner can check what will be saved.

The resulting records appear across the Concepts, Problems, and Weak Points views. The Review Queue brings back problems that have never been reviewed or have grown stale, turning the knowledge base into an ongoing study loop.

## Designing for multiple users

The app combines Streamlit with Supabase Auth and PostgreSQL. The authenticated user ID comes from runtime context rather than the model's tool arguments. Application queries filter by that ID, and Supabase Row-Level Security provides a second boundary at the database. Daily turn and token limits keep the public prototype's model usage bounded.

## Checking the agent's behavior

I built a scenario-based evaluation harness for the end-to-end workflow. It checks whether the agent's proposed actions satisfy practice-log tasks, rather than treating fluent answers as success. The repository also includes tests for auth, data access, tools, guardrails, and usage accounting.

The project is a deployed course prototype. Its main lesson was that an agent becomes more useful when its actions are inspectable, scoped to the right account, and easy for the user to approve or reject.
