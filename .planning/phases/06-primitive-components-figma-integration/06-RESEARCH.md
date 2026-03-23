# Phase 6: Primitive Components & Figma Integration - Research

**Researched:** 2026-03-23
**Domain:** React component authoring, Storybook stories/MDX, Figma Code Connect, @storybook/addon-designs
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Each component gets a colocated pair: `.stories.tsx` (variants/controls) + `.mdx` (usage guidelines, Canvas embed, ArgTypes, Figma embed). All files live under `stories/Primitives/`.
- **D-02:** Stories use `satisfies Meta<typeof Component>` pattern (not `as`) for type-safe story definitions. Each story file exports named stories for all variants/states.
- **D-03:** MDX docs include: purpose/when-to-use section, `<Canvas>` embeds of primary + variant stories, `<ArgTypes>` props table, `<Figma>` embed from addon-designs with real Figma frame URLs.
- **D-04:** No per-story decorators — rely on the existing global `withThemeAttributes` decorator in `preview.tsx`. Components use CSS vars that are already set globally via `data-brand`/`data-theme`.
- **D-05:** Stories tagged with `['autodocs']` in meta for automatic docs generation alongside the manual MDX page.
- **D-06:** Figma frame URLs will be provided during execution for each component's MDX `<Figma>` embed. User has URLs ready.
- **D-07:** Code Connect `.figma.tsx` files use placeholder node IDs (TODO comments) — user will fill in actual Figma component node IDs from Dev Mode later.
- **D-08:** `.figma.tsx` files are colocated with components inside `packages/primitives/src/{ComponentName}/`. Each component gets its own directory with `Component.tsx`, `Component.figma.tsx`, and `index.ts` re-export.
- **D-09:** Code Connect publish is a manual checklist item: `npx @figma/code-connect publish`. Not automated in CI for v1.
- **D-10:** All 5 primitives from roadmap are in scope: Text, ColorSwatch, Surface, Stack, Inline, VisuallyHidden.
- **D-11:** Stack (vertical) and Inline (horizontal) are two separate components, not a single Flex component. Matches Chakra/Radix conventions.
- **D-12:** Polymorphism via `as` prop guided by accessibility and SEO — Text, Stack, Inline, Surface support `as`; VisuallyHidden and ColorSwatch likely don't need it.
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

### Deferred Ideas (OUT OF SCOPE)

- Application-level components (Button, Input, Modal, etc.) — v2 scope
- Automated Code Connect publish in CI — manual for v1
- Component tokens (3rd tier) — v2 scope (COMP-05)
- Token diff/changelog page — backlog idea from Phase 5
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORY-10 | Primitive component stories cover all states and variants using Storybook Controls | Component file structure, story pattern, satisfies Meta, Controls API |
| STORY-11 | Each primitive has an MDX documentation file with usage guidelines, props table (via Autodocs), and Figma frame embed | MDX blocks pattern, `<Figma>` import from addon-designs/blocks, `<ArgTypes>`, `<Canvas>` |
| STORY-12 | Properties preview via Storybook Autodocs auto-generates interactive props tables from TypeScript interfaces | react-docgen-typescript, `autodocs: 'tag'` already configured in main.ts, JSDoc comment format |
| FIGMA-04 | `@storybook/addon-designs` configured; Figma frames embedded in primitive component stories | Addon already installed (v11.1.2), `<Figma url="...">` block for MDX, `design` parameter for stories |
| FIGMA-05 | Figma Code Connect `.figma.tsx` set up for each primitive component | `@figma/code-connect` v1.4.2, `figma.connect()` API, publish command |
</phase_requirements>

---

## Summary

Phase 6 completes the v1.0 milestone by building six React primitive components and wiring them to both Storybook documentation and Figma Code Connect. The project already has the infrastructure: `@design-system-x/primitives` package exists with tsup build, all Storybook addons are registered (`@storybook/addon-designs` v11.1.2 is already in `main.ts`), the global `withThemeAttributes` decorator is in place, and `stories/Primitives/` is pre-slotted in `storySort`. The work is primarily component authoring, not configuration.

