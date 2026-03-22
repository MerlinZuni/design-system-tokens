# Phase 4: Storybook Foundation — Research

**Researched:** 2026-03-22
**Domain:** Storybook 10 configuration, MDX docs, CSS token import, sidebar sort
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Storybook is already at 10.3.1 — the ROADMAP reference to "Storybook 8" is stale; the installed version wins
- **D-02:** `@storybook/addon-designs` needs adding to `package.json` and `main.ts` — not yet installed
- **D-03:** `@storybook/addon-essentials` is NOT used — stay with individual addons pattern (`addon-docs`, `addon-a11y`, `@chromatic-com/storybook`)
- **D-04:** `reactDocgen: 'react-docgen-typescript'` is already set in `main.ts` — no change needed
- **D-05:** `preview.ts` imports two files: primitives first, then `parent-brand/light` as the default semantic layer
  ```ts
  import '@design-system-x/tokens/css'
  import '@design-system-x/tokens/parent-brand/light'
  ```
- **D-06:** All 4 semantic CSS files are NOT imported simultaneously — `parent-brand/light.css` and `child-brand/light.css` both use `:root` as selector; loading both causes silent last-import-wins collision
- **D-07:** Brand×mode switching is deferred to Phase 5 — Phase 5 will update the SD config to use brand-scoped selectors AND add the Storybook toolbar switcher at the same time
- **D-08:** A global decorator in `preview.ts` wraps all story canvases with:
  - `background: var(--dsx-color-background-default)` — uses the imported semantic token
  - `padding: 2rem` — standard breathing room
- **D-09:** Decorator applies to `.stories.*` files only — MDX pages are unaffected by decorators by Storybook design
- **D-10:** `storySort` order: `Introduction → Design Purpose → Design Principles → Tokens → Styles → Primitives`
- **D-11:** Design Purpose page: placeholder format — neutral generic text that reads as a finished sentence (not brackets)
- **D-12:** Structure: one-paragraph purpose statement — *who it serves + what it enables + the deeper why*
- **D-13:** Reference text: "This design system gives product teams a consistent, accessible foundation — so they spend less time on solved problems and more time on the decisions that actually matter."
- **D-14:** Design Principles: capitalized short phrase + one-sentence definition that guides an actual decision
- **D-15:** 5 specific principles (Token-first, Accessible by default, Figma-authoritative, Documented not assumed, Composable)
- **D-16:** Both MDX pages explicitly note they are placeholders — include a comment or callout directing future consumers to replace the content
- **D-17:** Two Figma pages required: "Design Purpose" and "Design Principles"
- **D-18:** Figma page creation is a human action — plan should include it as a manual checkpoint step

### Claude's Discretion

- MDX page visual styling (use of Storybook `<Meta>`, callout blocks, typographic hierarchy within MDX)
- Whether to use `<Unstyled>` wrapper or standard MDX layout for the intro pages
- Exact wording of the placeholder callout directing consumers to replace content

### Deferred Ideas (OUT OF SCOPE)

- Brand×mode theme switcher toolbar — Phase 5
- Token preview pages (Color, Typography, Spacing, Elevation, Grid) — Phase 5
- Component stories — Phase 6
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORY-01 | Storybook configured with `@storybook/react-vite` builder and `reactDocgen: "react-docgen-typescript"` | D-01/D-04: already installed + configured; research confirms no changes needed to framework/docgen setup |
| STORY-02 | CSS custom property output from Style Dictionary imported in `.storybook/preview.ts` | D-05: two-file import pattern verified; exports map in `packages/tokens/package.json` confirms `./css` and `./parent-brand/light` paths resolve |
| STORY-03 | Sidebar sort order: Introduction → Design Purpose → Design Principles → Tokens → Styles → Primitives | D-10: storySort array pattern confirmed; nested array syntax documented in Architecture Patterns |
| STORY-13 | Design Purpose MDX page — clearly stated product reason | D-11–D-13: content and format locked; MDX unattached page pattern documented |
| STORY-14 | Design Principles MDX page — Word + definition format | D-14–D-16: 5 principles locked; content and format documented |
| FIGMA-06 | Figma file has dedicated pages for Design Purpose and Design Principles | D-17/D-18: human action (manual checkpoint); mirrors Storybook MDX content |
</phase_requirements>

