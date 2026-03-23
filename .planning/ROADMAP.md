# Roadmap: Design System X

**Milestone:** v1.0 — Token Foundation + Storybook Documentation
**Created:** 2026-03-22
**Goal:** Stable, multi-brand, multi-mode token system with a live Storybook documentation site and Figma bidirectional integration.

---

## Phase 1 — Monorepo Foundation

**Goal:** Scaffold the project structure that all subsequent phases build on. This must be done first — restructuring mid-project is painful.

**Requirements covered:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Root workspace + package scaffolding (tokens, primitives, Turborepo, TypeScript)
- [x] 01-02-PLAN.md — Storybook, ESLint, and Changesets setup

### Tasks

1. Initialize root `package.json` with npm workspaces pointing to `packages/*` and `apps/*`
2. Install and configure Turborepo (`turbo.json`) with task pipeline: `build`, `dev`, `lint`, `test`
3. Create `packages/tokens/` — bare package with `package.json`, `tsconfig.json`, tsup config (dual ESM+CJS, `.d.ts` output)
4. Create `packages/primitives/` — bare React + TypeScript package with tsup config; add `tokens` as dependency
5. Create `apps/storybook/` — bare Storybook workspace (no stories yet)
6. Create `tsconfig.base.json` at root with strict TypeScript settings; extend in each package
7. Configure ESLint flat config at root; extend in each package
8. Initialize Changesets: `changeset init`, configure `.changeset/config.json` for workspace-aware versioning
9. Set up `turbo.json` task dependency: `primitives#build` depends on `tokens#build`
10. Add root `package.json` scripts: `build`, `dev`, `lint`, `changeset`

**Verification:** `turbo run build` completes without errors across all packages. Changesets `changeset status` runs cleanly.

---

## Phase 2 — Primitive Token Pipeline

**Goal:** Define all primitive (Tier 1) tokens in DTCG format and establish the Style Dictionary v4 build pipeline outputting CSS custom properties and TypeScript.

**Requirements covered:** TOKEN-01, TOKEN-02, TOKEN-03, TOKEN-04, TOKEN-05, TOKEN-09

**Plans:** 2/2 plans executed

Plans:
- [x] 02-01-PLAN.md — Style Dictionary infrastructure (install, config, turbo wiring, tsup fix, index.ts barrel)
- [x] 02-02-PLAN.md — Author 5 primitive token JSON files from Figma and verify build outputs

### Tasks

1. Install Style Dictionary v4 in `packages/tokens/`
2. Create `src/tokens/primitive/color.tokens.json` — full color palette in DTCG format (`color.blue.500`, `color.neutral.100`, etc.)
3. Create `src/tokens/primitive/spacing.tokens.json` — spacing scale in DTCG format (`spacing.1`, `spacing.2`, ..., `spacing.16`, etc.)
4. Create `src/tokens/primitive/grid.tokens.json` — breakpoint values as DTCG `dimension` type; note these require TypeScript output, not CSS custom properties
5. Create `src/tokens/primitive/typography.tokens.json` — composite typography tokens authored for Tokens Studio (font-family, font-size, font-weight, line-height, letter-spacing per scale step)
6. Create `src/tokens/primitive/elevation.tokens.json` — composite shadow tokens authored for Tokens Studio (box-shadow values per elevation level)
7. Configure `style-dictionary.config.mjs` — ESM config with:
   - CSS custom properties platform (`outputReferences: true`) for color, spacing, typography, elevation
   - TypeScript/JS constants platform for grid/breakpoints
8. Wire Style Dictionary build into tsup config so `turbo run build` in `tokens` package generates all outputs
9. Verify CSS output: `--color-blue-500`, `--spacing-4`, `--elevation-shadow-2`, etc.
10. Verify TypeScript output: `breakpoints.sm`, `breakpoints.md`, `breakpoints.lg`, etc. with correct types

**Verification:** `packages/tokens/dist/` contains CSS custom property file and TypeScript constants file. All 5 primitive categories are represented. Token names follow `category.property.modifier` convention throughout.

---

## Phase 3 — Semantic Tokens & Figma Pipeline

**Goal:** Define Tier 2 semantic tokens with full multi-brand and light/dark mode support. Establish Figma Variables as the canonical source and configure the Tokens Studio Pro sync.

**Requirements covered:** TOKEN-06, TOKEN-07, TOKEN-08, TOKEN-10, FIGMA-01, FIGMA-02, FIGMA-03

**Plans:** 2/2 plans complete

Plans:
- [x] 03-01-PLAN.md — Semantic token authoring (4 brand x mode JSON files), SD multi-instance loop, package exports
- [x] 03-02-PLAN.md — Figma pipeline: Tokens Studio Pro sync + Variable Collection bootstrap

### Tasks

