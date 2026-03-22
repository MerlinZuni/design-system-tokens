# Figma Ecosystem Research: Design System X

**Project:** Design System X
**Researched:** 2026-03-22
**Scope:** Figma Variables, Tokens Studio Pro, Code Connect, Storybook addon-designs, naming conventions
**Knowledge cutoff:** August 2025
**Web access:** Unavailable — all findings from training data. Confidence noted per section.
**Overall confidence:** MEDIUM (core mechanics HIGH; specific version details MEDIUM; some edge-case behaviors LOW)

---

## 1. Figma Variables

### Confidence: HIGH (core system), MEDIUM (edge behaviors)

Figma Variables launched in mid-2023 and are now the canonical way to manage design tokens inside Figma. They replace legacy Styles for color, number, and string values — though Styles still exist for gradients, shadows, and text styles that Variables cannot yet fully represent.

### Core Concepts

**Variable Types**

| Type | Stores | Token Use |
|------|--------|-----------|
| `COLOR` | Solid RGBA color | Color primitives, semantic colors |
| `FLOAT` | Numeric value | Spacing, radii, font sizes, line heights |
| `STRING` | Text | Font family, font weight, breakpoint labels |
| `BOOLEAN` | True/false | Feature flags, show/hide states |

**Collections**

A Collection is a named container for a set of variables. Each Collection defines its own set of Modes. Collections are the correct structural unit for separating token tiers.

Recommended collection structure for a 3-tier system:

```
Collection: "Primitive"    → raw values (hex colors, px numbers)
Collection: "Semantic"     → references to Primitives with intent names
Collection: "Component"    → references to Semantic with component-scoped names
```

Each collection is independent. A variable in one collection can alias a variable from another collection — this is how the tier chain works.

**Groups**

Groups are formed by using slash (`/`) as a separator in variable names:

```
color/blue/500        → group: color/blue,  name: 500
color/blue/600        → group: color/blue,  name: 600
spacing/base          → group: spacing,     name: base
```

Figma renders groups as folders in the Variables panel. Groups are purely cosmetic/organizational — there is no programmatic difference between a grouped and an ungrouped variable. The full path (`color/blue/500`) is the variable's canonical name.

**Modes**

A Mode is a named variant of a Collection. All variables in a collection have one value per mode. Modes power theming.

