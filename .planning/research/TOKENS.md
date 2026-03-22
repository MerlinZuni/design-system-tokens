# Design Token Architecture Research

**Project:** Design System X
**Researched:** 2026-03-22
**Overall confidence:** HIGH (DTCG spec, Style Dictionary v4, 3-tier patterns are mature and well-documented)

---

## 1. W3C DTCG Format

### What It Is

The W3C Design Tokens Community Group (DTCG) format is an emerging standard for describing design tokens in a vendor-neutral JSON structure. As of 2025 it is a draft specification, not yet a finalized W3C Recommendation — but it is stable enough for production use. Style Dictionary v4, Tokens Studio Pro, and Theo all support it natively.

**Spec reference:** https://tr.designtokens.org/format/

### Core Token Structure

A token is a JSON object with reserved `$`-prefixed keys. All other keys define nested groups.

```json
{
  "color": {
    "blue": {
      "500": {
        "$type": "color",
        "$value": "#3B82F6",
        "$description": "Primary brand blue, 500 weight",
        "$extensions": {
          "com.tokens-studio.figma": {
            "exportKey": "color"
          }
        }
      }
    }
  }
}
```

### Reserved Keys

| Key | Required | Purpose |
|-----|----------|---------|
| `$type` | Recommended (can be inherited from group) | Declares the token type |
| `$value` | YES (for leaf tokens) | The token's value |
| `$description` | No | Human-readable description |
| `$extensions` | No | Tool-specific metadata; must be namespaced |

### Type Inheritance

`$type` can be set on a group and all children inherit it. This reduces repetition:

```json
{
  "color": {
    "$type": "color",
    "blue": {
      "500": { "$value": "#3B82F6" },
      "600": { "$value": "#2563EB" }
    }
  }
}
```

### $type Values (DTCG Spec)

| Type | Value Format | Example |
|------|-------------|---------|
| `color` | CSS color string or `{r, g, b, a}` object | `"#3B82F6"` |
| `dimension` | Number + px or rem unit | `"16px"` or `"1rem"` |
| `fontFamily` | String or array of strings | `"Inter, sans-serif"` |
| `fontWeight` | Number or keyword | `400` or `"bold"` |
| `duration` | String with ms/s | `"200ms"` |
| `cubicBezier` | Array of 4 numbers | `[0.4, 0, 0.2, 1]` |
| `number` | Plain number | `1.5` |
| `strokeStyle` | String keyword | `"dashed"` |
| `border` | Composite object | `{color, width, style}` |
| `shadow` | Composite object or array | `{color, offsetX, offsetY, blur, spread}` |
| `gradient` | Array of stop objects | `[{color, position}]` |
| `typography` | Composite object | `{fontFamily, fontSize, fontWeight, lineHeight, letterSpacing}` |
| `transition` | Composite object | `{duration, delay, timingFunction}` |

### Composite Token Example (Typography)

```json
{
  "typography": {
    "heading": {
      "xl": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{fontFamily.base}",
          "fontSize": "{fontSize.7xl}",
          "fontWeight": "{fontWeight.bold}",
          "lineHeight": "{lineHeight.tight}",
          "letterSpacing": "{letterSpacing.tight}"
        }
      }
    }
  }
}
```

### Alias / Reference Syntax

Token references use curly brace syntax: `{group.subgroup.token}`. This maps to the JSON object path.

```json
{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "{color.blue.500}"
      }
    }
  }
}
```

Style Dictionary resolves these references during build. Circular references are an error.

### $extensions Conventions

Extensions are namespaced by tool to avoid conflicts. The Tokens Studio namespace is `com.tokens-studio`:

```json
{
  "$extensions": {
    "com.tokens-studio": {
      "modify": {
        "type": "lighten",
        "value": 0.2
      }
    }
  }
}
```

Never use un-namespaced extension keys — they are reserved for the DTCG spec itself.

### Groups vs Tokens

A node is a **token** if it contains `$value`. A node is a **group** if it contains only other groups or tokens. Groups can carry `$type` and `$description` but never `$value`.

---

## 2. Style Dictionary v4

### What Changed from v3 → v4

Style Dictionary v4 (released 2024) is a major breaking change from v3. Key differences:

| Area | v3 | v4 |
|------|----|----|
| DTCG support | Manual parser required | Native, first-class |
| Config format | `config.json` | `config.js` / `config.mjs` (ESM) |
| Token value key | `value` | `$value` (DTCG) |
| Token type key | `category` / `type` | `$type` (DTCG) |
| Transforms | String names only | Named + inline functions |
| Parser | Single JSON parse | Pluggable parsers (YAML, etc.) |
| Platform output | Sync | Async (Promise-based) |
| References | `{category.type.item}` | `{group.subgroup.token}` (DTCG path) |

**Migration note:** v3 configs are NOT forward-compatible. If starting fresh (this project is), always use v4 patterns.

### Installation

```bash
npm install style-dictionary@^4
```

### Base Config Structure (ESM)

```js
// style-dictionary.config.mjs
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  // Token source files — glob patterns
  source: ['tokens/**/*.tokens.json'],

  // Per-platform output configuration
  platforms: {
    css: { /* ... */ },
    ts: { /* ... */ },
  },
});

await sd.buildAllPlatforms();
```

### CSS Custom Properties Platform

