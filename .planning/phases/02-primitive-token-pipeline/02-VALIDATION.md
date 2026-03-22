---
phase: 2
slug: primitive-token-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js shell commands (no test runner — token pipeline outputs are files/CSS/TS) |
| **Config file** | none — validation is file existence + grep + turbo run build |
| **Quick run command** | `cd packages/tokens && npm run build:tokens` |
| **Full suite command** | `npx turbo run build --filter=@design-system-x/tokens` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd packages/tokens && npm run build:tokens`
- **After every plan wave:** Run `npx turbo run build --filter=@design-system-x/tokens`
- **Before `/gsd:verify-work`:** Full suite must be green, all dist/ outputs present
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 2-01-01 | 01 | 1 | TOKEN-09 | syntax | `node --check packages/tokens/style-dictionary.config.mjs` | ⬜ pending |
| 2-01-02 | 01 | 1 | TOKEN-01 | file+grep | `grep -r '"$type": "color"' packages/tokens/tokens/primitives/` | ⬜ pending |
| 2-01-03 | 01 | 1 | TOKEN-02 | file+grep | `grep -r '"$type": "dimension"' packages/tokens/tokens/primitives/spacing*` | ⬜ pending |
| 2-01-04 | 01 | 1 | TOKEN-03 | file+grep | `grep -r 'breakpoint' packages/tokens/tokens/primitives/grid*` | ⬜ pending |
| 2-01-05 | 01 | 1 | TOKEN-04 | file+grep | `grep -r '"$type": "typography"' packages/tokens/tokens/primitives/typography*` | ⬜ pending |
| 2-01-06 | 01 | 1 | TOKEN-05 | file+grep | `grep -r '"$type": "shadow"' packages/tokens/tokens/primitives/elevation*` | ⬜ pending |
| 2-02-01 | 02 | 2 | TOKEN-09 | build+grep | `npx turbo run build --filter=tokens && grep -r '\-\-color-' packages/tokens/dist/css/` | ⬜ pending |
| 2-02-02 | 02 | 2 | TOKEN-03 | build+grep | `grep 'GridBreakpoint' packages/tokens/dist/index.js` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/tokens/package.json` — add `build:tokens` script before tsup build
- [ ] `packages/tokens/tsup.config.ts` — remove `clean: true` (prevents tsup from wiping SD CSS output)
- [ ] Install `style-dictionary@^4.4.0` and `@tokens-studio/sd-transforms@^1.3.0`

*Wave 0 infrastructure must be in place before any token JSON files are authored.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CSS var() chain preserved | TOKEN-09 | Requires visual/grep inspection of outputReferences | Open `dist/css/tokens.css`, confirm semantic refs use `var(--dsx-*)` not raw hex values |
| Figma values match token JSON | TOKEN-01–05 | Source of truth is Figma file | Compare token values in JSON against Figma file via Figma MCP |
| Inter Variable @font-face | TOKEN-04 | Phase 4 concern — SD does not output @font-face | Deferred — verify in Phase 4 |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
