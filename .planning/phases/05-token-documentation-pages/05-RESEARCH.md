# Phase 5: Token Documentation Pages - Research

**Researched:** 2026-03-23
**Domain:** Storybook 10 MDX documentation, globalTypes toolbar, CSS data-attribute theming, Style Dictionary v4 selector refactor
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Brand switching uses data attributes — `[data-brand="parent"]`, `[data-brand="child"]` on the root element. SD config must be updated to output brand-scoped selectors.
- **D-02:** Mode switching uses data attributes — `[data-theme="light"]`, `[data-theme="dark"]`. Light mode moves OFF `:root` to explicit `[data-theme="light"]` — no implicit defaults, tokens only apply when both `data-brand` and `data-theme` are set.
- **D-03:** Storybook toolbar has two separate dropdowns — one for Brand (parent, child), one for Mode (light, dark). Independent controls.
- **D-04:** Default state: Brand = parent, Mode = light (matches current preview.tsx import).
- **D-05:** Theme selection is global and persistent — once a theme is selected, ALL pages use that theme until explicitly changed.
- **D-06:** Full detail on all token pages — every token shows: visual representation + token name + CSS variable name + raw value + alias chain.
- **D-07:** All five token categories follow the same "show everything" principle. No lighter treatment for simpler categories.
- **D-08:** Token pages show both primitive AND semantic tokens on the same page — primitives at top, semantic mappings with alias chains below. One page per category.
- **D-09:** Token pages respond to the theme switcher — semantic sections live-update to show different alias chains and resolved values per brand/mode combination.
- **D-10:** Five composition categories in v1: heading hierarchy (h1-h6), body text variants (body, caption, overline, label), surface/card patterns (background + border + elevation), interactive states (default, hover, active, focus, disabled), feedback patterns (success, warning, error, info).
- **D-11:** Styles section is split into sub-pages matching the Figma file page structure.
- **D-12:** Styles pages respond to the global theme switcher (same as token pages).
- **D-13:** Full token reference detail on Styles pages — each composition shows visual result AND lists every token used with CSS variable names.

### Claude's Discretion

- Custom React component implementation for token visualizations (spacing bars, elevation cards, typography specimens, breakpoint rulers)
- Loading skeleton and error state design
- Exact Styles sub-page naming and sidebar ordering (should mirror Figma file structure)
- ColorPalette/ColorItem usage from @storybook/blocks vs custom components — whichever produces the required detail level
- Storybook globalTypes configuration for the toolbar dropdowns
- How to dynamically swap CSS imports or apply data attributes in the Storybook decorator

### Deferred Ideas (OUT OF SCOPE)

- Component-level token documentation (component tokens are Phase 6 / v2 scope)
- Figma frame embeds in token pages via addon-designs (no Figma frame URLs available yet)
- Automated token diff / changelog page (backlog)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORY-04 | Token preview page — Color: displays full palette using `ColorPalette`/`ColorItem` blocks with hex values and token names | ColorPalette/ColorItem API verified; custom wrapper needed to hit D-06 detail level; theme-reactive semantic section requires custom component |
| STORY-05 | Token preview page — Typography: displays all font families, weights, sizes, and line heights | Custom React component reading CSS vars; 13 type scale steps documented in primitives |
| STORY-06 | Token preview page — Spacing: visual scale showing all spacing steps with pixel values and token names | Custom React component; 36 spacing steps documented in primitives |
| STORY-07 | Token preview page — Elevation: displays all shadow levels with visual examples | Custom React component; shadow vars are decomposed (color/offsetX/offsetY/blur/spread sub-props) — box-shadow must be reassembled in component |
| STORY-08 | Token preview page — Grid/Breakpoints: displays breakpoint values and grid column configurations | TypeScript constants already exported from `dist/index.js`; use for static breakpoint ruler |
| STORY-09 | Styles preview section — shows composed primitive styles (headings, body text, surfaces, interactive states, feedback) | Five sub-pages per D-11; each page uses global theme globals and shows token reference table per D-13 |
</phase_requirements>

---

## Summary

Phase 5 has three interlocked work streams that must be sequenced correctly.

The first — and most blocking — is the Style Dictionary selector refactor. Currently `dist/parent-brand/light.css` uses `:root` and `dist/parent-brand/dark.css` uses `[data-theme="dark"]`. Both brands share the same selectors, meaning one brand's tokens silently overwrite the other. Decision D-01 and D-02 require compound selectors: `[data-brand="parent"][data-theme="light"]`, `[data-brand="parent"][data-theme="dark"]`, `[data-brand="child"][data-theme="light"]`, `[data-brand="child"][data-theme="dark"]`. This is a one-line change per SD instance (the `selector` variable). SD's `css/variables` format `options.selector` accepts arbitrary CSS selector strings — confirmed by documentation. The CSS file export paths in `package.json` and the `preview.tsx` imports do not need to change; only the CSS selector inside each file changes.

