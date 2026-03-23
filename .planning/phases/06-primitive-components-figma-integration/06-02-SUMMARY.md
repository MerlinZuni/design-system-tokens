---
phase: 06-primitive-components-figma-integration
plan: 02
subsystem: ui
tags: [react, typescript, storybook, csf, mdx, autodocs, figma-embed, primitives]

# Dependency graph
requires:
  - phase: 06-primitive-components-figma-integration
    plan: 01
    provides: "6 primitive React components (Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden) with TypeScript interfaces and barrel exports from @design-system-x/primitives"

provides:
  - 6 CSF story files (Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden) with named stories covering all variants
  - 6 MDX documentation files with usage guidelines, Canvas embeds, ArgTypes props tables, and Figma embed placeholders
  - Storybook sidebar section under "Primitives/" with 6 components

affects: [06-03-code-connect, storybook-documentation, figma-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "satisfies Meta<typeof Component> pattern for all story files (not as Meta)"
    - "tags: ['autodocs'] in meta object enables Storybook Autodocs for all story files"
    - "MDX import pattern: @storybook/addon-docs/blocks for Meta/Canvas/ArgTypes"
    - "MDX Figma import: storybook-addon-designs/blocks (NOT @storybook/addon-designs/blocks)"
    - "collapsable spelling (not collapsible) on Figma block"
    - "render: function for multi-instance stories (AllVariants, AllGaps, AllSizes, Grid, WithElevation, WithAlignment, Wrapping)"

key-files:
  created:
    - apps/storybook/stories/Primitives/Text.stories.tsx
    - apps/storybook/stories/Primitives/Text.mdx
    - apps/storybook/stories/Primitives/ColorSwatch.stories.tsx
    - apps/storybook/stories/Primitives/ColorSwatch.mdx
    - apps/storybook/stories/Primitives/Surface.stories.tsx
    - apps/storybook/stories/Primitives/Surface.mdx
    - apps/storybook/stories/Primitives/Stack.stories.tsx
    - apps/storybook/stories/Primitives/Stack.mdx
    - apps/storybook/stories/Primitives/Inline.stories.tsx
    - apps/storybook/stories/Primitives/Inline.mdx
    - apps/storybook/stories/Primitives/VisuallyHidden.stories.tsx
    - apps/storybook/stories/Primitives/VisuallyHidden.mdx
  modified: []

key-decisions:
  - "Figma embed URLs use placeholder (PLACEHOLDER/TODO) — actual Figma node IDs are provided when Figma file key is available (D-06 pattern from CONTEXT.md)"
  - "Inline and Stack Placeholder helper components are inlined per-story file — not shared — to keep story files self-contained"
  - "Surface Inverse story uses render: override to apply var(--dsx-color-text-inverse) on child text, demonstrating correct usage"

patterns-established:
  - "Story file pattern: import from @design-system-x/primitives, satisfies Meta<typeof Component>, tags autodocs, named story exports"
  - "MDX doc pattern: Meta of={Stories}, When to use section, Primary example Canvas, variant Canvas embeds, ArgTypes, Figma block"
  - "render: function pattern for multi-component showcase stories (maps over variant arrays)"

requirements-completed: [STORY-10, STORY-11, STORY-12, FIGMA-04]

# Metrics
duration: 8min
completed: 2026-03-23
---

# Phase 6 Plan 02: Component Stories and MDX Documentation Summary

**12 Storybook files (6 CSF story files + 6 MDX docs) for all primitive components, covering all variants via Controls and Autodocs, with Figma embed placeholders in each MDX doc**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-23T16:22:54Z
- **Completed:** 2026-03-23T16:30:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Created 6 CSF story files with named stories covering every variant and state from the UI-SPEC Story Coverage Contract (STORY-10, STORY-12)
- Created 6 MDX documentation files with purpose descriptions, "When to use" guidance, Canvas embeds, ArgTypes props tables, and Figma embed placeholders (STORY-11, FIGMA-04)
- All 12 files compile without errors in `turbo run build` (Storybook Vite build passes)

## Task Commits

1. **Task 1: Write .stories.tsx files for all 6 primitive components** - `e99a6f2` (feat)
2. **Task 2: Write .mdx documentation files for all 6 components with Figma embeds** - `4c6c264` (feat)

**Plan metadata:** (docs commit hash — see below)

## Files Created/Modified

- `apps/storybook/stories/Primitives/Text.stories.tsx` — Default, AllVariants, WithSemanticElement, Truncated; satisfies Meta<typeof Text>; argTypes for variant/as/children
- `apps/storybook/stories/Primitives/Text.mdx` — Purpose, When to use, 4 Canvas embeds, ArgTypes, Figma block
- `apps/storybook/stories/Primitives/ColorSwatch.stories.tsx` — Default, AllSizes, SemanticToken, Grid; satisfies Meta<typeof ColorSwatch>
- `apps/storybook/stories/Primitives/ColorSwatch.mdx` — Purpose, When to use, 4 Canvas embeds, ArgTypes, Figma block
- `apps/storybook/stories/Primitives/Surface.stories.tsx` — Default, WithElevation, Inverse, WithBorder; satisfies Meta<typeof Surface>
- `apps/storybook/stories/Primitives/Surface.mdx` — Purpose, When to use, 4 Canvas embeds, inverse usage note, ArgTypes, Figma block
- `apps/storybook/stories/Primitives/Stack.stories.tsx` — Default, AllGaps, WithAlignment with inline Placeholder helper; satisfies Meta<typeof Stack>
- `apps/storybook/stories/Primitives/Stack.mdx` — Purpose, When to use, 3 Canvas embeds, ArgTypes, Figma block
- `apps/storybook/stories/Primitives/Inline.stories.tsx` — Default, Wrapping, Justified with inline Placeholder helper; satisfies Meta<typeof Inline>
- `apps/storybook/stories/Primitives/Inline.mdx` — Purpose, When to use, 3 Canvas embeds, ArgTypes, Figma block
- `apps/storybook/stories/Primitives/VisuallyHidden.stories.tsx` — Default, Focusable; satisfies Meta<typeof VisuallyHidden>
- `apps/storybook/stories/Primitives/VisuallyHidden.mdx` — Purpose, When to use, 2 Canvas embeds, WCAG note, ArgTypes, Figma block

## Decisions Made

- Figma embed URLs use PLACEHOLDER/TODO values — actual Figma node IDs come from the Figma file once a file key is available (per D-06 from CONTEXT.md, Figma frame URLs are placeholders until user provides them)
- Placeholder helper components in Stack and Inline stories are defined inline per story file, not shared across files — keeps story files self-contained and avoids import coupling
- Surface Inverse story uses `render:` override to apply `var(--dsx-color-text-inverse)` on child text, demonstrating the correct usage pattern documented in the MDX

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 6 primitives have complete Storybook documentation under the "Primitives/" sidebar section
- Figma embed placeholders are in place — update URLs once Figma file key and node IDs are available
- Phase 6 Plan 03 can proceed with Figma Code Connect integration (CLI setup + publishable connection files)

## Known Stubs

- `apps/storybook/stories/Primitives/*.mdx` — Figma embed URLs use `https://www.figma.com/design/PLACEHOLDER/Design-System-X?node-id=TODO`. These are intentional placeholders per plan D-06. Plan 06-03 or user action will replace them with actual Figma frame URLs once the Figma file key is provided.

## Self-Check: PASSED

All 12 files verified to exist. Task commits e99a6f2 and 4c6c264 verified in git log.

---
*Phase: 06-primitive-components-figma-integration*
*Completed: 2026-03-23*
