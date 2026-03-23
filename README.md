# Design System Token Upgrade

**Goal:** GitHub/JSON + Figma bidirectional integration.
**Approach:** Code base first. Figma pulls code + updates file.

A design token system and primitive component library built on a **3-tier token architecture** (Primitive → Semantic → Component). Tokens are authored in Figma Variables, synced via Tokens Studio Pro to W3C DTCG-format JSON, and transformed by Style Dictionary into CSS custom properties and TypeScript constants. Storybook serves as the living documentation site.

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| `@design-system-x/tokens` | Design tokens — CSS custom properties + TypeScript breakpoint constants | `npm i @design-system-x/tokens` |
| `@design-system-x/primitives` | React primitive components consuming the token system | `npm i @design-system-x/primitives` |

## Architecture

```
Figma Variables
      ↓
Tokens Studio Pro (sync)
      ↓
W3C DTCG JSON  ←  Source of truth in code
      ↓
Style Dictionary v4
      ↓
┌─────────────────────────────────┐
│  CSS Custom Properties          │  --dsx-color-brand-500
│  TypeScript Constants           │  BREAKPOINTS.md = 768
│  Semantic Theme Files           │  parent-brand/light.css
└─────────────────────────────────┘
      ↓
React Components + Storybook
```

### Token Tiers

1. **Primitive** — Raw values: colors, spacing, typography, elevation, breakpoints (`--dsx-color-blue-500`, `--dsx-spacing-4`)
2. **Semantic** — Purpose-driven aliases that change per brand and mode (`--dsx-color-text-default`, `--dsx-color-background-primary`)
3. **Component** — Component-scoped tokens (planned for v2)

### Multi-Brand & Theming

Semantic tokens support multiple brands and color modes via CSS data attributes:

```html
<html data-brand="parent" data-theme="light">
```

Available combinations:
- `parent-brand` / `light` and `dark`
- `child-brand` / `light` and `dark`

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install & Build

```bash
npm install
npx turbo run build
```

### Run Storybook

```bash
npm run dev --workspace=@design-system-x/storybook
```

Opens at [http://localhost:6006](http://localhost:6006).

## Usage

### Tokens

```css
/* Import primitive tokens */
@import '@design-system-x/tokens/css';

/* Import a semantic theme */
@import '@design-system-x/tokens/parent-brand/light';
@import '@design-system-x/tokens/parent-brand/dark';
```

```tsx
// TypeScript breakpoint constants
import { BREAKPOINTS } from '@design-system-x/tokens'

if (window.innerWidth >= BREAKPOINTS.md) { /* tablet+ */ }
```

### Components

```tsx
import { Text, Surface, Stack } from '@design-system-x/primitives'

function Card() {
  return (
    <Surface elevation="md" background="primary">
      <Stack gap="md">
        <Text variant="heading-lg" as="h2">Title</Text>
        <Text variant="body-md">Description</Text>
      </Stack>
    </Surface>
  )
}
```

### Available Components

| Component | Purpose |
|-----------|---------|
| `Text` | Typography with variant prop mapping to the type scale |
| `Surface` | Semantic background, border, and elevation |
| `Stack` | Vertical layout using spacing tokens |
| `Inline` | Horizontal layout using spacing tokens |
| `ColorSwatch` | Color token preview (documentation use) |
| `VisuallyHidden` | Accessible hidden content |

## Project Structure

```
design-system-x/
├── packages/
│   ├── tokens/                 # @design-system-x/tokens
│   │   ├── tokens/
│   │   │   ├── primitives/     # DTCG JSON: color, spacing, typography, elevation, grid
│   │   │   └── semantic/       # DTCG JSON: parent-brand/, child-brand/ (light + dark)
│   │   ├── src/                # TypeScript exports (breakpoints)
│   │   └── dist/               # Build output: CSS + JS
│   └── primitives/             # @design-system-x/primitives
│       └── src/                # React components (Text, Surface, Stack, etc.)
├── apps/
│   └── storybook/              # Storybook documentation site
│       └── stories/            # MDX docs, stories, visualization components
├── turbo.json                  # Turborepo build pipeline
├── tsconfig.base.json          # Shared TypeScript config
└── RELEASE_CHECKLIST.md        # Publish workflow
```

## Development

### Build Pipeline

```bash
npx turbo run build        # Build all packages
npx turbo run lint         # Lint all packages
npx turbo run dev          # Watch mode
```

Build order is managed by Turborepo: `tokens:build:tokens` → `tokens:build` → `primitives:build` → `storybook:build`

### Adding Tokens

1. Edit DTCG JSON files in `packages/tokens/tokens/`
2. Run `npm run build:tokens --workspace=@design-system-x/tokens`
3. New `--dsx-*` CSS custom properties appear in `dist/css/tokens.css`

### Versioning & Publishing

Uses [Changesets](https://github.com/changesets/changesets) for version management:

```bash
npx changeset              # Create a changeset
npx changeset version      # Bump versions + generate changelogs
npm run release             # Build + publish to npm
```

See `RELEASE_CHECKLIST.md` for the full release workflow.

## Tech Stack

| Tool | Purpose |
|------|---------|
| npm workspaces + Turborepo | Monorepo management |
| tsup | Package builds (dual ESM/CJS) |
| Style Dictionary v4 | Token transformation (DTCG → CSS/TS) |
| Tokens Studio Pro | Figma ↔ code sync |
| Storybook 10 | Documentation site |
| Changesets | Versioning and changelogs |
| ESLint 9 + typescript-eslint | Linting |
| Figma Code Connect | Component code in Figma Dev Mode |

## License

Private — internal use only.