Examples:
- `Primitive` collection: no modes needed (raw values don't theme)
- `Semantic` collection: modes = `light`, `dark`
- `Brand` collection: modes = `brand-a`, `brand-b`

A frame in Figma can be assigned a specific mode, causing all variable references within it to resolve to that mode's values. This is how design-time light/dark preview works.

**Limitations on Modes**

| Figma Plan | Max Modes per Collection |
|------------|--------------------------|
| Starter (Free) | 1 (no real theming) |
| Professional | 4 |
| Organization / Enterprise | 40 |

This is a critical constraint. Multi-brand + light/dark = minimum 2 modes in Semantic (light, dark) and possibly separate Brand collections. A Professional plan is the minimum viable plan for this project.

### Mapping to Token Tiers

```
Figma Collection: "Primitive"
  Mode: (none — single mode)
  Variables:
    color/blue/50   → #EFF6FF
    color/blue/500  → #3B82F6
    color/blue/900  → #1E3A8A
    spacing/1       → 4
    spacing/2       → 8
    spacing/4       → 16
    radius/sm       → 4
    radius/md       → 8
    font/family/sans → "Inter, sans-serif"

Figma Collection: "Semantic"
  Mode: "light"
    color/background/primary   → alias: Primitive/color/blue/50
    color/text/primary         → alias: Primitive/color/blue/900
    color/action/default       → alias: Primitive/color/blue/500
    spacing/component/gap      → alias: Primitive/spacing/2
  Mode: "dark"
    color/background/primary   → alias: Primitive/color/blue/900
    color/text/primary         → alias: Primitive/color/blue/50
    color/action/default       → alias: Primitive/color/blue/400

Figma Collection: "Component"
  Mode: (inherits from Semantic via aliases)
  Variables:
    button/background/default  → alias: Semantic/color/action/default
    button/text/default        → alias: Semantic/color/text/primary
    button/spacing/padding-x   → alias: Semantic/spacing/component/gap
```

### Variable Aliasing Rules

- A variable can only alias a variable of the same type (COLOR → COLOR, FLOAT → FLOAT)
- Aliases resolve at the collection level first, then across collections
- Circular aliases are blocked by Figma but not always with a clear error
- A FLOAT variable cannot alias a COLOR — mismatched types silently fail or show as errors in the panel

### Scoping

Variables have a scope property that restricts where they can be applied:

| Scope | Meaning |
|-------|---------|
| All scopes | Usable everywhere |
| Fill color | Only paint fills |
| Stroke color | Only strokes |
| Corner radius | Only border-radius |
| Width/Height | Only dimension fields |
| Gap | Only auto layout gap |
| Padding | Only auto layout padding |
| Font size | Only typography |
| Line height | Only typography |

**Recommendation:** Set scopes deliberately on Semantic and Component tokens. Primitive tokens can remain "All scopes" since they're raw values rarely applied directly.

### Gotchas

1. **No gradient support.** Variables only store solid `COLOR`. Gradient styles must remain as Figma Styles.
2. **No typography composite support.** You cannot store a full font style (family + size + weight + line-height) as a single Variable. Each property is a separate FLOAT or STRING variable. This is a significant divergence from W3C DTCG `typography` composite tokens.
3. **Shadow/blur not supported.** Elevation tokens that represent `box-shadow` must be Figma Styles, not Variables.
4. **Boolean variables are Figma-only.** They drive "show layer" conditions in components but have no meaningful code-side equivalent. Don't try to export them as tokens.
5. **Mode switching is per-frame only.** You cannot apply a mode to an individual component instance — only to a wrapping frame. This affects how you set up demo frames in your Figma file.
6. **String variables have no Tokens Studio support for font composites.** Each property must be mapped individually when exporting.
7. **Variable names are mutable.** Renaming a variable breaks all existing aliases to it unless Figma's rename-with-aliases option is used. Establish naming convention before mass-aliasing.

---

## 2. Tokens Studio Pro

### Confidence: MEDIUM-HIGH (core workflow well-documented), MEDIUM (exact API behavior)

Tokens Studio (formerly Figma Tokens) is a Figma plugin that bridges Figma Variables and design token JSON files. The Pro tier adds Figma Variables sync, multi-file support, and direct Git integration.

### What It Does

```
Figma Variables  ←→  Tokens Studio Plugin  ←→  Token JSON files (W3C DTCG)
                                                       ↓
                                               Git Repository
                                                       ↓
                                              Style Dictionary
                                                       ↓
                                        CSS custom properties / TypeScript
```

### W3C DTCG Token Format

The W3C Design Tokens Community Group (DTCG) specification defines a JSON schema for design tokens. Tokens Studio Pro exports to this format. Style Dictionary v4 consumes it natively.

**DTCG JSON structure:**

```json
{
  "color": {
    "blue": {
      "500": {
        "$type": "color",
        "$value": "#3B82F6",
        "$description": "Blue scale step 500"
      }
    },
    "background": {
      "primary": {
        "$type": "color",
        "$value": "{color.blue.500}",
        "$description": "Primary background color"
      }
    }
  },
  "spacing": {
    "2": {
      "$type": "dimension",
      "$value": "8px"
    }
  }
}
```

Key DTCG rules:
- All keys starting with `$` are reserved metadata (`$type`, `$value`, `$description`, `$extensions`)
- References use `{dot.separated.path}` syntax — this is how Tokens Studio maps Figma alias relationships
- `$type` at a parent group level applies to all children (inheritance)
- Composite types (`typography`, `shadow`, `gradient`, `transition`) group multiple properties under one token — Figma Variables cannot represent these directly

**DTCG composite token example (typography):**
```json
{
  "typography": {
    "heading": {
      "h1": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{font.family.sans}",
          "fontSize": "{font.size.4xl}",
          "fontWeight": "{font.weight.bold}",
          "lineHeight": "{font.lineHeight.tight}"
        }
      }
    }
  }
}
```
This composite type has no direct Figma Variables equivalent — it must be authored in Tokens Studio directly or assembled manually.

### Figma Variables Sync Workflow

**Initial Setup**

1. Install Tokens Studio Pro plugin in Figma (paid subscription required)
2. Open plugin → Settings → Enable "Figma Variables sync"
3. Configure sync direction: bidirectional or one-way
4. Connect to Git storage (GitHub, GitLab, Azure DevOps) or use local JSON file export

**Sync from Figma Variables to JSON (export)**

```
Plugin → "Push to repository" or "Export tokens"
  → Reads all Collections and their variables
  → Maps slash-separated variable names to dot-separated JSON paths
  → Writes one JSON file per Collection (or merged, depending on settings)
  → Reference: color/blue/500 (Figma) → color.blue.500 (JSON key path)
  → Alias: Semantic variable aliasing Primitive → becomes {color.blue.500} in JSON
```

**Sync from JSON to Figma Variables (import)**

```
Plugin → "Pull from repository" or "Import tokens"
  → Reads JSON files
  → Creates Collections if they don't exist
  → Creates/updates Variables in each Collection
  → Resolves {references} back into Figma aliases
  → Preserves mode structure if JSON uses $extensions.mode
```

**Multi-file structure for this project:**

```
tokens/
  primitive.json     → maps to "Primitive" Collection
  semantic.json      → maps to "Semantic" Collection (with mode-split or $mode extension)
  component.json     → maps to "Component" Collection
```

With multi-mode tokens, the file structure options are:

Option A — Mode-per-file (simpler):
```
tokens/
  semantic.light.json
  semantic.dark.json
```

Option B — Single file with `$extensions.mode` (DTCG extension):
```json
{
  "$extensions": {
    "mode": "light"
  },
  "color": { ... }
}
```

Tokens Studio Pro handles both. Mode-per-file is easier to git diff. Single-file-per-mode is the recommended approach when using Git sync.

### Git Integration Setup

1. Plugin → Settings → Storage → GitHub
2. Provide: repo URL, branch, file path, Personal Access Token (PAT)
3. Tokens Studio reads/writes directly to the repo on push/pull
4. Use a dedicated `tokens/` directory in the repo

**Branch strategy:** Tokens Studio Pro does not manage branches. Always work in a tokens-specific branch or establish a convention (e.g. `tokens/update-color-scale`). Merges happen in GitHub as PRs.

### Limitations and Gotchas

1. **Figma Variables sync is Pro-only.** The free Tokens Studio plugin exports Styles but not Variables. Confirm team has Pro subscriptions.

2. **Bidirectional sync conflicts.** If a designer edits variables in Figma directly AND someone edits the JSON in code, conflicts arise on next sync. Establish a canonical direction: Figma is source of truth, JSON is derived. Never edit exported JSON manually.

3. **No composite variable support in Figma.** `typography`, `shadow`, `gradient` composite tokens can be authored in Tokens Studio but cannot round-trip through Figma Variables. They live in Tokens Studio only, not in Figma Variables panel.

4. **Mode mapping requires naming discipline.** Mode names in Tokens Studio must match what Figma Collections have configured. A mismatch means modes are created as duplicates.

5. **Variable scope is not preserved.** Tokens Studio exports `$value` and `$type` but does not export Figma's variable scope metadata (`Fill color`, `Corner radius`, etc.). Scopes must be set manually in Figma after import.

6. **Boolean variables are exported as STRING.** Figma BOOLEAN variables become `"true"` or `"false"` string values in JSON. They have no DTCG type. Treat them as internal-Figma-only and exclude them from token exports.

7. **FLOAT without units.** Figma stores FLOAT as a unit-less number (e.g. `8`). DTCG `dimension` requires a unit (e.g. `"8px"`). Tokens Studio applies a configurable unit suffix on export — confirm this is set to `px` for this project.

8. **Token Studio version pinning.** The plugin updates automatically in Figma. Breaking changes between plugin versions have occurred. Pin the JSON format version in plugin settings and document which plugin version was used when the project is initialized.

9. **Large variable sets are slow.** Collections with 500+ variables cause noticeable sync lag. Keep Primitive collections lean — define the scale steps you actually use, not every possible value.

10. **DELETE operations are not synced.** If a variable is removed from JSON and then pulled into Figma, Tokens Studio does not delete the corresponding Figma Variable. Deletions must be done manually in Figma. This is a known workflow gap.

### Tokens Studio Pro vs Free Comparison

| Feature | Free | Pro |
|---------|------|-----|
| Figma Variables sync | No | Yes |
| Git storage | No | Yes |
| Multi-file token sets | Limited | Yes |
| DTCG export format | Partial | Full |
| Multi-mode export | No | Yes |
| Priority support | No | Yes |

---

## 3. Figma Code Connect

### Confidence: MEDIUM (feature launched 2024, actively evolving)

Figma Code Connect is a tool that lets you annotate Figma components with the actual code (React, etc.) used to render them. In Figma Dev Mode, developers see real code snippets — not generated boilerplate — when they inspect a component.

### What It Solves

Without Code Connect, Figma Dev Mode shows auto-generated pseudocode that developers cannot copy and use. Code Connect replaces this with your actual import statement, component call, and prop mapping.

### Architecture

```
Figma Component (in Figma file)
        ↓ linked via nodeId
Code Connect file (*.figma.tsx)
        ↓ references
Actual React component (Button.tsx)
        ↓ published via CLI
Figma Dev Mode
```

### Installation

```bash
npm install --save-dev @figma/code-connect

# Or with npx (no install required for one-time publish)
npx @figma/code-connect
```

### Authentication

```bash
npx figma connect auth
# Follow prompt to generate and paste a Figma Personal Access Token
# Scope required: "File content" read access
```

The token is stored in `~/.figma/credentials` — not in the repo. Never commit Figma PATs.

### Creating a Code Connect File

For a `Button` component with Figma node ID `1:234`:

```tsx
// Button.figma.tsx
import figma from "@figma/code-connect";
import { Button } from "./Button"; // your actual component

figma.connect(Button, "https://www.figma.com/file/FILEID?node-id=1:234", {
  props: {
    // Map Figma component properties to React props
    label: figma.string("Label"),
    variant: figma.enum("Variant", {
      Primary: "primary",
      Secondary: "secondary",
      Destructive: "destructive",
    }),
    disabled: figma.boolean("Disabled"),
    iconStart: figma.boolean("Icon Start", {
      true: <Icon name="arrow-left" />,
      false: undefined,
    }),
  },
  example: ({ label, variant, disabled, iconStart }) => (
    <Button variant={variant} disabled={disabled} iconStart={iconStart}>
      {label}
    </Button>
  ),
});
```

### Figma Property Mapping Functions

| Figma Property Type | Code Connect Function | Notes |
|---------------------|----------------------|-------|
| Text | `figma.string("PropName")` | Maps text layer or component prop |
| Boolean | `figma.boolean("PropName")` | Maps to boolean prop |
| Variant / Enum | `figma.enum("PropName", {})` | Key = Figma value, Value = code value |
| Instance swap | `figma.instance("PropName")` | Maps nested component instances |
| Nested children | `figma.children(["Layer Name"])` | Maps to children or named slots |

### Publishing Code Connect

```bash
# Dry run — shows what would be published without writing to Figma
npx figma connect publish --dry-run

# Publish to Figma (writes to the Figma file)
npx figma connect publish

# Unpublish all connections for a file
npx figma connect unpublish
```

Publishing requires write access to the Figma file. In CI, use a service account token.

### Recommended File Structure

```
src/
  components/
    Button/
      Button.tsx              ← actual component
      Button.stories.tsx      ← Storybook story
      Button.figma.tsx        ← Code Connect file
      Button.test.tsx         ← tests
```

Keep `.figma.tsx` files colocated with the component. They are developer-only files — end users of the design system never see them.

### Getting the Figma Node ID

1. Open Figma file in browser
2. Right-click the component in the canvas → "Copy link to selection"
3. URL format: `https://www.figma.com/file/FILEID/filename?node-id=1-234`
4. Note: URL uses `-` separator (e.g. `1-234`) but Code Connect accepts both `1-234` and `1:234`

Alternatively:
```bash
npx figma connect create --fileUrl "https://www.figma.com/file/FILEID"
# Interactive: lists components in the file and generates stub .figma.tsx files
```

### Version Requirements

- `@figma/code-connect` requires Node.js 16+
- React JSX must be configured (tsconfig with `"jsx": "react-jsx"` or `"react"`)
- TypeScript: full TS support with type-checked `.figma.tsx` files

### Gotchas

1. **Code Connect is not real-time.** You must re-run `publish` after any change to `.figma.tsx` files. This is a manual step — add to your release process.

2. **File-level linking only.** Code Connect links to a specific Figma file. If components move between files, links break. Keep all design system components in one Figma file.

3. **Node IDs change on copy-paste.** If a component is duplicated in Figma (not the master component, but a copy), its node ID changes. Always link to the master component in the library file.

4. **`figma.instance()` is shallow.** Nested component mapping is one level deep by default. Deep component trees require explicit nesting in the example function.

5. **No auto-update on Figma side.** Figma does not notify Code Connect files when component properties change. Adding a new Figma prop requires manually updating the `.figma.tsx` file and re-publishing.

6. **Service account requirement for CI.** Personal tokens expire. For automated publish in CI (GitHub Actions), create a dedicated Figma service account. Store token in GitHub Secrets as `FIGMA_ACCESS_TOKEN`.

7. **Enum value casing must match exactly.** Figma enum property values are case-sensitive. `"Primary"` and `"primary"` are different values. Match Figma's exact casing in the mapping object keys.

8. **Code Connect is Dev Mode only.** It has no effect in Figma View mode or for non-Dev-mode-licensed users. Confirm your team's Figma plan includes Dev Mode.

---

## 4. `@storybook/addon-designs`

### Confidence: HIGH (stable, widely used), MEDIUM (exact current version)

`@storybook/addon-designs` embeds Figma frames, prototypes, and other design artifacts directly inside Storybook stories. Developers can reference the Figma design without leaving Storybook.

### What It Provides

- A "Design" tab in the Storybook addon panel (next to Controls, Actions, etc.)
- Embeds Figma frames via Figma Embed API (iframe)
- Supports: Figma files, Figma prototypes, URLs, images
- Works per-story or as a global default

### Installation

```bash
npm install --save-dev @storybook/addon-designs
```

Register in `.storybook/main.ts`:

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-designs",  // add this
  ],
  // ...
};

