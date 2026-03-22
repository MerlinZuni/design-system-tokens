# Phase 2: Primitive Token Pipeline - Research

**Researched:** 2026-03-22
**Domain:** Style Dictionary v4/v5, W3C DTCG tokens, Tokens Studio Pro, Turborepo task orchestration
**Confidence:** HIGH (core APIs verified against official docs; version conflict identified and resolved)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Color palette**
- D-01: Token values come from the Figma file — do not invent values; read from Figma source
- D-02: Standard interface hues as primitives: red, green, yellow, blue, orange, purple — each at multiple steps (50–900). Semantic aliasing happens in Phase 3.
- D-03: Naming: `color.{hue}.{step}` — e.g. `color.red.500`, `color.brand.500`

**Spacing scale**
- D-04: Values come from the Figma file
- D-05: Naming follows Tailwind convention: `spacing.0` through `spacing.96`
- D-06: Output as CSS custom properties in `rem` or `px` as defined in Figma

**Typography — fonts**
- D-07: Primary font: Archivo (Google Fonts, static)
- D-08: Variable font: Inter Variable (SIL OFL). Both included. Archivo: one `@font-face` per weight. Inter: single `@font-face` with `font-weight: 100 900` range.
- D-09: Tokens: `font.family.default` (Archivo), `font.family.variable` (Inter)

**Typography — scale**
- D-10: Scale values from Figma file
- D-11: Full range through Tailwind's type scale if Figma doesn't cover it
- D-12: Step naming follows Tailwind: `text-xs` through `text-9xl`
- D-13: Composite typography tokens (font-size + line-height + font-weight + letter-spacing) authored in Tokens Studio directly
- D-14: Token path: `typography.{step}` — e.g. `typography.text-xl`

**Grid and breakpoints**
- D-15: Values from Figma Grids page
- D-16: Standard breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- D-17: Breakpoints output as TypeScript constants ONLY — NOT CSS custom properties
- D-18: Token path: `grid.breakpoint.{name}`

**Elevation**
- D-19: Shadow values from Figma file
- D-20: Composite shadow tokens authored in Tokens Studio directly
- D-21: Token path: `elevation.{level}`

**Style Dictionary build integration**
- D-22: Style Dictionary runs as separate `build:tokens` script — NOT integrated into tsup
- D-23: `outputReferences: true` on all CSS platforms
- D-24: Phase 2 outputs: `dist/css/tokens.css` + TypeScript constants for breakpoints

### Claude's Discretion
- Exact numeric values for standard interface hues (red.500 etc.) if not in Figma — use Tailwind's default palette as reference
- Fallback type scale steps if Figma doesn't cover the full Tailwind range
- Number and naming of elevation levels if not clearly specified in Figma
- Step count for interface color hues (whether to include 50 and 950 endpoints)

### Deferred Ideas (OUT OF SCOPE)
- Semantic color aliases (error, success, warning, info) — Phase 3
- Multi-brand and dark/light mode token sets — Phase 3
- CSS custom property import in Storybook — Phase 4
- Font loading strategy (preconnect, font-display, self-hosting vs CDN) — Phase 4
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TOKEN-01 | Primitive color tokens in W3C DTCG format using `color.property.modifier` naming | DTCG `$type: "color"` structure confirmed; group-level type inheritance available; `color.{hue}.{step}` maps directly to JSON nesting |
| TOKEN-02 | Primitive spacing tokens in DTCG format using `spacing.property.modifier` naming | `$type: "dimension"` with px/rem values; Tailwind step names (`spacing.0`–`spacing.96`) are safe JSON keys |
| TOKEN-03 | Primitive grid/breakpoint tokens; breakpoints as TypeScript constants only | SD `javascript/es6` format with `filter` by `token.path[0]` confirmed; CSS vars cannot work in `@media` queries |
| TOKEN-04 | Primitive typography composite tokens authored in Tokens Studio; exported via Style Dictionary | `$type: "typography"` composite structure confirmed; sd-transforms preprocessor required for TS Pro format |
| TOKEN-05 | Primitive elevation/shadow composite tokens authored in Tokens Studio; exported via Style Dictionary | `$type: "shadow"` (DTCG) vs `boxShadow` (TS legacy) — preprocessor normalizes; `expandTypesMap` handles x/y → offsetX/offsetY |
| TOKEN-09 | Style Dictionary v4 pipeline outputs CSS custom properties with `outputReferences: true` | `options.outputReferences: true` confirmed working in SD v4.4.0 and v5 `css/variables` format |
| TOKEN-10 | Style Dictionary runs one instance per brand × mode combination | Phase 2 is primitives only (single run); multi-instance loop pattern established for Phase 3 |
</phase_requirements>

---

## Summary