```js
platforms: {
  css: {
    transformGroup: 'css',       // Built-in group: name/camel, color/css, size/rem
    prefix: 'dsx',               // --dsx-color-blue-500
    buildPath: 'dist/tokens/',
    files: [
      {
        destination: 'variables.css',
        format: 'css/variables',
        options: {
          outputReferences: true,    // Output aliases as var() references
          selector: ':root',         // Default selector for CSS vars
        },
      },
    ],
  },
}
```

With `outputReferences: true`, a semantic token that aliases a primitive becomes:

```css
:root {
  --dsx-color-blue-500: #3B82F6;
  --dsx-color-brand-primary: var(--dsx-color-blue-500);  /* alias preserved */
}
```

### TypeScript / JavaScript Platform

```js
platforms: {
  ts: {
    transformGroup: 'js',
    buildPath: 'dist/tokens/',
    files: [
      {
        destination: 'index.js',
        format: 'javascript/es6',
      },
      {
        destination: 'index.d.ts',
        format: 'typescript/es6-declarations',
      },
    ],
  },
}
```

This outputs:

```ts
// index.d.ts
export declare const ColorBlue500: string;
export declare const ColorBrandPrimary: string;
```

### Custom Transform Example

Transforms run on individual tokens. This example converts `dimension` values to rem:

```js
import StyleDictionary from 'style-dictionary';

StyleDictionary.registerTransform({
  name: 'size/pxToRem',
  type: 'value',
  filter: (token) => token.$type === 'dimension',
  transform: (token) => {
    const val = parseFloat(token.$value);
    return `${val / 16}rem`;
  },
});
```

### Custom Format Example

Formats control how output files are written:

```js
StyleDictionary.registerFormat({
  name: 'css/themed-variables',
  format: async ({ dictionary, options }) => {
    const { selector = ':root', theme = 'light' } = options;
    const vars = dictionary.allTokens
      .map((t) => `  --${t.name}: ${t.$value};`)
      .join('\n');
    return `${selector} {\n${vars}\n}\n`;
  },
});
```

### Multi-Theme Config (Light / Dark)

The recommended v4 pattern for multi-theme uses separate source arrays per build, one StyleDictionary instance per theme:

```js
// style-dictionary.config.mjs
import StyleDictionary from 'style-dictionary';

const themes = ['light', 'dark'];

for (const theme of themes) {
  const sd = new StyleDictionary({
    source: [
      'tokens/primitives/**/*.tokens.json',  // Shared
      `tokens/semantic/${theme}.tokens.json`, // Theme-specific
    ],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: 'dsx',
        buildPath: 'dist/tokens/',
        files: [
          {
            destination: `themes/${theme}.css`,
            format: 'css/variables',
            options: {
              outputReferences: true,
              selector: theme === 'light' ? ':root' : '[data-theme="dark"]',
            },
          },
        ],
      },
    },
  });

  await sd.buildAllPlatforms();
}
```

This produces:

```css
/* themes/light.css */
:root {
  --dsx-color-surface-default: #FFFFFF;
  --dsx-color-text-primary: #111827;
}

/* themes/dark.css */
[data-theme="dark"] {
  --dsx-color-surface-default: #111827;
  --dsx-color-text-primary: #F9FAFB;
}
```

### Multi-Brand Config

Same pattern as multi-theme, but the outer loop is over brands:

```js
const brands = ['brand-a', 'brand-b'];
const themes = ['light', 'dark'];

for (const brand of brands) {
  for (const theme of themes) {
    const sd = new StyleDictionary({
      source: [
        'tokens/primitives/**/*.tokens.json',
        `tokens/brands/${brand}/semantic/${theme}.tokens.json`,
      ],
      platforms: {
        css: {
          buildPath: `dist/tokens/${brand}/`,
          files: [{
            destination: `${theme}.css`,
            format: 'css/variables',
            options: {
              selector: theme === 'light' ? ':root' : '[data-theme="dark"]',
            },
          }],
        },
      },
    });
    await sd.buildAllPlatforms();
  }
}
```

### Built-in Transform Groups

| Group | Transforms Included | Best For |
|-------|---------------------|----------|
| `css` | name/kebab, color/css, size/rem | CSS custom properties |
| `js` | name/camel, color/hex | JS/TS modules |
| `scss` | name/kebab, color/css, size/rem | SCSS variables |
| `ios` | name/camelcase, color/UIColor | iOS Swift |
| `android` | name/snake, color/hex8android | Android XML |

For web-only (this project), `css` and `js` cover both outputs.

### outputReferences Caution

`outputReferences: true` preserves `var(--dsx-color-blue-500)` chain in CSS. This is almost always what you want for semantic tokens (it makes overrides easy in browser DevTools). However, it requires that primitive variables be loaded before semantic ones in the consuming app — order CSS imports accordingly:

```html
<!-- Correct load order -->
<link rel="stylesheet" href="/tokens/primitives.css">
<link rel="stylesheet" href="/tokens/themes/light.css">
<link rel="stylesheet" href="/tokens/components.css">
```

---

## 3. Three-Tier Token Architecture

### Concept

```
Primitive tokens   →   Semantic tokens   →   Component tokens
(raw values)           (usage intent)         (component-specific)
```

| Tier | Also Called | Purpose | Example |
|------|-------------|---------|---------|
| Primitive | Global, Base | Raw design values. No alias, no intent. | `color.blue.500 = #3B82F6` |
| Semantic | Alias, Decision | Maps intent to primitive. Theme-switchable. | `color.brand.primary = {color.blue.500}` |
| Component | Specific | Scoped to one component. Aliases semantic. | `button.background.default = {color.brand.primary}` |