Two integration fixes are required before the v1.0 milestone is clean: (1) replace hardcoded `BREAKPOINTS` constant in `token-data.ts` with imports from `@design-system-x/tokens` (the auto-generated `breakpoints.ts` already exports the exact values needed), and (2) make the Styles page `TokenTable` rows theme-reactive by using `getSemanticTokensForTheme()` with globals rather than static `rawValue` strings. The `Surfaces.mdx` page is representative of the pattern — its `TokenTable` rows have hardcoded `rawValue: 'var(--dsx-color-neutral-0)'` strings that don't update when brand/mode changes.

The Figma Code Connect setup uses `@figma/code-connect` v1.4.2 (latest). Since `.figma.tsx` files are not executed — they are parsed as strings — placeholder node IDs with TODO comments are the correct pattern for deferred wiring. The publish command is `npx @figma/code-connect publish` run from the package directory.

**Primary recommendation:** Build all six components with their directory structure first (Component.tsx + index.ts), then write stories + MDX, then add `.figma.tsx` files as the last step before the release checklist.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 (installed) | Component rendering | Already in use |
| TypeScript | 5.9.3 (installed) | Type safety, JSDoc-driven Autodocs | Already in use |
| @design-system-x/tokens | `*` (workspace) | CSS var source, BREAKPOINTS import | Already a dependency in primitives package.json |
| @figma/code-connect | 1.4.2 (latest) | Code Connect `.figma.tsx` files, publish CLI | Not yet installed — must add as devDependency |
| @storybook/addon-designs | 11.1.2 (installed) | `<Figma>` MDX block, story design parameters | Already registered in main.ts |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsup | ^8.5.1 (root) | Build primitives package | Already configured via tsup.config.ts |
| react-docgen-typescript | via Storybook 10 | Extracts TypeScript props for Autodocs | Configured in main.ts as `reactDocgen: 'react-docgen-typescript'` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline styles (CSS vars) | CSS Modules / styled-components | CSS vars approach matches existing Styles page pattern; no class name overhead; already confirmed by D-04 |
| `as` prop polymorphism | Separate wrapper components | `as` prop is idiomatic for design systems (Chakra, Radix); avoids component proliferation |
| `satisfies Meta<typeof Component>` | `Meta<typeof Component>` with `as` | `satisfies` keeps inference while catching errors at definition site — D-02 is locked |

**Installation (Code Connect only — everything else is installed):**
```bash
npm install --save-dev @figma/code-connect --workspace=packages/primitives
```

Or add to root devDependencies since it is a CLI tool:
```bash
npm install --save-dev @figma/code-connect
```

---

## Architecture Patterns

### Component Directory Structure (D-08)

Each component lives in its own subdirectory under `packages/primitives/src/`:

```
packages/primitives/src/
├── Text/
│   ├── Text.tsx          # Component implementation
│   ├── Text.figma.tsx    # Code Connect file
│   └── index.ts          # Re-exports: export { Text } from './Text'
├── ColorSwatch/
│   ├── ColorSwatch.tsx
│   ├── ColorSwatch.figma.tsx
│   └── index.ts
├── Surface/
│   ├── Surface.tsx
│   ├── Surface.figma.tsx
│   └── index.ts
├── Stack/
│   ├── Stack.tsx
│   ├── Stack.figma.tsx
│   └── index.ts
├── Inline/
│   ├── Inline.tsx
│   ├── Inline.figma.tsx
│   └── index.ts
├── VisuallyHidden/
│   ├── VisuallyHidden.tsx
│   ├── VisuallyHidden.figma.tsx
│   └── index.ts
└── index.ts              # Barrel: export * from './Text'; etc.
```

Story files live in the Storybook app, not in the package:

```
apps/storybook/stories/Primitives/
├── Text.stories.tsx
├── Text.mdx
├── ColorSwatch.stories.tsx
├── ColorSwatch.mdx
├── Surface.stories.tsx
├── Surface.mdx
├── Stack.stories.tsx
├── Stack.mdx
├── Inline.stories.tsx
├── Inline.mdx
├── VisuallyHidden.stories.tsx
└── VisuallyHidden.mdx
```

### Pattern 1: Component with `as` Prop (Polymorphic)

Used for Text, Surface, Stack, Inline (D-12). React 19 + TypeScript 5 — use `React.ElementType` pattern:

```typescript
// Source: React TypeScript docs / community standard pattern
import React from 'react'

type TextVariant = 'display' | 'heading-xl' | 'heading-lg' | 'heading-md' | 'heading-sm' | 'body-lg' | 'body-md' | 'body-sm' | 'label' | 'caption' | 'code'

interface TextOwnProps<E extends React.ElementType = 'span'> {
  /** Typography variant — maps to a CSS typography token step */
  variant?: TextVariant
  /** Override the rendered HTML element */
  as?: E
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

type TextProps<E extends React.ElementType = 'span'> = TextOwnProps<E> &
  Omit<React.ComponentPropsWithoutRef<E>, keyof TextOwnProps<E>>

/**
 * Text renders typographically styled text using the design system type scale.
 * Use the `variant` prop to select a typography step. Use `as` to render the
 * semantically correct HTML element (h1–h6, p, span, label, etc.).
 */
export function Text<E extends React.ElementType = 'span'>({
  variant = 'body-md',
  as,
  children,
  style,
  ...rest
}: TextProps<E>) {
  const Component = as ?? 'span'
  const variantToCssBase: Record<TextVariant, string> = {
    display: 'text-9xl',
    'heading-xl': 'text-4xl',
    'heading-lg': 'text-3xl',
    'heading-md': 'text-2xl',
    'heading-sm': 'text-xl',
    'body-lg': 'text-lg',
    'body-md': 'text-base',
    'body-sm': 'text-sm',
    label: 'text-sm',
    caption: 'text-xs',
    code: 'text-sm',
  }
  const step = variantToCssBase[variant]
  return (
    <Component
      style={{
        fontFamily: `var(--dsx-typography-${step}-font-family)`,
        fontSize: `var(--dsx-typography-${step}-font-size)`,
        fontWeight: `var(--dsx-typography-${step}-font-weight)`,
        lineHeight: `var(--dsx-typography-${step}-line-height)`,
        letterSpacing: `var(--dsx-typography-${step}-letter-spacing)`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}
```

**react-docgen-typescript note:** Generic components do not have their props extracted automatically by react-docgen-typescript when using the generic `<E extends ElementType>` pattern. To get Autodocs working, add explicit overloads or use a `TextProps` interface with specific prop types documented. The recommended workaround is to export a non-generic version of the props type with JSDoc comments, which react-docgen-typescript will pick up:

```typescript
// This interface is what react-docgen-typescript will read
export interface TextProps {
  variant?: TextVariant
  /** Override the rendered HTML element (e.g. 'h1', 'p', 'label') */
  as?: React.ElementType
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}
```

### Pattern 2: VisuallyHidden (Accessibility Primitive)

Standard CSS clip pattern — no `as` prop needed:

```typescript
// Source: Radix UI / WCAG accessibility pattern
const visuallyHiddenStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
}

export interface VisuallyHiddenProps {
  /** Content hidden visually but accessible to screen readers */
  children: React.ReactNode
}

export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span style={visuallyHiddenStyles}>{children}</span>
}
```

### Pattern 3: Storybook Story File (`satisfies Meta`)

```typescript
// Source: Storybook 8+ docs — satisfies pattern, D-02
import type { Meta, StoryObj } from '@storybook/react'
import { Text } from '@design-system-x/primitives'

const meta = {
  title: 'Primitives/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['display', 'heading-xl', 'heading-lg', 'body-md', 'body-sm', 'caption', 'code'],
    },
    as: { control: 'text' },
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'body-md', children: 'The quick brown fox' },
}

export const Heading: Story = {
  args: { variant: 'heading-lg', as: 'h2', children: 'Section heading' },
}
```

### Pattern 4: MDX Documentation File

```mdx
{/* Source: Confirmed pattern from Phase 4/5 — @storybook/addon-docs/blocks import */}
import { Meta, Canvas, ArgTypes } from '@storybook/addon-docs/blocks'
import { Figma } from 'storybook-addon-designs/blocks'
import * as TextStories from './Text.stories'

<Meta of={TextStories} />

# Text

Use **Text** when you need token-driven typography that automatically adapts to the active brand and mode...

## Figma

<Figma
  url="https://www.figma.com/file/PLACEHOLDER/Design-System-X?node-id=TODO"
  collapsable
  defaultCollapsed={false}
/>

## Usage

<Canvas of={TextStories.Default} />
<Canvas of={TextStories.Heading} />

## Props

<ArgTypes of={TextStories} />
```

