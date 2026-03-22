# Storybook Research: Design System X

**Domain:** React + TypeScript design system documentation
**Researched:** 2026-03-22
**Overall confidence:** HIGH (Storybook 8.x is stable and well-documented; patterns below reflect the stable 8.x API as of August 2025 knowledge cutoff)

---

## 1. Storybook 8.x Setup for React + TypeScript

### Installation

Storybook 8 ships with a unified `storybook` CLI package. The recommended init path:

```bash
npx storybook@8 init
```

For a project already using Vite (preferred for a design system — faster HMR, simpler config):

```bash
npx storybook@8 init --builder @storybook/builder-vite
```

For a Webpack 5 project:

```bash
npx storybook@8 init --builder @storybook/builder-webpack5
```

`init` auto-detects React + TypeScript and installs the correct framework package. You will end up with:

```
.storybook/
  main.ts
  preview.ts
src/
  stories/           # auto-generated examples (delete these)
```

### Core Packages

| Package | Purpose |
|---------|---------|
| `storybook` | CLI and core orchestrator |
| `@storybook/react` | React renderer |
| `@storybook/react-vite` | Vite integration (or `@storybook/react-webpack5`) |
| `@storybook/addon-essentials` | Docs, controls, actions, backgrounds, viewport, toolbars — all in one |
| `@storybook/addon-interactions` | Play function testing |
| `@storybook/addon-a11y` | Accessibility checks per story |
| `@storybook/addon-designs` | Embed Figma frames in stories (required per PROJECT.md) |
| `@storybook/test` | Storybook-native testing utilities |

```bash
npm install -D storybook @storybook/react @storybook/react-vite \
  @storybook/addon-essentials @storybook/addon-interactions \
  @storybook/addon-a11y @storybook/addon-designs @storybook/test
```

Note: `@storybook/addon-essentials` includes `@storybook/addon-docs` (which provides Autodocs and MDX support), `@storybook/addon-controls`, `@storybook/addon-actions`, `@storybook/addon-backgrounds`, `@storybook/addon-viewport`, and `@storybook/addon-toolbars`. You do not need to install these individually.

### `.storybook/main.ts`

```typescript
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // Story discovery: covers .stories.tsx files and .mdx standalone doc pages
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
  ],

  addons: [
    "@storybook/addon-essentials",   // docs, controls, actions, backgrounds, viewport
    "@storybook/addon-interactions", // play function support
    "@storybook/addon-a11y",         // accessibility panel
    "@storybook/addon-designs",      // Figma frame embedding
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  // TypeScript: react-docgen-typescript extracts props from TS interfaces
  typescript: {
    check: false,                    // do not block Storybook on type errors
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      // Include all exported types, not just those directly used as props
      shouldExtractLiteralValuesFromEnum: true,
      // Expand intersections so composed interfaces show fully
      shouldRemoveUndefinedFromOptional: true,
      // Filter out HTML event handlers from the props table (noise reduction)
      propFilter: (prop) =>
        prop.parent
          ? !prop.parent.fileName.includes("node_modules")
          : true,
    },
  },

  docs: {
    // Autodocs: generate a "Docs" tab for every story file by default.
    // Can be overridden per-story with `tags: ['autodocs']` or `tags: ['!autodocs']`.
    autodocs: "tag",
  },
};

export default config;
```

`autodocs: "tag"` means Autodocs only fires when a story file includes `'autodocs'` in its tags array. This gives per-file control. Use `autodocs: true` to enable for every story file automatically — useful for a design system where you want docs on everything.

### `.storybook/preview.ts`

```typescript
import type { Preview } from "@storybook/react";
import "../src/styles/tokens.css"; // import generated CSS custom properties

const preview: Preview = {
  parameters: {
    // Default backgrounds for component stories
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#1a1a2e" },
        { name: "surface", value: "#f5f5f5" },
      ],
    },
    // Default viewport (useful for responsive token pages)
    viewport: {
      defaultViewport: "desktop",
    },
    // Controls: sort props alphabetically in the table
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      sort: "alpha",
    },
    // Docs: configure the default subtitle shown in generated doc pages
    docs: {
      toc: true, // show table of contents in doc pages
    },
  },

  // Global decorators: wrap every story in a provider if needed
  decorators: [],

  // Tags applied globally — opt stories into autodocs by default
  tags: ["autodocs"],
};

export default preview;
```

---

## 2. Autodocs — Auto-Generating Props Tables from TypeScript Interfaces

### How It Works

Storybook 8 uses `react-docgen-typescript` (configured in `main.ts`) to statically analyze TypeScript component files at build time. It reads:

- Component prop interfaces/types
- JSDoc comments on interface members
- Default prop values
- Union types (mapped to select controls)
- Boolean props (mapped to boolean controls)

The generated props table appears in the "Docs" tab of any story that has `'autodocs'` in its tags.