export default config;
```

### Usage in Stories

**Per-story (recommended for component stories):**

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/FILEID/filename?node-id=1-234",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary", children: "Click me" },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/FILEID/filename?node-id=1-234&mode=design",
    },
  },
};
```

**Global default (applied to all stories):**

```typescript
// .storybook/preview.ts
export const parameters = {
  design: {
    type: "figma",
    url: "https://www.figma.com/file/FILEID/filename",
  },
};
```

**Multiple designs per story:**

```typescript
parameters: {
  design: [
    {
      name: "Light mode",
      type: "figma",
      url: "https://www.figma.com/file/FILEID?node-id=1-234",
    },
    {
      name: "Dark mode",
      type: "figma",
      url: "https://www.figma.com/file/FILEID?node-id=1-235",
    },
  ],
},
```

### Supported Design Types

| `type` value | Renders |
|-------------|---------|
| `"figma"` | Figma file viewer (read-only embed) |
| `"figmaPrototype"` | Interactive Figma prototype |
| `"link"` | External URL in iframe |
| `"image"` | Static image URL |

### Getting the Figma Embed URL

1. In Figma: select the frame → right-click → "Copy link to selection"
2. Use the URL directly — the addon handles the embed API integration
3. For the Design tab to show the correct component frame, the URL must include `node-id`

