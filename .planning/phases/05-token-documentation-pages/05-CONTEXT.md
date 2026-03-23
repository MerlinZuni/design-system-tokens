# Phase 5: Token Documentation Pages - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the visual token reference pages in Storybook (Color, Typography, Spacing, Elevation, Grid/Breakpoints), a Styles section showing composed design patterns, and a brand x mode theme switcher toolbar. This is the "living style guide" that makes the token system legible to designers and developers.

Requirements: STORY-04, STORY-05, STORY-06, STORY-07, STORY-08, STORY-09

</domain>

<decisions>
## Implementation Decisions

### Theme Switcher

- **D-01:** Brand switching uses data attributes — `[data-brand="parent"]`, `[data-brand="child"]` on the root element. SD config must be updated to output brand-scoped selectors.
- **D-02:** Mode switching uses data attributes — `[data-theme="light"]`, `[data-theme="dark"]`. Light mode moves OFF `:root` to explicit `[data-theme="light"]` — no implicit defaults, tokens only apply when both `data-brand` and `data-theme` are set.
- **D-03:** Storybook toolbar has two separate dropdowns — one for Brand (parent, child), one for Mode (light, dark). Independent controls.
- **D-04:** Default state: Brand = parent, Mode = light (matches current preview.tsx import).
- **D-05:** Theme selection is global and persistent — once a theme is selected, ALL pages (token pages, styles pages, future component stories) use that theme until explicitly changed.

### Token Page Information Density

- **D-06:** Full detail on all token pages — every token shows: visual representation + token name + CSS variable name + raw value + alias chain (for semantic tokens, full resolution path e.g. `color.background.default → color.neutral.0 → #ffffff`).
- **D-07:** All five token categories (color, typography, spacing, elevation, breakpoints) follow the same "show everything" principle. No lighter treatment for simpler categories.
- **D-08:** Token pages show both primitive AND semantic tokens on the same page — primitives at top, semantic mappings with alias chains below. One page per category.
- **D-09:** Token pages respond to the theme switcher — semantic sections live-update to show different alias chains and resolved values per brand/mode combination.

### Styles/Composed Section

- **D-10:** Five composition categories in v1: heading hierarchy (h1-h6), body text variants (body, caption, overline, label), surface/card patterns (background + border + elevation), interactive states (default, hover, active, focus, disabled), feedback patterns (success, warning, error, info).
- **D-11:** Styles section is split into sub-pages matching the Figma file page structure — not a single overview page.
- **D-12:** Styles pages respond to the global theme switcher (same as token pages — D-05 applies).
- **D-13:** Full token reference detail on Styles pages — each composition shows the visual result AND lists every token being used with CSS variable names.

### Claude's Discretion

- Custom React component implementation for token visualizations (spacing bars, elevation cards, typography specimens, breakpoint rulers)
- Loading skeleton and error state design
- Exact Styles sub-page naming and sidebar ordering (should mirror Figma file structure)
- ColorPalette/ColorItem usage from @storybook/blocks vs custom components — whichever produces the required detail level
- Storybook globalTypes configuration for the toolbar dropdowns
- How to dynamically swap CSS imports or apply data attributes in the Storybook decorator

</decisions>

<specifics>
## Specific Ideas

- Styles sub-pages should match how they are broken into pages in the Figma file
- Token pages double as a live debugging tool — switching themes shows exactly how semantic tokens re-resolve across brand/mode combinations
- The alias chain display (D-06) is critical for traceability — designers and developers should be able to trace any semantic token back through the full resolution path

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Token architecture
- `packages/tokens/style-dictionary.config.mjs` — Current SD config with `:root`/`[data-theme="dark"]` selectors that must be refactored to `[data-brand][data-theme]` selectors (D-01, D-02)
- `packages/tokens/tokens/$themes.json` — Tokens Studio Pro theme/mode mapping (4 combinations)
- `packages/tokens/package.json` — Exports map for CSS imports (`./css`, `./parent-brand/light`, etc.)

### Token source files
- `packages/tokens/tokens/primitives/*.tokens.json` — 5 primitive token files (color, spacing, typography, elevation, grid)
- `packages/tokens/tokens/semantic/{brand}/{mode}.tokens.json` — 4 semantic token files with alias syntax

### Storybook setup
- `apps/storybook/.storybook/main.ts` — Storybook 10 config with addon-designs, react-docgen-typescript
- `apps/storybook/.storybook/preview.tsx` — Current decorator and CSS imports (must be updated for theme switcher)
- `apps/storybook/stories/` — Existing MDX pages (Introduction, DesignPurpose, DesignPrinciples)

### Prior phase decisions
- `.planning/STATE.md` §Decisions — Full decision log including SD config patterns, CSS selector choices, tsup/SD interaction

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@storybook/blocks` — `ColorPalette`/`ColorItem` components available for color page (may need custom wrapper for full detail level)
- `@design-system-x/tokens` — TypeScript breakpoint constants exported from `dist/index.js` (use for breakpoints page)
- Semantic token JSON files — alias syntax (`{color.neutral.0}`) can be parsed to build alias chain displays

### Established Patterns
- SD `token.isSource` filter — separates semantic output from included primitives; same pattern needed if token pages read build metadata
- `@tokens-studio/sd-transforms` preprocessor — already handles composite token expansion (typography, elevation)
- MDX pages use nested folder structure for sidebar grouping (e.g., `Introduction/DesignPurpose.mdx` with Meta title slash notation)

### Integration Points
- `preview.tsx` decorator — must be refactored to apply `data-brand` and `data-theme` attributes from globalTypes instead of static CSS import
- `style-dictionary.config.mjs` — selector output must change from `:root`/`[data-theme="dark"]` to `[data-brand="X"][data-theme="Y"]` compound selectors
- `turbo.json` — may need updated outputs if SD generates differently-named files
- Storybook `storySort` in preview.tsx — already has Tokens and Styles slots in the ordering

</code_context>

<deferred>
## Deferred Ideas

- Component-level token documentation (component tokens are Phase 6 / v2 scope)
- Figma frame embeds in token pages via addon-designs (no Figma frame URLs available yet — Phase 6 handles Figma integration)
- Automated token diff / changelog page (backlog idea)

</deferred>

---

*Phase: 05-token-documentation-pages*
*Context gathered: 2026-03-23*
