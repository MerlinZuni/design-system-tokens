# Requirements: Design System X

**Defined:** 2026-03-22
**Core Value:** A single source of truth for all design decisions — tokens defined once in Figma, consumed reliably in code, with Storybook as the living reference that bridges design and development.

---

## v1 Requirements

### Infrastructure

- [x] **INFRA-01**: Monorepo is scaffolded with npm workspaces and Turborepo for dependency-ordered task execution
- [x] **INFRA-02**: `@design-system-x/tokens` package exists with tsup build producing TypeScript/ESM/CJS outputs (Phase 1); CSS custom property output added in Phase 2 once Style Dictionary pipeline is configured
- [x] **INFRA-03**: `@design-system-x/primitives` package exists with tsup build producing React + TypeScript components
- [x] **INFRA-04**: `apps/storybook` workspace hosts the documentation site, separate from library packages
- [x] **INFRA-05**: Changesets configured for versioning and changelog generation across workspaces
- [x] **INFRA-06**: Shared `tsconfig.base.json` and ESLint flat config used across all packages

### Token Architecture

- [x] **TOKEN-01**: Primitive color tokens defined in W3C DTCG format using `color.property.modifier` naming convention
- [x] **TOKEN-02**: Primitive spacing tokens defined in DTCG format using `spacing.property.modifier` naming convention
- [x] **TOKEN-03**: Primitive grid and breakpoint tokens defined in DTCG format; breakpoints exported as TypeScript constants (not CSS custom properties — cannot be used in `@media` queries)
- [x] **TOKEN-04**: Primitive typography composite tokens authored directly in Tokens Studio (not Figma Variables — composite types are unsupported); exported via Style Dictionary
- [x] **TOKEN-05**: Primitive elevation/shadow composite tokens authored directly in Tokens Studio; exported via Style Dictionary
- [x] **TOKEN-06**: Semantic light mode token set — aliases primitive tokens, defines purpose (`color.background.primary`, `color.text.default`, etc.)
- [x] **TOKEN-07**: Semantic dark mode token set — same structure as light, different aliases
- [x] **TOKEN-08**: Multi-brand semantic token sets — at least 2 brand variants, each with light and dark modes, using Figma Variable Modes (Organization plan supports up to 40 modes)
- [x] **TOKEN-09**: Style Dictionary v4 pipeline outputs CSS custom properties with `outputReferences: true` to preserve the alias chain as `var()` references
- [x] **TOKEN-10**: Style Dictionary v4 pipeline runs one instance per brand × mode combination for correct multi-theme output

### Figma Pipeline

- [x] **FIGMA-01**: Figma Variable Collections established — one Collection per tier: Primitive (no modes), Semantic (light/dark per brand)
- [x] **FIGMA-02**: Figma variable naming uses slash-separated convention (`color/background/primary`) that auto-translates to dot notation in DTCG JSON
- [x] **FIGMA-03**: Tokens Studio Pro sync configured — Figma is canonical source of truth; JSON files are read-only output and never hand-edited
- [ ] **FIGMA-04**: `@storybook/addon-designs` (version matching Storybook major version) configured; Figma frames embedded in primitive component stories
- [ ] **FIGMA-05**: Figma Code Connect (`.figma.tsx` files) set up for each primitive component, linking Figma master components to React code
- [x] **FIGMA-06**: Figma file has dedicated pages for Design Purpose (clearly stated product reason) and Design Principles (Word + definition format), mirroring the Storybook MDX pages

### Storybook Documentation