The second stream is the Storybook preview.tsx refactor. The current static CSS import (`import '@design-system-x/tokens/parent-brand/light'`) must be replaced with a decorator that reads two `globalTypes` globals (`brand`, `mode`) and applies them as `data-brand` and `data-theme` attributes on `document.documentElement`. Using `useEffect` inside a decorator is the standard pattern for this. The `initialGlobals` key sets the default values (parent + light per D-04). All four CSS files remain imported statically — only the data attributes on the html element control which CSS selector block takes effect at runtime. This avoids dynamic CSS injection complexity.

The third stream is the MDX documentation pages themselves. Six token pages and five+ styles sub-pages. `@storybook/blocks` `ColorPalette`/`ColorItem` handles color swatches adequately for primitives but cannot show alias chains or theme-reactive semantic rows — those require custom React components. All other token categories (typography, spacing, elevation, grid) require custom components. Because semantic sections must live-update when the theme switcher changes, they must read `context.globals` (passed via props or a shared hook) rather than reading CSS at parse time.

**Primary recommendation:** Sequence as SD refactor → preview.tsx decorator → then all MDX pages can be authored in parallel since they share the same component patterns.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `storybook` | ^10.3.1 | Documentation framework | Already installed |
| `@storybook/react-vite` | ^10.3.1 | Vite builder | Already installed |
| `@storybook/addon-docs` | ^10.3.1 | MDX support, ColorPalette/ColorItem | Already installed |
| `@design-system-x/tokens` | workspace `*` | CSS vars + TS breakpoint constants | Already installed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@storybook/blocks` | (re-exported from `@storybook/addon-docs/blocks`) | ColorPalette, ColorItem, Meta | Color primitive swatches only |
| React | (workspace) | Custom visualization components | Spacing bars, elevation cards, typography specimens, breakpoint ruler |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static CSS import of all 4 themes + data attributes | Dynamic `import()` per theme change | Dynamic import avoids loading unused CSS but adds async complexity and flash-of-unstyled-content. Static import + data attributes is simpler and instant |
| Custom ColorPalette component for primitives | `@storybook/blocks` ColorPalette/ColorItem | Built-in handles swatch + title + subtitle well for primitive rows. Build custom only for semantic/alias-chain rows. Mix both is the right call. |
| `@storybook/addon-themes` withThemeByDataAttribute | Custom decorator | withThemeByDataAttribute supports a single attributeName. Since D-01/D-02 require TWO independent attributes (brand + theme), a custom decorator applying both is required. withThemeByDataAttribute is not used. |

**Installation:** No new packages required. All dependencies already exist in the workspace.

---

## Architecture Patterns

### Recommended Project Structure

```
apps/storybook/
├── .storybook/
│   ├── main.ts              (no changes)
│   └── preview.tsx          (refactor: globalTypes + decorator)
└── stories/
    ├── Tokens/
    │   ├── Colors.mdx
    │   ├── Typography.mdx
    │   ├── Spacing.mdx
    │   ├── Elevation.mdx
    │   └── Grid.mdx
    ├── Styles/
    │   ├── Headings.mdx
    │   ├── BodyText.mdx
    │   ├── Surfaces.mdx
    │   ├── InteractiveStates.mdx
    │   └── Feedback.mdx
    └── components/          (shared React components for visualizations)
        ├── TokenTable.tsx
        ├── ColorSwatch.tsx
        ├── TypographySpecimen.tsx
        ├── SpacingBar.tsx
        ├── ElevationCard.tsx
        └── BreakpointRuler.tsx
```

MDX pages reference components with relative imports (e.g. `import { SpacingBar } from '../components/SpacingBar'`). Storybook resolves these through Vite.

### Pattern 1: globalTypes Toolbar Configuration

**What:** Two independent toolbar dropdowns defined in `preview.tsx` globalTypes. Each stores a string global that the decorator reads.

**When to use:** Any time Storybook needs a user-controllable value that affects all pages globally.

```typescript
// Source: https://storybook.js.org/docs/essentials/toolbars-and-globals (verified)
// .storybook/preview.tsx

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Brand token set',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: [
          { value: 'parent', title: 'Parent Brand' },
          { value: 'child', title: 'Child Brand' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    brand: 'parent',
    mode: 'light',
  },
}
```

### Pattern 2: Data-Attribute Decorator

**What:** A decorator that reads `context.globals.brand` and `context.globals.mode` and applies them as `data-brand` and `data-theme` attributes on `document.documentElement`. All four semantic CSS files are imported statically at the top of preview.tsx — the data attributes act as CSS selector switches.

**When to use:** Any CSS-variable theming system that uses attribute selectors rather than class names.

```typescript
// .storybook/preview.tsx
import React, { useEffect } from 'react'
import type { Preview, Decorator } from '@storybook/react'