### Requirements for Good Prop Extraction

**1. Export your props interface**

```typescript
// src/components/Button/Button.tsx

/** Controls the visual weight of the button */
export interface ButtonProps {
  /** The button's label text */
  label: string;
  /** Visual variant — maps to semantic color tokens */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Size — controls padding and font-size via spacing tokens */
  size?: "sm" | "md" | "lg";
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}
```

**2. Use named component exports with displayName**

```typescript
export const Button = ({ label, variant = "primary", size = "md", disabled = false, onClick }: ButtonProps) => {
  // ...
};
Button.displayName = "Button";
```

**3. Do not use `React.FC` — it hides return types and can confuse docgen**

Use explicit parameter destructuring instead.

**4. JSDoc comments on the interface become the "description" column in the props table**

Every prop should have a JSDoc comment. This is the primary way to document props in the generated table.

### Story File Wiring

```typescript
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],        // enables the Docs tab with auto-generated props table
  parameters: {
    docs: {
      description: {
        component: "The base button primitive. Maps directly to semantic action tokens.",
      },
    },
  },
  argTypes: {
    // Override or augment what docgen produces
    variant: {
      control: "select",
      description: "Maps to `color.action.*` semantic tokens",
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    // Default args shared across all stories in this file
    label: "Button",
    variant: "primary",
    size: "md",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;
```

### Subcomponent Props

If a component composes multiple sub-components and you want their props documented:

```typescript
const meta = {
  // ...
  subcomponents: { ButtonIcon },
} satisfies Meta<typeof Button>;
```

---

## 3. MDX Documentation Pages — Structure and Examples

### Two MDX Modes in Storybook 8

**Mode A: Attached MDX** — replaces the auto-generated Docs tab for a specific component. Lives alongside the `.stories.tsx` file and references it.

**Mode B: Standalone MDX** — a freestanding documentation page with no associated stories. Used for token preview pages, concept docs, getting-started guides.

Both are placed anywhere in the `stories` glob (e.g. `src/**/*.mdx`).

### Mode A: Attached Component Docs Page

```mdx
{/* src/components/Button/Button.mdx */}
import { Meta, Story, Canvas, Controls, ArgTypes, Description } from "@storybook/blocks";
import * as ButtonStories from "./Button.stories";

<Meta of={ButtonStories} />

# Button

The Button primitive maps directly to semantic action tokens. It is the base
interactive element across all surfaces.

<Description of={ButtonStories} />

## Usage

```tsx
import { Button } from "@design-system-x/primitives";

<Button label="Save changes" variant="primary" size="md" />
```

## States

<Canvas of={ButtonStories.Default} />
<Canvas of={ButtonStories.Secondary} />
<Canvas of={ButtonStories.Disabled} />

## All Variants

<Canvas of={ButtonStories.AllVariants} />

## Props

<Controls of={ButtonStories.Default} />

## Full Props Reference

<ArgTypes of={ButtonStories} />
```

To use an attached MDX file instead of auto-generated docs, reference it in the story file:

```typescript
// Button.stories.tsx
const meta = {
  title: "Primitives/Button",
  component: Button,
  parameters: {
    docs: {
      page: () => import("./Button.mdx"), // swap Autodocs for your MDX
    },
  },
} satisfies Meta<typeof Button>;
```

### Mode B: Standalone Token Preview Page

```mdx
{/* src/stories/tokens/Colors.mdx */}
import { Meta, ColorPalette, ColorItem } from "@storybook/blocks";

<Meta title="Tokens/Color" />

# Color Tokens

All primitive color tokens. These are the raw values — do not use these
directly in components. Use semantic tokens (`color.action.*`, `color.surface.*`)
which reference these primitives.

## Brand Blue

<ColorPalette>
  <ColorItem
    title="color.brand-blue"
    subtitle="Blue scale"
    colors={{
      "50":  "var(--color-brand-blue-50)",
      "100": "var(--color-brand-blue-100)",
      "200": "var(--color-brand-blue-200)",
      "300": "var(--color-brand-blue-300)",
      "400": "var(--color-brand-blue-400)",
      "500": "var(--color-brand-blue-500)",
      "600": "var(--color-brand-blue-600)",
      "700": "var(--color-brand-blue-700)",
      "800": "var(--color-brand-blue-800)",
      "900": "var(--color-brand-blue-900)",
    }}
  />
</ColorPalette>
```

The `ColorPalette` and `ColorItem` components are built into `@storybook/blocks` (part of addon-essentials). They render swatches with the resolved CSS variable values automatically — no custom code needed for basic color grids.

### Standalone Structural Template

For every token category, create one MDX file:

```
src/
  stories/
    tokens/
      Colors.mdx       — color palette
      Typography.mdx   — type scale
      Spacing.mdx      — spacing scale
      Elevation.mdx    — shadow tokens
      Grid.mdx         — breakpoints and grid config
    styles/
      TextStyles.mdx   — composed text styles using tokens
      SurfaceStyles.mdx
    introduction/
      GettingStarted.mdx
      TokenArchitecture.mdx
```

---

## 4. Token Preview Pages — Visual Approaches by Category

### 4a. Color Palette

Use the built-in `ColorPalette` + `ColorItem` blocks from `@storybook/blocks`. These render a grid of labelled swatches.

```mdx
{/* src/stories/tokens/Colors.mdx */}
import { Meta, ColorPalette, ColorItem } from "@storybook/blocks";

<Meta title="Tokens/Color Palette" />

# Color Palette

## Neutral

<ColorPalette>
  <ColorItem
    title="color.neutral"
    subtitle="Gray scale"
    colors={{
      "0":   "var(--color-neutral-0)",
      "50":  "var(--color-neutral-50)",
      "100": "var(--color-neutral-100)",
      "200": "var(--color-neutral-200)",
      "300": "var(--color-neutral-300)",
      "400": "var(--color-neutral-400)",
      "500": "var(--color-neutral-500)",
      "600": "var(--color-neutral-600)",
      "700": "var(--color-neutral-700)",
      "800": "var(--color-neutral-800)",
      "900": "var(--color-neutral-900)",
      "1000":"var(--color-neutral-1000)",
    }}
  />
</ColorPalette>

## Brand Blue

<ColorPalette>
  <ColorItem
    title="color.brand-blue"
    subtitle="Primary brand color scale"
    colors={{
      "50":  "var(--color-brand-blue-50)",
      "500": "var(--color-brand-blue-500)",
      "700": "var(--color-brand-blue-700)",
      "900": "var(--color-brand-blue-900)",
    }}
  />
</ColorPalette>
```

For token values alongside swatches (hex codes), use a custom React component embedded in MDX:

```tsx
// src/stories/tokens/ColorSwatch.tsx
interface ColorSwatchProps {
  name: string;
  cssVar: string;
  value: string; // hex or rgb — pulled from your TypeScript token export
}

export const ColorSwatch = ({ name, cssVar, value }: ColorSwatchProps) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 6,
        background: `var(${cssVar})`,
        border: "1px solid rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    />
    <div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#666" }}>{cssVar}</div>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#999" }}>{value}</div>
    </div>
  </div>
);
```

```mdx
import { ColorSwatch } from "./ColorSwatch";
import { colorTokens } from "../../tokens"; // your Style Dictionary TypeScript export

## Semantic Colors

{Object.entries(colorTokens.semantic).map(([key, token]) => (
  <ColorSwatch
    key={key}
    name={key}
    cssVar={`--${key.replace(/\./g, "-")}`}
    value={token.$value}
  />
))}
```

### 4b. Typography Scale

No built-in Storybook block. Use a custom React component:

```tsx
// src/stories/tokens/TypeScaleRow.tsx
interface TypeScaleRowProps {
  name: string;          // e.g. "typography.size.xl"
  cssVar: string;        // e.g. "--typography-size-xl"
  size: string;          // resolved value e.g. "24px"
  lineHeight: string;
  weight?: string;
  specimen?: string;
}

export const TypeScaleRow = ({
  name, cssVar, size, lineHeight, weight = "400", specimen = "The quick brown fox",
}: TypeScaleRowProps) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    gap: 16,
    padding: "16px 0",
    borderBottom: "1px solid var(--color-neutral-200, #e5e5e5)",
    alignItems: "baseline",
  }}>
    <div>
      <div style={{ fontWeight: 600, fontSize: 12 }}>{name}</div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#888", marginTop: 4 }}>
        {size} / {lineHeight}lh · w{weight}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#aaa" }}>{cssVar}</div>
    </div>
    <div style={{ fontSize: `var(${cssVar})`, lineHeight, fontWeight: weight }}>
      {specimen}
    </div>
  </div>
);
```

```mdx
{/* src/stories/tokens/Typography.mdx */}
import { Meta } from "@storybook/blocks";
import { TypeScaleRow } from "./TypeScaleRow";

<Meta title="Tokens/Typography Scale" />

# Typography Scale

Primitive type tokens. Map to `typography.size.*`, `typography.line-height.*`, `typography.weight.*`.

<TypeScaleRow name="typography.size.xs"   cssVar="--typography-size-xs"   size="12px" lineHeight="1.5" />
<TypeScaleRow name="typography.size.sm"   cssVar="--typography-size-sm"   size="14px" lineHeight="1.5" />
<TypeScaleRow name="typography.size.md"   cssVar="--typography-size-md"   size="16px" lineHeight="1.5" />
<TypeScaleRow name="typography.size.lg"   cssVar="--typography-size-lg"   size="18px" lineHeight="1.4" />
<TypeScaleRow name="typography.size.xl"   cssVar="--typography-size-xl"   size="24px" lineHeight="1.3" />
<TypeScaleRow name="typography.size.2xl"  cssVar="--typography-size-2xl"  size="32px" lineHeight="1.2" />
<TypeScaleRow name="typography.size.3xl"  cssVar="--typography-size-3xl"  size="48px" lineHeight="1.1" />
<TypeScaleRow name="typography.size.4xl"  cssVar="--typography-size-4xl"  size="64px" lineHeight="1.0" />
```

