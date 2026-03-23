# Design System X

## What This Is

A full design system built for a team, centered on a 3-tier design token architecture (Primitive → Semantic → Component) using a `category.property.modifier` naming convention. Tokens are authored in Figma Variables, synced via Tokens Studio Pro to W3C DTCG-format JSON, and transformed by Style Dictionary into CSS custom properties and TypeScript for consumption by React applications. Storybook serves as the living documentation site with Figma integration. Six primitive React components (Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden) provide the foundational building blocks.

## Core Value

A single source of truth for all design decisions — tokens defined once in Figma, consumed reliably in code, with Storybook as the living reference that bridges design and development.

## Current State

**v1.0 shipped 2026-03-24** — Token Foundation + Storybook Documentation

- 2 packages: `@design-system-x/tokens` (231 CSS custom properties, TypeScript breakpoints) + `@design-system-x/primitives` (6 React components)
- 3-tier token architecture: Primitive → Semantic (multi-brand × light/dark)
- Storybook 10 with 10 documentation pages, theme switcher, Figma embed placeholders
- Figma Code Connect files ready (pending real node IDs)
- ~4,960 lines of source code across 163 files

## Requirements

### Validated (v1.0)

- [x] INFRA-01–06: Monorepo, packages, Storybook, ESLint, Changesets — v1.0
- [x] TOKEN-01–10: Primitive + semantic tokens, SD pipeline, multi-brand/mode — v1.0
- [x] FIGMA-01–06: Variable Collections, naming, Tokens Studio sync, addon-designs, Code Connect, design pages — v1.0
- [x] STORY-01–14: Storybook config, token pages, styles pages, component stories, MDX docs, Autodocs — v1.0

### Active

- [ ] Replace TODO Figma node IDs in `.figma.tsx` files (requires real Figma file key)
- [ ] Publish Code Connect once node IDs are real
- [ ] Replace placeholder brand colors with actual brand hex values from Figma

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
- v1.0 shipped in 2 days (2026-03-22 → 2026-03-24) with 122 commits across 6 phases

## Constraints

- **Token naming**: Must follow `category.property.modifier` — enforced in Figma grouping and Style Dictionary output
- **Figma sync**: Tokens Studio Pro required (paid plugin) — team must have access
- **Stack**: React + TypeScript — component stories and token exports target this environment
- **Token format**: W3C DTCG (Design Tokens Community Group) — ensures forward compatibility with the emerging standard

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tokens Studio Pro over Figma REST API | Smoother sync workflow with automatic DTCG export; REST API requires custom scripting | ✓ Validated v1.0 |
| Style Dictionary v4 (not v5) | Native DTCG support; v5 incompatible with sd-transforms v1.x | ✓ Validated v1.0 |
| Storybook over custom docs site | Faster to ship, industry standard, Figma addon ecosystem, Autodocs removes manual work | ✓ Validated v1.0 |
| Figma Code Connect + addon-designs | Bidirectional Figma↔Storybook visibility | ✓ Scaffolded v1.0 (pending real node IDs) |
| v1 = tokens + primitives only | Stable token foundation is prerequisite for reliable components | ✓ Validated v1.0 |
| react-docgen over react-docgen-typescript | react-docgen reliably extracts JSDoc props with Vite source alias | ✓ Validated v1.0 |
| Compound [data-brand][data-theme] CSS selectors | Enables multi-brand + light/dark with pure CSS, no JS runtime | ✓ Validated v1.0 |
| ESLint 9 (not 10) | eslint-plugin-react uses API removed in ESLint 10 | ✓ Validated v1.0 |

---
*Last updated: 2026-03-24 after v1.0 milestone*