// Static imports — all four theme files loaded at startup
import '@design-system-x/tokens/css'
import '@design-system-x/tokens/parent-brand/light'
import '@design-system-x/tokens/parent-brand/dark'
import '@design-system-x/tokens/child-brand/light'
import '@design-system-x/tokens/child-brand/dark'

const withThemeAttributes: Decorator = (Story, context) => {
  const { brand = 'parent', mode = 'light' } = context.globals

  useEffect(() => {
    document.documentElement.setAttribute('data-brand', brand)
    document.documentElement.setAttribute('data-theme', mode)
  }, [brand, mode])

  return <Story />
}
```

**Critical:** After SD refactor, the CSS files use `[data-brand="parent"][data-theme="light"]` compound selectors — both attributes MUST be set or no semantic vars will resolve. The decorator must set both on every render. `document.documentElement` is the `<html>` element, which is outside the story iframe root but inside the preview iframe document — this is the correct target.

### Pattern 3: Style Dictionary Selector Refactor

**What:** Change the `selector` variable in the semantic loop from the current `mode === 'light' ? ':root' : '[data-theme="dark"]'` to a compound selector incorporating both brand and mode.

```javascript
// packages/tokens/style-dictionary.config.mjs
// BEFORE:
const selector = mode === 'light' ? ':root' : '[data-theme="dark"]';

// AFTER:
const selector = `[data-brand="${brand}"][data-theme="${mode}"]`;
```

SD's `css/variables` format `options.selector` accepts any CSS selector string. This single line change affects all four semantic instances. The CSS file paths, package.json exports, and Turbo outputs do not change.

### Pattern 4: Alias Chain Display Component

**What:** A React component that parses a semantic token's `$value` alias string (e.g. `{color.neutral.0}`) and resolves it recursively through the primitive JSON to show the full chain.

**When to use:** Every semantic token row on color, spacing, elevation, and styles pages (D-06 requirement).

```typescript
// stories/components/TokenTable.tsx

interface SemanticToken {
  name: string          // e.g. "color.background.default"
  cssVar: string        // e.g. "--dsx-color-background-default"
  alias: string         // e.g. "{color.neutral.0}"
  primitiveVar: string  // e.g. "--dsx-color-neutral-0"
  rawValue: string      // e.g. "#ffffff"
  description?: string
}

// Chain display: color.background.default → color.neutral.0 → #ffffff
```

The alias chain data must be computed at build time or provided as a static JSON artifact — it cannot be derived from computed CSS vars at runtime (CSS vars are opaque at runtime). The simplest approach: import the semantic token JSON files directly in the MDX component and parse them in the component.

### Pattern 5: MDX Page Structure

**What:** MDX pages use `Meta title="Tokens/Colors"` for sidebar grouping. Components are imported at the top. Pages are split into a primitive section (static, no theme dependency) and a semantic section (theme-reactive via context.globals).

```mdx
// stories/Tokens/Colors.mdx
import { Meta } from '@storybook/addon-docs/blocks'
import { ColorPalette, ColorItem } from '@storybook/addon-docs/blocks'
import { SemanticColorTable } from '../components/TokenTable'

<Meta title="Tokens/Colors" />

# Colors

## Primitive Palette
<ColorPalette>
  <ColorItem title="Brand" subtitle="color.brand.*" colors={{ ... }} />
</ColorPalette>

## Semantic Mappings
<SemanticColorTable />
```

The `SemanticColorTable` component accesses `context.globals` via `useGlobals` from `@storybook/preview-api` — or more practically, via Storybook's `useGlobals` React hook — to re-render when theme/brand switches.

### Anti-Patterns to Avoid

- **Hardcoding hex values in MDX:** Primitive color swatches should reference the JSON source or a static import, not magic strings. Stale documentation is worse than no documentation.
- **Reading CSS computed values with getComputedStyle for alias chains:** CSS custom property values returned by `getComputedStyle` are the resolved `var(--dsx-*)` strings, not the original alias (`{color.neutral.0}`). Parse the source JSON instead.
- **Using `:root` for any semantic CSS after the SD refactor:** After D-02 is implemented, `:root` contains only primitives. Semantic vars only load when both data attributes are set. Any page that forgets `data-brand` and `data-theme` will have broken semantic tokens.
- **Using React hooks directly inside MDX:** MDX is compiled to JSX but component-level hooks require a proper function component wrapper. Put hook logic in `.tsx` components, not inline MDX.
- **`@storybook/addon-themes` withThemeByDataAttribute:** This helper only manages a single `attributeName`. It cannot drive both `data-brand` and `data-theme` independently. Do not use it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color swatch grid for primitives | Custom grid layout | `ColorPalette`/`ColorItem` from `@storybook/addon-docs/blocks` | Built-in, handles labels, subtitle, hex values, accessible contrast display |
| Global toolbar dropdowns | Custom addon panel | `globalTypes` + `toolbar` in `preview.ts` | Native Storybook API, persists across pages, integrates with URL state |
| CSS selector scoping for multi-brand/mode | Custom CSS injection at runtime | SD `selector` option in `style-dictionary.config.mjs` | SD already runs a build loop per brand×mode — just change the selector string |
| Shadow reassembly for elevation cards | Complex CSS string builder | Inline style with individual shadow sub-properties read via `getComputedStyle` OR hardcode from known token values | Shadow vars are already decomposed into `--dsx-shadow-md-1-color`, `--dsx-shadow-md-1-offset-x`, etc. — read and reassemble |

**Key insight:** The alias chain display is the one truly custom piece. Everything else leverages existing SD output and Storybook APIs.

---

## CSS Architecture: The SD Selector Refactor

This is the most critical prerequisite for Phase 5. Without it, both brands share the same CSS selectors and one overwrites the other.

### Current State (must change)

```css
/* dist/parent-brand/light.css */
:root { --dsx-color-background-default: var(--dsx-color-neutral-0); }

