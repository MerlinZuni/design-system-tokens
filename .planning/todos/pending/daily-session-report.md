---
title: Set up daily session report system
status: pending
created: 2026-03-22
phase: ongoing
---

## What

At the end of each working day, produce a session report in `.planning/reports/YYYY-MM-DD.md` with a table covering:

- Time spent per topic (estimated from session activity)
- Tokens used per topic
- Cost of those tokens
- Any Claude rate limit waits encountered
- Total time and total cost at the bottom

## Format

Markdown table. One row per topic/activity block. Footer row with totals.

## Notes

- Token usage comes from `/gsd:session-report` or subagent usage blocks
- Time is estimated from session timestamps and activity
- Cost model: Claude Max subscription (flat rate) + any per-token API costs if applicable
- External subscriptions (Tokens Studio Pro, etc.) included as line items when relevant
- Report file lives at `.planning/reports/YYYY-MM-DD.md`
- Run at end of each session before closing