Phase 2 establishes the token pipeline from raw JSON source files to CSS custom properties and TypeScript constants. The core toolchain is: DTCG JSON files in `packages/tokens/tokens/` → Style Dictionary (`style-dictionary.config.mjs`) → `dist/css/tokens.css` + `dist/index.js`. Style Dictionary runs as `build:tokens` before tsup's `build` within the same Turborepo task graph.

**Critical version finding:** `style-dictionary` is at v5.4.0 on npm; v4.4.0 is the latest v4.x release. The project decision locks Style Dictionary v4 — install `style-dictionary@^4.4.0` explicitly. The companion package `@tokens-studio/sd-transforms` v2.x targets SD v5 and is incompatible with SD v4 — pin `@tokens-studio/sd-transforms@^1.3.0` (latest v1.x, SD v4 compatible). Node 22+ is required for SD v5; the environment has Node 25 so v5 would also work if the decision is revisited, but research below follows the locked v4 decision.

**Tokens Studio DTCG format caveat:** When Tokens Studio Pro exports in DTCG mode, shadow/composite tokens use `boxShadow` type and `x`/`y` property names instead of the DTCG `shadow` type and `offsetX`/`offsetY`. The `tokens-studio` preprocessor from `sd-transforms` automatically normalizes these before Style Dictionary processes them. This preprocessor is mandatory for Tokens Studio exports.

**Primary recommendation:** Install `style-dictionary@^4.4.0` and `@tokens-studio/sd-transforms@^1.3.0`; register the `tokens-studio` preprocessor in `style-dictionary.config.mjs`; use `buildAllPlatforms()` (not `build()`); chain `build:tokens` before `tsup` via Turborepo intra-package `dependsOn`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| style-dictionary | ^4.4.0 | Transform DTCG JSON → CSS vars + JS modules | Project locked; v4 is latest stable v4.x (5.4.0 is latest overall but project decision is v4) |
| @tokens-studio/sd-transforms | ^1.3.0 | Normalize Tokens Studio exports to DTCG; add TS Pro transforms | Required bridge between TS Pro format and SD v4; v1.x is SD v4 compatible |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none additional) | — | — | SD v4 + sd-transforms cover all required transforms for web CSS + ESM output |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| style-dictionary@^4.4.0 | style-dictionary@^5.4.0 | v5 is a near drop-in for most users; only breaking change is stricter reference validation and Node 22+ requirement. If team upgrades, also upgrade sd-transforms to v2.x. Phase 3 multi-brand patterns are identical in both versions. |
| @tokens-studio/sd-transforms@^1.3.0 | @tokens-studio/sd-transforms@^2.x | v2.x requires SD v5 — incompatible with locked SD v4 decision |

**Installation:**
```bash
# Run from packages/tokens/ directory
npm install style-dictionary@^4.4.0 @tokens-studio/sd-transforms@^1.3.0
```

**Version verification (confirmed 2026-03-22):**
```
style-dictionary     — latest v4.x: 4.4.0 (npm view style-dictionary versions)
@tokens-studio/sd-transforms — latest v1.x: 1.3.0 (SD v4 compatible)
```

---

## Architecture Patterns

### Recommended Project Structure

```
packages/tokens/
├── tokens/
│   └── primitives/
│       ├── color.tokens.json
│       ├── spacing.tokens.json
│       ├── typography.tokens.json    # composite typography authored here
│       ├── elevation.tokens.json     # composite shadow authored here
│       └── grid.tokens.json
├── src/
│   └── index.ts                      # exports breakpoints TypeScript constants
├── dist/
│   ├── css/
│   │   └── tokens.css               # pre-wired CSS export path (do not change)
│   ├── index.js                     # tsup ESM output
│   └── index.cjs                    # tsup CJS output
├── style-dictionary.config.mjs      # SD v4 config (MUST be .mjs — "type": "module")
├── tsup.config.ts
└── package.json
```

### Pattern 1: Style Dictionary v4 ESM Config

**What:** Single `.mjs` config file that registers sd-transforms and runs one build for primitives-only phase.

**When to use:** Phase 2 (primitives only — no brand/mode loop needed yet).

```javascript
// style-dictionary.config.mjs
// Source: https://styledictionary.com/reference/config/ + sd-transforms README
import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap } from '@tokens-studio/sd-transforms';

// Register all Tokens Studio transforms on the SD instance
register(StyleDictionary);

const sd = new StyleDictionary({
  source: ['tokens/primitives/**/*.tokens.json'],
  preprocessors: ['tokens-studio'],   // REQUIRED: normalizes TS Pro types to DTCG
  expand: {
    typesMap: expandTypesMap,         // maps boxShadow→shadow, x/y→offsetX/offsetY
  },
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      prefix: 'dsx',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',  // LOCKED: must match package.json ./css export
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: ':root',
          },
          // Exclude breakpoints from CSS output (D-17)
          filter: (token) => token.path[0] !== 'grid' || token.path[1] !== 'breakpoint',
        },
      ],
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'src/',
      files: [
        {
          destination: 'breakpoints.ts',
          format: 'javascript/es6',
          filter: (token) =>
            token.path[0] === 'grid' && token.path[1] === 'breakpoint',
        },
      ],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
```