/* dist/parent-brand/dark.css */
[data-theme="dark"] { --dsx-color-background-default: var(--dsx-color-neutral-900); }

/* dist/child-brand/light.css */
:root { --dsx-color-background-default: var(--dsx-color-neutral-0); }  /* OVERWRITES parent-brand/light */

/* dist/child-brand/dark.css */
[data-theme="dark"] { --dsx-color-background-default: var(--dsx-color-slate-500); }  /* OVERWRITES parent-brand/dark */
```

### Target State (D-01 + D-02)

```css
/* dist/parent-brand/light.css */
[data-brand="parent"][data-theme="light"] { --dsx-color-background-default: var(--dsx-color-neutral-0); }

/* dist/parent-brand/dark.css */
[data-brand="parent"][data-theme="dark"] { --dsx-color-background-default: var(--dsx-color-neutral-900); }

/* dist/child-brand/light.css */
[data-brand="child"][data-theme="light"] { --dsx-color-background-default: var(--dsx-color-neutral-0); }

/* dist/child-brand/dark.css */
[data-brand="child"][data-theme="dark"] { --dsx-color-background-default: var(--dsx-color-slate-500); }
```

### SD Config Change

One line in the semantic loop:

```javascript
// BEFORE
const selector = mode === 'light' ? ':root' : `[data-theme="dark"]`;