---

## Summary

Phase 4 is a pure configuration and content phase — no new library infrastructure, no new build steps. Storybook 10.3.1 is already installed and running at `apps/storybook/`. All token CSS files are already built at `packages/tokens/dist/`. The three code changes are: (1) add `@storybook/addon-designs` to `main.ts` addons array, (2) extend `preview.ts` with CSS imports, a global decorator, and `storySort`, and (3) create three MDX files in `apps/storybook/stories/`.

The only installation required is `@storybook/addon-designs@^11.0.0`. The package's version 11.x line targets Storybook `^10.0.0` — peer dependency confirmed. It must be installed at the **root** `devDependencies`, not inside `apps/storybook/`, because all `@storybook/*` packages are hoisted to root `node_modules` per the pattern established in Phase 1. The current `apps/storybook/package.json` should receive the entry, but the physical install goes to the root.

The key technical pitfall is the decorator JSX requirement: because the global decorator uses JSX (`<Story />`), `preview.ts` must be renamed to `preview.tsx` and `import React from 'react'` must be added at the top. Keeping it `.ts` causes a parse error at Storybook startup. The MDX import path for `Meta` is `@storybook/addon-docs/blocks` (not `@storybook/blocks`) — confirmed against Storybook 10 docs. FIGMA-06 is a human checkpoint, not code.

**Primary recommendation:** Rename `preview.ts` → `preview.tsx`, add the two CSS imports and decorator, add storySort, add `@storybook/addon-designs` to `main.ts`, then create the three MDX files. No build pipeline changes needed.

---

## Standard Stack

### Core (already installed)

| Package | Version in use | Purpose | Notes |
|---------|----------------|---------|-------|
| `storybook` | `^10.3.1` | CLI + core | Hoisted to root devDependencies |
| `@storybook/react-vite` | `^10.3.1` | React + Vite builder | Framework in `main.ts` |
| `@storybook/addon-docs` | `^10.3.1` | MDX support, Doc Blocks, Autodocs | Already in `main.ts` addons |
| `@storybook/addon-a11y` | `^10.3.1` | Accessibility checks | Already in `main.ts` addons |
| `@chromatic-com/storybook` | `^5.0.2` | Chromatic visual testing integration | Already in `main.ts` addons |

### To Install (Phase 4 adds one package)

| Package | Version | Purpose | Install Location |
|---------|---------|---------|-----------------|
| `@storybook/addon-designs` | `^11.0.0` | Figma frame embeds in addon panel | Root `devDependencies` (hoisted), entry also in `apps/storybook/package.json` |

**Version note:** `@storybook/addon-designs` latest stable is `11.1.2` (verified via `npm view` on 2026-03-22). The `^11.0.0` range is correct — v11.x peer-depends on `storybook: ^10.0.0`. Do NOT install v8.x or v9.x (those target Storybook 7–9).

**Installation:**
```bash
# Install at root (hoisted to root node_modules, accessible from apps/storybook)
npm install -D @storybook/addon-designs@^11.0.0 -w .
```

Also add the entry manually to `apps/storybook/package.json` devDependencies so the workspace dependency is explicit:
```json
"@storybook/addon-designs": "^11.0.0"
```

### Token CSS inputs (already built)

| File | Selector | Content |
|------|----------|---------|
| `packages/tokens/dist/css/tokens.css` | `:root` | All primitive tokens (`--dsx-color-brand-50`, `--dsx-spacing-*`, etc.) |
| `packages/tokens/dist/parent-brand/light.css` | `:root` | Semantic tokens referencing primitives via `var()` (`--dsx-color-background-default`, etc.) |

Both are reachable via the exports map in `packages/tokens/package.json` as `@design-system-x/tokens/css` and `@design-system-x/tokens/parent-brand/light`.

---

## Architecture Patterns

### Recommended Stories Directory Structure