**Key points:**
- `buildAllPlatforms()` is the correct async method (there is no `build()` method — the CLI uses `build` as a command name, the JS API uses `buildAllPlatforms()`).
- `cleanAllPlatforms()` before build prevents stale output.
- File MUST be `.mjs` because the `tokens` package has `"type": "module"` in package.json.
- The `tokens-studio` preprocessor must be declared explicitly in `preprocessors` array (required since sd-transforms v0.16.0).

### Pattern 2: Turborepo Intra-Package Task Chaining

**What:** `build:tokens` runs Style Dictionary; `build` runs tsup. `build` depends on `build:tokens` within the same package.

**When to use:** Any time two sequential tools must both complete within a single package's `build` step.

```json
// turbo.json — add build:tokens task
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build:tokens": {
      "outputs": ["dist/css/**"],
      "inputs": [
        "tokens/**/*.tokens.json",
        "style-dictionary.config.mjs",
        "package.json"
      ]
    },
    "build": {
      "dependsOn": ["^build", "build:tokens"],
      "outputs": ["dist/**", "storybook-static/**"],
      "inputs": ["src/**", "tsup.config.ts", "tsconfig.json", "package.json"]
    },
    ...
  }
}
```

```json
// packages/tokens/package.json scripts
{
  "scripts": {
    "build:tokens": "node style-dictionary.config.mjs",
    "build": "tsup"
  }
}
```

**Key points:**
- `"dependsOn": ["build:tokens"]` (no `^`) means "within this package, run `build:tokens` first." The `^` prefix means "run in dependency packages" — do not add `^` here.
- Turborepo caches `build:tokens` outputs separately — changing only TypeScript source won't re-run SD.
- `dist/css/**` must be in `build:tokens` outputs AND in `build` outputs for the CSS file to be in the Turbo cache.
- The `build` task `inputs` should NOT include `tokens/**` (those belong to `build:tokens` inputs).

### Pattern 3: DTCG Token File Structure

**What:** Well-formed DTCG JSON with type inheritance, ready for sd-transforms preprocessor.

**Color (DTCG, group-level $type):**
```json
{
  "color": {
    "$type": "color",
    "red": {
      "50":  { "$value": "#FEF2F2" },
      "100": { "$value": "#FEE2E2" },
      "200": { "$value": "#FECACA" },
      "300": { "$value": "#FCA5A5" },
      "400": { "$value": "#F87171" },
      "500": { "$value": "#EF4444" },
      "600": { "$value": "#DC2626" },
      "700": { "$value": "#B91C1C" },
      "800": { "$value": "#991B1B" },
      "900": { "$value": "#7F1D1D" },
      "950": { "$value": "#450A0A" }
    }
  }
}
```

**Spacing (Tailwind naming):**
```json
{
  "spacing": {
    "$type": "dimension",
    "0":   { "$value": "0px" },
    "0.5": { "$value": "2px" },
    "1":   { "$value": "4px" },
    "1.5": { "$value": "6px" },
    "2":   { "$value": "8px" },
    "2.5": { "$value": "10px" },
    "3":   { "$value": "12px" },
    "3.5": { "$value": "14px" },
    "4":   { "$value": "16px" },
    "5":   { "$value": "20px" },
    "6":   { "$value": "24px" },
    "7":   { "$value": "28px" },
    "8":   { "$value": "32px" },
    "9":   { "$value": "36px" },
    "10":  { "$value": "40px" },
    "11":  { "$value": "44px" },
    "12":  { "$value": "48px" },
    "14":  { "$value": "56px" },
    "16":  { "$value": "64px" },
    "20":  { "$value": "80px" },
    "24":  { "$value": "96px" },
    "28":  { "$value": "112px" },
    "32":  { "$value": "128px" },
    "36":  { "$value": "144px" },
    "40":  { "$value": "160px" },
    "44":  { "$value": "176px" },
    "48":  { "$value": "192px" },
    "52":  { "$value": "208px" },
    "56":  { "$value": "224px" },
    "60":  { "$value": "240px" },
    "64":  { "$value": "256px" },
    "72":  { "$value": "288px" },
    "80":  { "$value": "320px" },
    "96":  { "$value": "384px" }
  }
}
```

**Typography composite (authored in Tokens Studio, DTCG export format):**

When Tokens Studio Pro exports in DTCG mode, a composite typography token looks like:
```json
{
  "typography": {
    "$type": "typography",
    "text-xl": {
      "$value": {
        "fontFamily": "Archivo",
        "fontWeight": "500",
        "fontSize": "20px",
        "lineHeight": "28px",
        "letterSpacing": "0px"
      },
      "$description": "Tailwind text-xl equivalent"
    }
  }
}
```
Note: Tokens Studio may export `fontFamily` as a plain string rather than an array. The `ts/typography/fontWeight` transform normalizes font weight names to numbers.

