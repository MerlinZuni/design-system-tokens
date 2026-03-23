---
phase: 06-primitive-components-figma-integration
plan: 03
subsystem: figma
tags: [figma, code-connect, react, typescript, primitives, release-workflow]

# Dependency graph
requires:
  - phase: 06-01
    provides: 6 primitive React components (Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden)

provides:
  - "@figma/code-connect ^1.4.2 installed in packages/primitives devDependencies"
  - "6 .figma.tsx Code Connect files colocated with components, placeholder node IDs"
  - "RELEASE_CHECKLIST.md documenting the complete v1.0 publish flow"

affects: [figma-dev-mode, v1.0-release, npm-publish]

# Tech tracking
tech-stack:
  added:
    - "@figma/code-connect@^1.4.2 (devDependency in packages/primitives)"
  patterns:
    - "figma.connect() pattern: colocated .figma.tsx with placeholder TODO-NODE-ID, publish gated on real IDs"
    - "figma.enum() for union type prop mappings (variant, size, elevation, background, gap, align, justify)"
    - "figma.string() for text content props (children, label)"
    - "figma.boolean() for boolean props (border)"
    - "figma.children() for slot props (children in Surface, Stack, Inline)"

key-files:
  created:
    - packages/primitives/src/Text/Text.figma.tsx
    - packages/primitives/src/ColorSwatch/ColorSwatch.figma.tsx
    - packages/primitives/src/Surface/Surface.figma.tsx
    - packages/primitives/src/Stack/Stack.figma.tsx
    - packages/primitives/src/Inline/Inline.figma.tsx
    - packages/primitives/src/VisuallyHidden/VisuallyHidden.figma.tsx
    - RELEASE_CHECKLIST.md
  modified:
    - packages/primitives/package.json

key-decisions:
  - "Publish gated on real Figma node IDs (D-09) — DO NOT run npx @figma/code-connect publish with TODO placeholders"
  - "figma.children() used for slot-type props (Surface/Stack/Inline children) vs figma.string() for text content (Text/VisuallyHidden)"
  - "RELEASE_CHECKLIST.md at project root covers both packages (@design-system-x/tokens + @design-system-x/primitives)"

requirements-completed: [FIGMA-05]

# Metrics
duration: 2min
completed: 2026-03-23
---

# Phase 6 Plan 03: Figma Code Connect Files and Release Checklist Summary

**@figma/code-connect installed, 6 colocated .figma.tsx Code Connect files with placeholder node IDs and prop mappings ready for real Figma node IDs, plus RELEASE_CHECKLIST.md documenting the full v1.0 publish workflow**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-23T16:22:55Z
- **Completed:** 2026-03-23T16:24:38Z
- **Tasks:** 2 of 3 complete (stopped at human-verify checkpoint)
- **Files modified:** 8

## Accomplishments

- Installed `@figma/code-connect@^1.4.2` as devDependency in packages/primitives
- Created 6 `.figma.tsx` Code Connect files, colocated with each primitive component in `src/ComponentName/`
- All 6 files use `figma.enum()`, `figma.string()`, `figma.boolean()`, and `figma.children()` to map Figma component properties to React props
- All 6 files use placeholder `TODO-NODE-ID` per D-07 — publish is deliberately gated on real node IDs
- Created `RELEASE_CHECKLIST.md` at project root documenting the complete v1.0 flow: changeset, version, build, Code Connect publish (gated), npm publish, git tag
- TypeScript compilation passes with zero errors

## Task Commits

1. **Task 1: Install @figma/code-connect and create 6 Code Connect files** - `5d3ecdf` (feat)
2. **Task 2: Write v1.0 release checklist** - `70536d7` (feat)

## Files Created/Modified

- `packages/primitives/package.json` — Added @figma/code-connect ^1.4.2 to devDependencies
- `packages/primitives/src/Text/Text.figma.tsx` — New: Code Connect with 11-value enum variant + string children
- `packages/primitives/src/ColorSwatch/ColorSwatch.figma.tsx` — New: Code Connect with enum size (sm/md/lg) + string label
- `packages/primitives/src/Surface/Surface.figma.tsx` — New: Code Connect with enum elevation + enum background + boolean border + children slot
- `packages/primitives/src/Stack/Stack.figma.tsx` — New: Code Connect with enum gap + enum align + children slot
- `packages/primitives/src/Inline/Inline.figma.tsx` — New: Code Connect with enum gap + enum justify + children slot
- `packages/primitives/src/VisuallyHidden/VisuallyHidden.figma.tsx` — New: Code Connect with string children/label
- `RELEASE_CHECKLIST.md` — New: 13-step v1.0 publish flow at project root

## Decisions Made

- `figma.children()` used for slot-type props in container components (Surface, Stack, Inline) vs `figma.string()` for text content (Text content prop, VisuallyHidden label)
- Publish deliberately NOT run — Code Connect publish with TODO placeholders creates broken connections (per Pitfall 4 in RESEARCH.md and D-09)
- RELEASE_CHECKLIST.md placed at project root to be visible without navigating into package directories

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

All 6 `.figma.tsx` files contain `TODO-NODE-ID` and `TODO-FILE-KEY` placeholder values. This is intentional per D-07 and is tracked in RELEASE_CHECKLIST.md step 8 as the manual step required before publishing. The stubs do NOT prevent the plan's goal (FIGMA-05) from being achieved — Code Connect files are complete with correct prop mappings, awaiting only real node IDs.

## User Setup Required (Checkpoint)

Before Code Connect can be published:
1. Replace `TODO-FILE-KEY` in all 6 `.figma.tsx` files with the Figma file key from your design file URL
2. Replace `TODO-NODE-ID` in each `.figma.tsx` file with the actual Figma component node ID from Dev Mode
3. Run `cd packages/primitives && npx @figma/code-connect publish`

## Next Phase Readiness

- FIGMA-05 satisfied: Code Connect files exist for all 6 primitives
- RELEASE_CHECKLIST.md gates Code Connect publish on real node IDs (step 8)
- Phase 6 Plan 02 (component stories) can proceed independently of Code Connect publish

## Self-Check: PASSED

All created files verified to exist. Both task commits (5d3ecdf, 70536d7) verified in git log.

---
*Phase: 06-primitive-components-figma-integration*
*Completed: 2026-03-23*
