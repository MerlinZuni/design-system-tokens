# Design System X — Research Synthesis

**Project:** Design System X (React + TypeScript)
**Synthesized:** 2026-03-22
**Sources:** TOKENS.md, FIGMA.md, STORYBOOK.md, STRUCTURE.md
**Overall confidence:** HIGH for architecture and toolchain decisions; MEDIUM for Figma/Tokens Studio integration specifics

---

## Executive Summary

Design System X is a full-stack design token system: a 3-tier token architecture
(Primitive → Semantic → Component) flowing from Figma Variables → Tokens Studio Pro →
Style Dictionary v4 → CSS custom properties + TypeScript, feeding a React + TypeScript
component library documented in Storybook 8. The research confirms this is a
well-trodden path — IBM Carbon, Salesforce Lightning, and Atlassian all run the same
fundamental architecture — but the specific toolchain (Tokens Studio Pro + SD v4 +
`@figma/code-connect`) sits at the intersection of several actively evolving tools.
The patterns are correct; the integration plumbing requires careful sequencing.

The most consequential decision already made is CSS custom properties for theming
(not CSS-in-JS). This is the right call. CSS vars resolve natively in the browser,
cost zero runtime, and allow dark-mode toggling with a single attribute swap on
`<html>`. Every mature design system (Carbon, Spectrum, Primer) has converged on this
approach and away from runtime JS token injection. The multi-brand architecture follows
directly from this: each brand gets its own set of generated CSS files; switching a
brand in the consumer app is one stylesheet swap.

The critical structural risk is pipeline coupling. The Figma → JSON → CSS chain has
three tool boundaries (Tokens Studio Pro, Style Dictionary, the consuming app), each
with its own version lifecycle and potential for silent mismatches. The mitigation is
a locked naming convention established before any production variables are created,
end-to-end pipeline validation in CI from day one, and a clear rule that Figma is the
single source of truth — JSON is never edited by hand. Get the pipeline green on a
small proof-of-concept token set before authoring the full scale.

---

## Key Findings by Research Area

### TOKENS.md — Token Architecture and Style Dictionary v4

**Confidence: HIGH**

- The W3C DTCG format (`$type`, `$value`, `$description`, `$extensions`) is a stable
  draft spec natively supported by Style Dictionary v4 and Tokens Studio Pro. Use it
  as-is; do not invent a parallel schema.

- The 3-tier rule is absolute: **Component tokens alias Semantic tokens. Semantic
  tokens alias Primitive tokens. No tier-skipping. No upward aliasing.** The practical
  consequence: component CSS never contains a raw hex value or a primitive token name.

- Naming convention is `category.property.modifier` (dot in JSON, slash in Figma, hyphen
  in CSS output). Examples: `color.brand.primary` / `color/brand/primary` /
  `--dsx-color-brand-primary`. This convention must be documented and enforced before
  any variables are created in Figma.

- Style Dictionary v4 config is ESM-only (`config.mjs`). The multi-brand/multi-theme
  build is a nested loop — one `StyleDictionary` instance per brand × theme combination.
  Output structure: `dist/tokens/{brand}/primitives.css`, `light.css`, `dark.css`,
  `components.css`. Primitives and component tokens output once; semantic tokens output
  per theme.

- `outputReferences: true` in the SD config preserves the alias chain as `var()`
  references in CSS (e.g. `--dsx-color-brand-primary: var(--dsx-color-blue-500)`).
  This is mandatory — it enables runtime override without rebuild.

- CSS load order matters: primitives → semantic (theme) → components. Consumers must
  import in this order or semantic `var()` references will resolve against unset vars.

- Typography composite tokens (`$type: "typography"`) do not have direct Figma
  Variables equivalents. They must be authored in Tokens Studio directly (not synced
  from Figma) or assembled from atomic variables in the SD config.

- Shadow tokens using `inset: true` fall outside the DTCG draft spec. Tokens Studio
  handles it via `$extensions`. Style Dictionary's shadow transform must be verified to
  handle multi-shadow arrays (comma-separated `box-shadow`) and the `inset` field.

- Grid column count tokens (`number` type) must be filtered out of px-conversion
  transforms — they are unitless integers, not dimensions.

