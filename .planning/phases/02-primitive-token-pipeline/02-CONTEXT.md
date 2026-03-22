# Phase 2: Primitive Token Pipeline - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Define all primitive (Tier 1) tokens in W3C DTCG format and establish the Style Dictionary v4 build pipeline. Output: CSS custom properties + TypeScript constants consumed by all downstream phases. No semantic aliases here — raw values only.

</domain>

<decisions>
## Implementation Decisions

### Color palette
- **D-01:** Token values come from the Figma file — do not invent values; read from Figma source
- **D-02:** In addition to brand palette colors, define standard interface hues as primitives: red, green, yellow, blue, orange, purple — each at multiple steps (e.g. 50, 100, 200, 300, 400, 500, 600, 700, 800, 900). These are raw primitive values; semantic aliasing (`error`, `success`, `warning`, `info`) happens in Phase 3
- **D-03:** Naming: `color.{hue}.{step}` — e.g. `color.red.500`, `color.green.100`, `color.brand.500`

### Spacing scale
- **D-04:** Values come from the Figma file
- **D-05:** Naming follows Tailwind convention: `spacing.0`, `spacing.0.5`, `spacing.1`, `spacing.1.5`, `spacing.2` … `spacing.96` (Tailwind's full spacing scale)
- **D-06:** Output as CSS custom properties (`--spacing-1`, `--spacing-2`, etc.) — dimension values in `rem` or `px` as defined in Figma

### Typography — fonts
- **D-07:** Primary font: **Archivo** — sourced from Google Fonts, already in Figma file
- **D-08:** Variable font alternative: **Inter** — most widely used open-source variable sans-serif (SIL OFL). Included alongside Archivo to demonstrate the structural difference in token and CSS setup:
  - Archivo (static): one `@font-face` declaration per weight, discrete weight values (400, 500, 700)
  - Inter Variable: single `@font-face` with `font-weight: 100 900` range, any integer weight valid (e.g. 450), uses `font-variation-settings` for fine-tuning
- **D-09:** Both fonts defined as `fontFamily` tokens — Archivo as `font.family.default`, Inter as `font.family.variable` — so the token file is self-documenting on the difference

### Typography — scale
- **D-10:** Scale values come from the Figma file
- **D-11:** Full range desired: display/hero sizes through captions/labels — if Figma file does not cover the full range, supplement with Tailwind's complete type scale
- **D-12:** Step naming follows Tailwind convention: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`, `text-7xl`, `text-8xl`, `text-9xl`
- **D-13:** Composite typography tokens (font-size + line-height + font-weight + letter-spacing per step) authored in Tokens Studio directly — Figma Variables do not support composite types
- **D-14:** Token path: `typography.{step}` — e.g. `typography.text-xl.$value` contains the composite object

### Grid and breakpoints
- **D-15:** Values come from the Figma Grids page
- **D-16:** Standard web breakpoints: `sm`, `md`, `lg`, `xl`, `2xl` (Tailwind convention)
- **D-17:** Breakpoints output as TypeScript constants only — NOT CSS custom properties, because `px` values cannot be used inside `@media` queries via `var()`
- **D-18:** Token path: `grid.breakpoint.{name}` — e.g. `grid.breakpoint.lg`

### Elevation
- **D-19:** Shadow values come from the Figma file
- **D-20:** Composite shadow tokens authored in Tokens Studio directly — box-shadow values per elevation level
- **D-21:** Token path: `elevation.{level}` — naming TBD from Figma file (likely numeric 0–5 or named none/sm/md/lg/xl)

### Style Dictionary build integration
- **D-22:** Style Dictionary v4 runs as a separate `build:tokens` script in `packages/tokens/` — it is NOT integrated into tsup. tsup handles TypeScript transpilation; SD handles token transformation. Both run under the `build` turbo task
- **D-23:** `outputReferences: true` on all CSS platforms — preserves alias chain as `var()` references in Phase 3 semantic tokens
- **D-24:** Phase 2 outputs: one CSS file (`dist/css/tokens.css`) + one TypeScript constants file (`dist/index.js`) for breakpoints. Phase 3 will add per-brand per-mode CSS files

### Claude's Discretion
- Exact numeric values for standard interface hues (red.500 etc.) if not in Figma — use Tailwind's default palette as reference
- Fallback type scale steps if Figma file does not cover the full Tailwind range
- Number and naming of elevation levels if not clearly specified in Figma
- Step count for interface color hues (whether to include 50 and 950 endpoints)

</decisions>

<specifics>
## Specific Ideas

- "Standard interface colors" (Error/Success/Warning/Info) must exist as primitive hues so Phase 3 semantic tokens can alias them — e.g. `color.background.error → {color.red.500}`
- Tailwind naming convention is the anchor for both spacing and typography step names — consistency across both categories matters
- The Archivo vs Inter comparison in the token file is intentional documentation: the goal is to understand what switching to a variable font entails structurally, not just use whichever is easier

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Token research (architecture and format)
- `.planning/research/TOKENS.md` — DTCG format spec, Style Dictionary v4 config patterns, composite token structure, `outputReferences` behavior, Tokens Studio Pro sync format

### Figma design source
- Figma file (accessed via Figma MCP) — canonical source for all token values: color palette, spacing scale, typography scale, grid/breakpoints, elevation shadows. Read before authoring any token JSON.

### Project requirements
- `.planning/REQUIREMENTS.md` — TOKEN-01 through TOKEN-10 define what must be satisfied; cross-check all outputs against these IDs

### Phase 1 scaffolding (integration points)
- `packages/tokens/package.json` — existing exports map (`"."` for TS, `"./css"` for CSS); Style Dictionary output must land at `dist/css/tokens.css` to match the pre-wired `./css` export
- `packages/tokens/src/index.ts` — currently empty barrel; Phase 2 populates this with TypeScript token exports (breakpoints constants)

### No external spec docs
No ADRs or external feature docs beyond the above — requirements are fully captured in decisions above and REQUIREMENTS.md.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/tokens/package.json` exports map: `"./css": "./dist/css/tokens.css"` is already wired — SD output path is pre-determined, do not change it
- `packages/tokens/src/index.ts`: empty `export {}` barrel — replace with TypeScript breakpoint constants export

### Established Patterns
- All packages use `"type": "module"` — Style Dictionary config must be `style-dictionary.config.mjs` (ESM), not `.js` or `.cjs`
- Turborepo `tasks.build` in `turbo.json` runs `tokens#build` before `primitives#build` — Style Dictionary must complete within the `tokens` build step for downstream packages to see outputs
- `tsconfig.base.json` uses `"moduleResolution": "Bundler"` — TypeScript constants exported from `packages/tokens` will be consumed by bundler-aware tools

### Integration Points
- Phase 4 (Storybook Foundation) imports `@design-system-x/tokens/css` in `.storybook/preview.ts` — the `./css` export must resolve to a valid CSS file after this phase
- Phase 3 (Semantic Tokens) will reference primitive token values using DTCG `{color.blue.500}` alias syntax — primitive token names established here are permanent; renaming later breaks semantic aliases

</code_context>

<deferred>
## Deferred Ideas

- Semantic color aliases (error, success, warning, info mapped to primitive hues) — Phase 3
- Multi-brand and dark/light mode token sets — Phase 3
- CSS custom property import in Storybook — Phase 4
- Font loading strategy (`<link>` preconnect, `font-display: swap`, self-hosting vs CDN) — Phase 4 when fonts are first consumed in Storybook

</deferred>

---

*Phase: 02-primitive-token-pipeline*
*Context gathered: 2026-03-22*