1. Update primitive color scales: replace brand (violet placeholder) with teal scale (#4FC4C4), add secondary (purple #5944af), add slate (child-brand #1C1C28)
2. Author 4 semantic token JSON files (parent-brand/light, parent-brand/dark, child-brand/light, child-brand/dark) with full vocabulary (D-07, D-08)
3. Create $themes.json for Tokens Studio Pro theme mapping
4. Refactor style-dictionary.config.mjs to multi-instance loop: one SD instance per brand x mode combination (TOKEN-10)
5. Update package.json exports map with 4 new CSS paths
6. Update turbo.json build:tokens outputs for new CSS paths
7. Configure Tokens Studio Pro GitHub sync (manual — requires GitHub remote + PAT)
8. Push semantic tokens from code to Figma via Tokens Studio Pro (bootstrap per D-15)
9. Verify Figma Semantic Variable Collection has 4 modes
10. Verify round-trip sync: Figma edit -> Push to GitHub -> Pull back

**Verification:** `dist/` contains per-brand per-mode CSS files. Switching CSS file at runtime changes all semantic tokens. No hardcoded values in semantic token files — all are aliases. Figma Semantic collection has 4 modes. Tokens Studio Pro round-trip sync works.

---

## Phase 4 — Storybook Foundation

**Goal:** Configure Storybook 10 with addon-designs, import token CSS outputs into preview, establish sidebar sort order, and create Introduction/Design Purpose/Design Principles MDX pages. Verify Figma has matching documentation pages.

**Requirements covered:** STORY-01, STORY-02, STORY-03, STORY-13, STORY-14, FIGMA-06

**Plans:** 2/2 plans complete

Plans:
- [x] 04-01-PLAN.md — Storybook config: addon-designs, preview.tsx with CSS imports + decorator + storySort
- [x] 04-02-PLAN.md — Introduction MDX pages (Introduction, Design Purpose, Design Principles) + Figma page checkpoint

### Tasks

1. Install Storybook 8 in `apps/storybook/`: `@storybook/react-vite`, `@storybook/addon-essentials`, `@storybook/addon-designs`, `@storybook/addon-a11y`
2. Configure `main.ts`:
   - `framework: '@storybook/react-vite'`
   - `reactDocgen: 'react-docgen-typescript'` for full TypeScript prop inference
   - Register all addons
3. Configure `preview.ts`:
   - Import CSS custom property output from `@design-system-x/tokens` (primitive + default brand/light mode)
   - Set global decorator for consistent story background
4. Configure `storySort` in `preview.ts`: Introduction → Design Purpose → Design Principles → Tokens → Styles → Primitives
5. Create Introduction MDX page (`Introduction.mdx`) — project overview, links to Figma, how to use the system
6. Create Design Purpose MDX page (`Introduction/DesignPurpose.mdx`) — clearly stated reason the digital platform/product exists
7. Create Design Principles MDX page (`Introduction/DesignPrinciples.mdx`) — key values as a capitalized Word followed by a definition, capturing what good design means for the project
8. Create corresponding Figma pages: "Design Purpose" and "Design Principles" — mirror the Storybook MDX content so Figma file and Storybook are in sync (FIGMA-06)
9. Verify: `turbo run dev` in `apps/storybook` starts Storybook with no errors and CSS variables are available in browser DevTools

**Verification:** Storybook runs. Sidebar shows Introduction → Design Purpose → Design Principles. CSS custom properties (`--dsx-color-brand-500`, etc.) are visible in browser DevTools. Addon panels (Designs, A11y, Controls) appear. Figma file has matching Design Purpose and Design Principles pages.

---

## Phase 5 — Token Documentation Pages

**Goal:** Build the visual token reference pages in Storybook — the "living style guide" that makes the token system legible to designers and developers. Includes SD selector refactor for multi-brand theming, theme switcher toolbar, 5 token category pages, and 5 styles composition pages.

**Requirements covered:** STORY-04, STORY-05, STORY-06, STORY-07, STORY-08, STORY-09

**Plans:** 5/5 plans executed — COMPLETE

Plans:
- [x] 05-01-PLAN.md — SD selector refactor (compound [data-brand][data-theme]) + preview.tsx theme switcher
- [x] 05-02-PLAN.md — Shared visualization components (TokenTable, AliasChain, CopyToClipboard) + token-data utilities
- [x] 05-03-PLAN.md — Token pages: Colors, Typography, Spacing (STORY-04, STORY-05, STORY-06)
- [x] 05-04-PLAN.md — Token pages: Elevation, Grid/Breakpoints (STORY-07, STORY-08)
- [x] 05-05-PLAN.md — Styles sub-pages: Headings, Body Text, Surfaces, Interactive States, Feedback (STORY-09)

### Tasks

1. **Color page** (`Tokens/Colors.mdx`): Use `ColorPalette` and `ColorItem` blocks from `@storybook/blocks` to display the full color palette with hex values, token names, and CSS variable names
2. **Typography page** (`Tokens/Typography.mdx`): Custom React component rendering each type scale step (font family, size, weight, line-height, letter-spacing) using CSS variables
3. **Spacing page** (`Tokens/Spacing.mdx`): Custom React component rendering a visual scale — horizontal bars representing each spacing step with pixel value and token name labels
4. **Elevation page** (`Tokens/Elevation.mdx`): Custom React component rendering cards at each elevation level showing the shadow visually with shadow value and token name
5. **Grid/Breakpoints page** (`Tokens/Grid.mdx`): Custom React component showing breakpoint ranges as a visual ruler with values from TypeScript token constants
6. **Styles page** (`Styles/Overview.mdx`): Composed style examples — heading hierarchy, body text variations, surface/background combinations — showing how primitive tokens combine into design patterns
7. Add theme switcher to Storybook toolbar (via `globalTypes`) for toggling between brand × mode combinations

**Verification:** All 5 token category pages render correctly. Theme switcher changes visible colors and styles. Token names and values are accurate and match the DTCG source files.

---

## Phase 6 — Primitive Components & Figma Integration

**Goal:** Build the primitive React components with full Storybook stories, Figma frame embeds, and Code Connect setup. Fix Phase 5 integration wiring gaps. This completes the bidirectional Figma ↔ Storybook integration and closes all v1.0 milestone gaps.

**Requirements covered:** STORY-10, STORY-11, STORY-12, FIGMA-04, FIGMA-05

**Gap closure:** Closes all 5 unsatisfied requirements + 2 integration fixes from v1.0 audit

**Plans:** 1/3 plans executed

Plans:
- [x] 06-01-PLAN.md — Integration fixes (BREAKPOINTS import, theme-reactive Styles pages) + all 6 component implementations
- [ ] 06-02-PLAN.md — Storybook stories + MDX documentation for all 6 primitives with Figma embeds
- [ ] 06-03-PLAN.md — Figma Code Connect .figma.tsx files + release checklist

### Tasks

1. Define primitive component set in `packages/primitives/src/`:
   - `Text` — typography component with variant prop mapping to type scale tokens
   - `ColorSwatch` — displays a color token visually (used in docs, not production UI)
   - `Surface` — semantic background/border/shadow using elevation and color tokens
   - `Stack` / `Inline` — layout primitives using spacing tokens
   - `VisuallyHidden` — accessibility primitive
2. Write TypeScript interfaces for each component with JSDoc comments (powers Autodocs props tables)
3. Write Storybook stories for each component:
   - All variants and states as named stories
   - Controls wired to all props
   - `satisfies Meta<typeof Component>` pattern (not `as`)
4. Write MDX documentation file per component:
   - Usage guidelines
   - `<Canvas>` embed of primary story
   - `<ArgTypes>` (Autodocs props table)
   - `<Figma>` embed from `@storybook/addon-designs` (requires Figma frame URL)
5. Set up Figma Code Connect:
   - Create `.figma.tsx` colocated with each component
   - Link to master Figma component node ID (not instances)
   - Map Figma property enums to React prop values (case-sensitive)
6. Publish Code Connect: `npx @figma/code-connect publish` (manual step; add to release checklist)
7. Write release checklist documenting: `changeset` → `changeset version` → `turbo run build` → Code Connect publish → npm publish
8. **Integration fix:** Import BREAKPOINTS from `@design-system-x/tokens` in `token-data.ts` instead of hardcoded values; remove unused `primitiveGrid` import
9. **Integration fix:** Make Styles page TokenTable rows theme-reactive by using `getSemanticTokensForTheme()` instead of hardcoded parent-brand/light rawValues

**Verification:** Each primitive has stories covering all states. Props tables auto-populate from TypeScript. Figma frames visible in Designs panel in Storybook. Code Connect shows component code in Figma Dev Mode. BREAKPOINTS sourced from package. Styles page TokenTable updates with theme switcher.

---

## Milestone Summary

| Phase | Name | Requirements | Status |
|-------|------|-------------|--------|
| 1 | Monorepo Foundation | INFRA-01--06 | ✓ Complete |
| 2 | Primitive Token Pipeline | TOKEN-01--05, TOKEN-09 | ✓ Complete |
| 3 | Semantic Tokens & Figma Pipeline | Complete    | 2026-03-22 |
| 4 | 2/2 | Complete   | 2026-03-22 |
| 5 | Token Documentation Pages | STORY-04--09 | ✓ Complete |
| 6 | 1/3 | In Progress|  |

**Total v1 requirements:** 30 | **Phases:** 6 | **All requirements mapped** ✓

---

## Key Dependencies

```
Phase 1 (Monorepo)
    ↓
Phase 2 (Primitive Tokens) — depends on tokens package from Phase 1
    ↓
Phase 3 (Semantic + Figma) — depends on primitive tokens from Phase 2
    ↓
Phase 4 (Storybook Foundation) — depends on token CSS output from Phase 2/3
    ↓
Phase 5 (Token Docs) — depends on Storybook from Phase 4
    ↓
Phase 6 (Primitive Components) — depends on all token tiers and Storybook setup
```

---
*Roadmap created: 2026-03-22*
*Last updated: 2026-03-23 — Phase 6 planned: 3 plans in 2 waves*
