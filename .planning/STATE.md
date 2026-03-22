# STATE: Design System X

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** A single source of truth for all design decisions — tokens defined once in Figma, consumed reliably in code, with Storybook as the living reference that bridges design and development.
**Current focus:** Phase 1 — Monorepo Foundation (executing)

## Current Status

- [x] PROJECT.md defined
- [x] Research complete (TOKENS.md, FIGMA.md, STORYBOOK.md, STRUCTURE.md)
- [x] REQUIREMENTS.md defined (30 v1 requirements, all mapped)
- [x] ROADMAP.md defined (6 phases)
- [ ] Phase 1: Monorepo Foundation — **in progress** (1/2 plans complete)

## Active Phase

**Phase 1: Monorepo Foundation** — 2 plans, 2 waves
- Wave 1: Plan 01-01 — Root workspace + package scaffolding ✓ COMPLETE
- Wave 2: Plan 01-02 — Storybook, ESLint, and Changesets setup

Current position: Wave 2, Plan 01-02

## Decisions

- Turborepo v2 requires `packageManager` field in root package.json — added `npm@11.11.0`
- tsup with `"type": "module"` produces `.js` (ESM) and `.cjs` (CJS), not `.mjs/.js` — exports maps corrected in both packages
- `"types"` key in exports condition map must come before `"import"/"require"` for TypeScript declaration resolution
- tsup must be installed at root devDependencies — npm workspaces hoists to root, per-package installs don't create local `.bin`
- `composite: false` confirmed in tsconfig.base.json — tsup uses esbuild, not `tsc --build`

## Open Questions / Risks

- Verify Tokens Studio Pro v2 exact DTCG export format for composite tokens before Phase 2 begins
- Figma plan confirmed: Organization/Enterprise (up to 40 modes) ✓
- Composite tokens (typography, elevation) will be authored in Tokens Studio directly — not Figma Variables ✓
- Confirm team's npm registry (public npm vs GitHub Packages vs internal) before Phase 1 package setup
- Code Connect publish will be a manual release step for v1

## Stack

- Framework: React + TypeScript
- Monorepo: npm workspaces + Turborepo
- Build: tsup (packages), Vite (Storybook)
- Token sync: Tokens Studio Pro → W3C DTCG JSON
- Token transform: Style Dictionary v4
- Documentation: Storybook 8 (`@storybook/react-vite`)
- Versioning: Changesets
- Figma integration: @storybook/addon-designs + Figma Code Connect

---
*State initialized: 2026-03-22*
*Last session: 2026-03-22 — Completed 01-01-PLAN.md (Root workspace + package scaffolding)*
