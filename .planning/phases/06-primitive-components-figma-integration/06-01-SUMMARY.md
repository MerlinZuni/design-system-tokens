---
phase: 06-primitive-components-figma-integration
plan: 01
subsystem: ui
tags: [react, typescript, design-tokens, storybook, primitives, css-custom-properties]

# Dependency graph
requires:
  - phase: 05-token-documentation-pages
    provides: token-data.ts, TokenTable, SemanticTokenSection, Styles MDX pages, getSemanticTokensForTheme
  - phase: 02-primitive-token-pipeline
    provides: "@design-system-x/tokens with GridBreakpoint* constants"

provides:
  - BREAKPOINTS in token-data.ts sourced from @design-system-x/tokens (no hardcoded values)
  - StylesTokenTable wrapper component reading brand/mode from Storybook globals
  - 6 primitive React components (Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden) with TypeScript interfaces
  - Barrel export from @design-system-x/primitives

affects: [06-02-stories, 06-03-code-connect, component-stories, storybook-documentation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Polymorphic as-prop: TextProps & Record<string, unknown> spread pattern for HTML element override"
    - "StylesTokenTable useGlobals try/catch require() pattern (consistent with SemanticTokenSection)"
    - "GAP_MAP/ALIGN_MAP pattern: type-safe Record lookup for CSS var mapping"
    - "SpacingKey union type: xs/sm/md/lg/xl/2xl/3xl mapped to --dsx-spacing-* vars"

key-files:
  created:
    - apps/storybook/stories/components/StylesTokenTable.tsx
    - packages/primitives/src/Text/Text.tsx
    - packages/primitives/src/Text/index.ts
    - packages/primitives/src/ColorSwatch/ColorSwatch.tsx
    - packages/primitives/src/ColorSwatch/index.ts
    - packages/primitives/src/Surface/Surface.tsx
    - packages/primitives/src/Surface/index.ts
    - packages/primitives/src/Stack/Stack.tsx
    - packages/primitives/src/Stack/index.ts
    - packages/primitives/src/Inline/Inline.tsx
    - packages/primitives/src/Inline/index.ts
    - packages/primitives/src/VisuallyHidden/VisuallyHidden.tsx
    - packages/primitives/src/VisuallyHidden/index.ts
  modified:
    - apps/storybook/stories/components/token-data.ts
    - packages/primitives/src/index.ts
    - apps/storybook/stories/Styles/Surfaces.mdx
    - apps/storybook/stories/Styles/Headings.mdx
    - apps/storybook/stories/Styles/BodyText.mdx
    - apps/storybook/stories/Styles/InteractiveStates.mdx
    - apps/storybook/stories/Styles/Feedback.mdx

key-decisions:
  - "StylesTokenTable uses same useGlobals try/catch require() pattern as SemanticTokenSection for Storybook 10 monorepo compatibility"
  - "SpacingKey type is defined locally in both Stack and Inline (not shared) to keep component files self-contained and avoid cross-import coupling"
  - "Headings/BodyText Styles pages: only semantic color tokens shown in StylesTokenTable (typography primitive tokens are static, not in getSemanticTokensForTheme)"
  - "Text component exports non-generic TextProps for react-docgen-typescript Autodocs compatibility (generic TextProps would not be introspected)"

patterns-established:
  - "StylesTokenTable pattern: theme-reactive token table using getSemanticTokensForTheme(brand, mode)"
  - "Component directory structure: src/ComponentName/ComponentName.tsx + index.ts"
  - "All primitive components use var(--dsx-*) CSS custom properties exclusively — no hardcoded hex or px for design values"
  - "TypeScript interfaces use JSDoc block comments (/** */) on every prop for Autodocs generation"

requirements-completed: [STORY-10, STORY-12]

# Metrics
duration: 12min
completed: 2026-03-23
---

# Phase 6 Plan 01: Primitive Components and Integration Fixes Summary

**6 primitive React components (Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden) with typed props and barrel exports, plus BREAKPOINTS token import fix and theme-reactive StylesTokenTable replacing static token tables in all 5 Styles pages**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-23T16:08:00Z
- **Completed:** 2026-03-23T16:20:00Z
- **Tasks:** 3
- **Files modified:** 20

## Accomplishments

- Fixed D-13: BREAKPOINTS in token-data.ts now imports GridBreakpoint* constants from @design-system-x/tokens — single source of truth, no hardcoded pixel values
- Fixed D-14: Created StylesTokenTable.tsx wrapper that reads brand/mode globals and calls getSemanticTokensForTheme(), replacing static TokenTable in all 5 Styles MDX pages
- Implemented all 6 primitive components with TypeScript interfaces, JSDoc comments on every prop, and var(--dsx-*) CSS custom property consumption

## Task Commits

1. **Task 1: Fix BREAKPOINTS import in token-data.ts** - `7a1d147` (feat)
2. **Task 2: Create StylesTokenTable and update Styles MDX pages** - `276614d` (feat)
3. **Task 3: Implement 6 primitive components with barrel exports** - `9b7183f` (feat)

**Plan metadata:** (docs commit hash — see below)

## Files Created/Modified

- `apps/storybook/stories/components/token-data.ts` — Removed primitiveGrid import, added GridBreakpoint* from @design-system-x/tokens, BREAKPOINTS uses constants
- `apps/storybook/stories/components/StylesTokenTable.tsx` — New: theme-reactive token table using getSemanticTokensForTheme + useGlobals try/catch
- `apps/storybook/stories/Styles/Surfaces.mdx` — Replaced static TokenTable with StylesTokenTable
- `apps/storybook/stories/Styles/Headings.mdx` — Replaced static TokenTable with StylesTokenTable
- `apps/storybook/stories/Styles/BodyText.mdx` — Replaced static TokenTable with StylesTokenTable
- `apps/storybook/stories/Styles/InteractiveStates.mdx` — Replaced static TokenTable with StylesTokenTable
- `apps/storybook/stories/Styles/Feedback.mdx` — Replaced static TokenTable with StylesTokenTable
- `packages/primitives/src/Text/Text.tsx` — New: polymorphic text component, 11 type scale variants
- `packages/primitives/src/ColorSwatch/ColorSwatch.tsx` — New: swatch with hover border, 3 sizes
- `packages/primitives/src/Surface/Surface.tsx` — New: semantic background/elevation container
- `packages/primitives/src/Stack/Stack.tsx` — New: vertical flex with spacing token gap map
- `packages/primitives/src/Inline/Inline.tsx` — New: horizontal flex with wrap, gap, justify
- `packages/primitives/src/VisuallyHidden/VisuallyHidden.tsx` — New: CSS clip pattern for screen reader content
- `packages/primitives/src/index.ts` — Updated: barrel re-exports all 6 components + prop types

## Decisions Made

- StylesTokenTable uses same try/catch require() pattern as SemanticTokenSection for Storybook 10 monorepo compatibility
- SpacingKey type defined locally in Stack and Inline independently to avoid cross-component coupling
- Headings/BodyText show only semantic color tokens in StylesTokenTable (typography primitive tokens not in getSemanticTokensForTheme — they are static)
- Text component uses non-generic TextProps interface to ensure react-docgen-typescript Autodocs can introspect all props

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 6 primitives are exported from @design-system-x/primitives and ready for story files
- Component interfaces have JSDoc comments — Autodocs will generate prop tables automatically
- StylesTokenTable is ready for any new Styles pages that need theme-reactive token documentation
- Phase 6 Plan 02 can proceed with Storybook story files for each primitive component

## Self-Check: PASSED

All created files verified to exist. All 3 task commits (7a1d147, 276614d, 9b7183f) verified in git log.

---
*Phase: 06-primitive-components-figma-integration*
*Completed: 2026-03-23*
