---
phase: 04-storybook-foundation
plan: 01
subsystem: ui
tags: [storybook, addon-designs, css-custom-properties, design-tokens, react]

# Dependency graph
requires:
  - phase: 03-semantic-tokens-figma-pipeline
    provides: "dist/parent-brand/light.css, dist/css/tokens.css — imported as global CSS in preview.tsx"
  - phase: 02-primitive-token-pipeline
    provides: "dist/css/tokens.css with 231 CSS custom properties under --dsx-* namespace"
provides:
  - "Storybook runtime with @storybook/addon-designs registered in main.ts"
  - "Global CSS imports for primitive + parent-brand/light semantic tokens"
  - "Global decorator wrapping stories with semantic background and 2rem padding"
  - "storySort sidebar hierarchy: Introduction > Tokens > Styles > Primitives"
  - "Separate MDX glob pattern to discover standalone .mdx documentation files"
affects:
  - 04-storybook-foundation (plans 02+)
  - 05-theme-switching
  - 06-figma-embeds

# Tech tracking
tech-stack:
  added:
    - "@storybook/addon-designs@^11.1.2 — Figma frame embedding in story addon panels"
  patterns:
    - "getAbsolutePath() wrapper pattern for all addon registrations in main.ts"
    - "CSS import order: primitives (tokens.css) before semantic layer (brand/mode.css)"
    - "Global decorator as top-level preview key (not nested in parameters)"
    - "Semantic token reference (var(--dsx-color-background-default)) in decorator"

key-files:
  created:
    - "apps/storybook/.storybook/preview.tsx — CSS imports, global decorator, storySort config"
  modified:
    - "apps/storybook/.storybook/main.ts — addon-designs registration, MDX glob pattern"
    - "apps/storybook/package.json — @storybook/addon-designs added to devDependencies"
    - "package.json — @storybook/addon-designs added to root devDependencies"

key-decisions:
  - "preview.tsx not preview.ts — JSX decorator requires .tsx file extension (parser error otherwise)"
  - "Only parent-brand/light semantic CSS imported — never all 4 simultaneously, brand/mode switching deferred to Phase 5"
  - "decorators as top-level key on preview object — Storybook 9+ silently ignores parameters.decorators"
  - "Separate stories globs for .mdx and .stories.@(ts|tsx) — enables standalone MDX documentation files"
  - "npm install at root without -w flag — root is not a workspace, -w . fails"

patterns-established:
  - "CSS token import order: primitive tokens CSS first, then semantic CSS layer on top"
  - "Global decorator uses semantic token (var(--dsx-color-background-default)) not hardcoded hex"

requirements-completed: [STORY-01, STORY-02, STORY-03]

# Metrics
duration: 2min
completed: 2026-03-22
---

# Phase 4 Plan 01: Storybook Foundation Summary

**@storybook/addon-designs registered, token CSS globally imported in preview.tsx with decorator and storySort, monorepo build passing clean**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-22T21:20:06Z
- **Completed:** 2026-03-22T21:22:04Z
- **Tasks:** 2
- **Files modified:** 4 (main.ts, preview.tsx, apps/storybook/package.json, root package.json)

## Accomplishments

- Installed `@storybook/addon-designs@^11.1.2` at root and registered in main.ts addons array via `getAbsolutePath()` pattern
- Replaced `preview.ts` with `preview.tsx` containing CSS imports for primitive + parent-brand/light tokens, JSX global decorator with semantic background and 2rem padding, and storySort sidebar hierarchy
- Updated stories glob to two separate patterns enabling standalone `.mdx` documentation files alongside `.stories.@(ts|tsx)` story files
- Full monorepo `turbo run build` passes: 4/4 tasks successful (tokens, primitives, storybook static build)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install addon-designs and update main.ts config** - `131f08b` (feat)
2. **Task 2: Create preview.tsx with CSS imports, global decorator, and storySort** - `57f8ad9` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `apps/storybook/.storybook/main.ts` — Added addon-designs addon, split stories glob into .mdx + .stories.@(ts|tsx) patterns
- `apps/storybook/.storybook/preview.tsx` — New file: React import, token CSS imports, JSX global decorator, storySort config
- `apps/storybook/.storybook/preview.ts` — Deleted (replaced by preview.tsx)
- `apps/storybook/package.json` — Added `@storybook/addon-designs: ^11.0.0` to devDependencies
- `package.json` — Added `@storybook/addon-designs: ^11.1.2` to root devDependencies (hoisted)
- `package-lock.json` — Updated with 7 new packages from addon-designs install

## Decisions Made

- `preview.tsx` not `.ts` — the JSX decorator (`<Story />`, `<div>`) requires a `.tsx` file; a `.ts` file causes a parser error at Storybook startup
- `decorators` placed as top-level key on the preview object — Storybook 9+ silently ignores `parameters.decorators`, only top-level decorators are applied globally
- Only `parent-brand/light` CSS imported — never all 4 simultaneously; Phase 5 will add the dynamic brand/mode switcher to replace this static import
- `npm install` at root without `-w .` flag — root package is not a workspace target; `-w .` causes "No workspaces found" error

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- `npm install -D @storybook/addon-designs@^11.0.0 -w .` failed with "No workspaces found" because `-w .` targets workspace packages, not the root. Fixed by running without the flag: `npm install -D @storybook/addon-designs@^11.0.0`. This is a Rule 3 auto-fix (blocking install command), resolved inline.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Storybook runtime foundation complete: token CSS globally available, addon-designs registered, sidebar sort configured
- Plan 04-02 can proceed immediately: token preview stories (color, typography, spacing, elevation, grid) will render with correct CSS custom properties from the global imports established here
- Phase 6 Figma embeds have the addon-designs panel ready for use
- Phase 5 brand/mode switching has a clear stub: replace the static `import '@design-system-x/tokens/parent-brand/light'` in preview.tsx with a dynamic switcher

## Self-Check: PASSED

- FOUND: apps/storybook/.storybook/preview.tsx
- FOUND: apps/storybook/.storybook/main.ts
- FOUND (absent): apps/storybook/.storybook/preview.ts deleted correctly
- FOUND: .planning/phases/04-storybook-foundation/04-01-SUMMARY.md
- FOUND commit: 131f08b (Task 1)
- FOUND commit: 57f8ad9 (Task 2)

---
*Phase: 04-storybook-foundation*
*Completed: 2026-03-22*
