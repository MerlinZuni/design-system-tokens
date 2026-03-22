---
phase: 02-primitive-token-pipeline
plan: 02
subsystem: tokens
tags: [style-dictionary, dtcg, design-tokens, w3c, css-custom-properties, typescript, tailwind, color-palette, spacing, typography, elevation, breakpoints]

# Dependency graph
requires:
  - phase: 02-primitive-token-pipeline
    plan: 01
    provides: Style Dictionary pipeline config, build:tokens script, packages/tokens/ infrastructure
provides:
  - 5 DTCG JSON token source files in packages/tokens/tokens/primitives/
  - dist/css/tokens.css with 231 CSS custom properties (--dsx-* prefix) for color, spacing, typography, elevation, font-family
  - src/breakpoints.ts (SD-generated TypeScript breakpoint constants)
  - dist/index.js exports GridBreakpointSm/Md/Lg/Xl/2xl TypeScript constants
  - Token naming locked: color.{hue}.{step}, spacing.{step}, typography.{step}, elevation.{level}, grid.breakpoint.{name}
affects: [02-03-storybook-token-docs, 03-semantic-tokens, 04-storybook-foundation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - DTCG group-level $type inheritance — set once on group, all descendants inherit
    - $description on group objects (not file root) for SD compatibility and D-01 traceability
    - Composite typography tokens: $type=typography, $value={fontFamily, fontWeight, fontSize, lineHeight, letterSpacing}
    - Composite shadow tokens: $type=shadow, $value={color, offsetX, offsetY, blur, spread} — DTCG names (not x/y)
    - Multi-layer shadows as array $value for md/lg/xl elevation levels
    - Breakpoints as individual per-token $type=dimension (not group-level) for 2xl key safety
    - dist/ is gitignored — build outputs not committed; only source JSON and SD-generated src/breakpoints.ts committed

key-files:
  created:
    - packages/tokens/tokens/primitives/color.tokens.json
    - packages/tokens/tokens/primitives/spacing.tokens.json
    - packages/tokens/tokens/primitives/typography.tokens.json
    - packages/tokens/tokens/primitives/elevation.tokens.json
    - packages/tokens/tokens/primitives/grid.tokens.json
    - packages/tokens/src/breakpoints.ts
  modified: []

key-decisions:
  - "All token values use Tailwind v3 defaults as source — no Figma file key was provided in the plan; per Claude's Discretion in CONTEXT.md, Tailwind defaults are the authorized fallback"
  - "brand color palette uses Tailwind violet scale as placeholder — must be replaced with actual brand values once Figma file key is available"
  - "Root-level $description in DTCG JSON causes SD token collisions — move $description inside the group object, not at file root"
  - "dist/ is gitignored — build output CSS/JS not committed; source JSON + SD-generated src/breakpoints.ts are committed"
  - "Tailwind spacing scale: 1 unit = 4px, values in px (not rem)"
  - "Typography lineHeight for display sizes (text-5xl through text-9xl): unitless 1 expressed as equivalent px (48px for 48px font-size)"

patterns-established:
  - "Pattern 4: $description belongs inside group object, not at JSON file root — SD reads root keys as token paths"
  - "Pattern 5: SD-generated src/breakpoints.ts is committed as source code (intermediate artifact)"
  - "Pattern 6: dist/ outputs are gitignored — consumers run build to get CSS/JS artifacts"

requirements-completed: [TOKEN-01, TOKEN-02, TOKEN-03, TOKEN-04, TOKEN-05]

# Metrics
duration: 5min
completed: 2026-03-22
---

# Phase 02 Plan 02: Token Authoring Summary

**5 DTCG JSON token source files authored (color/spacing/typography/elevation/grid) with 231 CSS custom properties in dist/css/tokens.css and TypeScript breakpoint constants in dist/index.js**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-22T14:52:33Z
- **Completed:** 2026-03-22T14:57:34Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Authored all 5 primitive token JSON files in DTCG format with group-level $type inheritance
- color.tokens.json: 8 hues (brand, red, green, yellow, blue, orange, purple, neutral) × 11 steps = 90 color variables
- spacing.tokens.json: 34 Tailwind steps (spacing.0 through spacing.96, 4px base unit)
- typography.tokens.json: font.family.default (Archivo) + font.family.variable (Inter Variable) + 13 composite type scale steps
- elevation.tokens.json: 5 shadow levels (none, sm, md, lg, xl) using DTCG offsetX/offsetY
- grid.tokens.json: 5 breakpoints (sm/md/lg/xl/2xl) as TypeScript constants only, excluded from CSS
- Full build pipeline passes: turbo run build exits 0, 231 CSS custom properties generated

## Task Commits

Each task was committed atomically:

1. **Task 1: Color and spacing primitive token JSON** - `98c35eb` (feat)
2. **Task 2: Typography, elevation, and grid primitive token JSON** - `4c75b60` (feat)
3. **Task 3: Run build, SD breakpoints.ts, $description bug fix** - `30dd321` (feat)

**Plan metadata:** _(docs commit — pending)_

## Files Created/Modified

- `packages/tokens/tokens/primitives/color.tokens.json` - 8 hues × 11 steps, group $type=color, Tailwind v3 palette
- `packages/tokens/tokens/primitives/spacing.tokens.json` - 34 Tailwind steps 0-96, group $type=dimension
- `packages/tokens/tokens/primitives/typography.tokens.json` - font.family.default/variable + 13 composite type scale steps
- `packages/tokens/tokens/primitives/elevation.tokens.json` - 5 shadow levels with DTCG offsetX/offsetY
- `packages/tokens/tokens/primitives/grid.tokens.json` - 5 breakpoints as individual dimension tokens
- `packages/tokens/src/breakpoints.ts` - SD-generated TypeScript breakpoint constants (committed as source)

## Decisions Made

- **Tailwind v3 as fallback source:** No Figma file key was provided in the plan; used Tailwind v3 default color palette and type scale per Claude's Discretion in CONTEXT.md. brand color uses Tailwind violet as placeholder.
- **$description placement:** Moved from file root into group objects — SD reads root-level keys as token paths, causing collisions across files.
- **dist/ not committed:** The .gitignore excludes packages/tokens/dist/. Build outputs are generated artifacts, not source.
- **Spacing values in px:** All spacing as integer pixel values (4px = spacing.1), not rem. More explicit and matches Tailwind's pixel reference.
- **Typography display lineHeight:** For text-5xl through text-9xl, Tailwind specifies unitless 1 — expressed as equivalent px (lineHeight = fontSize value).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Moved $description from file root to group level to fix SD token collisions**
- **Found during:** Task 3 (run build)
- **Issue:** Style Dictionary reads root-level JSON keys as token paths. When multiple files each had `$description` at root, SD detected 4 "token collisions" across files since they all resolved to the same root-level path
- **Fix:** Moved `$description` from the JSON file root into the top-level token group object (e.g., from `{ "$description": "...", "color": {...} }` to `{ "color": { "$description": "...", ... } }`)
- **Files modified:** All 5 token JSON files
- **Verification:** Rebuilt with SD — 0 collision warnings, clean build output
- **Committed in:** `30dd321` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug fix)
**Impact on plan:** Essential correctness fix — $description at file root caused SD to misinterpret documentation strings as token values. Move was minimal and preserved all D-01 traceability information.