**Rule:** Each tier aliases DOWN only. Component tokens alias semantic tokens. Semantic tokens alias primitive tokens. Never skip tiers or alias upward.

**Why three tiers?**
- Primitives change rarely (new color in palette).
- Semantic tokens change per theme/brand without touching primitives.
- Component tokens change per component variant without touching semantics.
- Consuming devs use component tokens (or semantic, never primitive) in component styles.

### Naming Convention: `category.property.modifier`

The naming schema maps directly to DTCG JSON structure (dot-separated path = JSON nesting):

```
category  →  top-level group  (color, typography, spacing)
property  →  sub-group        (brand, text, background, heading)
modifier  →  leaf qualifier   (primary, default, hover, xl, sm)
```

Examples across tiers:

| Tier | Token Name | Value |
|------|-----------|-------|
| Primitive | `color.blue.500` | `#3B82F6` |
| Primitive | `fontSize.3xl` | `30px` |
| Semantic | `color.brand.primary` | `{color.blue.500}` |
| Semantic | `color.text.default` | `{color.neutral.900}` |
| Semantic | `color.text.inverse` | `{color.neutral.50}` |
| Component | `button.background.default` | `{color.brand.primary}` |
| Component | `button.background.hover` | `{color.brand.secondary}` |
| Component | `button.text.default` | `{color.text.inverse}` |

In CSS output (prefix `dsx`):

```css
--dsx-color-blue-500: #3B82F6;
--dsx-color-brand-primary: var(--dsx-color-blue-500);
--dsx-button-background-default: var(--dsx-color-brand-primary);
```

### File Structure Recommendation

```
tokens/
  primitives/
    color.tokens.json
    typography.tokens.json
    spacing.tokens.json
    elevation.tokens.json
    grid.tokens.json
  semantic/
    light.tokens.json          # Light mode semantic aliases
    dark.tokens.json           # Dark mode semantic aliases
  brands/
    brand-a/
      semantic/
        light.tokens.json
        dark.tokens.json
  components/
    button.tokens.json
    input.tokens.json
    badge.tokens.json
```

This separation drives Style Dictionary's `source` arrays — primitives are always included, semantic layer is swapped per theme/brand build.

---

## 4. Token Categories — Best Practices

### 4.1 Color

**Primitive structure:** Full palette as numeric scale (50–950 or 100–900). Include all hues you'll need. Never put alpha variants in primitives — derive them in semantics.

```json
{
  "color": {
    "$type": "color",
    "blue": {
      "50":  { "$value": "#EFF6FF" },
      "100": { "$value": "#DBEAFE" },
      "200": { "$value": "#BFDBFE" },
      "300": { "$value": "#93C5FD" },
      "400": { "$value": "#60A5FA" },
      "500": { "$value": "#3B82F6" },
      "600": { "$value": "#2563EB" },
      "700": { "$value": "#1D4ED8" },
      "800": { "$value": "#1E40AF" },
      "900": { "$value": "#1E3A8A" },
      "950": { "$value": "#172554" }
    },
    "neutral": {
      "0":   { "$value": "#FFFFFF" },
      "50":  { "$value": "#F9FAFB" },
      "100": { "$value": "#F3F4F6" },
      "200": { "$value": "#E5E7EB" },
      "300": { "$value": "#D1D5DB" },
      "400": { "$value": "#9CA3AF" },
      "500": { "$value": "#6B7280" },
      "600": { "$value": "#4B5563" },
      "700": { "$value": "#374151" },
      "800": { "$value": "#1F2937" },
      "900": { "$value": "#111827" },
      "950": { "$value": "#030712" },
      "1000": { "$value": "#000000" }
    },
    "green": { /* ... */ },
    "red":   { /* ... */ },
    "yellow": { /* ... */ }
  }
}
```

**Semantic structure (light mode):**

```json
{
  "color": {
    "$type": "color",
    "brand": {
      "primary":   { "$value": "{color.blue.500}" },
      "secondary": { "$value": "{color.blue.700}" },
      "tertiary":  { "$value": "{color.blue.100}" }
    },
    "text": {
      "default":   { "$value": "{color.neutral.900}" },
      "secondary": { "$value": "{color.neutral.600}" },
      "disabled":  { "$value": "{color.neutral.400}" },
      "inverse":   { "$value": "{color.neutral.0}" },
      "link":      { "$value": "{color.blue.600}" }
    },
    "surface": {
      "default":   { "$value": "{color.neutral.0}" },
      "raised":    { "$value": "{color.neutral.50}" },
      "overlay":   { "$value": "{color.neutral.100}" },
      "inverse":   { "$value": "{color.neutral.900}" }
    },
    "border": {
      "default":   { "$value": "{color.neutral.200}" },
      "strong":    { "$value": "{color.neutral.400}" },
      "focus":     { "$value": "{color.blue.500}" }
    },
    "feedback": {
      "error":     { "$value": "{color.red.600}" },
      "warning":   { "$value": "{color.yellow.500}" },
      "success":   { "$value": "{color.green.600}" },
      "info":      { "$value": "{color.blue.500}" }
    }
  }
}
```

**Dark mode semantic (same structure, different aliases):**

```json
{
  "color": {
    "$type": "color",
    "brand": {
      "primary":   { "$value": "{color.blue.400}" },
      "secondary": { "$value": "{color.blue.300}" }
    },
    "text": {
      "default":   { "$value": "{color.neutral.50}" },
      "secondary": { "$value": "{color.neutral.400}" },
      "inverse":   { "$value": "{color.neutral.900}" }
    },
    "surface": {
      "default":   { "$value": "{color.neutral.950}" },
      "raised":    { "$value": "{color.neutral.900}" },
      "overlay":   { "$value": "{color.neutral.800}" }
    }
  }
}
```