**Important:** The `<Figma>` block is imported from `'storybook-addon-designs/blocks'` (the package name under `@storybook/addon-designs` resolves to `storybook-addon-designs` — this is confirmed by the npm package structure). The `url` prop accepts a Figma file URL. `collapsable` (note spelling — not `collapsible`) controls collapse toggle.

### Pattern 5: Figma Code Connect File

```typescript
// Source: developers.figma.com/docs/code-connect/react — verified v1.4.2
// packages/primitives/src/Text/Text.figma.tsx

import figma from '@figma/code-connect/react'
import { Text } from './Text'

figma.connect(Text, 'https://www.figma.com/design/TODO-FILE-KEY/Design-System-X?node-id=TODO-NODE-ID', {
  props: {
    variant: figma.enum('Variant', {
      Display: 'display',
      'Heading XL': 'heading-xl',
      'Heading LG': 'heading-lg',
      'Heading MD': 'heading-md',
      'Heading SM': 'heading-sm',
      'Body LG': 'body-lg',
      'Body MD': 'body-md',
      'Body SM': 'body-sm',
      Label: 'label',
      Caption: 'caption',
      Code: 'code',
    }),
    children: figma.string('Content'),
  },
  example: ({ variant, children }) => (
    <Text variant={variant}>{children}</Text>
  ),
})
```

**Key constraint:** Code Connect files are parsed as strings, not executed. All imports, conditional logic, and dynamic values render literally. This means placeholder URLs and node IDs are fine — they appear in Dev Mode exactly as written.

### Pattern 6: Integration Fix — BREAKPOINTS import

Current `token-data.ts` has a hardcoded `BREAKPOINTS` object. The tokens package already exports the exact values via `@design-system-x/tokens`:

```typescript
// packages/tokens/src/breakpoints.ts (auto-generated, already exists)
export const GridBreakpointSm = "640px";
export const GridBreakpointMd = "768px";
export const GridBreakpointLg = "1024px";
export const GridBreakpointXl = "1280px";
export const GridBreakpoint2xl = "1536px";
```

The fix in `token-data.ts`:
```typescript
// REMOVE:
// import primitiveGrid from '../../../../packages/tokens/tokens/primitives/grid.tokens.json'
// ... (remove from PRIMITIVE_DATA spread too)
// export const BREAKPOINTS: Record<string, string> = { sm: '640px', ... }

// ADD:
import {
  GridBreakpointSm,
  GridBreakpointMd,
  GridBreakpointLg,
  GridBreakpointXl,
  GridBreakpoint2xl,
} from '@design-system-x/tokens'

export const BREAKPOINTS: Record<string, string> = {
  sm: GridBreakpointSm,
  md: GridBreakpointMd,
  lg: GridBreakpointLg,
  xl: GridBreakpointXl,
  '2xl': GridBreakpoint2xl,
}
```

`@design-system-x/tokens` is already a workspace dependency of `@design-system-x/storybook` (confirmed in `apps/storybook/package.json`), so no new dependency is needed.

### Pattern 7: Integration Fix — Theme-Reactive Styles Pages

The `Surfaces.mdx` (and peer Styles pages) pass static `rawValue` strings to `<TokenTable>`. These must become live CSS var reads that update with brand/mode. The fix pattern uses `getSemanticTokensForTheme()` with a globals-aware wrapper component, following the `SemanticTokenSection` pattern already established in Phase 5:

```tsx
// apps/storybook/stories/components/StylesTokenTable.tsx (new shared component)
// Wraps TokenTable with globals-aware semantic token resolution for Styles pages
import React from 'react'
import { TokenTable } from './TokenTable'
import { getSemanticTokensForTheme } from './token-data'

let useGlobals: (() => [Record<string, string>]) | undefined
try {
  const previewApi = require('@storybook/preview-api') as { useGlobals?: () => [Record<string, string>] }
  useGlobals = previewApi.useGlobals
} catch { useGlobals = undefined }

interface StylesTokenTableProps {
  tokenNames: string[]  // e.g. ['color.surface.card', 'color.border.default']
}

export function StylesTokenTable({ tokenNames }: StylesTokenTableProps) {
  let brand = 'parent', mode = 'light'
  if (useGlobals) {
    try { const [g] = useGlobals(); brand = g['brand'] ?? brand; mode = g['mode'] ?? mode } catch {}
  }
  const all = getSemanticTokensForTheme(brand, mode)
  const tokens = tokenNames.map(name => all.find(t => t.name === name)).filter(Boolean)
  return <TokenTable tokens={tokens} />
}
```

