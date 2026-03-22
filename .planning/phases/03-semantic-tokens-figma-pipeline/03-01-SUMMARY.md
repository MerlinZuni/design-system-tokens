---
phase: 03-semantic-tokens-figma-pipeline
plan: 01
subsystem: ui
tags: [style-dictionary, dtcg, design-tokens, css-custom-properties, tokens-studio, multi-brand, multi-mode]

# Dependency graph
requires:
  - phase: 02-primitive-token-pipeline
    provides: "SD v4 build pipeline, 5 DTCG primitive JSON files, dist/css/tokens.css"
provides:
  - "4 semantic token JSON files (2 brands x 2 modes) in DTCG format"
  - "SD multi-instance loop producing 4 brand/mode CSS files"
  - "dist/parent-brand/light.css and dist/parent-brand/dark.css — teal brand, brand-tinted dark surfaces"
  - "dist/child-brand/light.css and dist/child-brand/dark.css — navy accent, neutral dark surfaces"
  - "packages/tokens/tokens/$themes.json for Tokens Studio Pro export configuration"
  - "Updated package.json exports for all 4 semantic CSS paths"
  - "Updated turbo.json build:tokens outputs for new CSS paths"
affects:
  - phase-03-plan-02
  - storybook-token-preview
  - figma-pipeline

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SD multi-instance loop: one StyleDictionary() per brand x mode combination with include/source split"
    - "isSource filter: token.isSource in SD file filter excludes primitives from semantic CSS output"
    - "Semantic CSS uses var(--dsx-*) references to primitive vars — consumer loads both CSS files in order"
    - "DTCG alias-only semantic files: all $value fields use {color.*} syntax, zero raw hex"
    - "child-brand dark neutrality: all surfaces use neutral.* — zero color.brand.* per D-11"

key-files:
  created:
    - "packages/tokens/tokens/semantic/parent-brand/light.tokens.json"
    - "packages/tokens/tokens/semantic/parent-brand/dark.tokens.json"
    - "packages/tokens/tokens/semantic/child-brand/light.tokens.json"
    - "packages/tokens/tokens/semantic/child-brand/dark.tokens.json"
    - "packages/tokens/tokens/$themes.json"
  modified:
    - "packages/tokens/tokens/primitives/color.tokens.json"
    - "packages/tokens/style-dictionary.config.mjs"
    - "packages/tokens/package.json"
    - "turbo.json"

key-decisions:
  - "SD isSource filter: filter: token.isSource on semantic CSS platform files excludes primitive tokens from semantic output — without this filter, SD v4 with outputReferences:true outputs all include+source tokens"
  - "brand scale replaced: color.brand now teal (#4FC4C4 at 500) replacing Tailwind violet placeholder (D-03)"
  - "color.link is standalone under color, NOT nested under color.text — avoids token path collision and matches D-07"
  - "Option A for space tokens: duplicate space block across all 4 semantic files — avoids shared-file SD config complexity"
  - "child-brand uses navy for all action/focus/link roles — NOT slate (near-black slate is unsuitable as interactive color, see Research Pattern 3 note)"
  - "SD sequential loop (not Promise.all) — prevents buildPath overlap and stale output issues"

patterns-established:
  - "Pattern: include for primitives + source for semantics + filter:isSource produces clean single-tier CSS files"
  - "Pattern: 4 brand×mode CSS files loaded as :root (light) or [data-theme=dark] (dark) selector"
  - "Pattern: consumer imports tokens.css (primitives) + brand/mode.css (semantics) in that order"

requirements-completed: [TOKEN-06, TOKEN-07, TOKEN-08, TOKEN-10]

# Metrics
duration: 6min
completed: 2026-03-22
---

# Phase 3 Plan 01: Semantic Token Bootstrap Summary

**4 DTCG semantic JSON files + SD multi-instance loop producing 5 CSS files: teal parent-brand (light/:root, dark/brand-tinted), navy/slate child-brand (light, dark/neutral-only) with primitive CSS unchanged**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-22T16:57:39Z
- **Completed:** 2026-03-22T17:03:56Z
- **Tasks:** 3 (1a, 1b, 2)
- **Files modified:** 9

## Accomplishments

- Updated `color.tokens.json` with 4 new/updated primitive scales: teal brand (replaces violet placeholder), purple secondary, deep navy, and near-black slate
- Authored 4 DTCG semantic token JSON files covering 22 semantic categories each (D-07, D-08): parent-brand/light, parent-brand/dark (brand-tinted surfaces), child-brand/light (navy accents per D-04), child-brand/dark (neutral surfaces per D-11)
- Standalone `color.link` category in all 4 files with default/hover/visited/disabled (per D-07)
- Refactored SD config from single-instance to multi-instance BRANDS x MODES nested loop with `isSource` filter ensuring semantic CSS files contain only semantic tokens
- Created `$themes.json` with 4 entries for Tokens Studio Pro export configuration
- Updated `package.json` exports map with 4 new brand/mode CSS paths, and `turbo.json` build outputs
- Full turbo build passes (4/4 tasks)

## Task Commits

Each task was committed atomically:

1. **Task 1a: Update primitive color scales** - `ef1498d` (feat)
2. **Task 1b: Author 4 semantic token files + $themes.json** - `4795d9c` (feat)
3. **Task 2: SD multi-instance loop + package exports** - `d4b85c3` (feat)

## Files Created/Modified

- `packages/tokens/tokens/primitives/color.tokens.json` — replaced brand with teal, added secondary/navy/slate scales
- `packages/tokens/tokens/semantic/parent-brand/light.tokens.json` — 22 categories, teal action/link/focus
- `packages/tokens/tokens/semantic/parent-brand/dark.tokens.json` — brand-tinted surfaces (brand.950/900/800/700), lighter teal accents
- `packages/tokens/tokens/semantic/child-brand/light.tokens.json` — slate text, navy action/link/focus (D-04)
- `packages/tokens/tokens/semantic/child-brand/dark.tokens.json` — neutral surfaces only (D-11), navy.400 accents, zero color.brand.* refs
- `packages/tokens/tokens/$themes.json` — 4 Tokens Studio Pro theme entries with selectedTokenSets
- `packages/tokens/style-dictionary.config.mjs` — multi-instance loop with BRANDS/MODES arrays and isSource filter
- `packages/tokens/package.json` — added 4 new CSS export paths
- `turbo.json` — added dist/parent-brand/** and dist/child-brand/** to build:tokens outputs

## Decisions Made

- **SD isSource filter:** SD v4 with `outputReferences: true` outputs ALL tokens from both `include` and `source` arrays into the CSS file — the `isSource` property distinguishes source tokens from include-only tokens. Added `filter: (token) => token.isSource` to semantic CSS instances to prevent primitive vars from appearing in semantic CSS files.
- **child-brand action uses navy not slate:** Research Pattern 3 note explains near-black `#1C1C28` (slate.500) has poor affordance as an action/button color. Navy (`#1B3A6B`) is used for action/focus/link roles as specified in D-04.
- **brand scale updated in Task 1a:** color.brand replaced with actual teal scale (#4FC4C4 at 500) before semantic authoring, eliminating the violet placeholder.
- **standalone color.link category:** `color.link.*` lives at `color.link` not under `color.text` — D-07 specifies it as a separate category.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added isSource filter to SD semantic instances**
- **Found during:** Task 2 (SD multi-instance loop build verification)
- **Issue:** SD v4 with `include` + `outputReferences: true` still outputs primitive tokens into semantic CSS files (13 neutral vars, full brand/navy/etc scales) — contradicting the `include` vs `source` distinction documented in the research
- **Fix:** Added `filter: (token) => token.isSource` to each semantic CSS platform file config. `isSource: true` only on tokens from the `source` array; `isSource: false` on `include` tokens. This produces clean semantic-only CSS with `var(--dsx-*)` references to primitives.
- **Files modified:** `packages/tokens/style-dictionary.config.mjs`
- **Verification:** `grep -c "^  --dsx-color-neutral-" dist/parent-brand/light.css` returns 0; `var(--dsx-color-*)` references preserved (70 in light.css)
- **Committed in:** d4b85c3 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Essential for correctness — without the filter, semantic CSS contained ~263 primitive token declarations that should only live in tokens.css. Fix keeps consumer import contract clean (primitives + semantic, no duplication).

## Issues Encountered

- SD v4 with `include` does not automatically exclude referenced primitive tokens from `outputReferences`-enabled output. The `isSource` token property is the correct mechanism to distinguish source-authored tokens from include-only tokens. This is the standard SD v4 multi-instance pattern.

## User Setup Required

None — no external service configuration required for this plan. (Tokens Studio Pro Figma push is Plan 02.)

## Next Phase Readiness

- All 4 semantic JSON files authored and validated via SD build
- 5 CSS output files (1 primitive + 4 semantic) ready for Storybook and app consumption
- `$themes.json` ready for Tokens Studio Pro export-to-Figma in Plan 02
- GitHub remote setup (D-17) still required as a blocker before Plan 02 can execute Tokens Studio Pro sync

---
*Phase: 03-semantic-tokens-figma-pipeline*
*Completed: 2026-03-22*

## Self-Check: PASSED

All files confirmed on disk. All task commits confirmed in git history.
- FOUND: packages/tokens/tokens/primitives/color.tokens.json
- FOUND: packages/tokens/tokens/semantic/parent-brand/light.tokens.json
- FOUND: packages/tokens/tokens/semantic/parent-brand/dark.tokens.json
- FOUND: packages/tokens/tokens/semantic/child-brand/light.tokens.json
- FOUND: packages/tokens/tokens/semantic/child-brand/dark.tokens.json
- FOUND: packages/tokens/tokens/$themes.json
- FOUND: packages/tokens/style-dictionary.config.mjs
- FOUND: packages/tokens/package.json
- FOUND: turbo.json
- FOUND: .planning/phases/03-semantic-tokens-figma-pipeline/03-01-SUMMARY.md
- FOUND: ef1498d (feat: primitive color scales)
- FOUND: 4795d9c (feat: 4 semantic files + $themes.json)
- FOUND: d4b85c3 (feat: SD multi-instance loop + exports)