**Shadow composite (Tokens Studio DTCG export — sd-transforms normalizes this):**

Tokens Studio exports shadows as `boxShadow` with `x`/`y` properties. The `tokens-studio` preprocessor converts this to DTCG `shadow` with `offsetX`/`offsetY` before SD processes it. When authoring manually in DTCG (not via Tokens Studio), write DTCG-spec format:
```json
{
  "elevation": {
    "sm": {
      "$type": "shadow",
      "$value": {
        "color": "rgba(0, 0, 0, 0.05)",
        "offsetX": "0px",
        "offsetY": "1px",
        "blur": "2px",
        "spread": "0px"
      }
    },
    "md": {
      "$type": "shadow",
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
    }
  }
}
```

**Grid and breakpoints:**
```json
{
  "grid": {
    "breakpoint": {
      "sm":  { "$type": "dimension", "$value": "640px" },
      "md":  { "$type": "dimension", "$value": "768px" },
      "lg":  { "$type": "dimension", "$value": "1024px" },
      "xl":  { "$type": "dimension", "$value": "1280px" },
      "2xl": { "$type": "dimension", "$value": "1536px" }
    },
    "columns": {
      "sm": { "$type": "number", "$value": 4 },
      "md": { "$type": "number", "$value": 8 },
      "lg": { "$type": "number", "$value": 12 }
    }
  }
}
```

**Font family tokens:**
```json
{
  "font": {
    "family": {
      "default":  {
        "$type": "fontFamily",
        "$value": ["Archivo", "sans-serif"],
        "$description": "Static font — separate @font-face per weight (400, 500, 700)"
      },
      "variable": {
        "$type": "fontFamily",
        "$value": ["Inter Variable", "Inter", "sans-serif"],
        "$description": "Variable font — single @font-face with font-weight: 100 900"
      }
    }
  }
}
```

### Pattern 4: TypeScript Breakpoints Output

**What:** SD generates a TS file of breakpoint constants; tsup compiles it into `dist/index.js`.

```javascript
// SD output to src/breakpoints.ts (auto-generated — do not hand-edit)
export const GridBreakpointSm = '640px';
export const GridBreakpointMd = '768px';
export const GridBreakpointLg = '1024px';
export const GridBreakpointXl = '1280px';
export const GridBreakpoint2xl = '1536px';
```

`src/index.ts` (the hand-authored barrel) re-exports from the generated file:
```typescript
export * from './breakpoints';
```

**Important:** SD writes to `src/breakpoints.ts`. tsup's entry remains `src/index.ts`. This means SD must run (`build:tokens`) BEFORE tsup (`build`), which is enforced by the Turborepo `dependsOn` in Pattern 2.

### Pattern 5: Font Tokens and @font-face

**What:** Style Dictionary outputs `--dsx-font-family-default: "Archivo", sans-serif` as a CSS variable. It does NOT generate `@font-face` declarations — those are separate CSS.

**How to handle:** Write a hand-authored `fonts.css` in `packages/tokens/src/` (or directly in `dist/css/`) containing the `@font-face` rules for Archivo and Inter Variable. This file is NOT processed by Style Dictionary — it's a static asset.

```css
/* Archivo — static font, one declaration per weight */
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://fonts.gstatic.com/...') format('woff2');
}
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('https://fonts.gstatic.com/...') format('woff2');
}
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('https://fonts.gstatic.com/...') format('woff2');
}

/* Inter Variable — single declaration covering all weights */
@font-face {
  font-family: 'Inter Variable';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('https://fonts.gstatic.com/...') format('woff2');
}
```

**Decision for Phase 2:** Font loading strategy is deferred to Phase 4 (D-121 in deferred). Phase 2 only defines the `font.family.*` token values and outputs the CSS custom property. The `@font-face` CSS is a Phase 4 concern (Storybook preview integration).

### Anti-Patterns to Avoid