```
apps/storybook/
├── .storybook/
│   ├── main.ts           # Add @storybook/addon-designs here
│   └── preview.tsx       # Rename from .ts; add imports, decorator, storySort
└── stories/
    ├── Introduction.mdx                    # STORY-01 root page
    └── Introduction/
        ├── DesignPurpose.mdx               # STORY-13
        └── DesignPrinciples.mdx            # STORY-14
```

### Pattern 1: Adding an Addon to main.ts

The project uses `getAbsolutePath()` to resolve addon paths — this is already the pattern in `main.ts`. New addons follow the same pattern:

```typescript
// Source: apps/storybook/.storybook/main.ts (existing pattern)
addons: [
  getAbsolutePath('@storybook/addon-docs'),
  getAbsolutePath('@storybook/addon-a11y'),
  getAbsolutePath('@chromatic-com/storybook'),
  getAbsolutePath('@storybook/addon-designs'),  // add this line
],
```

### Pattern 2: CSS Imports in preview.tsx

CSS side-effect imports go at the top of `preview.tsx`, before the Preview config object. Import order matters: primitives first (`:root` baseline), then semantic layer (`:root` overrides with purpose-named aliases).

```typescript
// Source: D-05 (locked decision) + packages/tokens/package.json exports map
import '@design-system-x/tokens/css'
// Phase 5 will replace this line with a dynamic theme switcher — keep on own line
import '@design-system-x/tokens/parent-brand/light'
```

### Pattern 3: Global Decorator with JSX (requires .tsx extension)

The global decorator uses JSX, which requires renaming `preview.ts` → `preview.tsx`. The decorator must be at the **top level** of the preview config object, not inside `parameters`.

```tsx
// Source: Storybook docs — https://storybook.js.org/docs/writing-stories/decorators
import React from 'react'
import type { Preview } from '@storybook/react'

const preview: Preview = {
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--dsx-color-background-default)', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
  // ...
}
```

**Critical:** Decorators placed inside `parameters` are silently ignored in Storybook 9+. They must be a top-level key.

### Pattern 4: storySort for Nested Sidebar Groups

The `storySort` config object uses nested arrays to define second-level sort order within a group. The top-level array item name must match the title prefix used in MDX `<Meta title="..." />` declarations.

```typescript
// Source: https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy
parameters: {
  options: {
    storySort: {
      order: [
        'Introduction',
        ['Design Purpose', 'Design Principles'],
        'Tokens',
        'Styles',
        'Primitives',
      ],
    },
  },
},
```

