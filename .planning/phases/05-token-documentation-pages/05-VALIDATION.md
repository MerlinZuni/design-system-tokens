---
phase: 05
slug: token-documentation-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.0 + `@storybook/addon-vitest` ^10.3.1 |
| **Config file** | None — Wave 0 installs |
| **Quick run command** | `npm run test --workspace=apps/storybook` |
| **Full suite command** | `npm run test --workspace=apps/storybook` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** `grep "data-brand" packages/tokens/dist/parent-brand/light.css` (SD refactor check)
- **After every plan wave:** `npm run build --workspace=packages/tokens && npm run dev --workspace=apps/storybook` (visual verification)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | D-01/D-02 | Shell | `grep "data-brand" packages/tokens/dist/parent-brand/light.css` | N/A | ⬜ pending |
| 05-01-02 | 01 | 1 | D-03/D-04 | Manual | Open Storybook dev server, verify two dropdowns | N/A | ⬜ pending |
| 05-02-01 | 02 | 1 | STORY-04 | Smoke | `npx storybook test --story Tokens/Colors` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | STORY-05 | Smoke | `npx storybook test --story Tokens/Typography` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 1 | STORY-06 | Smoke | `npx storybook test --story Tokens/Spacing` | ❌ W0 | ⬜ pending |
| 05-02-04 | 02 | 1 | STORY-07 | Smoke | `npx storybook test --story Tokens/Elevation` | ❌ W0 | ⬜ pending |
| 05-02-05 | 02 | 1 | STORY-08 | Smoke | `npx storybook test --story Tokens/Grid` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | STORY-09 | Smoke | `npx storybook test --story Styles/*` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | D-09 | Manual | Toggle Brand/Mode toolbar, observe semantic rows update | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/storybook/vitest.config.ts` — Vitest config for addon-vitest test runner
- [ ] `apps/storybook/stories/Tokens/` directory — token documentation pages
- [ ] `apps/storybook/stories/Styles/` directory — styles sub-pages
- [ ] `apps/storybook/stories/components/` directory — shared visualization components

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Toolbar shows two separate dropdowns (Brand, Mode) | D-03 | UI chrome, not DOM content | Open Storybook, verify toolbar has Brand and Mode dropdowns |
| Default theme is parent/light | D-04 | Requires visual confirmation | Load Storybook fresh, verify Brand=parent, Mode=light selected |
| Theme persists across page navigation | D-05 | Navigation state | Switch to child/dark, navigate between pages, verify theme persists |
| Semantic alias chains update on theme switch | D-09 | Dynamic content | Switch theme, verify semantic token rows show different alias chains |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