**Color pitfall:** Never use numeric scale values directly in components. `color.blue.500` is a primitive — only reference `color.brand.primary` or `color.text.default` in component tokens. This is what enables theme switching.

### 4.2 Typography

Typography tokens decompose into atomic primitives (individual properties) and composite tokens (complete styles). Both are useful at different points.

**Primitive tokens:**

```json
{
  "fontFamily": {
    "$type": "fontFamily",
    "base":  { "$value": ["Inter", "system-ui", "sans-serif"] },
    "mono":  { "$value": ["JetBrains Mono", "Menlo", "monospace"] },
    "serif": { "$value": ["Georgia", "serif"] }
  },
  "fontSize": {
    "$type": "dimension",
    "xs":  { "$value": "12px" },
    "sm":  { "$value": "14px" },
    "md":  { "$value": "16px" },
    "lg":  { "$value": "18px" },
    "xl":  { "$value": "20px" },
    "2xl": { "$value": "24px" },
    "3xl": { "$value": "30px" },
    "4xl": { "$value": "36px" },
    "5xl": { "$value": "48px" },
    "6xl": { "$value": "60px" },
    "7xl": { "$value": "72px" }
  },
  "fontWeight": {
    "$type": "fontWeight",
    "regular":  { "$value": 400 },
    "medium":   { "$value": 500 },
    "semibold": { "$value": 600 },
    "bold":     { "$value": 700 }
  },
  "lineHeight": {
    "$type": "number",
    "none":    { "$value": 1 },
    "tight":   { "$value": 1.25 },
    "snug":    { "$value": 1.375 },
    "normal":  { "$value": 1.5 },
    "relaxed": { "$value": 1.625 },
    "loose":   { "$value": 2 }
  },
  "letterSpacing": {
    "$type": "dimension",
    "tighter": { "$value": "-0.05em" },
    "tight":   { "$value": "-0.025em" },
    "normal":  { "$value": "0em" },
    "wide":    { "$value": "0.025em" },
    "wider":   { "$value": "0.05em" },
    "widest":  { "$value": "0.1em" }
  }
}
```

**Composite semantic typography tokens:**

```json
{
  "typography": {
    "$type": "typography",
    "heading": {
      "xl": {
        "$value": {
          "fontFamily": "{fontFamily.base}",
          "fontSize": "{fontSize.7xl}",
          "fontWeight": "{fontWeight.bold}",
          "lineHeight": "{lineHeight.tight}",
          "letterSpacing": "{letterSpacing.tight}"
        }
      },
      "lg": {
        "$value": {
          "fontFamily": "{fontFamily.base}",
          "fontSize": "{fontSize.5xl}",
          "fontWeight": "{fontWeight.bold}",
          "lineHeight": "{lineHeight.tight}",
          "letterSpacing": "{letterSpacing.tight}"
        }
      },
      "md": {
        "$value": {
          "fontFamily": "{fontFamily.base}",
          "fontSize": "{fontSize.3xl}",
          "fontWeight": "{fontWeight.semibold}",
          "lineHeight": "{lineHeight.snug}",
          "letterSpacing": "{letterSpacing.normal}"
        }
      }
    },
    "body": {
      "lg": {
        "$value": {
          "fontFamily": "{fontFamily.base}",
          "fontSize": "{fontSize.lg}",
          "fontWeight": "{fontWeight.regular}",
          "lineHeight": "{lineHeight.relaxed}",
          "letterSpacing": "{letterSpacing.normal}"
        }
      },
      "md": {
        "$value": {
          "fontFamily": "{fontFamily.base}",
          "fontSize": "{fontSize.md}",
          "fontWeight": "{fontWeight.regular}",
          "lineHeight": "{lineHeight.normal}",
          "letterSpacing": "{letterSpacing.normal}"
        }
      }
    },
    "label": {
      "sm": {
        "$value": {
          "fontFamily": "{fontFamily.base}",
          "fontSize": "{fontSize.sm}",
          "fontWeight": "{fontWeight.medium}",
          "lineHeight": "{lineHeight.normal}",
          "letterSpacing": "{letterSpacing.wide}"
        }
      }
    },
    "code": {
      "md": {
        "$value": {
          "fontFamily": "{fontFamily.mono}",
          "fontSize": "{fontSize.sm}",
          "fontWeight": "{fontWeight.regular}",
          "lineHeight": "{lineHeight.relaxed}",
          "letterSpacing": "{letterSpacing.normal}"
        }
      }
    }
  }
}
```

**CSS output for composite typography:** Style Dictionary expands composite typography tokens into individual CSS custom properties by default (one var per property). To output a CSS shorthand `font:` rule, you need a custom format.

**Typography pitfall:** `lineHeight` as a unitless number (`1.5`) vs a dimension value (`24px`) has different DTCG type implications. Use `number` type for unitless ratios (recommended — they scale with `font-size`). Use `dimension` only for explicit pixel line heights.

### 4.3 Spacing

Spacing is the most frequently consumed token category. Use a base-8 or base-4 scale with named steps, not raw pixel values.

