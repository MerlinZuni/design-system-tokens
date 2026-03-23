---
phase: 6
slug: primitive-components-figma-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler + Storybook build (no vitest test suite for v1 primitives) |
| **Config file** | `packages/primitives/tsconfig.json`, `apps/storybook/.storybook/main.ts` |
| **Quick run command** | `npx tsc --noEmit -p packages/primitives/tsconfig.json` |
| **Full suite command** | `turbo run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit -p packages/primitives/tsconfig.json && npm run lint --workspace=packages/primitives`
- **After every plan wave:** Run `turbo run build`
- **Before `/gsd:verify-work`:** Full suite must be green + Storybook visual review
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | STORY-10 | smoke | `npx tsc --noEmit -p packages/primitives/tsconfig.json` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | STORY-10 | smoke | `npx tsc --noEmit -p packages/primitives/tsconfig.json` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | STORY-10, STORY-12 | build | `turbo run build` | ✅ | ⬜ pending |
| 06-02-02 | 02 | 2 | STORY-11 | build | `npm run build --workspace=apps/storybook` | ✅ | ⬜ pending |
| 06-03-01 | 03 | 2 | FIGMA-04 | manual | Open Storybook, verify Figma embeds load | manual-only | ⬜ pending |
| 06-03-02 | 03 | 2 | FIGMA-05 | compile | `npx tsc --noEmit -p packages/primitives/tsconfig.json` | ✅ | ⬜ pending |
| 06-04-01 | 04 | 1 | — | build | `turbo run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing tsc + Storybook build serve as the primary gate — no vitest test files required for v1 primitives.

- [ ] Verify `packages/primitives/tsconfig.json` `include` covers `src/**/*.tsx` and `src/**/*.figma.tsx`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Figma frame embed visible in Designs panel | FIGMA-04 | Requires Figma service + authenticated session | Open each component MDX page → verify Figma embed loads in Designs addon panel |
| Autodocs props table populates from TypeScript | STORY-12 | Visual verification of generated UI | Open each component docs page → verify Controls panel shows all typed props |
| Code Connect shows in Figma Dev Mode | FIGMA-05 | Requires Figma Dev Mode + published Code Connect | Run `npx @figma/code-connect publish` → open Figma Dev Mode → verify code snippet appears |
| Theme switcher updates Styles page TokenTable | — | Visual verification of reactive values | Switch Brand/Mode in Storybook toolbar → verify Styles pages update |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