### 4c. Spacing Scale

```tsx
// src/stories/tokens/SpacingRow.tsx
interface SpacingRowProps {
  name: string;   // e.g. "spacing.4"
  cssVar: string; // e.g. "--spacing-4"
  value: string;  // e.g. "16px"
}

export const SpacingRow = ({ name, cssVar, value }: SpacingRowProps) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "180px 80px 1fr",
    gap: 16,
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid var(--color-neutral-100, #f0f0f0)",
  }}>
    <div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#888" }}>{cssVar}</div>
    </div>
    <div style={{ fontFamily: "monospace", fontSize: 12, color: "#555" }}>{value}</div>
    {/* Visual bar scaled to the spacing value */}
    <div style={{
      height: 16,
      width: `var(${cssVar})`,
      background: "var(--color-brand-blue-400, #60a5fa)",
      borderRadius: 2,
      minWidth: 2,
    }} />
  </div>
);
```

```mdx
{/* src/stories/tokens/Spacing.mdx */}
import { Meta } from "@storybook/blocks";
import { SpacingRow } from "./SpacingRow";

<Meta title="Tokens/Spacing Scale" />

# Spacing Scale

All primitive spacing tokens. Use semantic spacing tokens (`spacing.component.*`,
`spacing.layout.*`) in components — these are the raw values those reference.

<SpacingRow name="spacing.0"  cssVar="--spacing-0"  value="0px"   />
<SpacingRow name="spacing.1"  cssVar="--spacing-1"  value="4px"   />
<SpacingRow name="spacing.2"  cssVar="--spacing-2"  value="8px"   />
<SpacingRow name="spacing.3"  cssVar="--spacing-3"  value="12px"  />
<SpacingRow name="spacing.4"  cssVar="--spacing-4"  value="16px"  />
<SpacingRow name="spacing.5"  cssVar="--spacing-5"  value="20px"  />
<SpacingRow name="spacing.6"  cssVar="--spacing-6"  value="24px"  />
<SpacingRow name="spacing.8"  cssVar="--spacing-8"  value="32px"  />
<SpacingRow name="spacing.10" cssVar="--spacing-10" value="40px"  />
<SpacingRow name="spacing.12" cssVar="--spacing-12" value="48px"  />
<SpacingRow name="spacing.16" cssVar="--spacing-16" value="64px"  />
<SpacingRow name="spacing.20" cssVar="--spacing-20" value="80px"  />
<SpacingRow name="spacing.24" cssVar="--spacing-24" value="96px"  />
```

### 4d. Elevation (Shadows)

```tsx
// src/stories/tokens/ElevationCard.tsx
interface ElevationCardProps {
  name: string;
  cssVar: string;
  value: string; // the raw box-shadow value
  level: number; // 0-5
}

export const ElevationCard = ({ name, cssVar, value, level }: ElevationCardProps) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
  }}>
    <div style={{
      width: 120,
      height: 80,
      borderRadius: 8,
      background: "var(--color-neutral-0, #ffffff)",
      boxShadow: `var(${cssVar})`,
    }} />
    <div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#888" }}>{cssVar}</div>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#aaa", maxWidth: 200, wordBreak: "break-all" }}>{value}</div>
    </div>
  </div>
);
```

```mdx
{/* src/stories/tokens/Elevation.mdx */}
import { Meta } from "@storybook/blocks";
import { ElevationCard } from "./ElevationCard";

<Meta title="Tokens/Elevation" />

# Elevation

Shadow tokens representing depth levels. Use `elevation.0` through `elevation.5`.

<div style={{ display: "flex", flexWrap: "wrap", gap: 32, padding: 24 }}>
  <ElevationCard name="elevation.0" cssVar="--elevation-0" value="none"                         level={0} />
  <ElevationCard name="elevation.1" cssVar="--elevation-1" value="0 1px 2px rgba(0,0,0,0.05)"  level={1} />
  <ElevationCard name="elevation.2" cssVar="--elevation-2" value="0 2px 8px rgba(0,0,0,0.08)"  level={2} />
  <ElevationCard name="elevation.3" cssVar="--elevation-3" value="0 4px 16px rgba(0,0,0,0.12)" level={3} />
  <ElevationCard name="elevation.4" cssVar="--elevation-4" value="0 8px 24px rgba(0,0,0,0.16)" level={4} />
  <ElevationCard name="elevation.5" cssVar="--elevation-5" value="0 16px 48px rgba(0,0,0,0.2)" level={5} />
</div>
```