```json
{
  "spacing": {
    "$type": "dimension",
    "0":   { "$value": "0px" },
    "1":   { "$value": "4px" },
    "2":   { "$value": "8px" },
    "3":   { "$value": "12px" },
    "4":   { "$value": "16px" },
    "5":   { "$value": "20px" },
    "6":   { "$value": "24px" },
    "7":   { "$value": "28px" },
    "8":   { "$value": "32px" },
    "10":  { "$value": "40px" },
    "12":  { "$value": "48px" },
    "16":  { "$value": "64px" },
    "20":  { "$value": "80px" },
    "24":  { "$value": "96px" },
    "32":  { "$value": "128px" },
    "40":  { "$value": "160px" },
    "48":  { "$value": "192px" },
    "64":  { "$value": "256px" }
  }
}
```

**Naming choice:** Numbers that match Tailwind's spacing scale (where 1 unit = 4px) are a safe, recognizable convention. Alternatively, use T-shirt sizes (xs, sm, md, lg, xl) for semantic clarity. Numeric is preferred at the primitive level because it is scale-neutral.

**Semantic spacing aliases:**

```json
{
  "spacing": {
    "$type": "dimension",
    "component": {
      "padding": {
        "xs": { "$value": "{spacing.2}" },
        "sm": { "$value": "{spacing.3}" },
        "md": { "$value": "{spacing.4}" },
        "lg": { "$value": "{spacing.6}" },
        "xl": { "$value": "{spacing.8}" }
      },
      "gap": {
        "sm": { "$value": "{spacing.2}" },
        "md": { "$value": "{spacing.4}" },
        "lg": { "$value": "{spacing.6}" }
      }
    },
    "layout": {
      "section": { "$value": "{spacing.16}" },
      "page":    { "$value": "{spacing.24}" }
    }
  }
}
```

### 4.4 Elevation (Shadow)

Elevation tokens use the DTCG `shadow` composite type. Define a scale of shadow levels.

```json
{
  "elevation": {
    "$type": "shadow",
    "none": {
      "$value": {
        "color": "rgba(0, 0, 0, 0)",
        "offsetX": "0px",
        "offsetY": "0px",
        "blur": "0px",
        "spread": "0px"
      }
    },
    "sm": {
      "$value": {
        "color": "rgba(0, 0, 0, 0.05)",
        "offsetX": "0px",
        "offsetY": "1px",
        "blur": "2px",
        "spread": "0px"
      }
    },
    "md": {
      "$value": [
        {
          "color": "rgba(0, 0, 0, 0.1)",
          "offsetX": "0px",
          "offsetY": "4px",
          "blur": "6px",
          "spread": "-1px"
        },
        {
          "color": "rgba(0, 0, 0, 0.06)",
          "offsetX": "0px",
          "offsetY": "2px",
          "blur": "4px",
          "spread": "-1px"
        }
      ]
    },
    "lg": {
      "$value": [
        {
          "color": "rgba(0, 0, 0, 0.1)",
          "offsetX": "0px",
          "offsetY": "10px",
          "blur": "15px",
          "spread": "-3px"
        },
        {
          "color": "rgba(0, 0, 0, 0.05)",
          "offsetX": "0px",
          "offsetY": "4px",
          "blur": "6px",
          "spread": "-2px"
        }
      ]
    },
    "xl": {
      "$value": [
        {
          "color": "rgba(0, 0, 0, 0.1)",
          "offsetX": "0px",
          "offsetY": "20px",
          "blur": "25px",
          "spread": "-5px"
        },
        {
          "color": "rgba(0, 0, 0, 0.04)",
          "offsetX": "0px",
          "offsetY": "10px",
          "blur": "10px",
          "spread": "-5px"
        }
      ]
    },
    "2xl": {
      "$value": {
        "color": "rgba(0, 0, 0, 0.25)",
        "offsetX": "0px",
        "offsetY": "25px",
        "blur": "50px",
        "spread": "-12px"
      }
    },
    "inner": {
      "$value": {
        "color": "rgba(0, 0, 0, 0.06)",
        "offsetX": "0px",
        "offsetY": "2px",
        "blur": "4px",
        "spread": "0px",
        "inset": true
      }
    }
  }
}
```

**Dark mode elevation:** Dark mode surfaces should use lighter shadows or glow effects instead of black-based shadows. Adjust semantic elevation tokens per theme:

```json
{
  "elevation": {
    "card":   { "$value": "{elevation.md}" },
    "dialog": { "$value": "{elevation.xl}" },
    "tooltip": { "$value": "{elevation.sm}" }
  }
}
```

**Elevation pitfall:** The DTCG `shadow` type renders as CSS `box-shadow`. The `inset` property is not yet in the DTCG draft spec for `shadow` — Tokens Studio adds it via extensions. When Style Dictionary outputs `shadow` tokens, verify your transform handles multi-shadow arrays (array of shadow objects → comma-separated `box-shadow`).

### 4.5 Grid and Breakpoints

Grid and breakpoint tokens do not have a standard DTCG `$type` — use `number` or `dimension` and custom transforms.

