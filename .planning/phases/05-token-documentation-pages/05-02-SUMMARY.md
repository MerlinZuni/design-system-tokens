---
phase: 05-token-documentation-pages
plan: 02
subsystem: ui
tags: [storybook, token-data, react-components, dtcg, alias-chain, click-to-copy, typescript]

# Dependency graph
requires:
  - phase: 05-token-documentation-pages
    plan: 01
    provides: SD compound selectors, Storybook Brand/Mode toolbar globals
  - packages: tokens/tokens/primitives/*.tokens.json, tokens/tokens/semantic/**/*.tokens.json
    provides: DTCG JSON source files for parsing

provides:
  - apps/storybook/stories/components/token-data.ts: DTCG JSON parsing utilities and static token data
  - apps/storybook/stories/components/TokenTable.tsx: reusable table with click-to-copy and alias chain
  - apps/storybook/stories/components/AliasChain.tsx: inline alias resolution path display
  - apps/storybook/stories/components/CopyToClipboard.tsx: accessible click-to-copy wrapper
  - apps/storybook/stories/components/SemanticTokenSection.tsx: theme-reactive semantic token display

affects:
  - plans: [05-03, 05-04, 05-05] — all token and styles MDX pages import from this layer

# Tech stack
tech_stack:
  added:
    - React hooks (useState, useCallback) for CopyToClipboard state management
    - navigator.clipboard API for clipboard writes
  patterns:
    - DTCG JSON tree walking via recursive flattenTokens/flattenSemanticTokens
    - Alias chain resolution: strip braces, walk primitive JSON, return [semantic, primitive, raw]
    - Conditional useGlobals import with require() try/catch for Storybook runtime resilience
    - Static pre-computed data exports computed at module load time (no runtime dynamic imports)

# Key files
key_files:
  created:
    - apps/storybook/stories/components/token-data.ts
    - apps/storybook/stories/components/TokenTable.tsx
    - apps/storybook/stories/components/AliasChain.tsx
    - apps/storybook/stories/components/CopyToClipboard.tsx
    - apps/storybook/stories/components/SemanticTokenSection.tsx
  modified: []

# Key decisions
decisions:
  - flattenSemanticTokens skips non-string $value nodes (shadow aliases pointing to elevation composites) — avoids invalid SemanticTokenRow for tokens like shadow.sm -> {elevation.sm}
  - SemanticTokenSection uses require() try/catch to import useGlobals — safer than static import for monorepo Storybook resolution
  - TokenTable renders dash placeholder (—) in alias chain column for non-semantic rows when showAliasChain is true
  - PRIMITIVE_DATA combines color + spacing + elevation for alias resolution coverage across all semantic token categories

# Metrics
metrics:
  duration: ~5 minutes
  completed_date: 2026-03-23T10:23:54Z
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 0
---

# Phase 5 Plan 02: Shared Token Visualization Components Summary

**One-liner:** DTCG JSON parsing utilities and five React components forming the shared data and UI layer consumed by all token documentation pages.

## What Was Built

### Task 1: token-data.ts

Central data layer for all token documentation pages. Parses all nine DTCG JSON files (5 primitive + 4 semantic) at module load time and exports pre-computed typed data.

**Interfaces exported:**
- `TokenRow` — primitive token row with name, cssVar, rawValue, description
- `SemanticTokenRow extends TokenRow` — adds alias, primitiveRef, primitiveCssVar
- `TypographyTokenRow` — composite typography with 5 sub-property CSS var names and raw values
- `ElevationTokenRow` — shadow levels with ShadowLayer[] and pre-assembled boxShadowString
- `ShadowLayer` — individual shadow component (color, offsetX, offsetY, blur, spread)

**Functions exported:**
- `tokenPathToCssVar(path, prefix)` — "color.brand.500" -> "--dsx-color-brand-500"
- `resolveAliasChain(semanticName, alias, primitiveData)` — returns [semantic, primitive, raw] chain
- `flattenTokens(obj, parentPath)` — recursive DTCG tree walker for primitive tokens
- `getPrimitiveColorTokens()` — all color scales (11 hues x 9-13 steps)
- `getPrimitiveSpacingTokens()` — 34 spacing steps sorted numerically
- `getPrimitiveTypographyTokens()` — 13 typography scale steps with all 5 sub-properties
- `getPrimitiveElevationTokens()` — none/sm/md/lg/xl with boxShadowString
- `getSemanticTokensForTheme(brand, mode)` — brand/mode-keyed semantic token lookup with alias resolution
- `SEMANTIC_TOKEN_SETS` — keyed record of all 4 semantic JSON objects
- `BREAKPOINTS` — TypeScript breakpoint constants { sm: '640px', ... '2xl': '1536px' }
- `PRIMITIVE_SPACING`, `PRIMITIVE_TYPOGRAPHY`, `SHADOW_LAYERS` — static pre-computed exports

### Task 2: Shared UI Components

**CopyToClipboard.tsx** — Accessible click-to-copy span wrapper. Uses `navigator.clipboard.writeText`, 300ms `var(--dsx-color-highlight-selected)` background flash, `role="button"`, `tabIndex={0}`, `onKeyDown` Enter support, `aria-live="polite"` screen reader feedback.

**AliasChain.tsx** — Inline resolution path display. Renders `semantic.token → primitive.token → #rawvalue` with Unicode U+2192 arrows styled `var(--dsx-color-action-default)`. Monospace font, `var(--dsx-color-surface-panel)` background pill.

**TokenTable.tsx** — Full-featured tabular token display. Columns: [Preview?] | Token Name | CSS Variable | Value | [Alias Chain?] | Description. All value cells wrapped in `<CopyToClipboard>`. Alternating row backgrounds. Empty state with "No tokens in this category" message. Optional `renderPreview` prop for visual swatches.

**SemanticTokenSection.tsx** — Theme-reactive component that reads `brand`/`mode` from Storybook globals via `useGlobals` (with `require()` try/catch for build resilience). Filters semantic tokens by `prefix` prop and renders `<TokenTable showAliasChain={true}>`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SemanticTokenSection useGlobals import made resilient**
- **Found during:** Task 2 implementation
- **Issue:** `useGlobals` from `@storybook/preview-api` may fail to resolve in the Storybook 10 monorepo setup (precedent: STATE.md decision about `context.globals` vs `useGlobals`)
- **Fix:** Used `require()` inside a try/catch at module level instead of static import
- **Files modified:** apps/storybook/stories/components/SemanticTokenSection.tsx

**2. [Rule 2 - Missing handling] flattenSemanticTokens skips non-string aliases**
- **Found during:** Task 1 implementation
- **Issue:** Semantic tokens like `shadow.sm -> {elevation.sm}` have elevation composite as their primitive reference, which would produce invalid SemanticTokenRow
- **Fix:** Added `typeof rawAlias !== 'string'` guard to skip these nodes
- **Files modified:** apps/storybook/stories/components/token-data.ts

## Self-Check: PASSED

Files verified:
- FOUND: apps/storybook/stories/components/token-data.ts
- FOUND: apps/storybook/stories/components/TokenTable.tsx
- FOUND: apps/storybook/stories/components/AliasChain.tsx
- FOUND: apps/storybook/stories/components/CopyToClipboard.tsx
- FOUND: apps/storybook/stories/components/SemanticTokenSection.tsx

Commits verified:
- 5e19bee — feat(05-02): token-data.ts — DTCG JSON parsing, alias chain resolution, all primitive and semantic data exports
- 9dfe8be — feat(05-02): shared UI components — TokenTable, AliasChain, CopyToClipboard, SemanticTokenSection