**Critical decision:** Use a CSS prefix (`dsx`) on all generated custom properties.
This avoids collision with consumer app CSS and makes design system tokens instantly
recognizable in DevTools.

---

### FIGMA.md — Figma Variables, Tokens Studio Pro, Code Connect, addon-designs

**Confidence: HIGH (core mechanics), MEDIUM (version-specific behaviors)**

- Figma plan tier is a hard constraint. Multi-brand + light/dark requires at least 2
  modes in the Semantic collection. Professional plan = 4 modes max; Organization/
  Enterprise = 40. Confirm the team's Figma plan before designing the brand mode count.
  If more than 4 brand × theme combinations are needed, Organization plan is required.

- Figma Variable types: `COLOR`, `FLOAT`, `STRING`, `BOOLEAN`. `BOOLEAN` variables are
  Figma-internal only — do not export them as tokens. `FLOAT` values are unitless in
  Figma; Tokens Studio must be configured to append `px` on export.

- Tokens Studio Pro (paid tier) is required for: Figma Variables sync, multi-file token
  sets, full DTCG export, multi-mode export, and Git integration. The free tier lacks
  all of these. Confirm Pro subscriptions before starting.

- Figma is the canonical source of truth. JSON files in the repository are derived
  outputs from Tokens Studio export. Manual edits to JSON are forbidden — they will be
  overwritten on the next sync and create undetectable drift.

- Tokens Studio does NOT propagate deletions. If a variable is removed from JSON and
  pulled back into Figma, the corresponding Figma Variable is not deleted. Deletions
  require a manual cleanup step in Figma.

- Variable scope metadata (Fill color, Corner radius, etc.) is not exported by Tokens
  Studio. Scopes must be set manually in Figma and are lost on re-import. Document
  which scopes each token category should carry and reapply after bulk re-imports.

- Figma Code Connect (`@figma/code-connect`) links Figma master component nodes to
  actual React component code, displaying real import snippets in Dev Mode. Files are
  `.figma.tsx` colocated with the component. Publishing is a CLI step (`npx figma
  connect publish`) that must be added to the release process or CI. Node IDs change
  if components are moved between Figma files — keep all design system components in
  a single Figma file.

- `@storybook/addon-designs` embeds Figma frames inside the Storybook "Design" tab via
  the Figma Embed API. Viewers must be logged into Figma in their browser; there is no
  workaround. For internal teams this is acceptable. For external consumers, consider
  screenshots (`type: "image"`) instead.

- The addon major version must match the Storybook major version. For SB 8.x, use
  `@storybook/addon-designs@8.x`.

**Naming convention rule (cross-cutting):** All Figma variable names use lowercase with
slash separators (`color/brand/primary`). No dots, no underscores, no spaces, no
camelCase. Tokens Studio translates slash to nested JSON. Violating this produces flat
or malformed JSON.

---

### STORYBOOK.md — Storybook 8.x Setup and Documentation Patterns

**Confidence: HIGH**

- Stack: Storybook 8 + `@storybook/react-vite` (Vite builder). Faster HMR than
  Webpack; simpler config for a library that has no complex asset processing.

- Autodocs is the documentation approach. Set `autodocs: true` globally in `main.ts`
  or per-file with `tags: ["autodocs"]` in the story meta. Do not hand-author MDX
  component docs unless the narrative requires it. Autodocs reads TypeScript interfaces
  via `react-docgen-typescript` (must be explicitly configured in `main.ts` — SB 8
  defaults to the faster but less capable `react-docgen`).

- Prop extraction requirements: export the props interface, use named function exports
  (not `React.FC`), add JSDoc on every interface member. JSDoc becomes the description
  column in the generated props table.

- Use `satisfies Meta<typeof Component>` (not `as Meta`) in story meta objects.
  `satisfies` preserves literal types for args and enables TypeScript story arg checking.

- MDX 3 is used in Storybook 8. Import from `@storybook/blocks`, not the old
  `@storybook/addon-docs/blocks` path. `ColorPalette` and `ColorItem` are built into
  `@storybook/blocks` and render token swatch grids for free — use them for the color
  token page.