Alternatively — simpler approach: replace the static `rawValue` strings in Styles MDX pages with `var(--dsx-*)` references (using `tokenPathToCssVar()`). The `TokenTable` component already renders the `rawValue` as display text, not as a computed style. The real fix is that the visual specimen in the MDX already uses CSS vars (e.g., `backgroundColor: 'var(--dsx-color-surface-card)'`) which ARE theme-reactive — those update automatically. The `TokenTable` `rawValue` column is documentation metadata (shows the alias). Consult the actual `TokenTable` component to determine if this column needs to be truly live or just shows the alias path.

### Anti-Patterns to Avoid

- **Hardcoded hex colors or px values in component inline styles:** All visual values must use `var(--dsx-*)` CSS custom properties. CSS vars are the contract between tokens and components.
- **Importing CSS files inside component package:** `packages/primitives` must NOT import CSS from `@design-system-x/tokens`. CSS is imported once in Storybook's `preview.tsx`. The primitives package consumes CSS vars at runtime — they are already on the DOM.
- **Generic type polymorphism confusing react-docgen-typescript:** Use explicit `Props` interface (non-generic) for the exported type even if the implementation uses generics internally. react-docgen-typescript reads exported types, not inferred generics.
- **Using `as` keyword for Meta:** Use `satisfies Meta<typeof Component>` not `as Meta<typeof Component>` (D-02 is locked, and `satisfies` gives better error messages).
- **MDX importing from `@storybook/addon-docs`:** Must import from `@storybook/addon-docs/blocks` (confirmed from Phase 4 decision and STATE.md).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Visually hidden for screen readers | Custom clip CSS on a div | `VisuallyHidden` component using clip-rect pattern | clip-rect + overflow:hidden is the WCAG-proven pattern; easy to get wrong |
| Figma prop mapping | Manual prop comment strings | `figma.enum()`, `figma.string()`, `figma.boolean()` | Code Connect parses these as structured data, renders in Dev Mode |
| Figma frame in MDX | Raw `<iframe>` | `<Figma url="..." />` from `storybook-addon-designs/blocks` | Handles authentication, resize, Figma embed protocol |
| CSS var consumption | CSS Modules + class names | Inline styles with `var(--dsx-*)` | Zero runtime overhead, zero class name collisions, already established pattern |
| Props table | Manual HTML table in MDX | `<ArgTypes of={Stories} />` + `autodocs: 'tag'` + JSDoc | react-docgen-typescript generates from TypeScript interfaces automatically |

**Key insight:** The infrastructure is complete. Every "don't hand-roll" item already exists in the project — the work is using existing patterns correctly, not inventing new ones.

---

## Common Pitfalls

### Pitfall 1: react-docgen-typescript Does Not Extract Generic Component Props

**What goes wrong:** `Text<E extends ElementType>` uses a generic type parameter. react-docgen-typescript cannot statically analyze generics and produces an empty or incorrect props table in Autodocs.
**Why it happens:** react-docgen-typescript uses static AST analysis, not TypeScript type inference.
**How to avoid:** Export a concrete `TextProps` interface (with `as?: React.ElementType`) separate from the generic implementation. The Autodocs table will read from the exported interface. Document all props with JSDoc `/** */` comments — these appear as prop descriptions in the Autodocs table.
**Warning signs:** Storybook shows "No props found" or an empty Controls panel.

### Pitfall 2: `storybook-addon-designs/blocks` Import Path

**What goes wrong:** Importing `<Figma>` from `@storybook/addon-designs/blocks` instead of `storybook-addon-designs/blocks` — the npm package is named `storybook-addon-designs` (without `@storybook/` scope prefix for the blocks subpath).
**Why it happens:** The package name in package.json is `@storybook/addon-designs` but the import path for doc blocks uses the internal package name `storybook-addon-designs`.
**How to avoid:** Always use `import { Figma } from 'storybook-addon-designs/blocks'`. Confirmed by source code at `packages/storybook-addon-designs/src/blocks.tsx`.
**Warning signs:** Module not found error in MDX compilation.

### Pitfall 3: CSS Import in Primitives Package