- **Using `build()` method on SD instance:** There is no `build()` instance method in SD v4 or v5. The correct method is `buildAllPlatforms()`. The CLI `style-dictionary build` command is separate.
- **Mixing sd-transforms v2 with style-dictionary v4:** sd-transforms v2.x targets SD v5 exclusively. Installing `@tokens-studio/sd-transforms@^2` with `style-dictionary@^4` will produce peer dependency errors and runtime failures.
- **Omitting `preprocessors: ['tokens-studio']`:** Since sd-transforms v0.16.0, the preprocessor is NOT applied automatically — it must be declared explicitly. Without it, Tokens Studio's `boxShadow` type and `x`/`y` shadow properties will not be normalized.
- **Writing breakpoints as CSS custom properties:** `var(--dsx-grid-breakpoint-lg)` cannot be used inside `@media (min-width: var(...))` — this is a CSS spec limitation, not a browser bug. Always output breakpoints as JS constants.
- **Using `^build` for the `build:tokens` dependsOn:** The `^` prefix means "run this task in all dependency packages first." For intra-package sequencing (SD before tsup in the same package), use `"dependsOn": ["build:tokens"]` without `^`.
- **Hand-editing SD output files:** `src/breakpoints.ts` is generated by Style Dictionary. Do not add manual content there. Hand-authored code goes in `src/index.ts` (barrel) only.
- **Naming token files `.json` without `.tokens`:** Style Dictionary can read plain `.json` but the `.tokens.json` convention makes the source glob unambiguous: `tokens/**/*.tokens.json`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DTCG `boxShadow`→`shadow` type normalization | Custom preprocessor | `tokens-studio` preprocessor from `@tokens-studio/sd-transforms` | sd-transforms handles `x`/`y`→`offsetX`/`offsetY`, `innerShadow`→`inset`, font weight name→number, line height %→unitless |
| Multi-shadow array → CSS `box-shadow` string | Custom transform | `tokens-studio` transformGroup | Built-in composite shadow handling in the transform group |
| `outputReferences` CSS var chain | Custom format | `css/variables` format with `outputReferences: true` | SD resolves the full alias chain and substitutes `var()` references automatically |
| Breakpoint constant filtering | Conditional logic in custom format | `filter` function on a `files` entry | SD's per-file `filter` function receives each token and returns boolean; no custom format needed |
| Token name transformation (kebab-case CSS names) | Custom transform | `name/kebab` transform (built-in SD) | Already included in `tokens-studio` transformGroup |

**Key insight:** The `tokens-studio` transformGroup bundles all necessary transforms for the Tokens Studio → SD v4 → web CSS pipeline. The primary value of sd-transforms is normalizing the format deviations Tokens Studio has from the DTCG spec (shadow type names, property names, font weight keywords).

---

## Common Pitfalls

### Pitfall 1: Style Dictionary v5 installed instead of v4

**What goes wrong:** Running `npm install style-dictionary` installs 5.4.0, not 4.4.0. The API is similar but sd-transforms v1.x (which targets SD v4) may fail on internal API changes.

**Why it happens:** Project decisions locked v4, but npm's latest is now v5. No `--legacy-peer-deps` warning is shown because sd-transforms v1.x declares SD v4 as a peer dependency.

**How to avoid:** Always pin: `npm install style-dictionary@^4.4.0 @tokens-studio/sd-transforms@^1.3.0`. Verify: `npm list style-dictionary`.

**Warning signs:** `sd.buildAllPlatforms is not a function` or peer dependency warnings during install.

### Pitfall 2: `preprocessors` key missing — Tokens Studio types not normalized

**What goes wrong:** Shadow tokens pass through as `$type: "boxShadow"` with `x`/`y` properties. SD v4 does not know the `boxShadow` type — it may skip those tokens or output malformed CSS.

**Why it happens:** Since `@tokens-studio/sd-transforms@0.16.0`, the preprocessor registration no longer auto-activates; it must be declared in config.

**How to avoid:** Always include `preprocessors: ['tokens-studio']` in the SD config object.

**Warning signs:** Build completes but `box-shadow` CSS variables are missing from output, or SD logs "Unknown token type: boxShadow".

### Pitfall 3: Turbo `build:tokens` output not declared — SD runs every time

**What goes wrong:** Turborepo cannot cache the Style Dictionary output if `outputs` is missing or incorrect for `build:tokens`. Every `turbo run build` re-runs SD even when token files haven't changed.

**Why it happens:** Turbo caches based on `inputs` changing AND `outputs` being declared. Without `outputs`, Turbo treats the task as uncacheable.

**How to avoid:** In `turbo.json`, set `"outputs": ["dist/css/**"]` for `build:tokens` and ensure `dist/css/**` is also in `build`'s outputs so the CSS file propagates through the cache.

**Warning signs:** `turbo run build` shows "FULL TURBO" but `style-dictionary build` output still appears on unchanged code.

### Pitfall 4: Dot-notation keys with numbers broken in some tools

**What goes wrong:** Token paths like `spacing.0.5` (for the 0.5 spacing step) use a decimal key. Some JSON parsers or SD path resolution may handle `0.5` unexpectedly when traversing nested objects.

**Why it happens:** In JSON, `"0.5"` is a valid string key. DTCG path traversal uses dot-separated strings — `{spacing.0.5}` means the key literally named `"0.5"` under `spacing`. Style Dictionary v4 handles this correctly, but consumers using dot notation in JavaScript (`tokens.spacing['0.5']`) must use bracket notation.

