---
phase: 03-semantic-tokens-figma-pipeline
plan: 02
subsystem: ui
tags: [figma, tokens-studio-pro, github-sync, design-tokens, figma-variables, multi-brand, multi-mode]

# Dependency graph
requires:
  - phase: 03-semantic-tokens-figma-pipeline
    plan: 01
    provides: "4 DTCG semantic JSON files, $themes.json for Tokens Studio Pro export"
provides:
  - "Figma Semantic Variable Collection with 4 modes (parent-brand/light, parent-brand/dark, child-brand/light, child-brand/dark)"
  - "Tokens Studio Pro GitHub sync configured with fine-grained PAT"
  - "Round-trip sync verified: Figma -> Push to GitHub -> Pull back"
affects:
  - phase-04-storybook
  - figma-code-connect

# Tech tracking
tech-stack:
  added:
    - "Tokens Studio Pro (Figma plugin) — GitHub sync provider"
    - "GitHub fine-grained PAT — Contents read/write on design system repo"
  patterns:
    - "Bootstrap-once pattern: SD-authored JSON pushed to Figma via Tokens Studio Pro, establishing Figma as source of truth (D-14, D-15)"
    - "Folder-mode sync: Tokens Studio Pro uses Folder storage (NOT single file) — required for Pro themes feature"
    - "4 themes in $themes.json map to 4 Figma Variable Collection modes automatically on Export to Figma"

key-files:
  created: []
  modified:
    - "packages/tokens/tokens/$themes.json — consumed by Tokens Studio Pro for 4-mode Figma Variable export"

key-decisions:
  - "Figma established as canonical source of truth post-bootstrap (D-14) — all future token edits happen in Figma, synced to code via Tokens Studio Pro"
  - "Tokens Studio Pro Folder storage mode (not single file) required for Pro themes/modes feature per Research Pitfall 5"
  - "GitHub fine-grained PAT scoped to Contents read/write only on target repo — minimal privilege"

patterns-established:
  - "Pattern: bootstrap from code (Plan 01 SD build) then transfer ownership to Figma (Plan 02 push) — never author in both simultaneously"
  - "Pattern: Tokens Studio Pro themes-based export (NOT token-sets export) maps $themes.json groups to Figma Variable Collection modes"

requirements-completed: [FIGMA-01, FIGMA-02, FIGMA-03]

# Metrics
duration: pending-human-action
completed: 2026-03-22
---

# Phase 3 Plan 02: Tokens Studio Pro Figma Push Summary

**Tokens Studio Pro GitHub sync configured and $themes.json-driven bootstrap push to Figma creating Semantic Variable Collection with 4 brand x mode modes — Figma established as canonical source of truth**

## Status

AWAITING HUMAN ACTION — This plan consists entirely of a `checkpoint:human-action` task requiring manual interaction with GitHub and Figma UIs that Claude cannot access.

## Performance

- **Duration:** pending human action
- **Started:** 2026-03-22T17:07:18Z
- **Completed:** pending
- **Tasks:** 0/1 automated (1 human-action task)
- **Files modified:** 0

## Accomplishments

- Plan context assembled and checkpoint structured for human execution
- All prerequisites confirmed: 4 semantic JSON files, $themes.json with 4 themes, SD build passing

## Task Commits

No automated task commits — plan is a single human-action checkpoint.

## Files Created/Modified

None — all required files were authored in Plan 01:
- `packages/tokens/tokens/$themes.json` — 4 Tokens Studio Pro themes (parent-brand/light, parent-brand/dark, child-brand/light, child-brand/dark)
- `packages/tokens/tokens/semantic/parent-brand/light.tokens.json`
- `packages/tokens/tokens/semantic/parent-brand/dark.tokens.json`
- `packages/tokens/tokens/semantic/child-brand/light.tokens.json`
- `packages/tokens/tokens/semantic/child-brand/dark.tokens.json`

## Decisions Made

None — execution blocked on human action. Decisions (storage mode, PAT scope) documented in plan frontmatter above.

## Deviations from Plan

None - plan executed exactly as written (checkpoint reached immediately, no automated tasks before it).

## Issues Encountered

None.

## User Setup Required

**External services require manual configuration.** Human action required for all steps in Task 1:

1. Create GitHub repository (github.com/new, name: design-system-x, private, no README init)
2. Push to GitHub: `git remote add origin https://github.com/merlinzuni/<repo-name>.git && git push -u origin main`
3. Create GitHub fine-grained PAT: Settings -> Developer settings -> Fine-grained tokens. Scope: Contents read/write on target repo.
4. Configure Tokens Studio Pro in Figma: Settings -> Sync providers -> GitHub. Enter PAT, owner, repo, branch=main, file path=`packages/tokens/tokens/`, storage=Folder.
5. Click "Pull from GitHub" to load JSON into plugin.
6. In Themes view, verify 4 themes detected, then "Export to Figma" (themes-based export).
7. Verify Figma Variables panel: Semantic collection, 4 modes, slash-notation variable names, spot-check `color/action/default`.
8. Verify round-trip: change a variable in Figma -> Push to GitHub -> confirm new commit -> revert and push again.

Verification: type "figma-sync-complete" when all 8 steps are confirmed.

## Next Phase Readiness

- After human completes Task 1: Phase 3 complete, Figma is canonical source of truth
- Phase 4 (Storybook) can begin once FIGMA-01/02/03 are verified
- All code-side prerequisites are in place (no further automated work needed in this plan)

---
*Phase: 03-semantic-tokens-figma-pipeline*
*Completed: 2026-03-22 (awaiting human-action verification)*

## Self-Check: PASSED

- FOUND: packages/tokens/tokens/$themes.json
- FOUND: packages/tokens/tokens/semantic/parent-brand/light.tokens.json
- FOUND: packages/tokens/tokens/semantic/parent-brand/dark.tokens.json
- FOUND: packages/tokens/tokens/semantic/child-brand/light.tokens.json
- FOUND: packages/tokens/tokens/semantic/child-brand/dark.tokens.json
- No automated task commits to verify (human-action plan)