This produces sidebar order: Introduction (root) → Introduction/Design Purpose → Introduction/DesignPrinciples → Tokens/* → Styles/* → Primitives/*.

### Pattern 5: Unattached MDX Doc Page

An unattached docs page (not linked to a component story file) uses `<Meta title="..." />` with no `of` prop. The `title` string defines the sidebar placement using slash-separated path notation.

```mdx
import { Meta } from '@storybook/addon-docs/blocks'

<Meta title="Introduction/Design Purpose" />

# Design Purpose
```

**Key facts:**
- Import from `@storybook/addon-docs/blocks` — NOT from `@storybook/blocks` (confirmed against Storybook 10 docs)
- The `title` value in `Meta` must match the path expected by `storySort`
- For the root Introduction page: `<Meta title="Introduction" />`
- For nested pages: `<Meta title="Introduction/Design Purpose" />`

The `stories` glob in `main.ts` must include `.mdx` files. Current config:
```typescript
stories: ['../stories/**/*.stories.@(ts|tsx|mdx)'],
```
This glob only matches files ending in `.stories.mdx` — a standalone `Introduction.mdx` will NOT be picked up. The glob needs updating to also include plain `.mdx` files:
```typescript
stories: [
  '../stories/**/*.mdx',
  '../stories/**/*.stories.@(ts|tsx)',
],
```

### Pattern 6: addon-designs Figma Embed (Phase 6 usage — for awareness)

Phase 4 only installs `@storybook/addon-designs`. The actual Figma embed parameters are added to component stories in Phase 6. Documenting here so the planner knows installation in Phase 4 is the full scope:

```typescript
// Phase 6 usage pattern — not implemented in Phase 4
export const MyStory = {
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/YOUR_FILE_ID',
    },
  },
}
```

### Anti-Patterns to Avoid

- **Importing all 4 semantic CSS files simultaneously:** `child-brand/light.css` and `parent-brand/light.css` both target `:root` — the last import wins, silently overwriting the first. Import only one semantic file at a time (D-06).
- **Putting decorators inside `parameters`:** Top-level `decorators` array is the only honored location in Storybook 9+. `parameters.decorators` is silently ignored.
- **Using `.ts` extension with JSX decorator:** A `.ts` file cannot contain `<Story />` JSX. Parser error at startup. Use `.tsx`.
- **Importing from `@storybook/blocks` instead of `@storybook/addon-docs/blocks`:** These are different entry points; `@storybook/blocks` may not resolve correctly in the monorepo hoist setup.
- **Using `[PLACEHOLDER]` bracket text in MDX pages:** D-11 locks that placeholder text must be neutral finished sentences, not visible scaffolding markers.
- **Installing `@storybook/addon-designs` inside `apps/storybook/`:** All `@storybook/*` packages must be installed at root because storybook CLI (hoisted at root) resolves `storybook/internal/*` from root `node_modules`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Figma frame embeds in addon panel | Custom iframe tab/panel | `@storybook/addon-designs` | Handles Figma auth tokens, responsive iframe sizing, multiple embed types |
| Sidebar ordering | Custom sort function | `storySort.order` array | Built-in; handles nested groups, wildcards, unmatched story fallback |
| CSS loading into Storybook | Custom Vite plugin | Side-effect import in `preview.tsx` | `@storybook/react-vite` handles CSS imports natively via Vite |
| MDX documentation routing | Custom router or manifest | `<Meta title="...">` in MDX files | Storybook derives sidebar placement from the title string automatically |

---

## Common Pitfalls

### Pitfall 1: preview.ts contains JSX but has .ts extension

**What goes wrong:** Storybook startup fails with a parse error like "Unexpected token '<'" when the decorator contains `<Story />` JSX.
**Why it happens:** TypeScript `.ts` files do not support JSX syntax; only `.tsx` files do.
**How to avoid:** Rename `preview.ts` → `preview.tsx` before adding the decorator. Add `import React from 'react'` at the top.
**Warning signs:** Parse error at `storybook dev` startup mentioning the `<` character.

### Pitfall 2: MDX files not found because glob only matches *.stories.mdx

**What goes wrong:** `Introduction.mdx` is not visible in the Storybook sidebar at all.
**Why it happens:** The current `main.ts` glob is `**/*.stories.@(ts|tsx|mdx)` — this requires the filename to end in `.stories.mdx`. A file named `Introduction.mdx` doesn't match.
**How to avoid:** Update the `stories` array in `main.ts` to include a separate `**/*.mdx` pattern.
**Warning signs:** MDX file exists on disk but no sidebar entry appears after `storybook dev` starts.

### Pitfall 3: storySort title prefix mismatch

**What goes wrong:** MDX pages appear at the bottom of the sidebar, after all `*` unmatched items, not in the specified order.
**Why it happens:** The `<Meta title="Introduction/Design Purpose" />` in the MDX file must exactly match the strings in `storySort.order`. Case and spacing differences cause the page to fall outside the sorted set.
**How to avoid:** Define the title strings in `storySort.order` first, then copy them verbatim into each MDX file's `<Meta title="...">` prop.
**Warning signs:** Pages appear sorted to end of sidebar despite being listed in the order array.

### Pitfall 4: @storybook/addon-designs version mismatch

**What goes wrong:** Storybook fails to load or the Designs panel doesn't appear, with peer dependency warning mentioning `storybook: ^10.0.0`.
**Why it happens:** Installing an older version of `@storybook/addon-designs` (e.g., `^8.x` for Storybook 7, or `^9.x` for Storybook 8/9) against Storybook 10.3.1.
**How to avoid:** Install `@storybook/addon-designs@^11.0.0` specifically. v11.x is the first version that targets Storybook 10.
**Warning signs:** npm peer dependency warning during install; "Addon not found" or missing panel in running Storybook.

### Pitfall 5: CSS imports not visible without running turbo build:tokens first

**What goes wrong:** `import '@design-system-x/tokens/css'` throws "module not found" or CSS vars are undefined in DevTools.
**Why it happens:** `packages/tokens/dist/` is gitignored and must be built before Storybook can import from it. The `turbo run dev` task depends on `^build` (upstream package builds) but if tokens were never built, dist is empty.
**How to avoid:** Run `turbo run build` from root before starting `storybook dev` for the first time in a clean checkout. Turborepo caches subsequent builds.
**Warning signs:** Import error on Storybook startup; `packages/tokens/dist/` directory is missing or empty.

### Pitfall 6: Decorators placed inside parameters are silently ignored

**What goes wrong:** The background decorator has no visible effect — stories render on white background.
**Why it happens:** In Storybook 9+, `parameters.decorators` is not honored. Only the top-level `decorators` export key is used.
**How to avoid:** Place the decorators array as a direct property of the `preview` object, not nested under `parameters`.
**Warning signs:** Stories render without the expected background despite decorator code being present.

---

## Code Examples

### Complete preview.tsx (Phase 4 target state)

```tsx
// Source: Storybook 10 docs + D-05, D-08, D-10 locked decisions
import React from 'react'
import type { Preview } from '@storybook/react'

// Primitive tokens (--dsx-color-*, --dsx-spacing-*, etc.) — must import first
import '@design-system-x/tokens/css'
// Default semantic layer — Phase 5 will replace this static import with dynamic switcher
import '@design-system-x/tokens/parent-brand/light'

const preview: Preview = {
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--dsx-color-background-default)', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          ['Design Purpose', 'Design Principles'],
          'Tokens',
          'Styles',
          'Primitives',
        ],
      },
    },
  },
}

export default preview
```

### main.ts addon addition

```typescript
// Source: apps/storybook/.storybook/main.ts (existing file + D-02)
addons: [
  getAbsolutePath('@storybook/addon-docs'),
  getAbsolutePath('@storybook/addon-a11y'),
  getAbsolutePath('@chromatic-com/storybook'),
  getAbsolutePath('@storybook/addon-designs'),
],
```

### Updated stories glob in main.ts

```typescript
// Source: Storybook 10 docs — MDX files must be explicitly included
stories: [
  '../stories/**/*.mdx',
  '../stories/**/*.stories.@(ts|tsx)',
],
```

### Introduction.mdx (root page)

```mdx
import { Meta } from '@storybook/addon-docs/blocks'