**What goes wrong:** Adding `import '@design-system-x/tokens/css'` inside a component file in `packages/primitives`. This would work in Storybook but break in any consumer app that uses SSR or non-Vite bundlers.
**Why it happens:** It seems convenient to co-locate the CSS import with the component.
**How to avoid:** Components consume CSS vars at runtime — they only reference `var(--dsx-*)` strings. The CSS is the consumer's responsibility to import (as `preview.tsx` already does). The `packages/primitives` package has no CSS import anywhere.
**Warning signs:** Build errors in non-Vite consumers, or duplicate CSS in Storybook.

### Pitfall 4: Code Connect File Published Before Node IDs Are Known

**What goes wrong:** Running `npx @figma/code-connect publish` with placeholder node IDs creates invalid connections in Figma Dev Mode that show broken links.
**Why it happens:** D-07 explicitly defers node ID filling to later. Publishing with TODO placeholders corrupts Dev Mode annotations.
**How to avoid:** The release checklist must gate Code Connect publish on node ID replacement. The `.figma.tsx` files must have TODO comments, but publish is the final manual step only after the user fills in real node IDs from Dev Mode.
**Warning signs:** Figma Dev Mode shows "Component not found" or broken links after publish.

### Pitfall 5: `collapsible` vs `collapsable` in addon-designs Figma Block

**What goes wrong:** Using `collapsible` prop (intuitive English) which is not defined — the prop is spelled `collapsable`.
**Why it happens:** Typo in the original addon-designs library API that has been preserved for backward compatibility.
**How to avoid:** Use `collapsable` (not `collapsible`) in `<Figma>` block props. Source confirmed in `blocks.tsx` interface.
**Warning signs:** Prop silently ignored, Figma embed is always expanded.

### Pitfall 6: Styles Pages TokenTable rawValue Not Reactive (Integration Fix)

**What goes wrong:** Styles pages (Surfaces, Headings, etc.) pass static `rawValue` strings to `<TokenTable>`. When the brand/mode toolbar changes, the token reference table doesn't update.
**Why it happens:** The `rawValue` in the static array is a string literal baked at MDX parse time, not a live CSS var read.
**How to avoid:** Two valid approaches: (a) replace static `rawValue` with `tokenPathToCssVar(tokenName)` so it shows the CSS var reference (which is brand-agnostic), or (b) use a globals-aware component (like `SemanticTokenSection`) that calls `getSemanticTokensForTheme(brand, mode)` at render time. Approach (a) is simpler and aligns with what the table is actually showing (token aliases, not computed values).
**Warning signs:** TokenTable on Surfaces page shows `var(--dsx-color-neutral-0)` for parent-brand/light even after switching to child-brand/dark.

---

## Code Examples

### ColorSwatch Component

```typescript
// Source: Recommended pattern — CSS vars, no external dep
export interface ColorSwatchProps {
  /** The CSS custom property name, e.g. '--dsx-color-brand-500' */
  cssVar: string
  /** Display label — token name or alias */
  label?: string
  /** Swatch size variant */
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: '24px', md: '40px', lg: '64px' }

export function ColorSwatch({ cssVar, label, size = 'md' }: ColorSwatchProps) {
  const dim = sizeMap[size]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div
        style={{
          width: dim,
          height: dim,
          borderRadius: '4px',
          backgroundColor: `var(${cssVar})`,
          border: '1px solid var(--dsx-color-border-subtle)',
        }}
        aria-label={label ?? cssVar}
      />
      {label && (
        <span style={{ fontSize: 'var(--dsx-typography-text-xs-font-size)', fontFamily: 'monospace', color: 'var(--dsx-color-text-muted)' }}>
          {label}
        </span>
      )}
    </div>
  )
}
```

### Surface Component

```typescript
// Source: Recommended pattern — elevation + surface color tokens
type ElevationLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl'
type SurfaceVariant = 'default' | 'card' | 'panel' | 'sunken'

export interface SurfaceProps {
  /** Surface color variant — maps to semantic color.surface.* tokens */
  variant?: SurfaceVariant
  /** Shadow elevation level — maps to semantic shadow.* tokens */
  elevation?: ElevationLevel
  /** Override the rendered HTML element */
  as?: React.ElementType
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function Surface({ variant = 'default', elevation = 'none', as: Component = 'div', children, style, ...rest }: SurfaceProps) {
  const bgVar = variant === 'default' ? 'var(--dsx-color-background-default)' : `var(--dsx-color-surface-${variant})`
  const shadowVar = elevation === 'none' ? 'none' : `var(--dsx-shadow-${elevation})`
  return (
    <Component
      style={{
        backgroundColor: bgVar,
        boxShadow: shadowVar,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}
```