- Token preview pages (Color, Typography, Spacing, Elevation, Grid) are standalone
  MDX pages or render-only stories. They use custom React display components
  (ColorSwatch, TypeScaleRow, SpacingRow, ElevationCard, BreakpointRow) that bind
  CSS variable references to visual outputs. The TS token export from Style Dictionary
  (`$value`/`$type` fields) feeds the data into these components directly.

- Generated CSS must be imported in `.storybook/preview.ts` in the correct order:
  primitives → semantic (light, default) → components. Storybook then makes these vars
  available to all stories and MDX files automatically.

- Dark mode preview in Storybook: use `@storybook/addon-themes` to toggle
  `[data-theme="dark"]` on the story container. This activates the dark semantic CSS
  vars without a page reload.

- Sidebar structure (via `title` field): `Introduction/`, `Tokens/`, `Styles/`,
  `Primitives/`. Sort order controlled via `storySort` in `preview.ts`.

- Figma Code Connect is a separate CI publish step from Storybook. The `.figma.tsx`
  files live alongside components but are published to Figma independently of Storybook
  builds. These are two distinct Figma integrations serving different audiences
  (Storybook addon-designs = developers reading docs; Code Connect = designers
  inspecting in Dev Mode).

---

### STRUCTURE.md — Monorepo and Repository Conventions

**Confidence: HIGH**

- Monorepo with npm workspaces + Turborepo from day one. Two published packages:
  `@design-system-x/tokens` (Style Dictionary output) and
  `@design-system-x/primitives` (React components). One app: `apps/storybook/`
  (not published to npm). Storybook is an app, not a library.