<Meta title="Introduction" />

# Design System X

A token-based design system connecting Figma and React.
Built on a three-tier token architecture — primitives, semantics, and components —
so every visual decision has a single source of truth.

## Getting started

- Browse token references under **Tokens**
- See composed styles under **Styles**
- Explore React primitives under **Primitives**
```

### DesignPurpose.mdx (STORY-13)

```mdx
import { Meta } from '@storybook/addon-docs/blocks'

<Meta title="Introduction/Design Purpose" />

{/* Placeholder — replace this paragraph with your product's actual design purpose statement */}

# Design Purpose

This design system gives product teams a consistent, accessible foundation —
so they spend less time on solved problems and more time on the decisions that actually matter.

It serves the people building digital products: the designers who define the experience
and the engineers who bring it to life. The system exists so both groups speak the same
language, sourced from a single token hierarchy that flows from Figma to code without drift.
```

### DesignPrinciples.mdx (STORY-14)

```mdx
import { Meta } from '@storybook/addon-docs/blocks'

<Meta title="Introduction/Design Principles" />

{/* Placeholder — replace these principles with ones that reflect your team's actual values */}

# Design Principles

## Token-first
Every visual decision starts as a token. Hardcoded values are design debt.

## Accessible by default
WCAG AA is the floor, not the goal. Every text/background pair is verified before shipping.

## Figma-authoritative
Figma Variables are the source of truth. Code is the output, never the source.

## Documented, not assumed
Every pattern has a Storybook story. If it's not demonstrated, it doesn't exist.

