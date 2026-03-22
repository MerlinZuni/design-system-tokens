---
phase: 3
slug: semantic-tokens-figma-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| Primitive scale update | 01 | 1 | TOKEN-06, TOKEN-07 | smoke | `cd packages/tokens && node style-dictionary.config.mjs 2>&1 \| grep -c "error"` — expect 0 | ✅ | ⬜ pending |
| Semantic JSON authoring | 01 | 1 | TOKEN-06, TOKEN-07 | smoke | `cd packages/tokens && node style-dictionary.config.mjs` exits 0 | ❌ W0 | ⬜ pending |
| SD multi-instance loop | 01 | 1 | TOKEN-10 | smoke | `turbo run build:tokens` exits 0 | ❌ W0 | ⬜ pending |
| 4 CSS output files | 01 | 1 | TOKEN-08 | smoke | `ls packages/tokens/dist/parent-brand/light.css packages/tokens/dist/parent-brand/dark.css packages/tokens/dist/child-brand/light.css packages/tokens/dist/child-brand/dark.css` | ❌ W0 | ⬜ pending |
| package.json exports map | 01 | 1 | TOKEN-08 | smoke | `cat packages/tokens/package.json \| grep "parent-brand"` — expect match | ❌ W0 | ⬜ pending |
| Tokens Studio git sync config | 02 | 2 | FIGMA-01, FIGMA-03 | manual | Tokens Studio Pro "Push" action succeeds | manual-only | ⬜ pending |
| Figma Variable Collection modes | 02 | 2 | FIGMA-01, FIGMA-02 | manual | Figma UI: Semantic collection shows 4 modes | manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Semantic JSON files: `packages/tokens/tokens/semantic/color.semantic.json`, `packages/tokens/tokens/semantic/spacing.semantic.json` — stubs for TOKEN-06, TOKEN-07
- [ ] SD multi-instance loop refactor: update `style-dictionary.config.mjs` to loop over `BRANDS × MODES` — for TOKEN-10
- [ ] Updated `packages/tokens/package.json` exports map with new CSS paths — for TOKEN-08
- [ ] `$themes.json` stub in token directory — for FIGMA-03

*Existing SD infrastructure covers build mechanics; Wave 0 creates new token files and refactors config.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Figma Variables `Semantic` collection has 4 modes | FIGMA-01 | Requires Figma UI access | Open Figma file → Variables panel → confirm `Semantic` collection with modes: `parent-brand/light`, `parent-brand/dark`, `child-brand/light`, `child-brand/dark` |
| Slash notation in Figma translates to dot notation in JSON | FIGMA-02 | Requires Tokens Studio export inspection | After Tokens Studio pull, inspect `color.semantic.json` for dot-notation keys matching Figma slash-notation variable names |
| Tokens Studio Pro sync round-trip | FIGMA-03 | Requires GitHub remote + Figma access | Tokens Studio Pro "Push to Git" succeeds; JSON files appear in GitHub repo; "Pull from Git" retrieves them |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
