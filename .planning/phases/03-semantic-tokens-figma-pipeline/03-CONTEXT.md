# Phase 3: Semantic Tokens & Figma Pipeline - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning (pending GitHub remote setup)

<domain>
## Phase Boundary

Define all Tier 2 semantic tokens with multi-brand and light/dark mode support. Establish Figma Variables as the canonical source of truth and configure Tokens Studio Pro git sync. Update Style Dictionary to run one instance per brand × mode combination.

</domain>

<decisions>
## Implementation Decisions

### Brand structure
- **D-01:** Two brands: `parent-brand` (primary) and `child-brand` (secondary/luxury) — generic names for starter kit portability
- **D-02:** Each brand has a `primary` and `secondary` color role — not two separate brands, but two color roles within one brand identity
- **D-03:** `parent-brand` colors: primary = teal `#4FC4C4` (color.brand.500), secondary = purple `#5944af` (color.secondary.500)
- **D-04:** `child-brand` colors: primary = near-black slate `#1C1C28`, secondary = deep navy `#1B3A6B`
- **D-05:** 4 CSS outputs: `parent-brand/light.css`, `parent-brand/dark.css`, `child-brand/light.css`, `child-brand/dark.css`

### Semantic token vocabulary — naming
- **D-06:** Role-based naming (`color.background.default`, `color.text.primary`) — not component-based
- **D-07:** Full semantic color categories:
  - `background` — page, surface, overlay, subtle, inverse
  - `surface` — card, panel, popover, tooltip, sunken
  - `text` — default, muted, subtle, inverse, disabled, link, link-hover, link-visited
  - `action` — default, hover, pressed, disabled, subtle
  - `focus` — focus ring (accessibility)
  - `link` — default, hover, visited, disabled
  - `border` — default, subtle, strong, inverse, focus
  - `divider` — separator/horizontal rule
  - `icon` — default, muted, inverse, disabled, action
  - `status.error` — background, text, border, icon
  - `status.warning` — background, text, border, icon
  - `status.success` — background, text, border, icon
  - `status.info` — background, text, border, icon
  - `overlay` — modal/drawer scrim
  - `shadow` — sm, md, lg (aliasing primitive elevation)
  - `skeleton` — base, highlight (loading states)
  - `highlight` — selected text, search match

### Semantic token vocabulary — spacing
- **D-08:** Semantic spacing tier included with 3 categories:
  - `space.component.xs/sm/md/lg/xl` — internal component padding
  - `space.layout.xs/sm/md/lg/xl` — section gaps, page margins, grid spacing
  - `space.inline.xs/sm/md/lg` — gap between inline elements (icon + label, etc.)
- **D-09:** Primitive spacing scale remains available for edge cases

### Dark mode
- **D-10:** `parent-brand` dark mode: brand-tinted surfaces (Vercel-inspired) with MORE noticeable contrast between depth levels than Vercel's subtle approach
- **D-11:** `child-brand` dark mode: deep charcoal surfaces (neutral dark, not tinted)
- **D-12:** All text/background pairings must pass WCAG AA (4.5:1 contrast ratio minimum)
- **D-13:** Accent surfaces (brand.500) use dark text, not white — `neutral.900` on `brand.500` passes AAA (~7:1)

### Figma & Tokens Studio workflow
- **D-14:** Figma-first approach — Figma Variables are the canonical source of truth
- **D-15:** Bootstrap method: author semantic JSON in code first → Tokens Studio Pro *pushes* to Figma to create Variable Collections automatically → Figma becomes source of truth going forward
- **D-16:** Tokens Studio Pro (paid, $49/mo) is installed in Figma with full sync capabilities
- **D-17:** Tokens Studio Pro requires GitHub remote — set up under merlinzuni account (see todo: github-remote-setup.md) — **blocker for phase execution**
- **D-18:** Figma Variable Collections: `Primitives` (existing, no modes) + `Semantic` (new, 4 modes: parent-brand/light, parent-brand/dark, child-brand/light, child-brand/dark)
- **D-19:** Figma variable naming: slash-separated (`color/background/default`) auto-translates to dot notation in DTCG JSON

### Claude's Discretion
- Exact primitive alias mapping for each semantic token (which primitive step maps to which semantic role)
- WCAG AA verification of all text/background pairings during authoring
- Style Dictionary multi-instance loop implementation (TOKEN-10)
- File structure for semantic JSON under `packages/tokens/tokens/semantic/`

</decisions>

<specifics>
## Specific Ideas

- Dark mode feel reference: Vercel's tinted dark — but surface depth contrast more pronounced/readable
- Luxury brand (child-brand) dark mode: deep charcoal, not tinted — let slate/navy accents pop cleanly
- Accessibility non-negotiable: every text/bg pairing verified at AA before committing token values

</specifics>

<canonical_refs>
## Canonical References

### Token architecture
- `.planning/research/TOKENS.md` — Token system research, DTCG format, Style Dictionary patterns
- `.planning/phases/02-primitive-token-pipeline/02-01-SUMMARY.md` — SD config decisions, build pipeline
- `.planning/phases/02-primitive-token-pipeline/02-02-SUMMARY.md` — Primitive token file structure, naming patterns

### Figma pipeline
- `.planning/research/FIGMA.md` — Figma Variables research, Tokens Studio sync patterns
- `.planning/phases/02-primitive-token-pipeline/02-VERIFICATION.md` — Verified primitive outputs that semantic tokens alias

### Requirements
- `.planning/REQUIREMENTS.md` §TOKEN-06, TOKEN-07, TOKEN-08, TOKEN-10, FIGMA-01, FIGMA-02, FIGMA-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/tokens/style-dictionary.config.mjs` — current single-instance SD config; Phase 3 extends this to multi-instance loop per brand × mode
- `packages/tokens/tokens/primitives/` — 5 DTCG JSON files; semantic tokens alias values from these
- `packages/tokens/src/index.ts` — barrel file; will need updating for semantic exports

### Established Patterns
- All token files use W3C DTCG format (`$value`, `$type`, `$description`)
- Alias syntax: `{color.brand.500}` — curly brace references
- SD output: `dist/css/tokens.css` → extends to `dist/parent-brand/light.css` etc.
- `outputReferences: true` already set — alias chain preserved as `var()` in CSS output

### Integration Points
- `turbo.json` `build:tokens` task — will need updating for multi-instance output
- `packages/tokens/package.json` exports map — new CSS paths need entries
- Storybook (Phase 4) imports CSS from tokens package — path changes here affect Phase 4

</code_context>

<deferred>
## Deferred Ideas

- GitHub Actions CI for automatic Tokens Studio sync on push — v2 (manual sync sufficient for v1)
- Automated WCAG contrast validation in CI — backlog (manual verification in Phase 3)
- Component tokens (Tier 3) — Phase 6

</deferred>

---

*Phase: 03-semantic-tokens-figma-pipeline*
*Context gathered: 2026-03-22*