## Composable
Primitives compose into semantics, semantics compose into components.
Each tier does one job.
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@storybook/addon-essentials` bundle | Individual addons (`addon-docs`, `addon-a11y`, etc.) | Storybook 8+ recommendation | Smaller bundle, explicit addon list, better tree-shaking |
| `preview.js` | `preview.ts` / `preview.tsx` | Storybook 6.4+ | Full TypeScript types for `Preview` config; `.tsx` required for JSX decorators |
| `addDecorator()` global function | `decorators` array export in preview | Storybook 7 | Declarative; `addDecorator` removed |
| `import { Meta } from '@storybook/blocks'` | `import { Meta } from '@storybook/addon-docs/blocks'` | Storybook 8 reorganization | The correct import path for the installed Storybook 10 setup |
| `@storybook/addon-designs` v8/v9 | v11.x | 2025 (targets Storybook 10) | Must use v11.x for Storybook 10 peer dependency compatibility |

**Deprecated/outdated:**
- `addon-essentials`: Not wrong, but Phase 1 chose individual addons — do not switch (D-03 locked)
- `parameters.decorators`: Silently ignored in Storybook 9+; use top-level `decorators` key only
- `*.stories.mdx` file naming: Works, but mixing with `*.mdx` in a split glob pattern is cleaner for documentation-only pages

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + `@storybook/addon-vitest` 10.3.1 (installed in `apps/storybook/package.json`) |
| Config file | None detected — Wave 0 gap |
| Quick run command | `cd apps/storybook && npx storybook dev -p 6006 --ci` (smoke test) |
| Full suite command | `turbo run build` from root |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| STORY-01 | Storybook starts without errors | smoke | `cd apps/storybook && npx storybook dev -p 6006 --ci 2>&1 \| grep -i error` | ❌ Wave 0 |
| STORY-02 | CSS custom properties visible in built output | shell | `grep -- "--dsx-color-background-default" apps/storybook/storybook-static/index.html 2>/dev/null \|\| grep -r "dsx-color" apps/storybook/storybook-static/ --include="*.css" -l` | ❌ Wave 0 |
| STORY-03 | Sidebar entries exist for all sort groups | smoke/manual | Verify in running Storybook browser | Manual only — no headless API |
| STORY-13 | Design Purpose page renders | shell | `test -f apps/storybook/stories/Introduction/DesignPurpose.mdx && echo "PASS"` | ❌ Wave 0 |
| STORY-14 | Design Principles page renders | shell | `test -f apps/storybook/stories/Introduction/DesignPrinciples.mdx && echo "PASS"` | ❌ Wave 0 |
| FIGMA-06 | Figma file has Design Purpose and Design Principles pages | manual | Human verification only — Figma UI access required | Manual only |

### Sampling Rate

- **Per task commit:** `turbo run build --filter=@design-system-x/storybook`
- **Per wave merge:** `turbo run build` (all packages, confirms token CSS exists before Storybook imports it)
- **Phase gate:** Storybook starts without errors (`storybook dev`) and CSS variables visible in DevTools

### Key Verification Commands

```bash
# 1. Full monorepo build (confirms token CSS builds before Storybook imports)
cd "/Users/merlinzuni/develop/design system tokens" && turbo run build

# 2. Storybook starts without errors
cd "/Users/merlinzuni/develop/design system tokens/apps/storybook" && npx storybook dev -p 6006

# 3. CSS vars present in tokens package dist (pre-condition check)
grep -- "--dsx-color-background-default" "/Users/merlinzuni/develop/design system tokens/packages/tokens/dist/parent-brand/light.css"

# 4. Confirm addon-designs resolves in node_modules
ls "/Users/merlinzuni/develop/design system tokens/node_modules/@storybook/addon-designs" 2>/dev/null && echo "FOUND" || echo "NOT INSTALLED"

# 5. Confirm MDX files exist
ls "/Users/merlinzuni/develop/design system tokens/apps/storybook/stories/Introduction/"