### Stack / Inline Pattern

```typescript
// Source: Chakra/Radix convention — separate components for axis clarity (D-11)
type SpacingStep = '0' | '1' | '2' | '3' | '4' | '6' | '8' | '12' | '16' | '24'

export interface StackProps {
  /** Vertical gap between children — maps to spacing token */
  gap?: SpacingStep
  /** Alignment on cross axis */
  align?: 'start' | 'center' | 'end' | 'stretch'
  as?: React.ElementType
  children?: React.ReactNode
  style?: React.CSSProperties
}

export function Stack({ gap = '4', align = 'stretch', as: Component = 'div', children, style, ...rest }: StackProps) {
  return (
    <Component
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `var(--dsx-spacing-${gap})`,
        alignItems: align,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}

// Inline is identical except flexDirection: 'row' and uses justifyContent for main-axis
```

### Code Connect File Template

```typescript
// Source: developers.figma.com/docs/code-connect/react — v1.4.2
// packages/primitives/src/{Component}/{Component}.figma.tsx
import figma from '@figma/code-connect/react'
import { ComponentName } from './ComponentName'

// TODO: Replace the URL with the actual Figma component node URL from Dev Mode
// Format: https://www.figma.com/design/{FILE-KEY}/...?node-id={NODE-ID}
figma.connect(ComponentName, 'https://www.figma.com/design/TODO-FILE-KEY/Design-System-X?node-id=TODO-NODE-ID', {
  props: {
    // TODO: Map Figma variant property names to React prop values
    // variant: figma.enum('Variant', { 'Value A': 'propa', 'Value B': 'propb' }),
  },
  example: (props) => <ComponentName {...props} />,
})
```

### Barrel Export Pattern

