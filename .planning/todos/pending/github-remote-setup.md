---
title: Set up GitHub remote for merlinzuni account
status: pending
created: 2026-03-22
phase: pre-3
priority: high
---

## What

Push the local git repository to GitHub under the merlinzuni account so that:
1. Code is backed up remotely
2. Tokens Studio Pro can sync to the repository (required for Figma → code pipeline)

## Why

Tokens Studio Pro git sync requires a GitHub remote to pull/push token JSON files. This is a blocker for Phase 3 execution.

## Steps (to be done with step-by-step guidance)

1. Create new repository on github.com (merlinzuni account)
2. Add remote origin to local repo
3. Push all existing commits
4. Configure Tokens Studio Pro with repo access token

## Notes

- User is not familiar with GitHub — needs guided walkthrough
- Repo should likely be private (contains design system source)
- Will need a GitHub personal access token for Tokens Studio Pro sync