// AFTER
const selector = `[data-brand="${brand}"][data-theme="${mode}"]`;
```

The `selector` string is passed to `options.selector` in the file config — SD's `css/variables` format accepts arbitrary CSS selector strings (HIGH confidence, verified against SD docs).

### Impact on Existing Imports

The CSS file paths do not change (`dist/parent-brand/light.css`, etc.). The package.json exports do not change. The `preview.tsx` import paths do not change. Only the CSS selector inside each file changes. All four files must be imported for the data-attribute approach to work — the current `preview.tsx` only imports one; it must be updated to import all four.

### No :root Fallback

D-02 is explicit: no `:root` fallback. If a page does not have both `data-brand` and `data-theme` set, semantic vars will not resolve. The decorator ensures both are always set on `document.documentElement`. Token pages that show raw CSS var names (e.g. `--dsx-color-background-default`) will still render because they display the var name as text, not as a computed value.

---

## Token Visualization: What Each Page Must Build

### Colors Page (STORY-04)

**Primitive section:**
- Use `ColorPalette`/`ColorItem` from `@storybook/addon-docs/blocks`
- Each `ColorItem`: title = scale name (e.g. "brand"), subtitle = "(primitive)", colors = object with shade keys and hex values
- Source: import primitive JSON directly (`packages/tokens/tokens/primitives/color.tokens.json`)
- Scales: brand (11 steps), secondary (11), navy (11), slate (5), neutral (13 steps including 0 and 1000), red/green/yellow/blue/orange/purple (Tailwind steps)

**Semantic section:**
- Custom `SemanticColorTable` component
- Reads `context.globals` for brand + mode to determine which semantic JSON to show
- Columns: token name, CSS variable, alias, primitive CSS var, raw hex, description
- Source: import semantic JSON for each brand/mode combination, switch on globals
- Responds to theme switcher live (re-renders when globals change)

### Typography Page (STORY-05)

**Primitive section:**
- Custom `TypographySpecimen` component
- For each scale step: render specimen text at that size, show token name, CSS var names (font-family, size, weight, line-height, letter-spacing)
- 13 steps: text-xs through text-9xl
- Also: font.family.default and font.family.variable (no visual specimen, just the font-family name and CSS var)

**Note on shadow sub-vars for composite tokens:** Typography CSS vars are also decomposed in the SD output. A typography CSS var would be something like `--dsx-typography-text-base-font-size: 16px`. Verify actual var names in `dist/css/tokens.css` before coding.

### Spacing Page (STORY-06)

**Primitive section:**
- Custom `SpacingBar` component
- Visual: horizontal bar whose width = the spacing value (relative to max), with token name and pixel value label
- 36 steps: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96

**Semantic section:**
- Three semantic spacing groups: space.component.*, space.layout.*, space.inline.*
- Show alias chain: space.component.md → spacing.4 → 16px
- Theme-reactive (spacing semantics are brand/mode independent in current JSON, but must still respond to switcher for correctness per D-09)

### Elevation Page (STORY-07)

**Primitive section:**
- Custom `ElevationCard` component
- Visual: a card element with `box-shadow` applied — must reconstruct from decomposed sub-vars
- SD decomposes shadow composite tokens into individual CSS vars:
  - Single-layer: `--dsx-elevation-sm-color`, `--dsx-elevation-sm-offset-x`, `--dsx-elevation-sm-offset-y`, `--dsx-elevation-sm-blur`, `--dsx-elevation-sm-spread`
  - Multi-layer (md, lg, xl): `--dsx-elevation-md-1-color`, `--dsx-elevation-md-1-offset-x`, etc. and `--dsx-elevation-md-2-*`
- Reconstructed box-shadow CSS string: `{offsetX} {offsetY} {blur} {spread} {color}` for each layer, joined with `, `
- Best practice: compute the box-shadow string in the component using `getComputedStyle` on a probe element, or build static shadow strings from known token values and show them as text

**Semantic section:**
- shadow.sm → elevation.sm, shadow.md → elevation.md, shadow.lg → elevation.lg
- Show alias chain; elevation semantics in current semantic JSON alias directly to primitive elevation

### Grid/Breakpoints Page (STORY-08)

**TypeScript constants (no CSS vars):**
- Import from `@design-system-x/tokens` (re-exported from `dist/index.js`)
- Available: `GridBreakpointSm` ("640px"), `GridBreakpointMd` ("768px"), `GridBreakpointLg` ("1024px"), `GridBreakpointXl` ("1280px"), `GridBreakpoint2xl` ("1536px")
- Custom `BreakpointRuler` component: visual ruler showing proportional ranges between breakpoints, with breakpoint names, TS constant names, and px values

**No theme switcher reactivity needed:** Breakpoints are primitives-only (no semantic layer), and they are TypeScript constants (not CSS vars). The switcher has no effect on this page — document this clearly.

### Styles Pages (STORY-09)

Five sub-pages per D-10 and D-11:

| Sub-page | Title suggestion | Content |
|----------|-----------------|---------|
| Headings | `Styles/Headings` | h1-h6 hierarchy with scale, weight, line-height |
| Body Text | `Styles/Body Text` | body, caption, overline, label variants |
| Surfaces | `Styles/Surfaces` | card/panel/popover with background + border + elevation |
| Interactive States | `Styles/Interactive States` | button/link: default, hover, active, focus, disabled |
| Feedback | `Styles/Feedback` | success, warning, error, info patterns |

Each sub-page:
- Shows the visual composition
- Lists all tokens used with CSS var names and current resolved values (D-13)
- Responds to theme switcher — semantic tokens change per brand/mode (D-12)
- Token reference table: token name, CSS var, current value (read via `getComputedStyle` for live values OR show from semantic JSON)

---

## Common Pitfalls

### Pitfall 1: Shadow CSS vars are decomposed, not a single property

**What goes wrong:** Developer tries to use `var(--dsx-elevation-md)` as a `box-shadow` value. That variable does not exist. SD expands the shadow composite into `--dsx-elevation-md-1-color`, `--dsx-elevation-md-1-offset-x`, etc.

**Why it happens:** DTCG shadow type → `@tokens-studio/sd-transforms` expand composite types → individual CSS properties per layer.

**How to avoid:** Reconstruction pattern (see Elevation section above). Either compute box-shadow at component render time or hardcode the reconstructed string from known token values in a static data file.

**Warning signs:** `box-shadow: var(--dsx-elevation-md)` renders no shadow. Check `dist/css/tokens.css` for actual property names.

### Pitfall 2: Semantic vars don't resolve until both data attributes are set

**What goes wrong:** A page loads and all `var(--dsx-color-background-*)` tokens are undefined / transparent. The story preview appears broken.

**Why it happens:** After the SD refactor, no `:root` fallback exists. Both `data-brand` AND `data-theme` must be on `document.documentElement` simultaneously.

**How to avoid:** The decorator must set both attributes in the same `useEffect`. Also set attributes on initial render (not just on change). Use `initialGlobals` in preview.tsx to ensure defaults are set before any story renders.

**Warning signs:** Page canvas has no background color; any color that was working before the SD refactor now shows as transparent.

### Pitfall 3: MDX hook usage outside a React component

**What goes wrong:** Calling `useGlobals()` from `@storybook/preview-api` directly in MDX file scope throws a hook rules error.

**Why it happens:** MDX compiles to a module-level function, not a React function component. React hooks require a function component context.

**How to avoid:** Place all hook calls inside `.tsx` wrapper components. Import those components into MDX and use them as JSX. Never call hooks in the MDX file body directly.

**Warning signs:** "React hooks can only be called inside a function component" error in Storybook console.

### Pitfall 4: preview.tsx currently imports only parent-brand/light — all four must be imported

**What goes wrong:** Switching to child-brand or dark mode shows no semantic tokens (CSS selector `[data-brand="child"][data-theme="light"]` matches but no stylesheet defines it).

**Why it happens:** The current `preview.tsx` only imports `@design-system-x/tokens/parent-brand/light`. After the SD refactor, all four compound-selector CSS files must be loaded.

**How to avoid:** Add all four imports to `preview.tsx` before writing any token pages.

**Warning signs:** Brand switcher changes the data attribute but colors don't change.

### Pitfall 5: Typography and spacing composite tokens in CSS have hyphenated sub-property names

**What goes wrong:** Developer expects `--dsx-typography-text-base` as a single property. It does not exist. SD expanded the composite.

**Why it happens:** `@tokens-studio/sd-transforms` expand composite types. Typography tokens → individual properties: `--dsx-typography-text-base-font-size`, `--dsx-typography-text-base-font-weight`, etc.

**How to avoid:** Check `dist/css/tokens.css` for actual generated var names before coding visualization components. Use consistent naming: the SD prefix `dsx` + token path in kebab case.

**Warning signs:** CSS var reads as empty string.

### Pitfall 6: `@storybook/addon-designs` is registered but irrelevant to Phase 5

**What goes wrong:** Developer adds Figma design links to token MDX pages, then hits a dead end because Figma frame URLs are not available.

**Why it happens:** `@storybook/addon-designs` is already registered in `main.ts` but Figma integration is deferred to Phase 6.

**How to avoid:** Do not reference `parameters.design` in any Phase 5 MDX or story. This is explicitly out of scope per the Deferred section.

---

## Code Examples

### globalTypes + Decorator Setup (preview.tsx)

```typescript
// Source: Storybook official docs (toolbars-and-globals) + Chromatic multi-theme decorator guide
import React, { useEffect } from 'react'
import type { Preview, Decorator } from '@storybook/react'

