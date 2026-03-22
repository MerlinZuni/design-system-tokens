# Phase 3: Semantic Tokens & Figma Pipeline - Research

**Researched:** 2026-03-22
**Domain:** W3C DTCG semantic token authoring, Style Dictionary v4 multi-instance loop, Tokens Studio Pro git sync, Figma Variables with multi-brand/multi-mode
**Confidence:** HIGH (core patterns verified against existing project + official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Brand structure**
- D-01: Two brands: `parent-brand` (primary) and `child-brand` (secondary/luxury) — generic names for starter kit portability
- D-02: Each brand has a `primary` and `secondary` color role — not two separate brands, but two color roles within one brand identity
- D-03: `parent-brand` colors: primary = teal `#4FC4C4` (color.brand.500), secondary = purple `#5944af` (color.secondary.500)
- D-04: `child-brand` colors: primary = near-black slate `#1C1C28`, secondary = deep navy `#1B3A6B`
- D-05: 4 CSS outputs: `parent-brand/light.css`, `parent-brand/dark.css`, `child-brand/light.css`, `child-brand/dark.css`

**Semantic token vocabulary — naming**
- D-06: Role-based naming (`color.background.default`, `color.text.primary`) — not component-based
- D-07: Full semantic color categories: `background`, `surface`, `text`, `action`, `focus`, `link`, `border`, `divider`, `icon`, `status.error/warning/success/info`, `overlay`, `shadow`, `skeleton`, `highlight`
- D-08: Semantic spacing with 3 categories: `space.component.xs/sm/md/lg/xl`, `space.layout.xs/sm/md/lg/xl`, `space.inline.xs/sm/md/lg`
- D-09: Primitive spacing scale remains available for edge cases

**Dark mode**
- D-10: `parent-brand` dark mode: brand-tinted surfaces (Vercel-inspired) with MORE noticeable surface depth contrast
- D-11: `child-brand` dark mode: deep charcoal surfaces (neutral dark, not tinted)
- D-12: All text/background pairings must pass WCAG AA (4.5:1 contrast ratio minimum)
- D-13: Accent surfaces (brand.500) use dark text — `neutral.900` on `brand.500` passes AAA (~7:1)

**Figma & Tokens Studio workflow**
- D-14: Figma-first approach — Figma Variables are the canonical source of truth
- D-15: Bootstrap method: author semantic JSON in code first → Tokens Studio Pro pushes to Figma → Figma becomes source of truth going forward
- D-16: Tokens Studio Pro (paid, $49/mo) installed in Figma with full sync capabilities
- D-17: Tokens Studio Pro requires GitHub remote — set up under merlinzuni account (see todo: github-remote-setup.md) — BLOCKER for phase execution
- D-18: Figma Variable Collections: `Primitives` (existing, no modes) + `Semantic` (new, 4 modes: parent-brand/light, parent-brand/dark, child-brand/light, child-brand/dark)
- D-19: Figma variable naming: slash-separated (`color/background/default`) auto-translates to dot notation in DTCG JSON

### Claude's Discretion

- Exact primitive alias mapping for each semantic token (which primitive step maps to which semantic role)
- WCAG AA verification of all text/background pairings during authoring
- Style Dictionary multi-instance loop implementation (TOKEN-10)
- File structure for semantic JSON under `packages/tokens/tokens/semantic/`

### Deferred Ideas (OUT OF SCOPE)

- GitHub Actions CI for automatic Tokens Studio sync on push — v2
- Automated WCAG contrast validation in CI — backlog
- Component tokens (Tier 3) — Phase 6
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TOKEN-06 | Semantic light mode token set — aliases primitive tokens, defines purpose (`color.background.primary`, `color.text.default`, etc.) | Alias mapping patterns + DTCG file structure covered in Architecture Patterns |
| TOKEN-07 | Semantic dark mode token set — same structure as light, different aliases | Dark mode alias strategy covered in Architecture Patterns and Code Examples |
| TOKEN-08 | Multi-brand semantic token sets — at least 2 brand variants, each with light and dark modes, using Figma Variable Modes | Per-brand per-mode file structure and SD loop pattern covered in Architecture Patterns |
| TOKEN-10 | Style Dictionary v4 pipeline runs one instance per brand × mode combination for correct multi-theme output | SD multi-instance nested loop verified against official examples — see Architecture Patterns |
| FIGMA-01 | Figma Variable Collections established — one Collection per tier: Primitive (no modes), Semantic (light/dark per brand) | Figma Variable Collection/Mode structure verified in FIGMA.md and web sources |
| FIGMA-02 | Figma variable naming uses slash-separated convention (`color/background/primary`) that auto-translates to dot notation | Convention verified as stable HIGH confidence — covered in Naming section |
| FIGMA-03 | Tokens Studio Pro sync configured — Figma is canonical source of truth; JSON files are read-only output and never hand-edited | GitHub sync setup steps documented; bootstrap flow (JSON→Figma→source of truth) covered in Standard Stack |
</phase_requirements>

---

## Summary

Phase 3 has three tightly coupled areas of work: (1) authoring semantic token JSON files in DTCG format for each brand × mode combination, (2) refactoring Style Dictionary to run one instance per brand × mode combination (TOKEN-10), and (3) bootstrapping the Figma Variables pipeline via Tokens Studio Pro.

The semantic token authoring work is purely mechanical — the project already has a working DTCG pipeline from Phase 2, and the only new complexity is the file structure for 4 brand-mode variants and mapping each semantic role to the correct primitive alias. The SD multi-instance loop is a well-documented v4 pattern: nest brand and mode arrays, create one `new StyleDictionary({...})` per combination with its own `source` array and `buildPath`, then call `buildAllPlatforms()`. The existing `style-dictionary.config.mjs` is replaced/extended, not rebuilt from scratch.

The Figma pipeline work is gated by the pending GitHub remote setup (D-17, documented in `github-remote-setup.md`). Once that blocker is cleared, the bootstrap flow is: push the authored JSON to the repo branch, configure Tokens Studio Pro in Figma with the PAT + repo path, then use Tokens Studio's "Export to Figma" (themes-mode, not token-sets-mode) to create the `Semantic` collection with 4 modes automatically. After that initial push, Figma becomes the canonical source and future edits flow Figma → Tokens Studio push → JSON → SD build.

**Primary recommendation:** Author all 4 semantic JSON files first (code bootstrap), validate the SD multi-instance build locally, then perform the Tokens Studio Pro Figma push in a single session once the GitHub remote is live. Never interleave JSON hand-editing and Figma edits — pick a direction and commit to it.

---

## Pre-Phase Blockers

Two pending todos must be resolved before Phase 3 execution:

| Blocker | File | What's Needed |
|---------|------|---------------|
| GitHub remote not set up | `.planning/todos/pending/github-remote-setup.md` | Create repo, add remote, push, get PAT for Tokens Studio Pro |
| Secondary color scale not in primitives | `.planning/todos/pending/figma-secondary-color-scale.md` | Add `color.secondary.*` (50–950) to `color.tokens.json` primitives; 11-step scale with base `#5944af` at 500 |

The secondary color scale is a **code change** (add to `packages/tokens/tokens/primitives/color.tokens.json`) that must happen before semantic tokens can reference `{color.secondary.500}`. Also: `color.brand` currently uses the Tailwind violet placeholder — this needs to be updated to the actual teal scale (`#4FC4C4` at step 500) before Phase 3 semantic tokens are authored.

---

## Standard Stack

### Core (already installed — no new installs required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| style-dictionary | ^4.4.0 | Token transform pipeline | Already installed in Phase 2; v4 is native DTCG; multi-instance loop is core v4 pattern |
| @tokens-studio/sd-transforms | ^1.3.0 | Normalizes Tokens Studio export format to DTCG standard | Already installed; must stay on v1.x (v2 targets SD v5 which is not used here) |

### External Tools (Figma pipeline — no npm installs)

| Tool | Version | Purpose | Status |
|------|---------|---------|--------|
| Tokens Studio Pro | Plugin (latest) | Figma Variables sync, GitHub git sync, multi-mode DTCG export | Already installed in Figma (D-16) |
| GitHub PAT | n/a | Allows Tokens Studio Pro to read/write repo | Pending (see blocker above) |

### No New npm Packages Required

Phase 3 does not add any new npm dependencies. All transform/build infrastructure was established in Phase 2. The only file changes are:
- New token JSON files under `tokens/semantic/`
- Updated `style-dictionary.config.mjs` (multi-instance loop)
- Updated `packages/tokens/package.json` exports map (4 new CSS paths)
- Updated `turbo.json` outputs (new CSS paths)

### Primitive Color Scale Updates Required (before semantic authoring)

These are JSON edits to existing primitive files, not new installs:

1. **Update `color.brand` scale** — replace Tailwind violet placeholder with teal scale anchored at `#4FC4C4` (step 500). Generate the full 50–950 scale from this anchor using perceptual lightness methodology.

2. **Add `color.secondary` scale** — add new `secondary` group to `color.tokens.json` with the purple scale from `figma-secondary-color-scale.md` (base `#5944af` at step 500, full 50–950).

3. **Add `color.slate` scale** — child-brand primary is `#1C1C28` (near-black). The existing `neutral` scale (Tailwind zinc) is close but not identical. Two options:
   - Use `neutral.950` (`#09090b`) as the child-brand primary alias if close enough
   - Add a dedicated `color.slate` scale anchored at `#1C1C28` for exact match

   **Recommendation (Claude's Discretion):** Add `color.slate` as a small 5-step scale (100/300/500/700/900) since only a few steps are needed for the luxury brand. `slate.500 = #1C1C28`.

---

## Architecture Patterns

### Recommended File Structure

```
packages/tokens/tokens/
├── primitives/                          # EXISTING — Phase 2, do not touch
│   ├── color.tokens.json               # MODIFY: update brand scale, add secondary + slate
│   ├── spacing.tokens.json
│   ├── typography.tokens.json
│   ├── elevation.tokens.json
│   └── grid.tokens.json
└── semantic/                            # NEW — Phase 3
    ├── parent-brand/
    │   ├── light.tokens.json           # Semantic aliases for parent-brand light mode
    │   └── dark.tokens.json            # Semantic aliases for parent-brand dark mode
    └── child-brand/
        ├── light.tokens.json           # Semantic aliases for child-brand light mode
        └── dark.tokens.json            # Semantic aliases for child-brand dark mode
```

CSS output structure:
```
packages/tokens/dist/
├── css/
│   └── tokens.css                      # EXISTING Phase 2 — primitive vars (keep for backwards compat)
├── parent-brand/
│   ├── light.css                       # NEW — semantic vars for parent-brand light
│   └── dark.css                        # NEW — semantic vars for parent-brand dark
└── child-brand/
    ├── light.css                       # NEW — semantic vars for child-brand light
    └── dark.css                        # NEW — semantic vars for child-brand dark
```

### Pattern 1: DTCG Semantic Token File Structure

All 4 semantic files use the same token vocabulary (D-07, D-08). Only the `$value` aliases differ between files. Group-level `$type` inheritance applies.

**Canonical file shape (light mode example):**

```json
{
  "color": {
    "$type": "color",
    "background": {
      "default":  { "$value": "{color.neutral.0}",    "$description": "Page canvas background" },
      "subtle":   { "$value": "{color.neutral.50}",   "$description": "Recessed background, alternate rows" },
      "surface":  { "$value": "{color.neutral.0}",    "$description": "Component surface background" },
      "overlay":  { "$value": "{color.neutral.100}",  "$description": "Overlay/scrim region" },
      "inverse":  { "$value": "{color.neutral.900}",  "$description": "Inverse/dark-on-light region" }
    },
    "surface": {
      "card":     { "$value": "{color.neutral.0}",    "$description": "Card background" },
      "panel":    { "$value": "{color.neutral.50}",   "$description": "Side panel/drawer background" },
      "popover":  { "$value": "{color.neutral.0}",    "$description": "Popover/dropdown background" },
      "tooltip":  { "$value": "{color.neutral.900}",  "$description": "Tooltip background" },
      "sunken":   { "$value": "{color.neutral.100}",  "$description": "Sunken well / input background" }
    },
    "text": {
      "default":      { "$value": "{color.neutral.900}", "$description": "Primary body text" },
      "muted":        { "$value": "{color.neutral.600}", "$description": "Secondary/supporting text" },
      "subtle":       { "$value": "{color.neutral.400}", "$description": "Placeholder text, captions" },
      "inverse":      { "$value": "{color.neutral.0}",   "$description": "Text on dark/inverse surfaces" },
      "disabled":     { "$value": "{color.neutral.300}", "$description": "Disabled state text" },
      "link":         { "$value": "{color.brand.500}",   "$description": "Default link color" },
      "link-hover":   { "$value": "{color.brand.600}",   "$description": "Link hover state" },
      "link-visited": { "$value": "{color.brand.700}",   "$description": "Visited link" }
    },
    "action": {
      "default":  { "$value": "{color.brand.500}", "$description": "Primary interactive element" },
      "hover":    { "$value": "{color.brand.600}", "$description": "Hover state" },
      "pressed":  { "$value": "{color.brand.700}", "$description": "Pressed/active state" },
      "disabled": { "$value": "{color.neutral.200}", "$description": "Disabled interactive element" },
      "subtle":   { "$value": "{color.brand.50}",  "$description": "Subtle/ghost action background" }
    },
    "focus": {
      "ring": { "$value": "{color.brand.500}", "$description": "Focus ring for keyboard navigation (WCAG AA)" }
    },
    "border": {
      "default": { "$value": "{color.neutral.200}", "$description": "Default border/outline" },
      "subtle":  { "$value": "{color.neutral.100}", "$description": "Subtle separator" },
      "strong":  { "$value": "{color.neutral.400}", "$description": "Emphasized border" },
      "inverse": { "$value": "{color.neutral.700}", "$description": "Border on inverse surfaces" },
      "focus":   { "$value": "{color.brand.500}",   "$description": "Keyboard focus ring border" }
    },
    "divider": {
      "default": { "$value": "{color.neutral.200}", "$description": "Horizontal rule / section divider" }
    },
    "icon": {
      "default":  { "$value": "{color.neutral.700}", "$description": "Default icon" },
      "muted":    { "$value": "{color.neutral.400}", "$description": "Secondary icon" },
      "inverse":  { "$value": "{color.neutral.0}",   "$description": "Icon on dark surfaces" },
      "disabled": { "$value": "{color.neutral.300}", "$description": "Disabled icon" },
      "action":   { "$value": "{color.brand.500}",   "$description": "Interactive/brand icon" }
    },
    "status": {
      "error": {
        "background": { "$value": "{color.red.50}",  "$description": "Error state background" },
        "text":       { "$value": "{color.red.700}",  "$description": "Error text" },
        "border":     { "$value": "{color.red.300}",  "$description": "Error border" },
        "icon":       { "$value": "{color.red.500}",  "$description": "Error icon" }
      },
      "warning": {
        "background": { "$value": "{color.yellow.50}",   "$description": "Warning state background" },
        "text":       { "$value": "{color.yellow.800}",  "$description": "Warning text" },
        "border":     { "$value": "{color.yellow.300}",  "$description": "Warning border" },
        "icon":       { "$value": "{color.yellow.500}",  "$description": "Warning icon" }
      },
      "success": {
        "background": { "$value": "{color.green.50}",  "$description": "Success state background" },
        "text":       { "$value": "{color.green.700}",  "$description": "Success text" },
        "border":     { "$value": "{color.green.300}",  "$description": "Success border" },
        "icon":       { "$value": "{color.green.500}",  "$description": "Success icon" }
      },
      "info": {
        "background": { "$value": "{color.blue.50}",   "$description": "Info state background" },
        "text":       { "$value": "{color.blue.700}",  "$description": "Info text" },
        "border":     { "$value": "{color.blue.300}",  "$description": "Info border" },
        "icon":       { "$value": "{color.blue.500}",  "$description": "Info icon" }
      }
    },
    "overlay": {
      "scrim": { "$value": "{color.neutral.950}", "$description": "Modal/drawer scrim — apply opacity in CSS (e.g. 60%)" }
    },
    "skeleton": {
      "base":      { "$value": "{color.neutral.100}", "$description": "Skeleton loader base" },
      "highlight": { "$value": "{color.neutral.50}",  "$description": "Skeleton shimmer highlight" }
    },
    "highlight": {
      "selected": { "$value": "{color.brand.100}", "$description": "Selected text / search match highlight" }
    }
  },
  "shadow": {
    "$type": "shadow",
    "sm": { "$value": "{elevation.sm}", "$description": "Small shadow — cards, buttons" },
    "md": { "$value": "{elevation.md}", "$description": "Medium shadow — dropdowns, dialogs" },
    "lg": { "$value": "{elevation.lg}", "$description": "Large shadow — modals, sheets" }
  },
  "space": {
    "$type": "dimension",
    "component": {
      "xs": { "$value": "{spacing.1}",  "$description": "4px — tight internal padding" },
      "sm": { "$value": "{spacing.2}",  "$description": "8px — compact component padding" },
      "md": { "$value": "{spacing.4}",  "$description": "16px — standard component padding" },
      "lg": { "$value": "{spacing.6}",  "$description": "24px — generous component padding" },
      "xl": { "$value": "{spacing.8}",  "$description": "32px — extra-large component padding" }
    },
    "layout": {
      "xs": { "$value": "{spacing.4}",  "$description": "16px — tight section gap" },
      "sm": { "$value": "{spacing.8}",  "$description": "32px — compact section gap" },
      "md": { "$value": "{spacing.16}", "$description": "64px — standard section gap" },
      "lg": { "$value": "{spacing.24}", "$description": "96px — wide section gap" },
      "xl": { "$value": "{spacing.32}", "$description": "128px — page-level gap" }
    },
    "inline": {
      "xs": { "$value": "{spacing.1}", "$description": "4px — icon to label in tight contexts" },
      "sm": { "$value": "{spacing.2}", "$description": "8px — icon to label standard" },
      "md": { "$value": "{spacing.3}", "$description": "12px — inline element gap" },
      "lg": { "$value": "{spacing.4}", "$description": "16px — generous inline gap" }
    }
  }
}
```

**Key rule:** Spacing tokens (`space.*`) do NOT vary by brand or mode — they are brand-invariant. Include them only in one shared file and reference via the SD `include` mechanism, OR duplicate the identical block across all 4 files (simpler, avoids shared-file complexity). See Pattern 3 for the shared-include approach.

### Pattern 2: Style Dictionary Multi-Instance Loop (TOKEN-10)

Replace the single-instance SD config with a nested brand × mode loop. Each instance gets its own `source` array, `buildPath`, and output filename.

```javascript
// style-dictionary.config.mjs
import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

const BRANDS = ['parent-brand', 'child-brand'];
const MODES = ['light', 'dark'];

// --- Instance 1: Primitives CSS (unchanged from Phase 2) ---
const sdPrimitives = new StyleDictionary({
  source: ['tokens/primitives/**/*.tokens.json'],
  preprocessors: ['tokens-studio'],
  expand: { typesMap: expandTypesMap },
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      prefix: 'dsx',
      buildPath: 'dist/css/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: { outputReferences: true, selector: ':root' },
        filter: (token) => !(token.path[0] === 'grid' && token.path[1] === 'breakpoint'),
      }],
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'src/',
      files: [{
        destination: 'breakpoints.ts',
        format: 'javascript/es6',
        filter: (token) => token.path[0] === 'grid' && token.path[1] === 'breakpoint',
      }],
    },
  },
});

// --- Instances 2–5: One per brand × mode combination ---
for (const brand of BRANDS) {
  for (const mode of MODES) {
    const selector = mode === 'light' ? ':root' : '[data-theme="dark"]';

    const sd = new StyleDictionary({
      // Primitives loaded as 'include' so they are available for alias resolution
      // but are NOT written to the output file (only tokens from 'source' are output)
      include: ['tokens/primitives/**/*.tokens.json'],
      // Brand+mode semantic tokens are the 'source' — these ARE written to output
      source: [`tokens/semantic/${brand}/${mode}.tokens.json`],

      preprocessors: ['tokens-studio'],
      expand: { typesMap: expandTypesMap },

      platforms: {
        css: {
          transformGroup: 'tokens-studio',
          transforms: ['name/kebab'],
          prefix: 'dsx',
          buildPath: `dist/${brand}/`,
          files: [{
            destination: `${mode}.css`,
            format: 'css/variables',
            options: {
              outputReferences: true,
              selector,
            },
          }],
        },
      },
    });

    await sd.cleanAllPlatforms();
    await sd.buildAllPlatforms();
  }
}

await sdPrimitives.cleanAllPlatforms();
await sdPrimitives.buildAllPlatforms();
```

**Critical detail — `include` vs `source`:**

| Property | Tokens Loaded | Tokens Written to Output |
|----------|---------------|--------------------------|
| `include` | Yes — available for alias resolution | No — excluded from output files |
| `source` | Yes | Yes — written to output |

Using `include` for primitives means the semantic CSS output file contains ONLY semantic tokens (e.g., `--dsx-color-background-default`), with alias references preserved as `var(--dsx-color-neutral-0)` pointing back to the primitive vars that live in `tokens.css`. This is correct: the consuming app loads `tokens.css` (primitives) + `parent-brand/light.css` (semantics) in that order.

**Confidence:** HIGH — `include` vs `source` distinction is documented in Style Dictionary v4 docs and is the standard pattern in the official multi-brand-multi-platform example.

### Pattern 3: Brand Color Alias Strategy

Each semantic file is the single source that differs. The alias targets per brand/mode:

**parent-brand/light.css — color.action.default resolves to:**
```
{color.brand.500} → teal #4FC4C4 → --dsx-color-brand-500
```

**parent-brand/dark.css — color.action.default resolves to:**
```
{color.brand.400} → lighter teal for dark mode → --dsx-color-brand-400
```
(Shift one step lighter for better luminance contrast on dark backgrounds.)

**child-brand/light.css — color.action.default resolves to:**
```
{color.slate.500} → near-black #1C1C28 — NOTE: near-black as action color is unusual;
use color.blue.600 as action on child-brand light for accessibility unless brief confirms near-black buttons
```

**child-brand/dark.css — color.action.default resolves to:**
```
{color.slate.300} → lighter slate for dark surfaces
```

**Important note for Claude's Discretion (alias mapping):** The child-brand uses a near-black (`#1C1C28`) as its "primary" color. On a white background, this has excellent contrast as text or icon color but fails as an interactive/action token because visual affordance of "this is a button" relies on color distinctiveness. Recommend using `color.slate.500` only for text, border, and icon roles, and using the navy (`color.navy.600` or `color.blue.900`) as the action color for child-brand interactive elements.

### Pattern 4: Dark Mode Surface Strategy

**parent-brand dark (Vercel-inspired, brand-tinted):**

Use brand-tinted dark surfaces with clear step contrast between depth levels:

| Role | Alias | Hex (approx) | Purpose |
|------|-------|--------------|---------|
| background.default | color.brand.950 (or custom very-dark-teal) | ~#0a1a1a | Canvas — deepest level |
| surface.card | color.brand.900 | ~#0d2020 | Card surface — 1 level above canvas |
| surface.panel | color.brand.800 | ~#112828 | Panel surface — 2 levels above |
| surface.popover | color.brand.700 | ~#163030 | Popover — highest elevation |
| text.default | color.neutral.50 | #fafafa | Near-white text |
| action.default | color.brand.400 | lighter teal | Shifted 1 step for dark-mode legibility |

**NOTE:** The existing `color.brand` scale is currently Tailwind violet (placeholder). Once replaced with the actual teal scale anchored at `#4FC4C4`, verify that steps 700–950 provide adequate dark surface differentiation. If the teal scale is too light at dark steps, consider using `color.neutral.950/900/800` with a teal tint only on specific accent surfaces.

**child-brand dark (deep charcoal, no tint):**

| Role | Alias | Hex (approx) | Purpose |
|------|-------|--------------|---------|
| background.default | color.neutral.950 | #09090b | Deepest surface |
| surface.card | color.neutral.900 | #18181b | Card |
| surface.panel | color.neutral.800 | #27272a | Panel |
| surface.popover | color.neutral.700 | #3f3f46 | Popover |
| text.default | color.neutral.50 | #fafafa | Primary text |
| action.default | color.secondary.400 | ~#9687d9 | Navy/purple accent on dark |

### Pattern 5: Semantic File Approach for Space Tokens

Space tokens (`space.component.*`, `space.layout.*`, `space.inline.*`) do not vary by brand or mode. Three valid options:

**Option A — Duplicate across all 4 files (RECOMMENDED for simplicity)**
Each semantic JSON file includes the identical `space` block. Maintenance cost is low because spacing changes are rare. No SD configuration complexity.

**Option B — Shared file loaded via `include`**
Create `tokens/semantic/shared/space.tokens.json` and add it to the `include` array in every SD instance. Tokens from `include` are excluded from output — this means space vars would NOT appear in the brand CSS files. Consumers would need a separate `shared.css` import.

**Option C — Shared file loaded via `source` in every instance**
Space tokens appear in every brand×mode output file (duplicated in 4 CSS files). Same outcome as Option A but managed as a single source file.

**Use Option A** — duplicate the space block in all 4 semantic files. The duplication is ~20 lines and removes any `include`/`source` complexity. Space tokens will appear correctly in all 4 output CSS files.

### Anti-Patterns to Avoid

- **Never use `source` for primitives in semantic SD instances** — this outputs all primitive tokens again into the semantic CSS file, creating duplicate `--dsx-color-*` declarations. Use `include` for primitives.
- **Never reference primitive tokens directly in component styles** — only reference semantic tokens. The whole point of the semantic tier is indirection.
- **Never put `$description` at the JSON file root** — known SD bug from Phase 2: root-level `$description` causes token path collisions across files. Put `$description` inside the group object.
- **Never hand-edit the exported JSON after Tokens Studio Pro is configured** — FIGMA-03 declares JSON as read-only output. Edit in Figma, push via Tokens Studio.
- **Never call `buildAllPlatforms()` on the same SD instance multiple times without `cleanAllPlatforms()` first** — stale output may persist.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-theme CSS custom properties | Custom CSS generator script | SD multi-instance loop | SD handles `outputReferences`, name transforms, file cleanup |
| Alias chain in CSS output | Manually writing `var()` chains | `outputReferences: true` in SD | SD v4 resolves cross-file references automatically |
| DTCG → Figma Variables | Manual Figma API script | Tokens Studio Pro export-to-Figma | Tokens Studio maps token structure to Collection/Mode structure automatically |
| Mode-per-file token sync | Custom Git webhook | Tokens Studio Pro git sync | Built-in PAT-based sync with PR-ready JSON diffs |
| Contrast ratio calculation | Color math library | Manual verification + reference table | At this scale (< 100 pairs), spot-check with browser DevTools or a contrast calculator |

**Key insight:** The SD `include` property is the built-in mechanism for "load these for resolution but don't output them." Using it correctly means the semantic CSS files contain only semantic tokens — exactly what consumers load to switch themes.

---

## Common Pitfalls

### Pitfall 1: Alias Resolution Across Files in SD Multi-Instance

**What goes wrong:** When semantic tokens reference `{color.neutral.900}`, SD must find `color.neutral.900` somewhere in its loaded files. If primitives are loaded via `source` instead of `include`, they appear in the output. If they're not loaded at all, SD throws an "unresolved reference" error.

**Why it happens:** Forgetting to add primitives to the `include` array in the semantic SD instances.

**How to avoid:** Every semantic SD instance must have:
```javascript
include: ['tokens/primitives/**/*.tokens.json'],
source: [`tokens/semantic/${brand}/${mode}.tokens.json`],
```

**Warning signs:** SD build errors like `"Token '{color.neutral.900}' not found"` or double-defined CSS variables in the output file.

### Pitfall 2: `cleanAllPlatforms()` Order Matters

**What goes wrong:** If `cleanAllPlatforms()` is called after `buildAllPlatforms()` on any instance, it deletes the output files that were just written.

**Why it happens:** Async loop where clean/build are accidentally swapped, or one instance's clean deletes another's output because `buildPath` overlaps.

**How to avoid:** Always call `await sd.cleanAllPlatforms()` BEFORE `await sd.buildAllPlatforms()` on each instance. In the loop pattern, call them sequentially per-instance, not in a Promise.all() without careful ordering.

### Pitfall 3: Tokens Studio Pro Mode Names Must Match

**What goes wrong:** Tokens Studio creates Figma Variable Modes using the names from `$themes.json`. If the mode name in `$themes.json` is `"light"` but Figma's collection has a mode named `"Light"` (different casing), a duplicate mode is created.

**Why it happens:** Case sensitivity in Figma Variable Mode names; Tokens Studio uses exact string matching.

**How to avoid:** Use all-lowercase, no-space mode names in `$themes.json` theme entries. Name Figma modes identically before pushing.

### Pitfall 4: Bootstrapping Direction — JSON to Figma Only (Not Figma to JSON)

**What goes wrong:** The bootstrap flow is code → Figma. If a designer creates Variables in Figma BEFORE the JSON is pushed, then the JSON push creates duplicate collections/variables or conflicts.

**Why it happens:** Misunderstanding D-15: "author semantic JSON in code first → Tokens Studio Pro pushes to Figma".

**How to avoid:** Complete all JSON authoring and validate the SD build BEFORE opening Tokens Studio Pro to push to Figma. The Primitives collection already exists in Figma (from Phase 2) — the Semantic collection is new and will be created fresh by Tokens Studio.

### Pitfall 5: `$themes.json` Must Use Folder Storage

**What goes wrong:** If Tokens Studio is configured with "single file" storage instead of "folder" storage, themes don't generate a `$themes.json` file and multi-mode export to Figma doesn't work.

**Why it happens:** Single-file storage is the simpler default; folder storage is required for Pro features including themes.

**How to avoid:** In Tokens Studio Pro settings → Storage → choose "Folder" (not "Single file"). The folder path in the repo should be `tokens/` (or wherever the semantic JSON files live).

### Pitfall 6: package.json Exports Map and turbo.json Outputs Need Updating

**What goes wrong:** Phase 4 (Storybook) imports CSS from this package. If the new `dist/parent-brand/light.css` etc. paths aren't in the `exports` map, imports fail with "package path not exported" error.

**Why it happens:** New output files from the SD loop need explicit export map entries.

**How to avoid:** Add 4 new entries to `packages/tokens/package.json` exports:
```json
{
  "./parent-brand/light": "./dist/parent-brand/light.css",
  "./parent-brand/dark": "./dist/parent-brand/dark.css",
  "./child-brand/light": "./dist/child-brand/light.css",
  "./child-brand/dark": "./dist/child-brand/dark.css"
}
```
And update `turbo.json` `build:tokens` outputs to include `"dist/parent-brand/**"` and `"dist/child-brand/**"`.

### Pitfall 7: WCAG Contrast — Status Token Text on Status Background

**What goes wrong:** `status.error.text` on `status.error.background` fails AA at commonly chosen alias pairs (e.g., `red.700` on `red.50` is fine; `red.500` on `red.50` often fails).

**Why it happens:** Status palettes are light-on-light. Step 700+ is safe for text; step 500 and below are not.

**How to avoid:** Default all `status.*.text` aliases to step 700+ against their step-50 background. Verify with contrast calculator before committing.

---

## Code Examples

### Primitive Alias Map — parent-brand light mode (key tokens only)

```json
{
  "color": {
    "$type": "color",
    "action": {
      "default": { "$value": "{color.brand.500}" },
      "hover":   { "$value": "{color.brand.600}" },
      "pressed": { "$value": "{color.brand.700}" }
    },
    "text": {
      "default": { "$value": "{color.neutral.900}" },
      "link":    { "$value": "{color.brand.500}" }
    },
    "background": {
      "default": { "$value": "{color.neutral.0}" }
    }
  }
}
```

CSS output (via SD with `outputReferences: true`):
```css
/* dist/parent-brand/light.css */
:root {
  --dsx-color-action-default: var(--dsx-color-brand-500);
  --dsx-color-action-hover: var(--dsx-color-brand-600);
  --dsx-color-text-default: var(--dsx-color-neutral-900);
  --dsx-color-background-default: var(--dsx-color-neutral-0);
}
```

### Primitive Alias Map — parent-brand dark mode (key differences)

```json
{
  "color": {
    "$type": "color",
    "action": {
      "default": { "$value": "{color.brand.400}" },
      "hover":   { "$value": "{color.brand.300}" },
      "pressed": { "$value": "{color.brand.500}" }
    },
    "text": {
      "default": { "$value": "{color.neutral.50}" },
      "link":    { "$value": "{color.brand.400}" }
    },
    "background": {
      "default": { "$value": "{color.neutral.950}" }
    }
  }
}
```

CSS output:
```css
/* dist/parent-brand/dark.css */
[data-theme="dark"] {
  --dsx-color-action-default: var(--dsx-color-brand-400);
  --dsx-color-text-default: var(--dsx-color-neutral-50);
  --dsx-color-background-default: var(--dsx-color-neutral-950);
}
```

### $themes.json for Tokens Studio Pro

The `$themes.json` file tells Tokens Studio Pro which token sets to activate for each theme. It lives at the folder root alongside the JSON files.

```json
[
  {
    "name": "light",
    "group": "parent-brand",
    "selectedTokenSets": {
      "primitives/color": "source",
      "primitives/spacing": "source",
      "primitives/typography": "source",
      "primitives/elevation": "source",
      "semantic/parent-brand/light": "enabled"
    }
  },
  {
    "name": "dark",
    "group": "parent-brand",
    "selectedTokenSets": {
      "primitives/color": "source",
      "primitives/spacing": "source",
      "primitives/typography": "source",
      "primitives/elevation": "source",
      "semantic/parent-brand/dark": "enabled"
    }
  },
  {
    "name": "light",
    "group": "child-brand",
    "selectedTokenSets": {
      "primitives/color": "source",
      "primitives/spacing": "source",
      "primitives/typography": "source",
      "primitives/elevation": "source",
      "semantic/child-brand/light": "enabled"
    }
  },
  {
    "name": "dark",
    "group": "child-brand",
    "selectedTokenSets": {
      "primitives/color": "source",
      "primitives/spacing": "source",
      "primitives/typography": "source",
      "primitives/elevation": "source",
      "semantic/child-brand/dark": "enabled"
    }
  }
]
```

This maps to Figma: "parent-brand" group → `Semantic` Collection, with modes "light" and "dark". Same for "child-brand" group.

**Note on Figma Variable Collections from Themes export:** According to Tokens Studio docs, "You need to export to Figma from Themes (pro) in order for the Plugin to create a single collection with multiple modes." D-18 expects `Primitives` (existing) + `Semantic` (new, 4 modes) — the `$themes.json` above produces exactly this via the themes export path.

**Note on Theme Switcher:** Once themes are attached to a Figma Variable Collection, Tokens Studio's Theme Switcher in the plugin no longer works. Figma's native Mode Switching must be used instead. This is expected behavior per the workflow.

### How Consumers Load Theme CSS

```css
/* In app root stylesheet — load order is critical */
@import '@design-system-x/tokens/css';               /* primitives */
@import '@design-system-x/tokens/parent-brand/light'; /* semantic light (default) */

/* Dark mode override — applied when [data-theme="dark"] is set on <html> */
@import '@design-system-x/tokens/parent-brand/dark';
```

Or via JavaScript in Storybook (Phase 4):
```typescript
// .storybook/preview.ts
import '@design-system-x/tokens/css';
import '@design-system-x/tokens/parent-brand/light';
import '@design-system-x/tokens/parent-brand/dark';
```

---

## WCAG Contrast Reference

Key pairings to verify during token authoring (using existing primitive hex values):

| Token Pair | Light/Dark | Approx Ratio | WCAG AA? | Notes |
|------------|-----------|--------------|----------|-------|
| neutral.900 (#18181b) on neutral.0 (#fff) | Light | ~19:1 | AAA | Body text on white canvas |
| neutral.50 (#fafafa) on neutral.950 (#09090b) | Dark | ~18:1 | AAA | Body text on dark canvas |
| brand.500 (teal #4FC4C4) on neutral.0 (#fff) | Light | ~need verify | LOW — verify | Teal at 500 may fail AA on white; use brand.600+ for text |
| neutral.900 (#18181b) on brand.500 (#4FC4C4) | Light | ~7:1 (D-13) | AAA | Dark text on teal accent (D-13 confirmed) |
| red.700 (#b91c1c) on red.50 (#fef2f2) | Any | ~5.2:1 | AA | Error text on error background |
| yellow.800 (#854d0e) on yellow.50 (#fefce8) | Any | ~5.5:1 | AA | Warning text on warning background |
| green.700 (#15803d) on green.50 (#f0fdf4) | Any | ~5.1:1 | AA | Success text on success background |
| blue.700 (#1d4ed8) on blue.50 (#eff6ff) | Any | ~5.4:1 | AA | Info text on info background |

**Important note:** `brand.500` (teal `#4FC4C4`) has a luminance of approximately 0.45 — it is a mid-tone color and likely fails AA contrast as text on white (target is 4.5:1; mid-tone teal typically achieves ~2.5–3:1 on white). The `text.link` alias using `{color.brand.500}` will FAIL WCAG AA. Use `brand.700` or `brand.800` for text link color on light backgrounds. Confirm with contrast calculator before finalizing.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single SD instance with all tokens | One SD instance per brand × mode | SD v4 (2024) | Correct isolation — no cross-theme token bleed |
| `value` key in token JSON | `$value` (DTCG) | SD v4 + DTCG draft | Already using `$value` from Phase 2 |
| Single `tokens.css` for all themes | 4 separate CSS files per brand/mode | Multi-brand requirement | Consumers import specific brand file, switch via `data-theme` attribute |

**Current approach (already in use):** `include` vs `source` distinction is the SD v4 standard for "load but don't output" primitives. This is the correct pattern.

---

## Open Questions

1. **Does `color.brand.500` (teal `#4FC4C4`) pass WCAG AA as link/action text on white backgrounds?**
   - What we know: D-13 confirms `neutral.900` on `brand.500` passes AAA (dark text on teal background). That's the inverse of text link.
   - What's unclear: `brand.500` as foreground text on `neutral.0` (white background) — teal at mid-luminance likely fails 4.5:1.
   - Recommendation: During token authoring, compute the ratio. If it fails, `text.link` and `action.default` foreground tokens should alias `brand.700` or `brand.800` instead of `brand.500` for light mode. Use `brand.400` or `brand.300` for dark mode (lighter = higher contrast on dark surfaces).

2. **Child-brand near-black as action color — viable?**
   - What we know: D-04 says `child-brand` primary = `#1C1C28`. D-03 frames these as "color roles within one brand identity."
   - What's unclear: A near-black primary is semantically unusual for interactive elements on a light background — it reads as neutral/content rather than interactive.
   - Recommendation: Use `color.slate.500` (`#1C1C28`) for text/icon/border semantic roles. Use `color.secondary.500` (`#1B3A6B`, the deep navy) as the action/interactive color role for child-brand, which provides clearer affordance.

3. **Teal primitive scale — will steps 700–950 provide adequate dark surface depth?**
   - What we know: D-10 requires "more noticeable contrast between depth levels" than Vercel's subtle approach. The existing brand scale is a placeholder.
   - What's unclear: Whether a teal palette at very dark steps (800–950) has enough perceptual differentiation between steps to serve as surface depth.
   - Recommendation: After updating the brand primitive scale, spot-check steps 700/800/900/950 in the browser. If depth is insufficient, use neutral dark steps with a teal hue rotation (HSL adjustment) rather than a pure teal scale.

4. **GitHub remote setup timing — does it block JSON authoring?**
   - What we know: D-17 says GitHub remote is a blocker for phase execution. The blocker is for the Figma pipeline step, not the JSON authoring step.
   - What's unclear: Whether the plan should be structured so JSON authoring and SD loop refactoring happen first (no GitHub needed), then Figma pipeline happens in a second wave once GitHub is set up.
   - Recommendation: Yes — structure Phase 3 in two waves: Wave 1 = primitive updates + semantic JSON authoring + SD multi-instance loop + package exports update (no GitHub needed). Wave 2 = GitHub remote setup + Tokens Studio Pro configuration + push to Figma. This unblocks most of the coding work immediately.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test framework installed |
| Config file | None — see Wave 0 |
| Quick run command | `turbo run build:tokens` (build validation as smoke test) |
| Full suite command | `turbo run build` (full build including tsup) |

No JavaScript test framework (Jest, Vitest) is configured in this project. Token correctness is validated by the Style Dictionary build succeeding (no unresolved references, no collision warnings) and inspecting the CSS output.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOKEN-06 | Semantic light mode tokens build without errors and produce CSS variables | smoke | `turbo run build:tokens 2>&1 \| grep -c "error"` — expect 0 | ❌ Wave 0: no test file, build script validates |
| TOKEN-07 | Semantic dark mode tokens build without errors | smoke | same | ❌ Wave 0 |
| TOKEN-08 | 4 CSS files exist after build: `dist/parent-brand/light.css`, `dist/parent-brand/dark.css`, `dist/child-brand/light.css`, `dist/child-brand/dark.css` | smoke | `ls packages/tokens/dist/parent-brand/ packages/tokens/dist/child-brand/` | ❌ Wave 0 |
| TOKEN-10 | SD multi-instance loop runs all 4 combinations | smoke | `turbo run build:tokens` exits 0 | ❌ Wave 0 |
| FIGMA-01 | Figma Variables `Semantic` collection has 4 modes | manual | None — Figma UI verification | manual-only: requires Figma access |
| FIGMA-02 | Slash notation in Figma translates to dot notation in JSON | manual | Inspect exported JSON after Tokens Studio sync | manual-only |
| FIGMA-03 | Tokens Studio Pro sync is configured; JSON round-trips to Figma | manual | Tokens Studio Pro "Push" action succeeds | manual-only: requires GitHub remote |

### Sampling Rate

- **Per task commit:** `cd packages/tokens && node style-dictionary.config.mjs` (SD build only — fast)
- **Per wave merge:** `turbo run build` (full pipeline: SD + tsup)
- **Phase gate:** `turbo run build` green + manual Figma verification before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] No test framework needed — SD build output is the validation artifact
- [ ] Smoke-check script: after SD build, `ls dist/parent-brand/light.css dist/parent-brand/dark.css dist/child-brand/light.css dist/child-brand/dark.css` — all 4 must exist
- [ ] Spot-check CSS output for expected variables: `grep "color-background-default" dist/parent-brand/light.css` must return a line

No test framework installation required. All TOKEN-* requirements validate via build artifact existence and content inspection.

---

## Sources

### Primary (HIGH confidence)

- Project FIGMA.md — Tokens Studio Pro sync mechanics, Figma Variable Collection/Mode structure, slash-to-dot naming convention
- Project TOKENS.md — SD v4 multi-theme/multi-brand loop pattern (lines 288–374), `include` vs `source` pattern, DTCG semantic token file structures
- Phase 02 SUMMARY.md (01 + 02) — Exact SD config that Phase 3 extends; verified primitive token names and file paths
- Phase 02 VERIFICATION.md — Confirmed output paths, export map entries, CSS variable naming
- `packages/tokens/style-dictionary.config.mjs` — Existing SD config (source for extension)
- `packages/tokens/tokens/primitives/color.tokens.json` — Exact primitive token paths for alias targets
- `packages/tokens/tokens/primitives/spacing.tokens.json` — Spacing steps for semantic space token aliases
- [Style Dictionary multi-brand-multi-platform example](https://github.com/amzn/style-dictionary/tree/master/examples/advanced/multi-brand-multi-platform) — Confirmed nested loop `getStyleDictionaryConfig(brand, platform)` pattern

### Secondary (MEDIUM confidence)

- [Tokens Studio GitHub sync docs](https://docs.tokens.studio/token-storage/remote/sync-git-github) — Required fields (PAT, owner/repo, branch, folder path), folder vs single-file storage
- [Tokens Studio Variables overview](https://docs.tokens.studio/figma/variables-overview) — "Export to Figma from Themes (pro)" creates single collection with multiple modes; Theme Switcher disabled after variable attachment
- [sd-transforms README theming section](https://github.com/tokens-studio/sd-transforms) — `$themes.json` format: array of `{name, group, selectedTokenSets}` objects; token set status values `"source"/"enabled"/"disabled"`
- [Style Dictionary v4 buildAllPlatforms async](https://styledictionary.com/reference/api/) — Confirmed async Promise-based API; `cleanAllPlatforms` uses `cleanPlatform` per-platform

### Tertiary (LOW confidence, flag for validation)

- WCAG contrast ratios in reference table above — calculated from known hex values; verify with browser DevTools or https://webaim.org/resources/contrastchecker/ before finalizing token values
- `$themes.json` exact key names (`selectedTokenSets` status values) — sourced from sd-transforms README; verify format before using

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; existing SD v4 + sd-transforms pattern
- Architecture (SD multi-instance loop): HIGH — official example confirms nested loop + `include`/`source` pattern
- Tokens Studio Pro git sync: MEDIUM — docs confirm folder storage and themes export; exact $themes.json verified via sd-transforms README
- Figma Variable Collection/Mode mapping: MEDIUM — Tokens Studio docs confirm theme group → collection, theme name → mode; Theme Switcher behavior confirmed
- WCAG contrast ratios: LOW — table is approximate; must verify with actual hex values once brand primitive scale is finalized
- Pitfalls: HIGH — most pitfalls confirmed from Phase 2 experience or official docs

**Research date:** 2026-03-22
**Valid until:** 2026-06-22 (90 days — SD v4 and Tokens Studio Pro are stable; re-verify if either releases a major version)