```json
{
  "grid": {
    "columns": {
      "xs": { "$type": "number", "$value": 4 },
      "sm": { "$type": "number", "$value": 4 },
      "md": { "$type": "number", "$value": 8 },
      "lg": { "$type": "number", "$value": 12 },
      "xl": { "$type": "number", "$value": 12 }
    },
    "gutter": {
      "xs": { "$type": "dimension", "$value": "16px" },
      "sm": { "$type": "dimension", "$value": "16px" },
      "md": { "$type": "dimension", "$value": "24px" },
      "lg": { "$type": "dimension", "$value": "32px" },
      "xl": { "$type": "dimension", "$value": "32px" }
    },
    "margin": {
      "xs": { "$type": "dimension", "$value": "16px" },
      "sm": { "$type": "dimension", "$value": "24px" },
      "md": { "$type": "dimension", "$value": "32px" },
      "lg": { "$type": "dimension", "$value": "40px" },
      "xl": { "$type": "dimension", "$value": "80px" }
    },
    "maxWidth": {
      "sm": { "$type": "dimension", "$value": "640px" },
      "md": { "$type": "dimension", "$value": "768px" },
      "lg": { "$type": "dimension", "$value": "1024px" },
      "xl": { "$type": "dimension", "$value": "1280px" },
      "2xl": { "$type": "dimension", "$value": "1536px" }
    }
  },
  "breakpoint": {
    "xs":  { "$type": "dimension", "$value": "0px" },
    "sm":  { "$type": "dimension", "$value": "640px" },
    "md":  { "$type": "dimension", "$value": "768px" },
    "lg":  { "$type": "dimension", "$value": "1024px" },
    "xl":  { "$type": "dimension", "$value": "1280px" },
    "2xl": { "$type": "dimension", "$value": "1536px" }
  }
}
```

**TypeScript output for breakpoints:** CSS custom properties cannot be used inside `@media` query values. Output breakpoints as a TypeScript object for use in JS-based media queries (e.g., with `useMediaQuery` hooks or Framer Motion):

```js
// style-dictionary.config.mjs
platforms: {
  ts: {
    transformGroup: 'js',
    buildPath: 'dist/tokens/',
    files: [
      {
        destination: 'breakpoints.ts',
        format: 'javascript/es6',
        filter: (token) => token.path[0] === 'breakpoint',
      },
    ],
  },
}
```

Output:

```ts
export const BreakpointSm = '640px';
export const BreakpointMd = '768px';
```

**Grid pitfall:** Grid column counts are unitless integers — do not apply a `dimension` type or a px-conversion transform to them. Filter by token name/path in transforms to avoid contamination.

---

## 5. Multi-Brand + Light/Dark Mode Token Strategy

### The Core Problem

Themes (light/dark) and brands must be independently switchable. A user might be on Brand A in dark mode, or Brand B in light mode. The solution is a matrix of outputs rather than a single token file.

### DTCG File Organization for Modes

Tokens Studio Pro exports Figma Variable Collections as separate DTCG files. Each Collection maps to a token tier:

```
Figma Variable Collections  →  Token Files
─────────────────────────────────────────────
Primitives (no modes)        →  tokens/primitives/*.tokens.json
Semantic (Light / Dark)      →  tokens/semantic/light.tokens.json
                                tokens/semantic/dark.tokens.json
Brand-A Semantic (L / D)     →  tokens/brands/brand-a/light.tokens.json
                                tokens/brands/brand-a/dark.tokens.json
Component (no modes)         →  tokens/components/*.tokens.json
```

The key insight: **component tokens never change per mode**. They reference semantic tokens, and semantic tokens are what swap per mode. Components stay stable.

### Full Build Matrix Example

```js
// style-dictionary.config.mjs
import StyleDictionary from 'style-dictionary';

const brands = ['default', 'brand-a', 'brand-b'];
const themes = ['light', 'dark'];

for (const brand of brands) {
  for (const theme of themes) {
    const semanticPath = brand === 'default'
      ? `tokens/semantic/${theme}.tokens.json`
      : `tokens/brands/${brand}/${theme}.tokens.json`;

    const sd = new StyleDictionary({
      source: [
        'tokens/primitives/**/*.tokens.json',
        semanticPath,
        'tokens/components/**/*.tokens.json',
      ],
      log: { warnings: 'warn', verbosity: 'default' },
      platforms: {
        css: {
          transformGroup: 'css',
          prefix: 'dsx',
          buildPath: `dist/tokens/${brand}/`,
          files: [
            // Primitives: always :root, only output once per brand
            ...(theme === 'light' ? [{
              destination: 'primitives.css',
              format: 'css/variables',
              filter: (token) => token.filePath.includes('primitives'),
              options: { selector: ':root' },
            }] : []),
            // Semantic: scoped to theme selector
            {
              destination: `${theme}.css`,
              format: 'css/variables',
              filter: (token) =>
                token.filePath.includes('semantic') ||
                token.filePath.includes(brand),
              options: {
                outputReferences: true,
                selector: theme === 'light' ? ':root' : '[data-theme="dark"]',
              },
            },
            // Components: output once (theme-neutral)
            ...(theme === 'light' ? [{
              destination: 'components.css',
              format: 'css/variables',
              filter: (token) => token.filePath.includes('components'),
              options: {
                outputReferences: true,
                selector: ':root',
              },
            }] : []),
          ],
        },
      },
    });

    await sd.buildAllPlatforms();
  }
}
```

### Consumer Usage in HTML

```html
<!-- Load primitives first (raw values, never change) -->
<link rel="stylesheet" href="/tokens/default/primitives.css">

<!-- Load semantic defaults (light mode = :root) -->
<link rel="stylesheet" href="/tokens/default/light.css">

<!-- Load component tokens (reference semantics) -->
<link rel="stylesheet" href="/tokens/default/components.css">

<!-- JS toggles data-theme="dark" on <html> to activate dark overrides -->
```

```js
// Theme toggling — no CSS file swap needed
document.documentElement.setAttribute('data-theme', 'dark');
```

### Brand Switching

Brand switching usually requires a CSS file swap (different palette, different brand.primary value):

