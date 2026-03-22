# STATE: Design System X

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-22)

**Core value:** A single source of truth for all design decisions — tokens defined once in Figma, consumed reliably in code, with Storybook as the living reference that bridges design and development.
**Current focus:** Phase 2 — Token Implementation (ready to begin)

## Current Status

- [x] PROJECT.md defined
- [x] Research complete (TOKENS.md, FIGMA.md, STORYBOOK.md, STRUCTURE.md)
- [x] REQUIREMENTS.md defined (30 v1 requirements, all mapped)
- [x] ROADMAP.md defined (6 phases)
- [x] Phase 1: Monorepo Foundation — **COMPLETE** (2/2 plans)

## Active Phase

**Phase 1: Monorepo Foundation** — 2 plans, 2 waves — COMPLETE
- Wave 1: Plan 01-01 — Root workspace + package scaffolding ✓ COMPLETE
- Wave 2: Plan 01-02 — Storybook, ESLint, and Changesets setup ✓ COMPLETE

Current position: Phase 1 complete — ready for Phase 2

## Decisions

- Turborepo v2 requires `packageManager` field in root package.json — added `npm@11.11.0`
- tsup with `"type": "module"` produces `.js` (ESM) and `.cjs` (CJS), not `.mjs/.js` — exports maps corrected in both packages
- `"types"` key in exports condition map must come before `"import"/"require"` for TypeScript declaration resolution
- tsup must be installed at root devDependencies — npm workspaces hoists to root, per-package installs don't create local `.bin`
- `composite: false` confirmed in tsconfig.base.json — tsup uses esbuild, not `tsc --build`
- ESLint 9 not 10 — `eslint-plugin-react@7.37.5` uses `context.getFilename()` removed in ESLint 10; stay on ESLint 9 until plugin ecosystem catches up
- `apps/storybook` workspace package must be named `@design-system-x/storybook` — using plain "storybook" causes npm to shadow the storybook CLI with the workspace symlink
- storybook CLI must be hoisted to root devDependencies — `@storybook/*` addons are hoisted to root and need to resolve `storybook/internal/*` from root `node_modules`
- Changesets `access: "public"` is critical for `@design-system-x/*` scoped packages — default "restricted" causes 402 errors on npm publish
- `changeset status` requires Git >= 2.22 (`--no-relative` flag); system has old git at `/usr/local/bin/git` (2.15.0) — run with `PATH=/usr/bin:$PATH` until PATH is fixed

## Open Questions / Risks

- Verify Tokens Studio Pro v2 exact DTCG export format for composite tokens before Phase 2 begins
- Figma plan confirmed: Organization/Enterprise (up to 40 modes) ✓
- Composite tokens (typography, elevation) will be authored in Tokens Studio directly — not Figma Variables ✓
- Confirm team's npm registry (public npm vs GitHub Packages vs internal) before Phase 1 package setup
- Code Connect publish will be a manual release step for v1
- /usr/local/bin/git is 2.15.0 — upgrade to >= 2.22 for changeset status to work without PATH workaround

## Stack

- Framework: React + TypeScript
- Monorepo: npm workspaces + Turborepo
- Build: tsup (packages), Vite (Storybook)
- Token sync: Tokens Studio Pro → W3C DTCG JSON
- Token transform: Style Dictionary v4
- Documentation: Storybook 10 (`@storybook/react-vite`)
- Versioning: Changesets (access: public, baseBranch: main)
- Figma integration: @storybook/addon-designs + Figma Code Connect
- Linting: ESLint 9 flat config + typescript-eslint v8 (projectService)

---
*State initialized: 2026-03-22*
*Last session: 2026-03-22 — Completed 01-02-PLAN.md (Storybook, ESLint, and Changesets setup)*