### 4e. Grid and Breakpoints

```tsx
// src/stories/tokens/BreakpointRow.tsx
interface BreakpointRowProps {
  name: string;       // e.g. "grid.breakpoint.sm"
  cssVar: string;
  value: string;      // e.g. "640px"
  columns: number;
  gutter: string;
  margin: string;
}

export const BreakpointRow = ({ name, cssVar, value, columns, gutter, margin }: BreakpointRowProps) => (
  <div style={{
    padding: "16px 0",
    borderBottom: "1px solid var(--color-neutral-200, #e5e5e5)",
  }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "160px 80px 60px 80px 80px",
      gap: 16,
      fontSize: 13,
      alignItems: "center",
    }}>
      <div>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#888" }}>{cssVar}</div>
      </div>
      <div style={{ fontFamily: "monospace" }}>{value}</div>
      <div>{columns} col</div>
      <div>{gutter} gutter</div>
      <div>{margin} margin</div>
    </div>
    {/* Mini grid visualizer */}
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: gutter,
      marginTop: 8,
      padding: `0 ${margin}`,
    }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} style={{ height: 8, background: "var(--color-brand-blue-100, #dbeafe)", borderRadius: 2 }} />
      ))}
    </div>
  </div>
);
```

```mdx
{/* src/stories/tokens/Grid.mdx */}
import { Meta } from "@storybook/blocks";
import { BreakpointRow } from "./BreakpointRow";

<Meta title="Tokens/Grid & Breakpoints" />

# Grid & Breakpoints

| | Breakpoint | Columns | Gutter | Margin |
|-|------------|---------|--------|--------|
| xs | 0px+ | 4 | 16px | 16px |
| sm | 640px+ | 4 | 16px | 24px |
| md | 768px+ | 8 | 24px | 32px |
| lg | 1024px+ | 12 | 24px | 40px |
| xl | 1280px+ | 12 | 32px | 80px |
| 2xl | 1536px+ | 12 | 32px | 120px |

<BreakpointRow name="grid.breakpoint.xs"  cssVar="--grid-breakpoint-xs"  value="0px"    columns={4}  gutter="16px" margin="16px"  />
<BreakpointRow name="grid.breakpoint.sm"  cssVar="--grid-breakpoint-sm"  value="640px"  columns={4}  gutter="16px" margin="24px"  />
<BreakpointRow name="grid.breakpoint.md"  cssVar="--grid-breakpoint-md"  value="768px"  columns={8}  gutter="24px" margin="32px"  />
<BreakpointRow name="grid.breakpoint.lg"  cssVar="--grid-breakpoint-lg"  value="1024px" columns={12} gutter="24px" margin="40px"  />
<BreakpointRow name="grid.breakpoint.xl"  cssVar="--grid-breakpoint-xl"  value="1280px" columns={12} gutter="32px" margin="80px"  />
<BreakpointRow name="grid.breakpoint.2xl" cssVar="--grid-breakpoint-2xl" value="1536px" columns={12} gutter="32px" margin="120px" />
```

---

## 5. Storybook Controls — Interactive Prop Controls

Controls are configured in the `argTypes` field of a story's `meta` object. `react-docgen-typescript` infers most controls automatically; `argTypes` lets you override or enrich them.

### Control Type Reference

| Prop type in TypeScript | Auto-inferred control | Override with |
|------------------------|----------------------|---------------|
| `string` | `text` | `{ control: "text" }` |
| `boolean` | `boolean` | `{ control: "boolean" }` |
| `number` | `number` | `{ control: "number" }` |
| `"a" \| "b" \| "c"` | `select` | `{ control: "radio" }` for ≤4 options |
| `string[]` | `object` | custom |
| CSS color string | `color` (with swatch picker) if name matches `/color/i` | explicit matcher in preview.ts |
| `Date` | `date` | explicit matcher |

### Full argTypes Example

```typescript
// Button.stories.tsx
const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",                // radio for small enum sets
      options: ["primary", "secondary", "ghost", "danger"],
      description: "Visual variant — maps to `color.action.*` semantic tokens",
      table: {
        defaultValue: { summary: "primary" },
        type: { summary: '"primary" | "secondary" | "ghost" | "danger"' },
      },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Controls padding and font-size via spacing tokens",
      table: {
        defaultValue: { summary: "md" },
      },
    },
    disabled: {
      control: "boolean",
    },
    onClick: {
      // Hide event handler from controls panel — not interactable
      table: { disable: true },
    },
  },
  args: {
    label: "Button",
    variant: "primary",
    size: "md",
    disabled: false,
  },
} satisfies Meta<typeof Button>;
```