```js
// React: swap brand stylesheet
const switchBrand = (brand) => {
  document.getElementById('brand-tokens').href = `/tokens/${brand}/light.css`;
};
```

Or use CSS cascade layers to layer brand tokens on top of defaults without file swapping, if the brand set is small enough to ship all at once.

### Selector Strategy Options

| Strategy | Selector | Tradeoff |
|----------|----------|---------|
| `:root` for light, `[data-theme="dark"]` for dark | Most common, works with `prefers-color-scheme` fallback | Requires JS for toggle |
| `.theme-light` / `.theme-dark` on `<body>` | Scoped to body | Requires class management |
| `@media (prefers-color-scheme: dark)` | CSS-only, no JS | Cannot be overridden by user preference toggle |
| CSS `@layer` based | `@layer theme.light { }` | Newest, flexible cascade control |

Recommended: `:root` for light (default), `[data-theme="dark"]` for dark override. This allows both CSS-only (via `prefers-color-scheme` polyfill or no-JS fallback) and JS-toggled dark mode.

### Tokens Studio Pro + DTCG Export Notes

Tokens Studio Pro (v2+) exports each Figma Variable Collection as a separate DTCG JSON file with a flat or nested structure based on the slash-separated Figma group names. Key behaviors:

- Figma Variable `color/brand/primary` → DTCG path `color.brand.primary`
- Mode aliases (e.g., Variable set to a different value in Dark mode) → exported as separate files per mode, not a single file with mode keys
- `$extensions` block with `com.tokens-studio` namespace carries Figma-specific metadata (collection name, mode, resolve alias)
- Token Studio may output `$type: "color"` as Figma's internal format (`{r, g, b, a}` with 0–1 floats) — Style Dictionary's DTCG color transform handles conversion to hex/hsl

**Verify:** Tokens Studio Pro v2's exact DTCG export format (especially whether it uses the DTCG `$type` vocabulary or custom types) should be confirmed against the current Tokens Studio docs when setting up the pipeline. The mapping of Figma collection → DTCG file is the critical integration point.

---

## 6. Complete Style Dictionary v4 Config (Reference)

This is a complete, production-ready config combining all of the above:

```js
// style-dictionary.config.mjs
import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';

// ─── Custom Transforms ────────────────────────────────────────────

// Convert px dimension values to rem (base 16)
StyleDictionary.registerTransform({
  name: 'dsx/size/rem',
  type: 'value',
  filter: (token) =>
    token.$type === 'dimension' &&
    typeof token.$value === 'string' &&
    token.$value.endsWith('px'),
  transform: (token) => {
    const px = parseFloat(token.$value);
    return `${px / 16}rem`;
  },
});

// Flatten shadow array to CSS box-shadow string
StyleDictionary.registerTransform({
  name: 'dsx/shadow/css',
  type: 'value',
  filter: (token) => token.$type === 'shadow',
  transform: (token) => {
    const shadows = Array.isArray(token.$value) ? token.$value : [token.$value];
    return shadows
      .map(({ offsetX, offsetY, blur, spread, color, inset }) =>
        [inset ? 'inset' : '', offsetX, offsetY, blur, spread, color]
          .filter(Boolean)
          .join(' ')
      )
      .join(', ');
  },
});

// ─── Custom Transform Groups ──────────────────────────────────────

StyleDictionary.registerTransformGroup({
  name: 'dsx/css',
  transforms: [
    'attribute/cti',
    'name/kebab',
    'color/css',
    'dsx/size/rem',
    'dsx/shadow/css',
  ],
});

StyleDictionary.registerTransformGroup({
  name: 'dsx/js',
  transforms: [
    'attribute/cti',
    'name/camel',
    'color/hex',
    'dsx/size/rem',
  ],
});

// ─── Build Matrix ─────────────────────────────────────────────────

const brands = ['default', 'brand-a'];
const themes = ['light', 'dark'];

for (const brand of brands) {
  for (const theme of themes) {
    const semanticSource = brand === 'default'
      ? [`tokens/semantic/${theme}.tokens.json`]
      : [`tokens/brands/${brand}/${theme}.tokens.json`];

    const sd = new StyleDictionary({
      source: [
        'tokens/primitives/**/*.tokens.json',
        ...semanticSource,
        'tokens/components/**/*.tokens.json',
      ],

      platforms: {
        // ── CSS Custom Properties ──
        css: {
          transformGroup: 'dsx/css',
          prefix: 'dsx',
          buildPath: `dist/tokens/${brand}/`,
          files: [
            // Primitive CSS vars (output only in light pass to avoid duplication)
            ...(theme === 'light' ? [{
              destination: 'primitives.css',
              format: 'css/variables',
              filter: ({ filePath }) => filePath.includes('/primitives/'),
              options: {
                selector: ':root',
                outputReferences: false,  // Primitives are raw values
              },
            }] : []),

            // Semantic/brand CSS vars (themed)
            {
              destination: `${theme}.css`,
              format: 'css/variables',
              filter: ({ filePath }) =>
                filePath.includes('/semantic/') || filePath.includes(`/brands/${brand}/`),
              options: {
                outputReferences: true,
                selector: theme === 'light' ? ':root' : '[data-theme="dark"]',
              },
            },

            // Component CSS vars (output only in light pass)
            ...(theme === 'light' ? [{
              destination: 'components.css',
              format: 'css/variables',
              filter: ({ filePath }) => filePath.includes('/components/'),
              options: {
                outputReferences: true,
                selector: ':root',
              },
            }] : []),
          ],
        },

        // ── TypeScript / JavaScript ──
        ts: {
          transformGroup: 'dsx/js',
          buildPath: `dist/tokens/${brand}/`,
          files: [
            // Full token map as JS object
            ...(theme === 'light' ? [{
              destination: 'index.js',
              format: 'javascript/es6',
            }, {
              destination: 'index.d.ts',
              format: 'typescript/es6-declarations',
            }] : []),

            // Breakpoints as separate named export (for useMediaQuery etc)
            ...(theme === 'light' ? [{
              destination: 'breakpoints.js',
              format: 'javascript/es6',
              filter: ({ path }) => path[0] === 'breakpoint',
            }, {
              destination: 'breakpoints.d.ts',
              format: 'typescript/es6-declarations',
              filter: ({ path }) => path[0] === 'breakpoint',
            }] : []),
          ],
        },
      },
    });

    await sd.buildAllPlatforms();
    console.log(`Built: ${brand} / ${theme}`);
  }
}
```