Best practice: point to the master component frame, not an instance. That way the link is stable across Figma edits.

### Version Compatibility Matrix

| Storybook Version | Addon Version | Notes |
|-------------------|---------------|-------|
| 7.x | `@storybook/addon-designs@7.x` | Stable, widely deployed |
| 8.x | `@storybook/addon-designs@8.x` | Current, use this for new projects |
| 6.x | `@storybook/addon-designs@6.x` | Legacy, don't use for new projects |

**Check the major version matches your Storybook major version.** Mismatched major versions cause the addon panel tab to not appear.

### Authentication: The Embed Limitation

Figma embeds require the viewer to be logged into Figma in their browser. If the viewer is not logged in, the embed shows a login prompt. This is a Figma embed API constraint — there is no workaround. Document this for your team.

For internal teams, this is generally acceptable. For public documentation sites, consider using screenshots/images as `type: "image"` instead.

### Gotchas

1. **Figma URL must be accessible to the viewer.** Private Figma files require the viewer to have access. Share the Figma file with "Anyone with the link can view" for Storybook consumers outside the organization.

2. **Node ID format in URLs.** Figma URLs use `node-id=1-234` (hyphen). Some older integrations use `node-id=1:234` (colon). The addon handles both, but prefer the hyphen format from direct Figma link copying.