### Disabling Controls for Token Preview Stories

Token pages (Color, Typography, Spacing) do not need controls — they are reference pages. In those story files:

```typescript
const meta = {
  title: "Tokens/Color Palette",
  parameters: {
    controls: { disable: true }, // hide the controls panel entirely
    docs: { disable: true },     // optionally hide Docs tab too
  },
} satisfies Meta;
```

### Global Control Matchers (in `preview.ts`)

```typescript
parameters: {
  controls: {
    matchers: {
      color: /(background|color|fill|stroke|tint|shade)$/i,
      date: /Date$/,
    },
  },
},
```

Any prop whose name matches `color` pattern automatically gets the color picker control.

---

## 6. Story Structure for Primitive Components

### Typography Component — All Weights and Sizes

```typescript
// src/components/Typography/Typography.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "./Typography";

const meta = {
  title: "Primitives/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Primitive text rendering component. All props map directly to typography tokens. " +
          "Do not pass raw values — use token-mapped size, weight, and family props.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"],
      description: "Maps to `typography.size.*` tokens",
    },
    weight: {
      control: "radio",
      options: ["regular", "medium", "semibold", "bold"],
      description: "Maps to `typography.weight.*` tokens",
    },
    family: {
      control: "radio",
      options: ["sans", "serif", "mono"],
      description: "Maps to `typography.family.*` tokens",
    },
    color: {
      control: "color",
      description: "Override text color — use semantic token values",
    },
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "label"],
      description: "HTML element rendered",
    },
    children: {
      control: "text",
    },
  },
  args: {
    children: "The quick brown fox jumps over the lazy dog",
    size: "md",
    weight: "regular",
    family: "sans",
    as: "p",
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Default interactive story (shown in Controls panel) ---
export const Default: Story = {};

// --- All sizes ---
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const).map((size) => (
        <Typography key={size} size={size} weight="regular">
          {size} — The quick brown fox
        </Typography>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "All size steps from `typography.size.xs` to `typography.size.4xl`.",
      },
    },
  },
};

// --- All weights ---
export const AllWeights: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(["regular", "medium", "semibold", "bold"] as const).map((weight) => (
        <Typography key={weight} size="xl" weight={weight}>
          {weight} — The quick brown fox
        </Typography>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// --- All families ---
export const AllFamilies: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["sans", "serif", "mono"] as const).map((family) => (
        <Typography key={family} size="lg" weight="regular" family={family}>
          {family} — The quick brown fox jumps over the lazy dog
        </Typography>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// --- Semantic heading hierarchy ---
export const HeadingHierarchy: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Typography size="4xl" weight="bold" as="h1">H1 Display Heading</Typography>
      <Typography size="3xl" weight="bold" as="h2">H2 Section Heading</Typography>
      <Typography size="2xl" weight="semibold" as="h3">H3 Sub-section Heading</Typography>
      <Typography size="xl" weight="semibold" as="h4">H4 Card Heading</Typography>
      <Typography size="lg" weight="medium" as="h5">H5 Label Heading</Typography>
      <Typography size="md" weight="regular" as="p">
        Body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Typography>
      <Typography size="sm" weight="regular" as="span">
        Caption / helper text — small supporting content.
      </Typography>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// --- Individual pinned stories for the Docs tab sidebar ---
export const ExtraSmall: Story = { args: { size: "xs" } };
export const Small:      Story = { args: { size: "sm" } };
export const Medium:     Story = { args: { size: "md" } };
export const Large:      Story = { args: { size: "lg" } };
export const XLarge:     Story = { args: { size: "xl" } };

export const Regular:    Story = { args: { weight: "regular" } };
export const Medium_W:   Story = { args: { weight: "medium",   name: "Medium Weight" } };
export const Semibold:   Story = { args: { weight: "semibold" } };
export const Bold:       Story = { args: { weight: "bold" } };
```

### Color Swatch Story (All Swatches with Values)

For the color token page, use a standalone MDX file (section 4a). However, if you want an actual `.stories.tsx` for the Storybook sidebar with proper filtering, use a render-only story:

```typescript
// src/stories/tokens/ColorPalette.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ColorSwatchGrid } from "./ColorSwatchGrid"; // custom display component
import { primitiveColorTokens } from "../../tokens/primitive"; // SD TypeScript export

const meta = {
  title: "Tokens/Color Palette",
  component: ColorSwatchGrid,
  parameters: {
    controls: { disable: true },
    backgrounds: { disable: true }, // token page manages its own background
    layout: "fullscreen",
  },
} satisfies Meta<typeof ColorSwatchGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  render: () => (
    <ColorSwatchGrid
      title="Neutral"
      tokens={primitiveColorTokens.neutral}
    />
  ),
};

export const BrandBlue: Story = {
  render: () => (
    <ColorSwatchGrid
      title="Brand Blue"
      tokens={primitiveColorTokens.brandBlue}
    />
  ),
};

export const AllColors: Story = {
  render: () => (
    <div>
      {Object.entries(primitiveColorTokens).map(([group, tokens]) => (
        <ColorSwatchGrid key={group} title={group} tokens={tokens} />
      ))}
    </div>
  ),
};
```