**How to avoid:** Keep spacing file keys as-is per Tailwind convention. No workaround needed for SD output. Document that breakpoint constant names for `text-` prefixed keys will be camelCased by SD: `typography['text-xl']` → `TypographyTextXl` in the JS constants.

**Warning signs:** SD output contains `--dsx-spacing-0-5: 2px` (expected) and TypeScript constant is `SpacingXxxx` (check the exact casing SD emits for decimal keys).

### Pitfall 5: @font-face not generated by Style Dictionary

**What goes wrong:** Developer expects `dist/css/tokens.css` to contain `@font-face` declarations for Archivo and Inter. It does not — SD only outputs `--dsx-font-family-default: "Archivo", sans-serif`.

**Why it happens:** Style Dictionary's `fontFamily` type outputs the CSS variable value, not the `@font-face` block. `@font-face` is a separate CSS at-rule that SD does not generate natively (no built-in format for it).

**How to avoid:** Treat font loading as a separate concern. Phase 2 outputs only the `font-family` CSS variable. The `@font-face` CSS is a Phase 4 task (Storybook preview).

**Warning signs:** Fonts don't appear in Storybook — this is expected until Phase 4.

### Pitfall 6: tsup `clean: true` deletes SD-generated CSS

**What goes wrong:** tsup's `clean: true` option deletes the entire `dist/` directory on every build. If SD runs before tsup (correct order), tsup's clean step wipes `dist/css/tokens.css`.

**Why it happens:** Turborepo runs `build:tokens` then `build` (tsup) in sequence. tsup's `clean: true` runs at the start of tsup's execution, before tsup writes its own files.

**How to avoid:** Change tsup config to NOT clean, and instead rely on Turbo's cache invalidation. Or configure tsup to only clean `dist/index.js` and `dist/index.cjs` (not `dist/css/`). Recommended: remove `clean: true` from `tsup.config.ts` in the tokens package; SD outputs to `dist/css/` while tsup outputs to `dist/` root.

**Warning signs:** `dist/css/tokens.css` is missing after `turbo run build` even though `build:tokens` succeeded.

---

## Code Examples

### Complete style-dictionary.config.mjs (Phase 2)

```javascript
// packages/tokens/style-dictionary.config.mjs
// Source: https://styledictionary.com/reference/api/ + https://github.com/tokens-studio/sd-transforms README

import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

const sd = new StyleDictionary({
  source: ['tokens/primitives/**/*.tokens.json'],
  preprocessors: ['tokens-studio'],
  expand: {
    typesMap: expandTypesMap,
  },
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      prefix: 'dsx',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: ':root',
          },
          filter: (token) =>
            !(token.path[0] === 'grid' && token.path[1] === 'breakpoint'),
        },
      ],
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'src/',
      files: [
        {
          destination: 'breakpoints.ts',
          format: 'javascript/es6',
          filter: (token) =>
            token.path[0] === 'grid' && token.path[1] === 'breakpoint',
        },
      ],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
```

### package.json scripts (packages/tokens)

```json
{
  "scripts": {
    "build:tokens": "node style-dictionary.config.mjs",
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint ."
  }
}
```

### turbo.json additions

```json
{
  "tasks": {
    "build:tokens": {
      "outputs": ["dist/css/**", "src/breakpoints.ts"],
      "inputs": [
        "tokens/**/*.tokens.json",
        "style-dictionary.config.mjs",
        "package.json"
      ]
    },
    "build": {
      "dependsOn": ["^build", "build:tokens"],
      "outputs": ["dist/**", "storybook-static/**"],
      "inputs": ["src/**", "tsup.config.ts", "tsconfig.json", "package.json"]
    }
  }
}
```

### tsup.config.ts — remove clean: true

```typescript
// packages/tokens/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: false,   // CHANGED: SD writes dist/css/tokens.css; tsup must not delete it
  sourcemap: true,
  splitting: false,
  treeshake: true,
})
```

### src/index.ts — populate with breakpoints export

```typescript
// packages/tokens/src/index.ts
// Re-export SD-generated breakpoints constants
export * from './breakpoints';
```

### Expected CSS output shape

```css
/* dist/css/tokens.css */
:root {
  --dsx-color-red-50: #FEF2F2;
  --dsx-color-red-100: #FEE2E2;
  /* ... */
  --dsx-color-red-500: #EF4444;
  /* ... */
  --dsx-spacing-0: 0px;
  --dsx-spacing-0-5: 2px;
  --dsx-spacing-1: 4px;
  /* ... */
  --dsx-spacing-96: 384px;
  --dsx-font-family-default: "Archivo", sans-serif;
  --dsx-font-family-variable: "Inter Variable", Inter, sans-serif;
  --dsx-elevation-sm: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  /* ... */
  --dsx-typography-text-xl-font-family: "Archivo", sans-serif;
  --dsx-typography-text-xl-font-size: 20px;
  /* etc. — SD expands composite typography tokens per property */
}
```