3. **Responsive iframe.** The Figma embed is a fixed-size iframe. It does not resize to match the component's rendered size. This is a cosmetic limitation — the embed is for reference, not pixel comparison.

4. **No live sync.** The embed shows whatever Figma file currently contains. If the design changes, the Storybook viewer automatically sees the updated design (because it's a live embed, not a screenshot). This is a feature, not a bug — but it means "as-built" Figma and Storybook can diverge without a visual indicator.

5. **Prototype type requires separate prototype URL.** Figma prototype links have a different URL format (`/proto/` instead of `/file/`). Don't mix up file and prototype URLs.

---

## 5. Naming Conventions: Figma Slash vs Code Dot

### Confidence: HIGH

This is the most operationally important convention in the project because it affects every file, every variable name, and every token reference across Figma, JSON, and code.

### The Core Translation

| Context | Separator | Example |
|---------|-----------|---------|
| Figma Variables panel | `/` (slash) | `color/background/primary` |
| W3C DTCG JSON keys | `.` (dot) via nesting | `{"color":{"background":{"primary":{...}}}}` |
| DTCG references | `.` (dot) | `{color.background.primary}` |
| CSS custom properties | `-` (hyphen) | `--color-background-primary` |
| TypeScript export | `.` (dot) or `camelCase` | `tokens.color.background.primary` |

### Why Slash in Figma

Figma uses `/` to create folder hierarchy in the Variables panel. There is no other way to organize variables into groups — it is purely a naming convention that Figma parses into a tree. The full variable name including slashes is how Tokens Studio reads and maps it.

```
Figma variable name: "color/background/primary"
                      ↑ This is one string — Figma splits on / for the UI
```

### Why Dot in DTCG JSON

DTCG tokens are nested JSON objects. The path `color.background.primary` maps to:

```json
{
  "color": {
    "background": {
      "primary": {
        "$type": "color",
        "$value": "#ffffff"
      }
    }
  }
}
```

Tokens Studio converts `color/background/primary` (Figma) → `color.background.primary` (JSON path) automatically. This is the core translation the plugin performs.

### Naming Convention for This Project

This project uses `category.property.modifier`. Applied consistently:

```
category   = color, spacing, typography, radius, elevation, grid
property   = background, text, border, action, icon, ...
modifier   = primary, secondary, disabled, hover, focus, ...
```

**Primitive examples:**
```
Figma:  color/blue/50
Figma:  color/blue/500
Figma:  color/blue/900
Figma:  spacing/1            (= 4px)
Figma:  spacing/2            (= 8px)
Figma:  spacing/4            (= 16px)
Figma:  radius/sm
Figma:  radius/md
Figma:  radius/lg
Figma:  font/family/sans
Figma:  font/size/sm
Figma:  font/weight/regular
Figma:  font/weight/bold
```

**Semantic examples:**
```
Figma:  color/background/primary
Figma:  color/background/secondary
Figma:  color/background/inverse
Figma:  color/text/primary
Figma:  color/text/secondary
Figma:  color/text/disabled
Figma:  color/text/inverse
Figma:  color/border/default
Figma:  color/border/focus
Figma:  color/action/default
Figma:  color/action/hover
Figma:  color/action/pressed
Figma:  color/action/disabled
Figma:  spacing/component/gap
Figma:  spacing/component/padding-x
Figma:  spacing/component/padding-y
Figma:  spacing/layout/section
```

**Component examples:**
```
Figma:  button/background/default
Figma:  button/background/hover
Figma:  button/background/pressed
Figma:  button/background/disabled
Figma:  button/text/default
Figma:  button/text/disabled
Figma:  button/border/default
Figma:  button/border/focus
Figma:  button/spacing/padding-x
Figma:  button/spacing/padding-y
Figma:  button/spacing/gap
```

### CSS Output (via Style Dictionary)

Style Dictionary transforms DTCG JSON into CSS custom properties:

```css
/* Primitives */
--color-blue-50: #eff6ff;
--color-blue-500: #3b82f6;
--spacing-1: 4px;
--spacing-2: 8px;
--radius-sm: 4px;

/* Semantic */
--color-background-primary: var(--color-blue-50);
--color-text-primary: var(--color-blue-900);
--color-action-default: var(--color-blue-500);

/* Component */
--button-background-default: var(--color-action-default);
--button-text-default: var(--color-text-primary);
```

### TypeScript Output (via Style Dictionary)

```typescript
// tokens.ts (generated)
export const tokens = {
  color: {
    blue: { 50: "#eff6ff", 500: "#3b82f6", 900: "#1e3a8a" },
    background: { primary: "var(--color-background-primary)" },
    text: { primary: "var(--color-text-primary)" },
  },
  spacing: { 1: "4px", 2: "8px", 4: "16px" },
} as const;
```

### Rules to Enforce

1. **All lowercase.** `color/blue/500` not `Color/Blue/500`. Figma is case-sensitive and mismatches create duplicate groups.
2. **Hyphens for multi-word modifiers.** `padding-x` not `paddingX` or `padding_x`. Consistent with CSS conventions.
3. **No spaces.** Figma permits spaces in names but they produce ugly CSS (`--color-background primary`) and must be escaped.
4. **Numbers for scales.** Use numeric scales for primitives (`spacing/1`, `spacing/2`) that map to a base-4px grid. Use semantic names for semantic tokens (`spacing/component/gap`).
5. **Never abbreviate ambiguously.** `bg` vs `background`: pick one and enforce it. Recommendation: use full words in all tiers. Abbreviations save keystrokes but increase cognitive load for new team members.
6. **Separator is always slash in Figma.** Never use dot or underscore in Figma variable names — Tokens Studio uses slash as the group separator and dots/underscores produce flat (ungrouped) JSON.

---

## 6. End-to-End Workflow

### Complete Token Pipeline

```
1. Author in Figma
   - Create Collections: Primitive, Semantic, Component
   - Name variables using slash notation: color/blue/500
   - Set aliases across collections
   - Configure modes in Semantic collection: light, dark

2. Sync to JSON via Tokens Studio Pro
   - Open Tokens Studio plugin → Push to Git
   - Produces: tokens/primitive.json, tokens/semantic.light.json, tokens/semantic.dark.json
   - Review diff in PR: confirm variable names and alias references look correct

3. Transform via Style Dictionary
   - Style Dictionary reads DTCG JSON
   - Outputs: dist/tokens.css, dist/tokens.ts
   - Run in CI on merge to main

4. Consume in React
   - Import dist/tokens.css in app root
   - Import dist/tokens.ts for TypeScript token references
   - Use CSS custom properties in component styles

5. Document in Storybook
   - Token preview pages show raw values (color swatches, spacing scale, etc.)
   - Component stories use @storybook/addon-designs to embed Figma frame
   - Figma Code Connect links Figma components to code examples in Dev Mode

6. Update cycle
   - Designer edits Figma Variable → pushes via Tokens Studio
   - PR in GitHub with JSON diff → review by developer
   - Merge triggers Style Dictionary → updated dist files
   - Storybook rebuild shows updated tokens
```

### Recommended Figma File Structure

```
Figma File: "Design System X"
├── Page: _Admin (for variable management, not public)
│   └── Frame: Mode previews (light frame, dark frame for visual QA)
├── Page: Primitives
│   └── Color palette swatches
│   └── Spacing scale
│   └── Typography scale
├── Page: Semantic Tokens
│   └── Color usage examples per context
├── Page: Components
│   └── Button (master component)
│   └── ... (other primitives)
└── Page: Playground (scratch space, not source of truth)
```

---

## 7. Version Requirements Summary

| Tool | Minimum Version | Recommended | Notes |
|------|----------------|-------------|-------|
| Figma Plan | Professional | Organization | Professional = 4 modes; Org = 40 modes |
| Tokens Studio | Pro tier | Pro tier | Free tier lacks Variables sync |
| `@figma/code-connect` | Latest | Latest (active dev) | Pin in package.json |
| `@storybook/addon-designs` | 8.x (matches SB 8.x) | 8.x | Must match Storybook major version |
| Node.js | 16+ | 20 LTS | Required by `@figma/code-connect` |
| Storybook | 7.x | 8.x | 8.x for Vite + React + TS |
| Style Dictionary | 4.x | 4.x | v4 = native DTCG support |

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Tokens Studio Pro breaks in Figma update | Medium | High | Pin plugin version; keep manual export backup |
| Figma adds/removes Variable features | Medium | Medium | Monitor Figma changelog; design for current feature set only |
| Code Connect node IDs break on Figma reorganization | High | Medium | Publish Code Connect files early; add to CI to catch broken links |
| Team edits Figma Variables without going through Tokens Studio | High | High | Document sync workflow in CONTRIBUTING.md; make manual edits painful (require PR review of JSON diff) |
| Mode count exceeds plan limit | Low | High | Audit mode count during planning; confirm plan tier before adding brand modes |
| addon-designs embed blocked by Figma login | Medium | Low | Share Figma file as "Anyone with link can view" |
| DTCG spec changes break Style Dictionary output | Low | Medium | Style Dictionary v4 tracks DTCG closely; monitor SD release notes |

---

## 9. Sources and Confidence Notes

**Note:** Web access was unavailable during this research session. All findings are based on training data with knowledge cutoff of August 2025. The following areas should be verified against current documentation before finalizing implementation:

- Tokens Studio Pro: verify current pricing/plan tiers at https://tokens.studio/pricing
- Figma Variables mode limits per plan: verify at https://help.figma.com/hc/en-us/articles/15339657135383
- `@figma/code-connect` current API: verify at https://github.com/figma/code-connect
- `@storybook/addon-designs` current version: verify at https://github.com/storybookjs/addon-designs
- W3C DTCG specification status: verify at https://design-tokens.github.io/community-group/format/

**HIGH confidence findings** (stable, unlikely to have changed):
- Figma slash-group naming convention
- DTCG JSON structure and `$type`/`$value` semantics
- Code Connect basic API (`.connect()`, `figma.string()`, `figma.enum()`, `figma.boolean()`)
- Storybook addon-designs `parameters.design` API
- CSS custom property naming output pattern from Style Dictionary

**MEDIUM confidence findings** (correct as of August 2025, verify before implementing):
- Tokens Studio Pro exact sync behavior for modes
- Code Connect CLI flags (`--dry-run`, exact publish command)
- Storybook 8.x addon compatibility matrix

**LOW confidence findings** (may have changed, must verify):
- Exact Figma plan mode limits (these have changed before)
- Tokens Studio plugin version pinning mechanism
- `@figma/code-connect` `figma.instance()` nesting depth behavior