## Issues Encountered

- SD token collision warnings on first build — root-level $description keys treated as token values by Style Dictionary. Fixed by moving descriptions inside group objects.
- Figma MCP: No Figma file key was provided in the plan's must_haves section. All token values sourced from Tailwind v3 defaults per Claude's Discretion. brand palette uses Tailwind violet as placeholder — should be replaced when Figma file key is available.

## Known Stubs

- **`packages/tokens/tokens/primitives/color.tokens.json` — `color.brand.*`:** brand palette uses Tailwind violet scale as placeholder (no Figma file key). Values are valid hex strings and the build works correctly, but brand colors should be updated with actual brand values from Figma once the file key is known. This does NOT prevent the plan goal from being achieved (all CSS vars generated and named correctly).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 primitive token JSON files authored and validated
- Build pipeline produces 231 CSS custom properties in dist/css/tokens.css
- TypeScript breakpoint constants exported via dist/index.js
- Token names are permanent from this point: `color.{hue}.{step}`, `spacing.{step}`, `typography.{step}`, `elevation.{level}`, `grid.breakpoint.{name}` — Phase 3 semantic aliases will reference these names
- Blocker for Storybook token docs (02-03): none — token CSS is available at `@design-system-x/tokens/css`
- Note: brand colors should be updated from Figma file when file key is available

---
*Phase: 02-primitive-token-pipeline*
*Completed: 2026-03-22*

## Self-Check: PASSED

All files exist and all commits verified:
- packages/tokens/tokens/primitives/color.tokens.json — FOUND
- packages/tokens/tokens/primitives/spacing.tokens.json — FOUND
- packages/tokens/tokens/primitives/typography.tokens.json — FOUND
- packages/tokens/tokens/primitives/elevation.tokens.json — FOUND
- packages/tokens/tokens/primitives/grid.tokens.json — FOUND
- packages/tokens/src/breakpoints.ts — FOUND
- .planning/phases/02-primitive-token-pipeline/02-02-SUMMARY.md — FOUND
- Commit 98c35eb — FOUND
- Commit 4c75b60 — FOUND
- Commit 30dd321 — FOUND
