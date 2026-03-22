# Phase 4: Storybook Foundation - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure Storybook with the correct addon setup, import token CSS outputs, establish the sidebar sort order, and create the Introduction/Design Purpose/Design Principles MDX pages. This phase is the documentation scaffold — token preview pages and component stories are Phase 5 and 6.

</domain>

<decisions>
## Implementation Decisions

### Storybook version & addons
- **D-01:** Storybook is already at 10.3.1 (installed in Phase 1) — the ROADMAP reference to "Storybook 8" is stale; the installed version wins
- **D-02:** `@storybook/addon-designs` needs adding to `package.json` and `main.ts` — not yet installed
- **D-03:** `@storybook/addon-essentials` is NOT used — Phase 1 installed individual addons (`addon-docs`, `addon-a11y`, `@chromatic-com/storybook`); stay with that pattern
- **D-04:** `reactDocgen: 'react-docgen-typescript'` is already set in `main.ts` — no change needed

### Token CSS import strategy
- **D-05:** `preview.ts` imports two files: primitives first, then `parent-brand/light` as the default semantic layer
  ```ts
  import '@design-system-x/tokens/css'
  import '@design-system-x/tokens/parent-brand/light'
  ```
- **D-06:** All 4 semantic CSS files are NOT imported simultaneously — `parent-brand/light.css` and `child-brand/light.css` both use `:root` as selector; loading both would cause silent last-import-wins collision
- **D-07:** Brand×mode switching is deferred to Phase 5 — Phase 5 will update the SD config to use brand-scoped selectors AND add the Storybook toolbar switcher at the same time

### Global decorator
- **D-08:** A global decorator in `preview.ts` wraps all story canvases with:
  - `background: var(--dsx-color-background-default)` — uses the imported semantic token, not a hardcoded value
  - `padding: 2rem` — standard breathing room, consistent with most design system Storybooks
- **D-09:** Decorator applies to `.stories.*` files only — MDX pages (Design Purpose, Design Principles) are unaffected by decorators by Storybook design; no special handling needed

### Sidebar sort order
- **D-10:** `storySort` in `preview.ts` follows: `Introduction → Design Purpose → Design Principles → Tokens → Styles → Primitives`

### Design Purpose page (STORY-13)
- **D-11:** Placeholder format — fill-in-the-blank slots are **neutral generic text** that reads as a finished sentence (not visible brackets), so the page looks complete out of the box but is clearly meant to be replaced
- **D-12:** Structure: one-paragraph purpose statement following the formula — *who it serves + what it enables + the deeper why*
- **D-13:** Reference text: "This design system gives product teams a consistent, accessible foundation — so they spend less time on solved problems and more time on the decisions that actually matter."

### Design Principles page (STORY-14)
- **D-14:** Format: capitalized short phrase + one-sentence definition that guides an actual decision (not a vague adjective)
- **D-15:** 5 principles, each specific enough to resolve a real design conflict:
  1. **Token-first** — Every visual decision starts as a token. Hardcoded values are design debt.
  2. **Accessible by default** — WCAG AA is the floor, not the goal. Every text/background pair is verified before shipping.
  3. **Figma-authoritative** — Figma Variables are the source of truth. Code is the output, never the source.
  4. **Documented, not assumed** — Every pattern has a Storybook story. If it's not demonstrated, it doesn't exist.
  5. **Composable** — Primitives compose into semantics, semantics compose into components. Each tier does one job.
- **D-16:** Both MDX pages explicitly note they are placeholders — include a comment or callout directing future consumers to replace the content

### Figma pages (FIGMA-06)
- **D-17:** Two Figma pages required: "Design Purpose" and "Design Principles" — mirrors Storybook MDX content exactly
- **D-18:** Figma page creation is a human action (requires Figma access) — plan should include this as a manual checkpoint step, not automated

### Claude's Discretion
- MDX page visual styling (use of Storybook `<Meta>`, callout blocks, typographic hierarchy within MDX)
- Whether to use `<Unstyled>` wrapper or standard MDX layout for the intro pages
- Exact wording of the placeholder callout directing consumers to replace content

</decisions>

<specifics>
## Specific Ideas

- Design Purpose and Principles pages should look **finished**, not like scaffolding — neutral placeholder text, not `[YOUR BRAND HERE]` brackets
- The 5 principles were informed by real design system precedents (IBM, Shopify Polaris, Ross Moody's DS principles research) and are specific to this token-based architecture
- Phase 5 owns the brand×mode theme switcher — Phase 4 must not attempt to implement it, but `preview.ts` should be structured so Phase 5 can cleanly replace the static import with dynamic switching

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Storybook setup
- `apps/storybook/.storybook/main.ts` — current addon list; `@storybook/addon-designs` needs adding here
- `apps/storybook/.storybook/preview.ts` — current preview config; CSS imports, decorator, and storySort all go here
- `apps/storybook/package.json` — current devDependencies; `@storybook/addon-designs` needs adding here

### Token CSS outputs
- `packages/tokens/dist/css/tokens.css` — primitive tokens (`:root` scoped)
- `packages/tokens/dist/parent-brand/light.css` — default semantic layer (`:root` scoped)
- `packages/tokens/dist/parent-brand/dark.css` — dark variant (`[data-theme="dark"]` scoped)
- `packages/tokens/dist/child-brand/light.css` — child brand light (`:root` scoped — collision risk if loaded simultaneously with parent-brand/light)
- `packages/tokens/package.json` — exports map; verify `./css` and `./parent-brand/light` paths resolve correctly

### Requirements
- `.planning/REQUIREMENTS.md` §STORY-01, STORY-02, STORY-03, STORY-13, STORY-14, FIGMA-06

### Prior phase summaries
- `.planning/phases/03-semantic-tokens-figma-pipeline/03-VERIFICATION.md` — verified token outputs that preview.ts imports

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/storybook/.storybook/main.ts` — framework, reactDocgen, and 3 addons already configured; Phase 4 adds `@storybook/addon-designs` only
- `apps/storybook/.storybook/preview.ts` — bare config with just controls matchers; Phase 4 adds imports, decorator, and storySort

### Established Patterns
- Storybook workspace package is named `@design-system-x/storybook` (not plain "storybook") — avoids npm workspace shadowing the storybook CLI
- All `@storybook/*` addons are hoisted to root `node_modules` — install `@storybook/addon-designs` at root `devDependencies`, not inside `apps/storybook/`
- Stories live in `apps/storybook/stories/` — MDX pages follow the same path pattern

### Integration Points
- `@design-system-x/tokens` is already a dependency in `apps/storybook/package.json` — CSS import in `preview.ts` will resolve via this workspace dependency
- Phase 5 will replace the static `parent-brand/light` import in `preview.ts` with a dynamic switcher — keep the import on its own line, clearly commented, for easy replacement

</code_context>

<deferred>
## Deferred Ideas

- Brand×mode theme switcher toolbar — Phase 5 (requires SD config update to brand-scoped selectors first)
- Token preview pages (Color, Typography, Spacing, Elevation, Grid) — Phase 5
- Component stories — Phase 6

</deferred>

---

*Phase: 04-storybook-foundation*
*Context gathered: 2026-03-22*