import '@design-system-x/tokens/css'
import '@design-system-x/tokens/parent-brand/light'
import '@design-system-x/tokens/parent-brand/dark'
import '@design-system-x/tokens/child-brand/light'
import '@design-system-x/tokens/child-brand/dark'

const withThemeAttributes: Decorator = (Story, context) => {
  const { brand = 'parent', mode = 'light' } = context.globals

  useEffect(() => {
    document.documentElement.setAttribute('data-brand', brand)
    document.documentElement.setAttribute('data-theme', mode)
  }, [brand, mode])

  return <Story />
}

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Brand token set',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: [
          { value: 'parent', title: 'Parent Brand' },
          { value: 'child', title: 'Child Brand' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    brand: 'parent',
    mode: 'light',
  },
  decorators: [withThemeAttributes],
  parameters: {
    // ... existing controls and storySort config
  },
}

export default preview
```

### SD Selector Refactor (style-dictionary.config.mjs)

```javascript
// Source: existing style-dictionary.config.mjs; selector field documented at styledictionary.com
for (const brand of BRANDS) {
  for (const mode of MODES) {
    // CHANGED: compound selector — both brand and mode required
    const selector = `[data-brand="${brand}"][data-theme="${mode}"]`;
    // ... rest of SD instance config unchanged
  }
}
```

### Accessing Globals in a Visualization Component

```typescript
// Source: Storybook globals API — context.globals pattern
// stories/components/SemanticColorTable.tsx
import { useGlobals } from '@storybook/preview-api'
import parentBrandLight from '../../../packages/tokens/tokens/semantic/parent-brand/light.tokens.json'
import parentBrandDark from '../../../packages/tokens/tokens/semantic/parent-brand/dark.tokens.json'
import childBrandLight from '../../../packages/tokens/tokens/semantic/child-brand/light.tokens.json'
import childBrandDark from '../../../packages/tokens/tokens/semantic/child-brand/dark.tokens.json'

const SEMANTIC_TOKENS: Record<string, Record<string, unknown>> = {
  'parent-light': parentBrandLight,
  'parent-dark': parentBrandDark,
  'child-light': childBrandLight,
  'child-dark': childBrandDark,
}