Note: SD v4 with `expand.typesMap: expandTypesMap` expands composite tokens into individual CSS custom properties. Typography becomes `--dsx-typography-text-xl-font-size`, `--dsx-typography-text-xl-font-weight`, etc. — not a CSS shorthand. That is the expected and correct output for primitive tokens.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `StyleDictionary.extend(cfg)` (v3) | `new StyleDictionary(cfg)` (v4) | SD v4.0, 2024 | New class-based API; `extend()` removed |
| Sync `sd.buildAllPlatforms()` | Async `await sd.buildAllPlatforms()` | SD v4.0, 2024 | Build scripts must be async or use top-level await |
| `value` key in token JSON | `$value` key (DTCG) | SD v4.0, 2024 | v3 configs are not forward-compatible |
| `@tokens-studio/sd-transforms@^1.x` targets SD v4 | `@tokens-studio/sd-transforms@^2.x` targets SD v5 | sd-transforms v2.0, 2025 | Must pin v1.x when using SD v4 |
| style-dictionary@^4.4.0 is latest v4 | style-dictionary@5.4.0 is npm `latest` | SD v5.0, 2025 | Installing without version pin gives v5; pin v4 explicitly |

**Deprecated/outdated:**
- `StyleDictionary.extend()`: Removed in v4. Use `new StyleDictionary()`.
- `sd.buildAllPlatforms()` called synchronously: All async in v4+; must `await`.
- `config.json` as config file: Still supported in v4, but `.mjs` is required for this project (`"type": "module"`).

---

## Open Questions

1. **Figma token values**
   - What we know: The Figma file is the canonical source for color, spacing, typography, grid, and elevation values
   - What's unclear: Exact brand palette colors, exact shadow levels used in the Figma file, whether type scale covers all 13 Tailwind steps
   - Recommendation: Read Figma via MCP before authoring any `.tokens.json` files. Use Tailwind defaults only as fallback per Claude's Discretion.

2. **Tokens Studio export format for composite tokens in practice**
   - What we know: The preprocessor normalizes `boxShadow`→`shadow` and `x`/`y`→`offsetX`/`offsetY`; typography exports 9 properties in `$value`
   - What's unclear: Whether Tokens Studio Pro v2 DTCG export includes all 9 typography properties or a subset; whether `paragraphIndent` and `paragraphSpacing` are output
   - Recommendation: When Tokens Studio tokens are first exported, inspect the raw JSON and verify the preprocessor normalizes correctly. If extra properties appear in the composite, add custom filters.

3. **CSS variable name collisions for Tailwind step names with hyphens**
   - What we know: `text-xl` as a key becomes `--dsx-typography-text-xl-font-size` after the `name/kebab` transform
   - What's unclear: Whether the double hyphen in `text-xl` causes issues in the kebab transform (it may output `--dsx-typography-text--xl` with double dash)
   - Recommendation: After first build, inspect output CSS variable names for double-hyphen issues. If present, register a custom `name/kebab` override or rename keys to `textXl` in the token JSON and document the departure from D-12.

---

## Validation Architecture

`workflow.nyquist_validation` is not set to false in `.planning/config.json` — validation section is included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None currently — node assertions + file existence checks sufficient |
| Config file | None required |
| Quick run command | `node -e "require('./dist/index.cjs')"` (smoke test) |
| Full suite command | See per-requirement commands below |