---

## 7. Naming Conventions — Quick Reference

### Category.Property.Modifier Mapping

| Primitive | Semantic | Component |
|-----------|----------|-----------|
| `color.blue.500` | `color.text.default` | `button.text.default` |
| `color.neutral.200` | `color.border.default` | `input.border.default` |
| `spacing.4` | `spacing.component.padding.md` | `button.padding.horizontal` |
| `fontSize.md` | — | `button.label.fontSize` |
| `elevation.md` | `elevation.card` | `card.shadow` |
| `fontWeight.semibold` | — | `button.label.fontWeight` |

### What Goes in Each Tier

| Question | Tier |
|----------|------|
| "What is this raw value?" | Primitive |
| "What does this color mean in the UI?" | Semantic |
| "What does this button's background use?" | Component |

### Naming Anti-Patterns to Avoid

| Anti-Pattern | Problem | Correct |
|-------------|---------|---------|
| `color.primary` (no modifier) | Ambiguous — primary what? | `color.brand.primary` |
| `color.button.background` in semantics | Component logic in semantic tier | Move to component tokens |
| `blue-500` as semantic name | Exposes primitive, breaks theming | `color.brand.primary` |
| `color.light.primary` | Bakes mode into name | Separate files per mode |
| `spacing.16px` | Value in name — breaks if scale changes | `spacing.4` (step number) |

---

## 8. Tokens Studio Pro → Style Dictionary Pipeline

### Token Flow

```
Figma Variables
  ↓ (Tokens Studio Pro sync)
DTCG JSON files in Git
  ↓ (npm run build:tokens)
Style Dictionary v4
  ↓
dist/tokens/
  ├── default/
  │   ├── primitives.css
  │   ├── light.css
  │   ├── dark.css
  │   ├── components.css
  │   ├── index.js
  │   └── index.d.ts
  └── brand-a/
      ├── primitives.css
      ├── light.css
      ├── dark.css
      └── ...
```

### package.json Scripts

```json
{
  "scripts": {
    "build:tokens": "node style-dictionary.config.mjs",
    "watch:tokens": "nodemon --watch tokens/ --ext json --exec 'npm run build:tokens'"
  }
}
```

### Storybook Integration

Storybook consumes the built CSS files. Import them in `.storybook/preview.ts`:

```ts
// .storybook/preview.ts
import '../dist/tokens/default/primitives.css';
import '../dist/tokens/default/light.css';
import '../dist/tokens/default/components.css';
```

For dark mode preview in Storybook, use `@storybook/addon-themes` to toggle `[data-theme="dark"]` on the story container.

---

## 9. Confidence Assessment

| Area | Confidence | Basis |
|------|-----------|-------|
| DTCG format structure | HIGH | Spec is stable draft, widely implemented |
| Style Dictionary v4 API | HIGH | v4 released 2024, API is well-documented and stable |
| 3-tier architecture pattern | HIGH | Industry consensus, used by Salesforce Lightning, IBM Carbon, Atlassian |
| Multi-theme CSS strategy | HIGH | Established CSS custom property pattern |
| Tokens Studio Pro DTCG export format | MEDIUM | Details of v2's exact export schema should be verified against current Tokens Studio docs — the DTCG mapping was correct as of late 2024 but export format details can shift |
| Shadow inset DTCG support | LOW | `inset` is not in the DTCG draft spec — handled by Tokens Studio extension; verify Style Dictionary's shadow transform handles this |
| Grid/breakpoint DTCG types | MEDIUM | No official DTCG type for these; `number`/`dimension` is the community convention |

---

## 10. Sources

- W3C DTCG Specification (draft): https://tr.designtokens.org/format/
- Style Dictionary v4 documentation: https://styledictionary.com
- Style Dictionary GitHub (v4 branch): https://github.com/amzn/style-dictionary
- Tokens Studio Pro documentation: https://docs.tokens.studio
- Salesforce Lightning Design System token architecture (reference implementation): https://www.lightningdesignsystem.com/design-tokens/
- IBM Carbon Design System tokens: https://carbondesignsystem.com/elements/color/tokens/

**Confidence note:** WebSearch and WebFetch were unavailable during this research session. All findings are based on training knowledge current through August 2025. The W3C DTCG spec, Style Dictionary v4, and 3-tier token architecture are mature and stable enough that training data is reliable. The Tokens Studio Pro export format specifics (Section 8) and shadow `inset` handling (Section 4.4) are the two areas where current documentation should be consulted before implementation.