export function SemanticColorTable() {
  const [globals] = useGlobals()
  const brand = globals.brand ?? 'parent'
  const mode = globals.mode ?? 'light'
  const tokens = SEMANTIC_TOKENS[`${brand}-${mode}`]
  // ... render rows with alias chain
}
```

**Note:** `useGlobals` from `@storybook/preview-api` is the hook for reading globals in preview-context React components. Verify this import path is available in Storybook 10 — as of Storybook 8+ it is the stable API (MEDIUM confidence — verified by Storybook decorator docs, but exact path for Storybook 10 should be confirmed at implementation time; `storybook/preview-api` is an alternative path in newer versions).

### ColorPalette for Primitive Swatches

```mdx
// Source: https://storybook.js.org/docs/api/doc-blocks/doc-block-colorpalette (verified)
import { ColorPalette, ColorItem } from '@storybook/addon-docs/blocks'

<ColorPalette>
  <ColorItem
    title="brand"
    subtitle="Teal — primary brand color"
    colors={{
      '50': '#f0fdfd',
      '500': '#4FC4C4',
      '900': '#0a4040',
    }}
  />
</ColorPalette>
```

`ColorItem.colors` accepts an object where keys become labels. Pass all 11 shades per scale for full palette display.

### ElevationCard Shadow Reconstruction

```typescript
// stories/components/ElevationCard.tsx
// Shadow vars are decomposed by SD: --dsx-elevation-md-1-color, --dsx-elevation-md-1-offset-x, etc.
// Multi-layer shadows require reading multiple sub-props and joining

