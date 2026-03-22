# Design System X

## What This Is

A full design system built for a team, centered on a 3-tier design token architecture (Primitive → Semantic → Component) using a `category.property.modifier` naming convention. Tokens are authored in Figma Variables, synced via Tokens Studio Pro to W3C DTCG-format JSON, and transformed by Style Dictionary into CSS custom properties and TypeScript for consumption by React applications. Storybook serves as the living documentation site with Figma integration.

## Core Value

A single source of truth for all design decisions — tokens defined once in Figma, consumed reliably in code, with Storybook as the living reference that bridges design and development.

## Requirements

### Validated

**Infrastructure (Phase 1 — validated 2026-03-22)**
- [x] npm workspaces monorepo with Turborepo v2 dependency-ordered builds
- [x] `@design-system-x/tokens` package with dual ESM/CJS tsup output
- [x] `@design-system-x/primitives` package with React + TypeScript tsup output
- [x] `apps/storybook` workspace running Storybook 10 (`@storybook/react-vite`)
- [x] Shared `tsconfig.base.json` strict TypeScript config across all packages
- [x] ESLint 9 flat config with `typescript-eslint` v8 `projectService` auto-discovery
- [x] Changesets configured with `access: "public"` for `@design-system-x/*` scoped packages

### Validated

**Primitive Token Pipeline (Phase 2 — validated 2026-03-22)**
- [x] Style Dictionary v4 build pipeline wired into `packages/tokens` (`build:tokens` script, turbo task ordering)
- [x] `@tokens-studio/sd-transforms` preprocessor configured for DTCG input
- [x] 5 DTCG-format primitive token JSON files: color (8 hues × 11 steps), spacing (34 steps), typography (13 composite + 2 font families), elevation (5 levels), grid/breakpoints (5)
- [x] 231 CSS custom properties output to `dist/css/tokens.css` under `--dsx-*` namespace
- [x] TypeScript breakpoint constants exported from `dist/index.js`
- [x] Token files version-controlled alongside code
- [x] `category.property.modifier` naming convention used throughout primitives

### Active

**Token Architecture**
- [ ] Semantic and Component token tiers (Tier 2 and 3) — primitive tier complete
- [ ] Multi-brand + light/dark mode support via Figma Variable Collections and modes

**Figma → Code Pipeline**
- [ ] Figma Variables as design source of truth (placeholder values in `color.brand.*` pending Figma file key)
- [ ] Tokens Studio Pro syncs Figma Variables → W3C DTCG JSON

**Storybook Documentation**
- [ ] Storybook configured for React + TypeScript with Autodocs
- [ ] Token preview pages: color palette, typography scale, spacing scale, elevation, grid/breakpoints
- [ ] Styles preview section showing composed primitive styles
- [ ] Properties preview via Storybook Controls + Autodocs (auto-generated from TypeScript interfaces)
- [ ] Primitive component stories with all states and variants
- [ ] Component MDX documentation files per primitive
- [ ] `@storybook/addon-designs` for Figma frame embedding in stories
- [ ] Figma Code Connect for displaying component code inside Figma Dev Mode

### Out of Scope

- Full application component library (Button, Input, Modal, Form, etc.) — deferred to v2; tokens must be stable first
- Native mobile token outputs (iOS/Android) — deferred to v3+
- Custom documentation site — Storybook fulfills this for v1
- OAuth or user auth of any kind — not applicable to a design system

## Context

- The existing Figma design system was created before Figma introduced Variables and is being used as a starting point for layout reference, not as a source of truth
- Figma Variables (introduced 2023) now support Collections (token tiers) and Modes (themes) natively — this project builds from that foundation
- Tokens Studio Pro is the sync layer between Figma and code; it exports to W3C DTCG format which Style Dictionary v4 supports natively
- The `category.property.modifier` convention in code maps to Figma's `category/property/modifier` slash-separated group naming

## Constraints

- **Token naming**: Must follow `category.property.modifier` — enforced in Figma grouping and Style Dictionary output
- **Figma sync**: Tokens Studio Pro required (paid plugin) — team must have access
- **Stack**: React + TypeScript — component stories and token exports target this environment
- **Token format**: W3C DTCG (Design Tokens Community Group) — ensures forward compatibility with the emerging standard
- **v1 boundary**: Primitive tokens and their Storybook documentation only — no application-level components until tokens are stable

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tokens Studio Pro over Figma REST API | Smoother sync workflow with automatic DTCG export; REST API requires custom scripting | — Pending |
| Style Dictionary v4 | Native DTCG support, active maintenance, widest platform output support | ✓ Validated Phase 2 |
| Storybook over custom docs site | Faster to ship, industry standard, Figma addon ecosystem, Autodocs removes manual work | — Pending |
| Figma Code Connect + addon-designs | Bidirectional Figma↔Storybook visibility; one shows Figma in Storybook, the other shows code in Figma | — Pending |
| v1 = tokens + primitives only | Stable token foundation is prerequisite for reliable components; avoids refactoring components when tokens change | — Pending |

---
*Last updated: 2026-03-22 — Phase 2 complete (primitive token pipeline: 231 CSS vars, 5 DTCG JSON files, Style Dictionary v4 build verified)*
