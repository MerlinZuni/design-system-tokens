---
phase: 4
slug: storybook-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + `@storybook/addon-vitest` 10.3.1 (installed in `apps/storybook/`) |
| **Config file** | None detected — Wave 0 installs |
| **Quick run command** | `turbo run build --filter=@design-system-x/storybook` |
| **Full suite command** | `turbo run build` (root — all packages) |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `turbo run build --filter=@design-system-x/storybook`
- **After every plan wave:** Run `turbo run build` (full monorepo)
- **Before `/gsd:verify-work`:** Full suite must be green + Storybook must start without errors
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | STORY-01 | shell | `ls node_modules/@storybook/addon-designs` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | STORY-01 | build | `turbo run build --filter=@design-system-x/storybook` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | STORY-02 | shell | `grep "dsx-color-background-default" packages/tokens/dist/parent-brand/light.css` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | STORY-02 | build | `turbo run build --filter=@design-system-x/storybook` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 1 | STORY-03 | shell | `grep "storySort" apps/storybook/.storybook/preview.tsx` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | STORY-13 | shell | `test -f apps/storybook/stories/Introduction/DesignPurpose.mdx && echo PASS` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | STORY-14 | shell | `test -f apps/storybook/stories/Introduction/DesignPrinciples.mdx && echo PASS` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | FIGMA-06 | manual | Human verification — Figma UI access required | Manual only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test files to stub — all verification is shell/build/manual for this phase
- [ ] Existing build infrastructure covers all automated checks

*Existing infrastructure covers all phase requirements (build commands + shell assertions).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar sort order correct | STORY-03 | No headless API for Storybook sidebar | Start `storybook dev`, confirm order: Introduction → Design Purpose → Design Principles → Tokens → Styles → Primitives |
| Figma Design Purpose page exists | FIGMA-06 | Requires Figma UI access | Open Figma file, confirm "Design Purpose" and "Design Principles" pages exist with matching content |
| CSS vars visible in DevTools | STORY-02 | Runtime browser check | Open Storybook in browser, DevTools → computed styles → confirm `--dsx-color-background-default` is set |
| Addon panels visible | STORY-01 | Runtime browser check | Open any story, confirm Designs, A11y, Controls panels appear in the addon panel |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