- [x] **STORY-01**: Storybook 8 configured with `@storybook/react-vite` builder, `@storybook/addon-essentials`, and `reactDocgen: "react-docgen-typescript"` for full TypeScript prop inference
- [x] **STORY-02**: CSS custom property output from Style Dictionary imported in `.storybook/preview.ts` so all token variables are available globally in stories and MDX
- [x] **STORY-03**: Sidebar sort order: Introduction → Design Purpose → Design Principles → Tokens → Styles → Primitives
- [x] **STORY-04**: Token preview page — Color: displays full palette using `ColorPalette`/`ColorItem` blocks with hex values and token names
- [x] **STORY-05**: Token preview page — Typography: displays all font families, weights, sizes, and line heights
- [x] **STORY-06**: Token preview page — Spacing: visual scale showing all spacing steps with pixel values and token names
- [x] **STORY-07**: Token preview page — Elevation: displays all shadow levels with visual examples
- [x] **STORY-08**: Token preview page — Grid/Breakpoints: displays breakpoint values and grid column configurations
- [x] **STORY-09**: Styles preview section — shows composed primitive styles (e.g. heading styles, body text styles, surface styles)
- [x] **STORY-10**: Primitive component stories cover all states and variants using Storybook Controls
- [ ] **STORY-11**: Each primitive has an MDX documentation file with usage guidelines, props table (via Autodocs), and Figma frame embed
- [x] **STORY-12**: Properties preview via Storybook Autodocs auto-generates interactive props tables from TypeScript interfaces (no manual work required if TypeScript interfaces are well-typed)
- [x] **STORY-13**: Design Purpose page — MDX page with a clearly stated reason the digital platform/product exists; sits under Introduction in the sidebar
- [x] **STORY-14**: Design Principles page — MDX page listing key values as a capitalized Word followed by a definition; captures what good design means for this project; sits under Introduction in the sidebar

---

## v2 Requirements

### Application Components

- **COMP-01**: Core application component library: Button, Input, Select, Checkbox, Radio, Toggle
- **COMP-02**: Layout components: Container, Grid, Stack, Divider
- **COMP-03**: Feedback components: Alert, Toast, Badge, Spinner
- **COMP-04**: Overlay components: Modal, Drawer, Tooltip, Popover
- **COMP-05**: Component tokens (3rd tier) — component-scoped aliases to semantic tokens

### Platform Expansion

- **PLAT-01**: Native mobile token outputs via Style Dictionary (iOS Swift, Android XML/Compose)
- **PLAT-02**: Custom documentation site if Storybook outgrown

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Application component library (Button, Input, etc.) | Tokens must be stable before components reference them — v2 |
| Native mobile outputs (iOS/Android) | Different build pipeline; not needed until web is proven — v3+ |
| Custom documentation site | Storybook fulfills this for v1 |
| OAuth or any auth system | Not applicable to a design system |
| Real-time design-to-code sync | Tokens Studio Pro sync is on-demand; real-time is over-engineering for v1 |
| Automated Code Connect publish in CI | Manual release step for v1; automate in v2 when release cadence is established |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete (01-01) |
| INFRA-02 | Phase 1 (TS/ESM/CJS), Phase 2 (CSS) | Complete (01-01, scaffold) |
| INFRA-03 | Phase 1 | Complete (01-01) |
| INFRA-04 | Phase 1 | Complete (01-02) |
| INFRA-05 | Phase 1 | Complete (01-02) |
| INFRA-06 | Phase 1 | Complete (01-01, tsconfig.base.json; ESLint in 01-02) |
| TOKEN-01 | Phase 2 | Complete |
| TOKEN-02 | Phase 2 | Complete |
| TOKEN-03 | Phase 2 | Complete |
| TOKEN-04 | Phase 2 | Complete |
| TOKEN-05 | Phase 2 | Complete |
| TOKEN-09 | Phase 2 | Complete |
| TOKEN-10 | Phase 3 | Complete |
| TOKEN-06 | Phase 3 | Complete |
| TOKEN-07 | Phase 3 | Complete |
| TOKEN-08 | Phase 3 | Complete |
| FIGMA-01 | Phase 3 | Complete |
| FIGMA-02 | Phase 3 | Complete |
| FIGMA-03 | Phase 3 | Complete |
| STORY-01 | Phase 4 | Complete |
| STORY-02 | Phase 4 | Complete |
| STORY-03 | Phase 4 | Complete |
| STORY-04 | Phase 5 | Complete |
| STORY-05 | Phase 5 | Complete |
| STORY-06 | Phase 5 | Complete |
| STORY-07 | Phase 5 | Complete |
| STORY-08 | Phase 5 | Complete |
| STORY-09 | Phase 5 | Complete |
| STORY-10 | Phase 6 | Complete |
| STORY-11 | Phase 6 | Pending |
| STORY-12 | Phase 6 | Complete |
| STORY-13 | Phase 4 | Complete |
| STORY-14 | Phase 4 | Complete |
| FIGMA-04 | Phase 6 | Pending |
| FIGMA-05 | Phase 6 | Pending |
| FIGMA-06 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 — TOKEN-10 moved from Phase 2 to Phase 3 (multi-instance SD loop pattern belongs with multi-brand/mode semantic token work)*
