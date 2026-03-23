---
phase: 05-token-documentation-pages
plan: 01
subsystem: ui
tags: [style-dictionary, storybook, css-custom-properties, data-attributes, multi-brand, multi-mode]

# Dependency graph
requires:
  - phase: 04-storybook-foundation
    provides: preview.tsx with CSS imports and global decorator
  - phase: 03-semantic-tokens-figma-pipeline
    provides: 4 semantic CSS files (parent/child x light/dark) from Style Dictionary

provides:
  - Compound [data-brand][data-theme] CSS selectors in all 4 semantic CSS files
  - Storybook Brand (Parent/Child) and Mode (Light/Dark) toolbar dropdowns via globalTypes
  - withThemeAttributes decorator that sets data-brand + data-theme on document.documentElement
  - initialGlobals defaulting to parent brand + light mode
  - All 4 semantic CSS files imported in Storybook at startup

affects:
  - 05-02-colors-page
  - 05-03-typography-page
  - 05-04-spacing-elevation-grid-pages
  - 05-05-styles-section

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Compound CSS selector pattern: [data-brand='X'][data-theme='Y'] — no implicit :root defaults, tokens only apply when both attributes are set"
    - "Storybook globalTypes toolbar: brand + mode dropdowns drive global state for all pages"
    - "Storybook Decorator pattern: context.globals drives useEffect setting HTML data attributes — avoids useGlobals hook import path ambiguity"
    - "All 4 semantic CSS files imported at boot; data-attribute selectors control which variables activate"

key-files:
  created: []
  modified:
    - packages/tokens/style-dictionary.config.mjs
    - apps/storybook/.storybook/preview.tsx

key-decisions:
  - "Compound CSS selector [data-brand='X'][data-theme='Y'] moves light mode off :root — no implicit defaults, both attributes required (D-01, D-02)"
  - "context.globals used in decorator instead of useGlobals hook — avoids import path ambiguity in Storybook 10 monorepo setup (per RESEARCH.md open question #1)"
  - "All 4 semantic CSS files imported upfront — data-attribute selectors control which ruleset activates; no dynamic CSS swapping needed"
  - "initialGlobals sets brand=parent, mode=light — default state without user interaction (D-04)"

patterns-established:
  - "SD brand selector: brand.replace('-brand', '') strips suffix so data attribute values are 'parent'/'child' not 'parent-brand'/'child-brand'"
  - "Storybook decorator reads context.globals, sets data attributes in useEffect — reactive to global state changes"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-03-23
---

# Phase 5 Plan 01: SD Selector Refactor + Storybook Theme Switcher Summary

**Compound [data-brand][data-theme] CSS selectors output by Style Dictionary, with Storybook Brand + Mode toolbar dropdowns driving live theme switching via data attributes on the HTML element**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-23T10:17:22Z
- **Completed:** 2026-03-23T10:25:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Style Dictionary now outputs `[data-brand="parent"][data-theme="light"]` compound selectors for all 4 semantic CSS files — no implicit `:root` defaults
- Storybook toolbar has independent Brand (Parent Brand / Child Brand) and Mode (Light / Dark) dropdowns driven by `globalTypes`
- `withThemeAttributes` decorator reads `context.globals` and sets `data-brand` + `data-theme` on `document.documentElement` via `useEffect`, causing CSS variables to live-update on every page
- All 4 semantic CSS files imported at Storybook startup; data-attribute selectors control which ruleset is active
- Default state is `parent` brand + `light` mode via `initialGlobals` (no user interaction required)

## Task Commits

Each task was committed atomically:

1. **Task 1: SD selector refactor — compound [data-brand][data-theme] selectors** - `f135d61` (feat)
2. **Task 2: preview.tsx — globalTypes toolbar + withThemeAttributes decorator** - `fea9ae5` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `packages/tokens/style-dictionary.config.mjs` — Changed selector from `:root`/`[data-theme="dark"]` to `[data-brand="${brand.replace('-brand','')}"][data-theme="${mode}"]`
- `apps/storybook/.storybook/preview.tsx` — Full rewrite: added all 4 CSS imports, `withThemeAttributes` decorator, `globalTypes` toolbar dropdowns, `initialGlobals`, updated `storySort` sub-page ordering

## Decisions Made

- `context.globals` used in decorator instead of `useGlobals` hook — avoids import path ambiguity in Storybook 10 monorepo setup (per RESEARCH.md open question #1)
- All 4 semantic CSS files imported upfront at startup — data-attribute selectors control activation; no dynamic CSS swapping needed. This is simpler and avoids Vite/Webpack dynamic import complexity
- `brand.replace('-brand', '')` strips the `-brand` suffix from internal constants (`parent-brand`, `child-brand`) so `data-brand` attribute values are `parent`/`child` (per D-01)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Build warnings ("filtered out token references were found") are pre-existing and expected from the `isSource` filter on semantic instances — not caused by this change.

## User Setup Required

None — no external service configuration required. Storybook starts with toolbar dropdowns active immediately.

## Next Phase Readiness

- Theme switching infrastructure is fully operational — all downstream plans (05-02 through 05-05) can rely on `data-brand` + `data-theme` attribute switching working across all pages
- CSS selectors are compound and non-conflicting — all 4 brand×mode combinations can coexist in the browser simultaneously, with data attributes selecting the active ruleset
- Toolbar defaults to parent brand + light mode — matches D-04 and the previous single-import default behavior

---
*Phase: 05-token-documentation-pages*
*Completed: 2026-03-23*