No formal test framework is required for this phase. All validation is deterministic file output checking and CSS parsing — shell assertions are sufficient and faster than a test runner.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOKEN-01 | `dist/css/tokens.css` contains `--dsx-color-red-500` | smoke | `grep -q '\-\-dsx-color-red-500' packages/tokens/dist/css/tokens.css && echo PASS` | ❌ Wave 0 (tokens.css generated by build) |
| TOKEN-01 | Color token count ≥ 6 hues × 11 steps = 66 minimum | smoke | `grep -c '\-\-dsx-color-' packages/tokens/dist/css/tokens.css` | ❌ Wave 0 |
| TOKEN-02 | `dist/css/tokens.css` contains `--dsx-spacing-1` through `--dsx-spacing-96` | smoke | `grep -q '\-\-dsx-spacing-96' packages/tokens/dist/css/tokens.css && echo PASS` | ❌ Wave 0 |
| TOKEN-02 | Spacing 0.5 step present | smoke | `grep -q '\-\-dsx-spacing-0-5' packages/tokens/dist/css/tokens.css && echo PASS` | ❌ Wave 0 |
| TOKEN-03 | Breakpoints NOT in CSS output | smoke | `! grep -q '\-\-dsx-grid-breakpoint' packages/tokens/dist/css/tokens.css && echo PASS` | ❌ Wave 0 |
| TOKEN-03 | TypeScript breakpoints in `dist/index.js` | smoke | `node -e "const b=require('./packages/tokens/dist/index.cjs'); console.log(Object.keys(b).some(k=>k.includes('Breakpoint')))"` | ❌ Wave 0 |
| TOKEN-04 | Typography CSS vars present for all 13 Tailwind steps | smoke | `grep -c '\-\-dsx-typography-text-' packages/tokens/dist/css/tokens.css` (expect ≥ 13 lines per property) | ❌ Wave 0 |
| TOKEN-05 | Shadow CSS vars present | smoke | `grep -q '\-\-dsx-elevation-' packages/tokens/dist/css/tokens.css && echo PASS` | ❌ Wave 0 |
| TOKEN-09 | `outputReferences: true` — CSS contains `var()` references for alias tokens | manual | Inspect `dist/css/tokens.css` — Phase 2 has no aliases yet; verify in Phase 3 when semantic tokens are added | N/A |
| TOKEN-10 | Single SD instance in Phase 2; multi-instance architecture confirmed for Phase 3 | manual | Inspect `style-dictionary.config.mjs` for single `new StyleDictionary()` call | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `node packages/tokens/style-dictionary.config.mjs && grep -c -- '--dsx-color-' packages/tokens/dist/css/tokens.css`
- **Per wave merge:** Full build: `npm run build -w packages/tokens && ls -la packages/tokens/dist/css/tokens.css`
- **Phase gate:** `dist/css/tokens.css` exists, is non-empty, and contains at minimum color, spacing, typography, and elevation variables before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `packages/tokens/tokens/primitives/color.tokens.json` — TOKEN-01
- [ ] `packages/tokens/tokens/primitives/spacing.tokens.json` — TOKEN-02
- [ ] `packages/tokens/tokens/primitives/typography.tokens.json` — TOKEN-04
- [ ] `packages/tokens/tokens/primitives/elevation.tokens.json` — TOKEN-05
- [ ] `packages/tokens/tokens/primitives/grid.tokens.json` — TOKEN-03
- [ ] `packages/tokens/style-dictionary.config.mjs` — all TOKEN-*
- [ ] `packages/tokens/src/index.ts` — replace empty barrel with breakpoints export

---

## Sources

### Primary (HIGH confidence)
- [styledictionary.com/reference/api/](https://styledictionary.com/reference/api/) — `buildAllPlatforms()` vs `buildPlatform()`, no `build()` method
- [styledictionary.com/reference/hooks/formats/predefined/](https://styledictionary.com/reference/hooks/formats/predefined/) — `javascript/es6`, `javascript/esm`, `typescript/es6-declarations` confirmed format names and output structure
- [styledictionary.com/reference/config/](https://styledictionary.com/reference/config/) — `platforms`, `source`, `preprocessors`, `expand` config keys
- [github.com/tokens-studio/sd-transforms README](https://github.com/tokens-studio/sd-transforms/blob/main/README.md) — `register()`, `expandTypesMap`, `preprocessors: ['tokens-studio']` usage
- [turborepo.dev/docs/crafting-your-repository/configuring-tasks](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks) — intra-package `dependsOn` (no `^`) for sequential task chaining
- npm registry — `style-dictionary@4.4.0` latest v4; `style-dictionary@5.4.0` latest overall; `@tokens-studio/sd-transforms@1.3.0` latest v1.x (SD v4 compatible)

### Secondary (MEDIUM confidence)
- [styledictionary.com/versions/v5/migration/](https://styledictionary.com/versions/v5/migration/) — v5 breaking changes: stricter token references, Node 22+ requirement
- [docs.tokens.studio/manage-tokens/token-types/box-shadow](https://docs.tokens.studio/manage-tokens/token-types/box-shadow) — `boxShadow`/`x`/`y` Tokens Studio deviation from DTCG; preprocessor normalization path
- [docs.tokens.studio/manage-settings/token-format](https://docs.tokens.studio/manage-settings/token-format) — DTCG opt-in mode; `$type`/`$value` prefix behavior

### Tertiary (LOW confidence)
- WebSearch result: sd-transforms v2.x "only breaking change is no longer compatible with v4" — not verified against official changelog; treat as directionally correct, verify before implementing

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed against npm registry (2026-03-22)
- Architecture: HIGH — config patterns verified against official SD docs and sd-transforms README
- Turbo orchestration: HIGH — intra-package `dependsOn` confirmed in Turborepo official docs
- Tokens Studio composite format: MEDIUM — preprocessor normalization confirmed; exact DTCG export shape unverified (depends on Tokens Studio Pro version in use)
- Font @font-face output: HIGH — confirmed SD does NOT generate @font-face; CSS variable output shape is well-documented

**Research date:** 2026-03-22
**Valid until:** 2026-06-22 (Style Dictionary ecosystem is evolving; check for SD v4→v5 migration if project revisits version lock)