### Spacing Story — Visual Scale

```typescript
// src/stories/tokens/Spacing.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";

// Simple inline render — no component needed
const meta = {
  title: "Tokens/Spacing Scale",
  parameters: {
    controls: { disable: true },
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const spacingSteps = [
  { name: "spacing.0",  var: "--spacing-0",  px: 0   },
  { name: "spacing.1",  var: "--spacing-1",  px: 4   },
  { name: "spacing.2",  var: "--spacing-2",  px: 8   },
  { name: "spacing.3",  var: "--spacing-3",  px: 12  },
  { name: "spacing.4",  var: "--spacing-4",  px: 16  },
  { name: "spacing.6",  var: "--spacing-6",  px: 24  },
  { name: "spacing.8",  var: "--spacing-8",  px: 32  },
  { name: "spacing.10", var: "--spacing-10", px: 40  },
  { name: "spacing.12", var: "--spacing-12", px: 48  },
  { name: "spacing.16", var: "--spacing-16", px: 64  },
  { name: "spacing.20", var: "--spacing-20", px: 80  },
  { name: "spacing.24", var: "--spacing-24", px: 96  },
];

export const SpacingScale: Story = {
  render: () => (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Spacing Scale</h2>
      {spacingSteps.map(({ name, var: cssVar, px }) => (
        <div key={name} style={{
          display: "grid",
          gridTemplateColumns: "160px 60px 1fr",
          alignItems: "center",
          gap: 16,
          padding: "8px 0",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <code style={{ fontSize: 12 }}>{name}</code>
          <span style={{ fontSize: 12, color: "#888" }}>{px}px</span>
          <div style={{
            height: 12,
            width: px === 0 ? 2 : px,
            background: "#60a5fa",
            borderRadius: 2,
            minWidth: 2,
          }} />
        </div>
      ))}
    </div>
  ),
};
```

### Icon Story — All States

```typescript
// src/components/Icon/Icon.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./Icon";

const meta = {
  title: "Primitives/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text" },
    size: { control: "radio", options: ["xs", "sm", "md", "lg", "xl"] },
    color: { control: "color" },
  },
  args: { name: "star", size: "md" },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} style={{ textAlign: "center" }}>
          <Icon name="star" size={size} />
          <div style={{ fontSize: 10, marginTop: 4 }}>{size}</div>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
```

---

## 7. Figma Integration — `@storybook/addon-designs`

Per `PROJECT.md`, both `@storybook/addon-designs` (Figma in Storybook) and Figma Code Connect (code in Figma Dev Mode) are required.

### addon-designs Setup

```typescript
// In any story file, add to parameters:
export const Default: Story = {
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/[FILE_ID]/[FILE_NAME]?node-id=[NODE_ID]",
    },
  },
};
```

Set at the meta level to apply to all stories in the file:

```typescript
const meta = {
  title: "Primitives/Button",
  component: Button,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ABC123/Design-System-X?node-id=123%3A456",
    },
  },
} satisfies Meta<typeof Button>;
```

### Figma Code Connect

Code Connect is a separate tool from the Storybook addon. It runs as a CLI step that uploads code snippets to Figma so they appear in Dev Mode. Add to each component:

```typescript
// src/components/Button/Button.figma.tsx
import figma from "@figma/code-connect";
import { Button } from "./Button";

figma.connect(Button, "https://www.figma.com/file/ABC123?node-id=123:456", {
  props: {
    label: figma.string("Label"),
    variant: figma.enum("Variant", {
      Primary: "primary",
      Secondary: "secondary",
      Ghost: "ghost",
      Danger: "danger",
    }),
    size: figma.enum("Size", {
      Small: "sm",
      Medium: "md",
      Large: "lg",
    }),
    disabled: figma.boolean("Disabled"),
  },
  example: ({ label, variant, size, disabled }) => (
    <Button label={label} variant={variant} size={size} disabled={disabled} />
  ),
});
```

Publish with:

```bash
npx figma connect publish --token $FIGMA_ACCESS_TOKEN
```

---

## 8. Sidebar Navigation Structure

Storybook sidebar is controlled by the `title` field in each story's `meta`. Use `/` separators to create groups. Recommended structure for Design System X:

```
Introduction
  Getting Started
  Token Architecture
  Contributing

Tokens
  Color Palette
  Typography Scale
  Spacing Scale
  Elevation
  Grid & Breakpoints

Styles
  Text Styles
  Surface Styles

Primitives
  Typography
  Icon
  [future primitive components]
```