function buildBoxShadow(level: 'sm' | 'md' | 'lg' | 'xl', el: HTMLElement): string {
  const style = getComputedStyle(el)
  const prefix = `--dsx-elevation-${level}`

  if (level === 'sm') {
    // Single layer
    const { color, x, y, blur, spread } = readLayer(style, prefix)
    return `${x} ${y} ${blur} ${spread} ${color}`
  }
  // Multi-layer: read -1- and -2- variants
  const l1 = readLayer(style, `${prefix}-1`)
  const l2 = readLayer(style, `${prefix}-2`)
  return `${l1.x} ${l1.y} ${l1.blur} ${l1.spread} ${l1.color}, ${l2.x} ${l2.y} ${l2.blur} ${l2.spread} ${l2.color}`
}
```

Alternatively: hardcode the shadow strings as static data (derived from known token values) in a `tokens-data.ts` file to avoid `getComputedStyle` at render time.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Storybook `parameters.decorators` | Top-level `decorators` key in preview config | Storybook 9+ | `parameters.decorators` silently ignored — already noted in STATE.md |
| Single `:root` selector for light mode | Compound `[data-brand][data-theme]` selector | Phase 5 (this phase) | Cannot have both brands loaded simultaneously without compound selectors |
| Static single CSS import | All four CSS imports + data-attribute switching | Phase 5 (this phase) | Enables live theme switching without CSS injection |
| `@storybook/addon-docs/blocks` ColorPalette for full token docs | ColorPalette for primitives + custom components for semantic layer | Current best practice | ColorPalette cannot show alias chains or respond to theme globals |

**Deprecated/outdated:**
- `:root` selector on semantic CSS files: replaced by compound `[data-brand][data-theme]` (D-01, D-02)
- Static single CSS import in `preview.tsx`: replaced by four static imports + data-attribute decorator

---

## Open Questions

1. **`useGlobals` import path in Storybook 10**
   - What we know: `useGlobals` from `@storybook/preview-api` is the documented API for reading globals in preview-context hooks (Storybook 8+)
   - What's unclear: Whether the path is `@storybook/preview-api` or `storybook/preview-api` in Storybook 10 (package was renamed in some major versions)
   - Recommendation: At implementation time, check `node_modules/@storybook/preview-api` and `node_modules/storybook/preview-api` to confirm which exists. Fall back to `context.globals` via decorator parameter if hook path is wrong — that approach does not require any import.

2. **Typography CSS var naming pattern**
   - What we know: SD expands composite tokens. Shadow tokens expand to `--dsx-shadow-sm-color`, `--dsx-shadow-sm-offset-x`, etc.
   - What's unclear: Whether typography expands similarly (`--dsx-typography-text-base-font-size`) or uses a different expansion path under `@tokens-studio/sd-transforms`
   - Recommendation: Before coding TypographySpecimen, run `cat dist/css/tokens.css | grep typography` to confirm actual generated var names.

3. **Styles sub-page sidebar ordering**
   - What we know: `storySort` in `preview.tsx` has a `'Styles'` slot. Sub-pages nest under it via slash notation in Meta title.
   - What's unclear: Whether `storySort` needs explicit child ordering for Styles sub-pages or if alphabetical default is acceptable
   - Recommendation: Add explicit `Styles: ['Headings', 'Body Text', 'Surfaces', 'Interactive States', 'Feedback']` ordering to `storySort` to match Figma file page order.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.0 + `@storybook/addon-vitest` ^10.3.1 |
| Config file | None found — Wave 0 gap |
| Quick run command | `npm run test --workspace=apps/storybook` (verify at implementation time) |
| Full suite command | `npm run test --workspace=apps/storybook` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STORY-04 | Colors MDX page renders without errors; primitive swatches show | Smoke (Storybook addon-vitest) | `npx storybook test --story Tokens/Colors` | Wave 0 |
| STORY-05 | Typography MDX page renders all 13 scale steps | Smoke | `npx storybook test --story Tokens/Typography` | Wave 0 |
| STORY-06 | Spacing MDX page renders all 36 bars | Smoke | `npx storybook test --story Tokens/Spacing` | Wave 0 |
| STORY-07 | Elevation MDX page renders cards with visible shadows | Smoke | `npx storybook test --story Tokens/Elevation` | Wave 0 |
| STORY-08 | Grid MDX page renders 5 breakpoint rows | Smoke | `npx storybook test --story Tokens/Grid` | Wave 0 |
| STORY-09 | All 5 Styles sub-pages render without errors | Smoke | `npx storybook test --story Styles/*` | Wave 0 |
| D-01/D-02 | SD refactor: semantic CSS uses compound `[data-brand][data-theme]` selectors | Manual verification | `grep "data-brand" packages/tokens/dist/parent-brand/light.css` | N/A — shell cmd |
| D-03/D-04 | Toolbar shows two dropdowns; defaults to parent/light | Manual | Open Storybook dev server | N/A |
| D-09 | Theme switcher causes semantic sections to update | Manual | Toggle Brand/Mode toolbar, observe semantic rows | N/A |

**Note:** `@storybook/addon-vitest` is already in the package.json devDependencies but no vitest config or test files were found. Wave 0 must create the vitest config.

### Sampling Rate

- **Per task commit:** `grep "data-brand" packages/tokens/dist/parent-brand/light.css` (SD refactor check)
- **Per wave merge:** `npm run build --workspace=packages/tokens && npm run dev --workspace=apps/storybook` (visual verification)
- **Phase gate:** All 6 MDX pages load without console errors; theme switcher changes visible colors

### Wave 0 Gaps

- [ ] `apps/storybook/vitest.config.ts` — needed for `@storybook/addon-vitest` test runner
- [ ] `apps/storybook/stories/Tokens/` directory — create with placeholder
- [ ] `apps/storybook/stories/Styles/` directory — create with placeholder
- [ ] `apps/storybook/stories/components/` directory — shared visualization components

---

## Sources

### Primary (HIGH confidence)

- [Storybook Toolbars & Globals](https://storybook.js.org/docs/essentials/toolbars-and-globals) — globalTypes API, initialGlobals, context.globals in decorators
- [Storybook ColorPalette doc block](https://storybook.js.org/docs/api/doc-blocks/doc-block-colorpalette) — ColorPalette/ColorItem props and MDX usage
- [Style Dictionary Formats — predefined](https://styledictionary.com/reference/hooks/formats/predefined/) — css/variables format selector option
- [Chromatic custom decorators](https://www.chromatic.com/docs/custom-decorators/) — useEffect pattern for data-attribute application
- Existing codebase: `packages/tokens/dist/parent-brand/light.css` — confirmed `:root` selector currently; `dist/parent-brand/dark.css` — confirmed `[data-theme="dark"]`; `src/breakpoints.ts` — confirmed TS constant names
- Existing codebase: `packages/tokens/tokens/semantic/parent-brand/light.tokens.json` — alias syntax confirmed `{color.neutral.0}`

### Secondary (MEDIUM confidence)

- [Storybook Themes docs](https://storybook.js.org/docs/essentials/themes) — withThemeByDataAttribute pattern (single-attribute limitation confirmed — reason for custom decorator)
- [Multi-theme decorator blog post](https://yannbraga.dev/blog/multi-theme-decorator) — useEffect + context.globals pattern for multiple attributes

### Tertiary (LOW confidence)

- `useGlobals` import path from `@storybook/preview-api` in Storybook 10 — needs verification at implementation time; confirmed in concept from multiple decorator examples but exact package path may vary

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed, versions confirmed from package.json
- SD selector refactor: HIGH — `selector` option verified from SD docs; one-line change
- Decorator pattern: HIGH — `context.globals` + `useEffect` pattern confirmed from Storybook official docs and Chromatic guide
- Token visualization components: MEDIUM — component designs are correct based on token structure analysis; implementation details (shadow reconstruction, useGlobals path) have LOW-MEDIUM uncertainty
- Pitfalls: HIGH — shadow decomposition and missing data attributes confirmed from actual dist file inspection

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (Storybook 10 is stable; SD v4 is stable)
