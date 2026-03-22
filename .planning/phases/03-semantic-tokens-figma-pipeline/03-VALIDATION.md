---
phase: 3
slug: semantic-tokens-figma-pipeline
status: active
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Style Dictionary build as smoke test |
| **Config file** | `packages/tokens/style-dictionary.config.mjs` |
| **Quick run command** | `cd packages/tokens && node style-dictionary.config.mjs` |
| **Full suite command** | `turbo run build` |
| **Estimated runtime** | ~10 seconds (quick) / ~30 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `cd packages/tokens && node style-dictionary.config.mjs`
- **After every plan wave:** Run `turbo run build`
- **Before `/gsd:verify-work`:** Full suite must be green + manual Figma verification
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| Primitive scale update (1a) | 01 | 1 | TOKEN-06, TOKEN-07 | smoke | `cd packages/tokens && node style-dictionary.config.mjs` exits 0 + grep checks for #4FC4C4, navy, slate | ✅ | ⬜ pending |
| Semantic JSON authoring (1b) | 01 | 1 | TOKEN-06, TOKEN-07 | smoke | File existence + grep for color.navy.500, color.link, no color.brand in child-dark | ✅ | ⬜ pending |
| SD multi-instance loop (2) | 01 | 1 | TOKEN-10 | smoke | `cd packages/tokens && node style-dictionary.config.mjs` exits 0 | ✅ | ⬜ pending |
| 4 CSS output files (2) | 01 | 1 | TOKEN-08 | smoke | `ls packages/tokens/dist/parent-brand/light.css ...` | ✅ | ⬜ pending |
| package.json exports map (2) | 01 | 1 | TOKEN-08 | smoke | `grep "parent-brand" packages/tokens/package.json` | ✅ | ⬜ pending |
| Turbo full build (2) | 01 | 1 | TOKEN-10 | smoke | `turbo run build` exits 0 | ✅ | ⬜ pending |
| Tokens Studio git sync config | 02 | 2 | FIGMA-01, FIGMA-03 | manual | Tokens Studio Pro "Push" action succeeds | manual-only | ⬜ pending |
| Figma Variable Collection modes | 02 | 2 | FIGMA-01, FIGMA-02 | manual | Figma UI: Semantic collection shows 4 modes | manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 is covered by Plan 01 Task 1a (primitive scale update). The semantic JSON files, SD refactor, and $themes.json are all created within Plan 01 tasks — no separate Wave 0 pre-work is needed.

- [x] Primitive color scales updated with brand, secondary, navy, slate — Task 1a
- [x] Semantic JSON files authored with all vocabulary — Task 1b
- [x] SD multi-instance loop refactored — Task 2
- [x] Updated package.json exports — Task 2
- [x] $themes.json created — Task 1b

*All Wave 0 items are addressed by Plan 01 tasks, not separate pre-work.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Figma Variables `Semantic` collection has 4 modes | FIGMA-01 | Requires Figma UI access | Open Figma file -> Variables panel -> confirm `Semantic` collection with modes: `parent-brand/light`, `parent-brand/dark`, `child-brand/light`, `child-brand/dark` |
| Slash notation in Figma translates to dot notation in JSON | FIGMA-02 | Requires Tokens Studio export inspection | After Tokens Studio pull, inspect semantic JSON for dot-notation keys matching Figma slash-notation variable names |
| Tokens Studio Pro sync round-trip | FIGMA-03 | Requires GitHub remote + Figma access | Tokens Studio Pro "Push to Git" succeeds; JSON files appear in GitHub repo; "Pull from Git" retrieves them |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** signed-off