```typescript
// packages/primitives/src/index.ts — final state after all components added
export * from './Text'
export * from './ColorSwatch'
export * from './Surface'
export * from './Stack'
export * from './Inline'
export * from './VisuallyHidden'
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `as Meta<typeof Component>` | `satisfies Meta<typeof Component>` | Storybook 7+ / TS 4.9 | Better inference: `satisfies` checks conformance without widening the type |
| `parameters.design: { type: 'figma', url }` | `parameters.design: { type: 'figma', url }` (unchanged) | — | Still valid; alternatively use `<Figma>` block in MDX for inline embed |
| `clip: 'rect(0, 0, 0, 0)'` VisuallyHidden | Same clip-rect pattern | Stable | sr-only pattern unchanged; `clip-path: inset(50%)` is a modern alternative but less universally supported |
| figma.connect() with explicit URL string | Same — URL string is stable | v1.4.x | No API changes expected for v1 |

---

## Validation Architecture

> `workflow.nyquist_validation` key is absent from `.planning/config.json` — treated as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @storybook/addon-vitest (via storybook package.json) |
| Config file | None detected — no `vitest.config.ts` in `apps/storybook/` or root |
| Quick run command | `npm run test --workspace=apps/storybook` (once configured) |
| Full suite command | `turbo run test` |

**Note:** `@storybook/addon-vitest` is in the storybook devDependencies and `vitest` 4.1.0 is installed. A `vitest.config.ts` or `vitest.workspace.ts` has not been created yet. This is a Wave 0 gap if test coverage is required.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STORY-10 | All 6 components render without error | smoke | Visual in Storybook — `storybook dev` manual review | ❌ Wave 0 (optional) |
| STORY-11 | MDX files compile and appear in Storybook sidebar | smoke | `npm run build --workspace=apps/storybook` | ✅ (build step verifies) |
| STORY-12 | Autodocs generates props tables from TypeScript interfaces | manual | Open Storybook docs page, verify Controls panel has props | manual-only |
| FIGMA-04 | Figma embed appears in MDX docs pages | manual | Open Storybook docs page, verify Figma frame loads | manual-only |
| FIGMA-05 | `.figma.tsx` files have no TypeScript errors | unit | `npx tsc --noEmit` in `packages/primitives` | ✅ (tsc step) |

**Rationale for manual-only:** FIGMA-04, FIGMA-05, and STORY-12 require visual verification or external service (Figma) access that cannot be automated in < 30 seconds in a CI context. The primary automated gate is TypeScript compilation (`tsc --noEmit`) and Storybook build success.

### Sampling Rate

- **Per task commit:** `npm run lint --workspace=packages/primitives && npx tsc --noEmit -p packages/primitives/tsconfig.json`
- **Per wave merge:** `turbo run build` (Storybook build verifies MDX compilation)
- **Phase gate:** Storybook builds cleanly, all 6 components visible in sidebar, Autodocs props tables populated

### Wave 0 Gaps

- [ ] `apps/storybook/vitest.config.ts` — if Storybook interaction tests are desired for STORY-10
- [ ] `packages/primitives/tsconfig.json` — verify `include` covers `src/**/*.tsx` and `src/**/*.figma.tsx`

*(If no automated test suite is planned for this phase: "Existing tsc + Storybook build serve as the primary gate — no vitest test files required for v1 primitives.")*

---

## Open Questions

1. **TokenTable `rawValue` fix scope**
   - What we know: Styles MDX pages pass static `rawValue` strings. `TokenTable` renders them as text in a "Value" column. The visual specimen divs already use CSS vars and are live-reactive.
   - What's unclear: Does the `rawValue` column need to show the resolved value per-theme, or is showing the alias path (e.g., `var(--dsx-color-neutral-0)`) sufficient documentation?
   - Recommendation: Replace static `rawValue` strings with the CSS var reference string (e.g., `tokenPathToCssVar('color.surface.card')`) — this is always correct regardless of brand/mode, and is what the token system promises. Only use `getSemanticTokensForTheme()` if the actual hex value per-theme is required.

2. **Code Connect `@figma/code-connect` install location**
   - What we know: Not installed anywhere in the project. The CLI is used via `npx`.
   - What's unclear: Should it be a devDependency of `packages/primitives` or root? Figma recommends root-level CLI install for monorepos.
   - Recommendation: Add to root `devDependencies`. `npx @figma/code-connect publish` is the standard publish incantation and works without a local install.

3. **VisuallyHidden — `clip-path: inset(50%)` vs `clip: rect(0,0,0,0)`**
   - What we know: Both patterns are widely used. `clip` is deprecated in CSS but still works. `clip-path: inset(50%)` is the modern replacement.
   - What's unclear: Browser support matrix for this project's target audience.
   - Recommendation: Use `clip: rect(0,0,0,0)` with a `clipPath: 'inset(50%)'` comment as a modern alternative. Safety first — the clip-rect approach is battle-tested in every design system (Radix, Chakra, Reach UI).

---

## Sources

### Primary (HIGH confidence)

- Codebase scan — `apps/storybook/.storybook/main.ts`, `preview.tsx`, `apps/storybook/package.json`, `packages/primitives/package.json`, `apps/storybook/stories/components/token-data.ts`, `packages/tokens/src/breakpoints.ts` — project state verified directly
- `npm view @figma/code-connect version` — v1.4.2 (current)
- `npm view @storybook/addon-designs version` — v11.1.2 (current)
- `node_modules/react/package.json` — React 19.2.4 installed
- `node_modules/typescript/package.json` — TypeScript 5.9.3 installed

### Secondary (MEDIUM confidence)

- [developers.figma.com/docs/code-connect/react](https://developers.figma.com/docs/code-connect/react) — `figma.connect()` API, `figma.enum()`, `figma.string()`, `figma.boolean()`, prop mapping pattern
- [github.com/storybookjs/addon-designs src/blocks.tsx](https://github.com/storybookjs/addon-designs/blob/master/packages/storybook-addon-designs/src/blocks.tsx) — `Figma` block component props interface, `collapsable` spelling confirmed
- WebSearch findings — `storybook-addon-designs/blocks` import path confirmed by multiple community sources

### Tertiary (LOW confidence)

- react-docgen-typescript generic component limitation — from community knowledge; should be verified by testing if props table is empty for a generic component

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified from installed node_modules and package.json files
- Architecture: HIGH — all patterns derived from existing project conventions confirmed in source code
- Pitfalls: MEDIUM — react-docgen-typescript generic limitation is community-known; others are HIGH from source inspection
- Code Connect API: MEDIUM — verified from official Figma developer docs; node ID placeholder pattern is LOW (recommended by community convention)

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (30 days — Storybook and Code Connect are stable release cadence)
