# Milestones

## v1.0 Token Foundation + Storybook Documentation (Shipped: 2026-03-23)

**Phases completed:** 6 phases, 16 plans, 37 tasks

**Key accomplishments:**

- npm workspaces monorepo with Turborepo v2 task pipeline, tsup dual ESM+CJS builds for @design-system-x/tokens and @design-system-x/primitives, both producing dist/ artifacts in correct dependency order
- ESLint 9 flat config with typescript-eslint v8 projectService, Storybook 10.3.1 react-vite with addon-a11y + react-docgen-typescript, and Changesets with public scoped package access
- Style Dictionary v4 build pipeline wired into packages/tokens with Turborepo intra-package ordering, tokens-studio preprocessor, and tsup clean-bug fix
- 5 DTCG JSON token source files authored (color/spacing/typography/elevation/grid) with 231 CSS custom properties in dist/css/tokens.css and TypeScript breakpoint constants in dist/index.js
- 4 DTCG semantic JSON files + SD multi-instance loop producing 5 CSS files: teal parent-brand (light/:root, dark/brand-tinted), navy/slate child-brand (light, dark/neutral-only) with primitive CSS unchanged
- Tokens Studio Pro GitHub sync configured with Folder/DTCG storage and $themes.json-driven bootstrap push created Figma Semantic Variable Collection — 226 variables across 4 brand x mode combinations with round-trip sync verified
- @storybook/addon-designs registered, token CSS globally imported in preview.tsx with decorator and storySort, monorepo build passing clean
- Three Storybook MDX documentation pages (Introduction, Design Purpose, Design Principles) with token-first placeholder content and correct storySort wiring
- Compound [data-brand][data-theme] CSS selectors output by Style Dictionary, with Storybook Brand + Mode toolbar dropdowns driving live theme switching via data attributes on the HTML element
- One-liner:
- One-liner:
- ElevationCard and BreakpointRuler visualization components with Elevation.mdx (shadow cards, CSS var table, semantic section via SemanticTokenSection) and Grid.mdx (proportional ruler, TS constant reference, no semantic tier)
- Five Styles/ sub-pages delivering composed design pattern specimens — heading hierarchy h1-h6, body text variants, surface cards, interactive state buttons, and feedback alerts — all using semantic CSS variables that live-update with the Brand/Mode theme switcher.
- 6 primitive React components (Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden) with typed props and barrel exports, plus BREAKPOINTS token import fix and theme-reactive StylesTokenTable replacing static token tables in all 5 Styles pages
- 12 Storybook files (6 CSF story files + 6 MDX docs) for all primitive components, covering all variants via Controls and Autodocs, with Figma embed placeholders in each MDX doc
- @figma/code-connect installed, 6 colocated .figma.tsx Code Connect files with placeholder node IDs and prop mappings ready for real Figma node IDs, plus RELEASE_CHECKLIST.md documenting the full v1.0 publish workflow

---
