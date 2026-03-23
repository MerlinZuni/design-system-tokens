# Phase 6: Primitive Components & Figma Integration - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the primitive React components (Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden) with full Storybook stories, MDX documentation with Figma frame embeds, and Figma Code Connect setup. Fix 2 Phase 5 integration wiring gaps (BREAKPOINTS import, Styles page theme reactivity). This completes all v1.0 milestone requirements.

Requirements: STORY-10, STORY-11, STORY-12, FIGMA-04, FIGMA-05

</domain>

<decisions>
## Implementation Decisions

### Story & Documentation Structure
- **D-01:** Each component gets a colocated pair: `.stories.tsx` (variants/controls) + `.mdx` (usage guidelines, Canvas embed, ArgTypes, Figma embed). All files live under `stories/Primitives/`.
- **D-02:** Stories use `satisfies Meta<typeof Component>` pattern (not `as`) for type-safe story definitions. Each story file exports named stories for all variants/states.
- **D-03:** MDX docs include: purpose/when-to-use section, `<Canvas>` embeds of primary + variant stories, `<ArgTypes>` props table, `<Figma>` embed from addon-designs with real Figma frame URLs.
- **D-04:** No per-story decorators — rely on the existing global `withThemeAttributes` decorator in `preview.tsx`. Components use CSS vars that are already set globally via `data-brand`/`data-theme`.
- **D-05:** Stories tagged with `['autodocs']` in meta for automatic docs generation alongside the manual MDX page.

### Figma Integration
- **D-06:** Figma frame URLs will be provided during execution for each component's MDX `<Figma>` embed. User has URLs ready.
- **D-07:** Code Connect `.figma.tsx` files use placeholder node IDs (TODO comments) — user will fill in actual Figma component node IDs from Dev Mode later.
- **D-08:** `.figma.tsx` files are colocated with components inside `packages/primitives/src/{ComponentName}/`. Each component gets its own directory with `Component.tsx`, `Component.figma.tsx`, and `index.ts` re-export.
- **D-09:** Code Connect publish is a manual checklist item: `npx @figma/code-connect publish`. Not automated in CI for v1.

### Component Set & Scope
- **D-10:** All 5 primitives from roadmap are in scope: Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden.
- **D-11:** Stack (vertical) and Inline (horizontal) are two separate components, not a single Flex component. Matches Chakra/Radix conventions.
- **D-12:** Polymorphism via `as` prop is guided by accessibility and SEO — components that benefit from semantic HTML (Text, Stack, Inline, Surface) should support `as` to render correct HTML elements. VisuallyHidden and ColorSwatch likely don't need it.

### Integration Fixes (Gap Closure)
- **D-13:** `token-data.ts` must import BREAKPOINTS from `@design-system-x/tokens` instead of using hardcoded values. Remove unused `primitiveGrid` import.
- **D-14:** Styles page TokenTable rows must be theme-reactive — use `getSemanticTokensForTheme()` with current brand/mode from globals instead of hardcoded parent-brand/light rawValues.

### Claude's Discretion
- Text component variant/prop API design — how variant names map to typography tokens
- Component TypeScript interfaces and JSDoc documentation depth
- Exact CSS var consumption pattern (inline styles vs className composition)
- ColorSwatch component API (token name prop, size variants)
- Surface component props (elevation levels, background/border token mapping)
- Stack/Inline gap prop values and alignment options
- VisuallyHidden implementation approach
- Story variant coverage decisions per component
- MDX usage guideline content and examples

</decisions>

<specifics>
## Specific Ideas

- Components should consume `--dsx-*` CSS custom properties for all visual styling — tokens are the source of truth
- The `as` prop decision is driven by accessibility and SEO: use it where semantic HTML matters (h1-h6, p, section, nav, ul/ol)
- Stack and Inline as separate components makes intent clearer in code — vertical vs horizontal is immediately obvious from the component name
- Release checklist should document the full publish flow: `changeset` → `changeset version` → `turbo run build` → Code Connect publish → npm publish

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Component package
- `packages/primitives/src/index.ts` — Currently empty barrel export; components will be added here
- `packages/primitives/package.json` — Build config (tsup), peer deps (react >=18), internal dep on @design-system-x/tokens
- `packages/primitives/tsup.config.ts` — Dual ESM/CJS output, external react/react-dom

### Token architecture
- `packages/tokens/src/breakpoints.ts` — Auto-generated TypeScript breakpoint constants (GridBreakpointSm etc.)
- `packages/tokens/tokens/primitives/*.tokens.json` — 5 primitive token source files
- `packages/tokens/tokens/semantic/{brand}/{mode}.tokens.json` — 4 semantic token files with alias syntax
- `packages/tokens/package.json` — Exports map for CSS imports

### Storybook setup
- `apps/storybook/.storybook/main.ts` — Storybook 10 config with addon-designs, react-docgen-typescript, autodocs: 'tag'
- `apps/storybook/.storybook/preview.tsx` — withThemeAttributes decorator, Brand/Mode toolbar globals, all 4 semantic CSS imports
- `apps/storybook/stories/Primitives/` — Target directory for component stories + MDX docs

### Existing visualization layer (for integration fixes)
- `apps/storybook/stories/components/token-data.ts` — Token parsing utilities, hardcoded BREAKPOINTS to fix, getSemanticTokensForTheme()
- `apps/storybook/stories/Styles/*.mdx` — Styles pages that need theme-reactive TokenTable rows

### Prior phase decisions
- `.planning/STATE.md` §Decisions — Full decision log including preview.tsx patterns, MDX conventions, CSS selector choices

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `withThemeAttributes` decorator in preview.tsx — already handles brand/mode switching for all stories
- `TokenTable`, `AliasChain`, `CopyToClipboard` components — reusable in component MDX docs if needed
- `getSemanticTokensForTheme()` in token-data.ts — resolves semantic tokens for any brand/mode combination
- `@storybook/addon-designs` v11 — already installed and registered, ready for `<Figma>` embeds

### Established Patterns
- MDX uses `import { Meta } from '@storybook/addon-docs/blocks'` (confirmed for Storybook 10 monorepo)
- Nested sidebar: parent page at `stories/Category.mdx`, children at `stories/Category/Child.mdx` with Meta title slash notation
- `context.globals` in Storybook decorator (not useGlobals hook) — avoids import path ambiguity
- `storySort` in preview.tsx already has `Primitives` slot in the ordering

### Integration Points
- `packages/primitives/src/index.ts` — barrel export where all components are re-exported
- `apps/storybook/stories/Primitives/` — story + MDX files consume components from `@design-system-x/primitives`
- `token-data.ts` BREAKPOINTS — currently hardcoded, must be changed to import from `@design-system-x/tokens`
- Styles MDX pages — TokenTable currently uses static parent-brand/light values, needs globals-aware rendering

</code_context>

<deferred>
## Deferred Ideas

- Application-level components (Button, Input, Modal, etc.) — v2 scope, tokens must be stable first
- Automated Code Connect publish in CI — manual for v1, automate once release cadence is established
- Component tokens (3rd tier) — v2 scope (COMP-05)
- Token diff/changelog page — backlog idea from Phase 5

</deferred>

---

*Phase: 06-primitive-components-figma-integration*
*Context gathered: 2026-03-23*