- Do NOT create per-component npm packages at v1. The maintenance overhead of 10+
  package.json files, independent versioning, and cross-package peer dep declarations
  outweighs the benefit until a significant component library is stable (reference:
  Radix's model is appropriate at 40+ primitives; not at 10).

- Build tool: tsup (esbuild-based) for both packages. ESM + CJS dual output with
  `.d.ts`. The `exports` field in `package.json` is mandatory — without it, bundlers
  fall back to CJS defeating tree-shaking. The `./css` export subpath
  (`"./css": "./dist/css/tokens.css"`) is the clean API for token CSS import.

- TypeScript strategy: strict `tsconfig.base.json` at root extended per package.
  Key options: `moduleResolution: "Bundler"`, `exactOptionalPropertyTypes: true`,
  `noUncheckedIndexedAccess: true`, `jsx: "react-jsx"`. TypeScript project references
  (`references: [{ "path": "../tokens" }]` in the primitives tsconfig) enable
  incremental builds and correct cross-package type checking.

- Do NOT use `paths` aliases in tsconfig for cross-package imports. Use the actual
  scoped package names (`@design-system-x/tokens`) — npm workspaces symlinks handle
  resolution. `paths` create a second resolution source that diverges from production.

- Linting: ESLint v9 flat config (`eslint.config.js`), not `.eslintrc`. Include
  `eslint-plugin-jsx-a11y` — accessibility is non-negotiable for a design system.
  Use `@typescript-eslint/recommended-type-checked` instead of airbnb config.

- Versioning: Changesets (`@changesets/cli`), not `standard-version`. Changesets is
  workspace-aware — it understands that bumping `tokens` should propagate to
  `primitives`. Install Changesets only after packages are set up and publishing.

- Commit conventions: Conventional Commits enforced by `commitlint` + `husky` +
  `lint-staged`. `BREAKING CHANGE:` footer is the signal to consumers that a token
  was removed or renamed without a compatibility alias.

- Recommended setup sequence (order matters to avoid rework):
  1. Root `package.json` with workspaces
  2. `tsconfig.base.json`
  3. `turbo.json` pipeline
  4. `packages/tokens/` with SD config and tsup build
  5. `packages/primitives/` with tsup, referencing tokens
  6. `apps/storybook/` with SB 8.x
  7. Prettier + ESLint at root
  8. husky + commitlint + lint-staged
  9. Changesets (after packages are publishing-ready)

---

## Cross-Cutting Concerns

These concerns span multiple phases and must be resolved before or during Phase 1.
They cannot be deferred without creating rework later.

### 1. Naming Convention Lock-In (Affects All Phases)

The `category/property/modifier` naming convention in Figma translates to
`category.property.modifier` in JSON, `--dsx-category-property-modifier` in CSS, and
`tokens.category.property.modifier` in TypeScript. Every downstream artifact is derived
from the Figma variable name. Changing names after mass-aliasing is expensive — Figma's
rename-with-aliases option must be used or all aliases break silently.

**Decision required before Phase 1:** Finalize and document the naming convention.
Review the anti-pattern list (no `color.primary`, no `blue-500` as a semantic name,
no value-in-name like `spacing.16px`). Write it into `CONTRIBUTING.md` before the
first variable is created.

### 2. CSS Variable Prefix (Affects Token Build, All Consumers)

The `dsx` prefix on all generated CSS custom properties is a project-wide decision.
It cannot be changed after consumers adopt the library without a breaking change.
Confirm the prefix before the first Style Dictionary build.

### 3. Figma Plan and Tokens Studio Pro Subscriptions (Blocks Phase 1)

Multi-brand + light/dark theming requires Professional Figma plan (minimum) and Tokens
Studio Pro subscriptions for every designer working with tokens. These are hard
prerequisites — the pipeline cannot be built without them. Confirm licensing before
beginning token architecture work.

### 4. CSS Load Order (Affects Token Consumer API)

The generated CSS must be imported in order: primitives → semantic → components. This
is a consumer contract that must be documented and enforced in the package README.
Violating it produces unresolved `var()` references (the CSS variable equivalent of
`undefined`). Consider whether to bundle all three into a single `tokens.css` entry
file for simpler consumer usage, with separate files available for advanced consumers
who need to swap themes dynamically.

### 5. Figma as Sole Source of Truth (Affects Team Workflow)

Manual edits to the exported JSON files will be overwritten on the next Tokens Studio
sync. This must be a team-level agreement enforced by process (PR review of JSON diffs)
and documented clearly. The CI pipeline should lint/validate JSON before SD build to
catch accidental manual edits early.

### 6. Code Connect and addon-designs Are Independent Pipelines (Affects Storybook Phase)

`@storybook/addon-designs` (Figma embedded in Storybook) and Figma Code Connect (code
snippets embedded in Figma Dev Mode) are two distinct integrations. They share a Figma
file URL and node ID but are maintained separately. Code Connect publish is a release
step, not a Storybook build step. Plan for both in the CI/release pipeline.

---

## Open Questions and Risks

| # | Question / Risk | Severity | Resolution Path |
|---|----------------|----------|-----------------|
| Q1 | What is the team's Figma plan? Professional (4 modes) or Organization (40 modes)? | BLOCKING | Confirm with stakeholders before Phase 1 |
| Q2 | Do all designers have Tokens Studio Pro subscriptions? | BLOCKING | Confirm and budget before Phase 1 |
| Q3 | How many brands need to be supported at launch? | HIGH | Drives file structure and SD build matrix complexity |
| Q4 | Should dark mode be opt-in (`[data-theme="dark"]`) or system-default (`prefers-color-scheme`)? | HIGH | Affects SD selector config; must choose before token build is implemented |
| Q5 | Should consumer apps import one bundled `tokens.css` or three separate files? | MEDIUM | Affects the tokens package public API and the export map in `package.json` |
| Q6 | Is Tokens Studio Pro v2's DTCG export format exactly as documented (especially `$type` vocabulary and shadow `inset` field)? | MEDIUM | Must be verified against current Tokens Studio docs before pipeline implementation |
| Q7 | Does the Style Dictionary shadow transform handle multi-shadow arrays and `inset: true`? | MEDIUM | Verify or write a custom shadow transform before authoring elevation tokens |
| Q8 | Who owns the Figma service account for CI Code Connect publish? | MEDIUM | Needs a dedicated Figma account with write access; personal PATs expire |
| Q9 | Will Storybook be publicly accessible or internal-only? | LOW | Affects whether `@storybook/addon-designs` Figma login requirement is acceptable |
| Q10 | What typography composite token strategy — DTCG composite (`$type: "typography"`) authored in Tokens Studio, or atomic SD assembly? | MEDIUM | Composite types cannot round-trip through Figma Variables; must be designed intentionally |

---

## Implications for Roadmap

### Suggested Phase Order

**Phase 1 — Repository Foundation and Token Pipeline (No UI)**

Everything downstream depends on this being correct. Build it first, validate it fully.

Delivers:
- Monorepo with npm workspaces + Turborepo
- `packages/tokens/` scaffolded with Style Dictionary v4 config
- End-to-end proof-of-concept: one Figma Variable (e.g. `color/blue/500`) flows
  through Tokens Studio Pro → JSON commit → SD build → CSS output
- Naming convention documented and locked
- CI runs SD build on every PR that touches `tokens/`

Pitfalls to avoid:
- Do not start building components until this pipeline is proven
- Do not edit JSON files manually even once — establish the no-edit rule immediately
- Confirm Figma plan tier and Tokens Studio Pro access before starting

Research flag: This phase is well-documented. No additional research needed.

---

**Phase 2 — Full Token Authoring (Primitive and Semantic Tiers)**

Build the complete token set in Figma and export through the pipeline.

Delivers:
- All Primitive tokens: full color palette (neutral, brand blues, greens, reds, yellows),
  full typography scale (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing),
  spacing scale (base-4 numeric), elevation (shadow scale), grid/breakpoints
- Semantic tokens: light and dark modes for color (brand, text, surface, border, feedback)
  and semantic spacing aliases
- Multi-brand structure: default brand + first additional brand (if applicable)
- SD builds the full matrix: `dist/tokens/{brand}/{light,dark,primitives,components}.css`
- Storybook token preview pages: Color, Typography, Spacing, Elevation, Grid

Pitfalls to avoid:
- Do not use primitive token names in semantic or component contexts
- Typography composite tokens cannot be authored in Figma Variables — author in
  Tokens Studio directly or assemble via SD config
- Shadow `inset` handling: write and test the custom SD transform before authoring
  the elevation scale

Research flag: Shadow composite transform and typography composite strategy need
brief validation against current SD v4 docs. Everything else is HIGH confidence.

---

**Phase 3 — Component Token Tier and First Primitives**

Build the component token layer and the first React primitive components.

Delivers:
- `packages/primitives/` with tsup build referencing `@design-system-x/tokens`
- Component tokens for initial primitives (Button, Typography, Icon, Input at minimum)
- React components consuming CSS custom properties via component tokens (never raw values)
- Storybook stories with Autodocs, argTypes, addon-designs Figma embed

Pitfalls to avoid:
- Components must consume component-tier tokens, not semantic tokens directly, and
  never primitive tokens
- Use `satisfies Meta<typeof Component>` not `as Meta` in story files
- Set `reactDocgen: "react-docgen-typescript"` in `main.ts` — the default docgen
  will produce incomplete props tables
- Export props interfaces from component files and add JSDoc on every member

Research flag: Standard patterns. No additional research needed.

---

**Phase 4 — Figma Code Connect and Release Pipeline**

Wire Figma ↔ code bidirectionally and set up the release process.

Delivers:
- `.figma.tsx` Code Connect files for each component, colocated with source
- CI step: `npx figma connect publish` on release (using Figma service account token
  in GitHub Secrets)
- Changesets configuration and first release of `@design-system-x/tokens` and
  `@design-system-x/primitives`
- Conventional Commits enforced via commitlint + husky

Pitfalls to avoid:
- Node IDs in `.figma.tsx` must reference master components, not instances
- All design system components must remain in a single Figma file to prevent
  node ID drift on file reorganization
- Figma enum value casing in Code Connect must match Figma exactly (case-sensitive)
- Code Connect publish must be re-run after every `.figma.tsx` change — automate in CI

Research flag: Code Connect CLI flags and exact publish API may have evolved. Verify
`@figma/code-connect` current version and flags before implementing the CI step.

---

**Phase 5 — Documentation and Storybook Polish**

Finalize the Storybook documentation site as the consumer-facing reference.

Delivers:
- Introduction section: Getting Started, Token Architecture, Contributing guides
- Complete token preview pages for all token categories
- Storybook sidebar sort order configured
- Dark mode toggle via `@storybook/addon-themes`
- Storybook deployed to a stable URL (Chromatic, GitHub Pages, or Vercel)

Pitfalls to avoid:
- Figma embed (addon-designs) requires the consumer to be logged into Figma — document
  this clearly; for a public docs site, consider `type: "image"` for Figma frames
- MDX 3 imports must come from `@storybook/blocks`, not old addon-docs paths

Research flag: Storybook deployment target (Chromatic vs GitHub Pages vs Vercel) may
warrant a brief research spike to evaluate cost and CI integration.

---

### Dependency Graph Summary

```
Phase 1 (pipeline)
  → Phase 2 (tokens)
      → Phase 3 (components)  ← depends on tokens CSS being available
          → Phase 4 (release + Code Connect)
              → Phase 5 (docs polish)
```

Phases 1 and 2 are strictly sequential — the token pipeline must be validated before
authoring the full token set. Phase 3 can begin with a subset of Phase 2 (just color
and spacing primitives) rather than waiting for the complete token set. Phases 4 and 5
can begin in parallel once Phase 3 has at least 2-3 stable components.

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Token architecture (3-tier, DTCG, SD v4) | HIGH | Stable spec, mature tools, industry-wide consensus |
| CSS custom property theming strategy | HIGH | `[data-theme]` selector pattern is established; SD v4 config is well-documented |
| Monorepo structure (npm workspaces, Turborepo, tsup) | HIGH | Stable tools, mirrors Radix/Carbon/Chakra structures |
| TypeScript config patterns | HIGH | TS project references and strict config are stable handbook patterns |
| Storybook 8 setup and Autodocs | HIGH | SB 8 stable since 2024; API patterns are well-documented |
| ESLint flat config, Changesets, Conventional Commits | HIGH | All tools stable and widely adopted |
| Figma Variables core mechanics | HIGH | Variables launched 2023, behavior stable |
| Tokens Studio Pro sync workflow | MEDIUM | Core workflow correct; exact DTCG export schema details should be verified on setup |
| Shadow composite transform in SD v4 | MEDIUM-LOW | Multi-shadow array + inset handling needs verification against current SD v4 docs |
| Figma Code Connect CLI flags | MEDIUM | Correct as of mid-2024; actively evolving — verify before CI implementation |
| Figma plan mode limits | MEDIUM | Has changed before; verify current limits at help.figma.com before designing brand/mode count |

**Overall: MEDIUM-HIGH.** The architecture, toolchain choices, and code patterns are
high-confidence. The integration seams (Tokens Studio ↔ SD, Code Connect CLI) are
medium-confidence and should each be validated with a 30-minute smoke test against
current documentation before committing to the full implementation of each phase.

---

## Aggregated Sources

- W3C DTCG Specification (draft): https://tr.designtokens.org/format/
- Style Dictionary v4 docs: https://styledictionary.com
- Tokens Studio Pro docs: https://docs.tokens.studio
- Figma Variables help: https://help.figma.com/hc/en-us/articles/15339657135383
- `@figma/code-connect` GitHub: https://github.com/figma/code-connect
- `@storybook/addon-designs` GitHub: https://github.com/storybookjs/addon-designs
- Storybook 8 docs: https://storybook.js.org/docs
- Turborepo docs: https://turbo.build/repo/docs
- tsup docs: https://tsup.egoist.dev
- Changesets: https://github.com/changesets/changesets
- TypeScript project references: https://www.typescriptlang.org/docs/handbook/project-references.html
- Radix UI Primitives (structure reference): https://github.com/radix-ui/primitives
- IBM Carbon Design System (structure reference): https://github.com/carbon-design-system/carbon
- ESLint flat config migration: https://eslint.org/docs/latest/use/configure/migration-guide

**Note:** Web access was unavailable during all four research sessions. All findings
draw from training knowledge with cutoff of August 2025. The areas most likely to have
changed are Tokens Studio Pro's exact DTCG export format, `@figma/code-connect` CLI
flags, and Figma plan tier mode limits. Verify each against current documentation
before beginning the relevant implementation phase.