# 6. Storybook build (static output — can grep for CSS var injection)
cd "/Users/merlinzuni/develop/design system tokens/apps/storybook" && npx storybook build
grep -r "dsx-color-background-default" storybook-static/ --include="*.css" -l
```

### Wave 0 Gaps

- [ ] `apps/storybook/vitest.config.ts` — configure Vitest for story-level tests (needed for Phase 6 component testing; can scaffold in Phase 4)
- [ ] No existing test files — Phase 4 is config + content, no unit-testable logic; smoke test via `storybook dev` is the primary gate

*(No unit test gaps — Phase 4 deliverables are config files and MDX content, not testable logic. Smoke test is the correct verification method.)*

---

## Open Questions

1. **stories glob split: does order matter?**
   - What we know: Storybook processes both patterns; MDX-first ordering is a Storybook docs convention
   - What's unclear: Whether putting `**/*.mdx` before `**/*.stories.*` affects autodocs generation
   - Recommendation: Follow the Storybook docs convention (MDX first) — it's the documented pattern and low risk

2. **`<Unstyled>` wrapper for MDX pages?**
   - What we know: By default, MDX pages in Storybook get the docs theme applied (typography, margins, etc. from addon-docs)
   - What's unclear: Whether the project wants intro pages to match the docs theme or use raw styling
   - Recommendation: Use the default docs theme (no `<Unstyled>`) for Phase 4. The pages look polished without additional work. If the team wants custom layout, that is a Phase 5+ concern.

3. **Figma page creation timing**
   - What we know: FIGMA-06 is a human action; plan must include a manual checkpoint
   - What's unclear: Whether the Figma file already has placeholder pages from prior phases
   - Recommendation: Plan should include an explicit manual step: "Create two Figma pages named 'Design Purpose' and 'Design Principles' with text matching the MDX content."

---

## Sources

### Primary (HIGH confidence)
- `apps/storybook/.storybook/main.ts` — current addon list; confirmed `@storybook/addon-designs` absent
- `apps/storybook/.storybook/preview.ts` — confirmed bare config; no CSS imports, no decorator, no storySort
- `apps/storybook/package.json` — confirmed `@design-system-x/tokens` in dependencies; `@storybook/addon-designs` absent
- `packages/tokens/package.json` — exports map confirmed: `./css` → `dist/css/tokens.css`, `./parent-brand/light` → `dist/parent-brand/light.css`
- `packages/tokens/dist/parent-brand/light.css` — confirmed `--dsx-color-background-default: var(--dsx-color-neutral-0)` exists
- `packages/tokens/dist/css/tokens.css` — confirmed `--dsx-color-brand-*` primitive variables exist with `dsx` prefix
- [Storybook MDX docs](https://storybook.js.org/docs/writing-docs/mdx) — unattached MDX page pattern, Meta import path
- [Storybook decorators docs](https://storybook.js.org/docs/writing-stories/decorators) — global decorator syntax, top-level key requirement
- [Storybook naming/hierarchy docs](https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy) — storySort nested array syntax
- `npm view @storybook/addon-designs dist-tags` — confirmed latest is `11.1.2`; v11.x peer-depends on `storybook: ^10.0.0 || ^10.0.0-0`

### Secondary (MEDIUM confidence)
- [addon-designs GitHub README](https://github.com/storybookjs/addon-designs) — v11.x ↔ Storybook 10 compatibility table, installation pattern
- WebSearch: decorator JSX requiring `.tsx` extension — corroborated by Storybook GitHub issue #14742 and official preview.tsx examples in Storybook's own repo

### Tertiary (LOW confidence)
- None — all critical claims verified against source files or official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via `npm view`; existing files inspected directly
- Architecture patterns: HIGH — verified against Storybook 10 official docs
- CSS import strategy: HIGH — exports map read directly from `packages/tokens/package.json`; CSS file content inspected
- addon-designs compatibility: HIGH — peer deps confirmed via `npm view @storybook/addon-designs@11.0.0 peerDependencies`
- MDX import path: HIGH — confirmed against Storybook 10.3 docs
- Pitfalls: HIGH (preview.ts→.tsx, glob, storySort) — multiple corroborating sources; MEDIUM (silent decorator in parameters) — Storybook changelog confirms

**Research date:** 2026-03-22
**Valid until:** 2026-05-01 (Storybook releases frequently; re-verify addon-designs version before install if > 6 weeks pass)