Map to titles:

```typescript
title: "Introduction/Getting Started"
title: "Introduction/Token Architecture"
title: "Tokens/Color Palette"
title: "Tokens/Typography Scale"
title: "Tokens/Spacing Scale"
title: "Tokens/Elevation"
title: "Tokens/Grid & Breakpoints"
title: "Styles/Text Styles"
title: "Styles/Surface Styles"
title: "Primitives/Typography"
title: "Primitives/Icon"
```

To control sort order, use `storySort` in `preview.ts`:

```typescript
const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Introduction",
          ["Getting Started", "Token Architecture", "Contributing"],
          "Tokens",
          ["Color Palette", "Typography Scale", "Spacing Scale", "Elevation", "Grid & Breakpoints"],
          "Styles",
          "Primitives",
        ],
      },
    },
  },
};
```

---

## 9. Key Configuration Details and Pitfalls

### react-docgen-typescript vs react-docgen

Storybook 8 defaults to `react-docgen` (faster, JS-based). For TypeScript interface extraction you must explicitly set:

```typescript
typescript: {
  reactDocgen: "react-docgen-typescript",
}
```

Without this, props tables will be incomplete — union types won't resolve, JSDoc won't appear.

### `satisfies` vs `as` in meta definition

Always use `satisfies Meta<typeof Component>` (not `as Meta<typeof Component>`). `satisfies` preserves the literal type of `args` so TypeScript can typecheck story args properly and Controls can infer types.

### MDX 3 in Storybook 8

Storybook 8 uses MDX 3 (not MDX 2). The import style changed:

```mdx
// Storybook 8 / MDX 3 — correct
import { Meta, Canvas, Controls } from "@storybook/blocks";

// Do NOT use the old Storybook 6/7 MDX format:
// import { Meta } from "@storybook/addon-docs/blocks"; // WRONG in v8
```

### CSS Custom Properties in Stories

CSS custom properties (from Style Dictionary output) must be imported in `preview.ts` to be available in all stories and MDX files. Import the generated CSS file once globally:

```typescript
// .storybook/preview.ts
import "../src/tokens/tokens.css"; // your Style Dictionary CSS output
```

### TypeScript Path Aliases

If using `@/` path aliases (e.g. via Vite's `resolve.alias`), mirror the same alias config in `.storybook/main.ts`:

```typescript
// .storybook/main.ts
import path from "path";

const config: StorybookConfig = {
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
    };
    return config;
  },
};
```

### Token TypeScript Export Shape

For the custom token preview components (ColorSwatch, SpacingRow, etc.) to import from the TypeScript token export, your Style Dictionary output should export a structured object. Example expected shape:

```typescript
// src/tokens/index.ts (generated by Style Dictionary)
export const primitiveColorTokens = {
  neutral: {
    "0":   { $value: "#ffffff", $type: "color" },
    "50":  { $value: "#fafafa", $type: "color" },
    "100": { $value: "#f5f5f5", $type: "color" },
    // ...
  },
  brandBlue: {
    "50":  { $value: "#eff6ff", $type: "color" },
    // ...
  },
};
```

Style Dictionary v4 with W3C DTCG format produces `$value` and `$type` fields natively — this aligns directly with what your token preview components expect.

---

## 10. Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Storybook 8.x core API | HIGH | Stable since early 2024; `Meta`, `StoryObj`, `satisfies` pattern is current API |
| autodocs + react-docgen-typescript | HIGH | Well-documented; config in main.ts is verified pattern |
| MDX 3 blocks API | HIGH | `@storybook/blocks` is the correct import; ColorPalette/ColorItem are real |
| addon-designs API | HIGH | `parameters.design.type: "figma"` is stable pattern |
| Figma Code Connect API | MEDIUM | Correct as of mid-2024; verify `@figma/code-connect` package version before use |
| Style Dictionary v4 DTCG output shape | HIGH | `$value`/`$type` fields are W3C DTCG spec; SD v4 natively supports this |
| Custom token preview components | HIGH | These are custom React components — patterns are sound |

Web search and WebFetch were unavailable during this research session. All findings draw from training data covering Storybook 8.x through August 2025. The core Storybook 8 API is stable and unlikely to have breaking changes in this area. Verify `@figma/code-connect` current package name and version before implementing.

---

## Sources

- Storybook 8 official docs: https://storybook.js.org/docs (verify current)
- Storybook Blocks API: https://storybook.js.org/docs/writing-docs/doc-blocks
- react-docgen-typescript: https://github.com/styleguidist/react-docgen-typescript
- Figma Code Connect: https://github.com/figma/code-connect
- @storybook/addon-designs: https://github.com/storybookjs/addon-designs
- Style Dictionary v4 DTCG: https://styledictionary.com/reference/dtcg/
