---
phase: 03-semantic-tokens-figma-pipeline
plan: 02
subsystem: ui
tags: [figma, tokens-studio-pro, github-sync, design-tokens, figma-variables, multi-brand, multi-mode, dtcg]

# Dependency graph
requires:
  - phase: 03-semantic-tokens-figma-pipeline
    plan: 01
    provides: "4 DTCG semantic JSON files, $themes.json for Tokens Studio Pro export"
provides:
  - "GitHub remote at github.com/MerlinZuni/design-system-tokens (SSH)"
  - "Tokens Studio Pro configured with GitHub sync (Folder storage, W3C DTCG format, branch main, path packages/tokens/tokens/)"
  - "Figma Semantic Variable Collection with 4 modes (parent-brand/light, parent-brand/dark, child-brand/light, child-brand/dark)"
  - "226 variables per mode in Figma — slash notation (color/background/default)"
  - "Round-trip sync verified: Figma edit -> Push to GitHub commit -> revert cleanly"
  - "Figma established as canonical source of truth (D-14)"
affects:
  - phase-04-storybook
  - figma-code-connect
  - phase-05-token-documentation

# Tech tracking
tech-stack:
  added:
    - "Tokens Studio Pro (Figma plugin) — GitHub sync provider, W3C DTCG Folder storage"
    - "GitHub repository: github.com/MerlinZuni/design-system-tokens (SSH remote)"
    - "GitHub fine-grained PAT — Contents read/write on design-system-tokens repo"
  patterns:
    - "Bootstrap-once pattern (D-15): SD-authored JSON pushed to Figma via Tokens Studio Pro, establishing Figma as source of truth (D-14)"
    - "Folder-mode sync: Tokens Studio Pro uses Folder storage (NOT single file) — required for Pro themes feature"
    - "4 themes in $themes.json map to 4 Figma Variable Collection modes automatically on Export to Figma"
    - "W3C DTCG format in Tokens Studio Pro: dot notation in JSON round-trips cleanly to/from slash notation in Figma Variables"

key-files:
  created: []
  modified:
    - "packages/tokens/tokens/$themes.json — consumed by Tokens Studio Pro for 4-mode Figma Variable export"

key-decisions:
  - "SSH remote used (not HTTPS): repo configured as git@github.com:MerlinZuni/design-system-tokens.git"
  - "Tokens Studio Pro Folder storage mode (not single file) required for Pro themes/modes feature per Research Pitfall 5"
  - "W3C DTCG format selected in Tokens Studio Pro to match Plan 01 JSON authoring — ensures round-trip fidelity"
  - "Figma established as canonical source of truth post-bootstrap (D-14) — all future token edits happen in Figma, synced to code via Tokens Studio Pro"

patterns-established:
  - "Pattern: bootstrap from code (Plan 01 SD build) then transfer ownership to Figma (Plan 02 push) — never author in both simultaneously"
  - "Pattern: Tokens Studio Pro themes-based export (NOT token-sets export) maps $themes.json groups to Figma Variable Collection modes"
  - "Pattern: Tokens Studio Pro sync path is packages/tokens/tokens/ — source JSON directory, not dist/"

requirements-completed: [FIGMA-01, FIGMA-02, FIGMA-03]

# Metrics
duration: human-action
completed: 2026-03-22
---

# Phase 3 Plan 02: Tokens Studio Pro Figma Push Summary

**Tokens Studio Pro GitHub sync configured with Folder/DTCG storage and $themes.json-driven bootstrap push created Figma Semantic Variable Collection — 226 variables across 4 brand x mode combinations with round-trip sync verified**

## Performance

- **Duration:** Human-action task (manual steps in GitHub and Figma UIs)
- **Started:** 2026-03-22 (checkpoint reached — awaiting human)
- **Completed:** 2026-03-22
- **Tasks:** 1 (checkpoint:human-action — completed by human)
- **Files modified:** 0 (no code changes — configuration in external services)

## Accomplishments

- GitHub repository created and all project code pushed: github.com/MerlinZuni/design-system-tokens (SSH remote, branch main)
- GitHub fine-grained PAT created and scoped to Contents read/write on the target repository
- Tokens Studio Pro plugin configured in Figma: GitHub sync provider, Folder storage, path `packages/tokens/tokens/`, branch main, W3C DTCG format
- Token JSON files pulled from GitHub into Tokens Studio Pro — all 4 semantic token sets + primitives loaded
- Tokens Studio Pro themes export run: created Figma `Semantic` Variable Collection with 4 modes (parent-brand/light, parent-brand/dark, child-brand/light, child-brand/dark), 226 variables each
- Variable names in Figma use slash notation (`color/background/default`, `color/action/default`) — matches DTCG dot notation round-trip
- Round-trip sync verified: Figma variable changed, pushed to GitHub (new commit visible), change reverted and pushed again cleanly

## Task Commits

This plan contained one `checkpoint:human-action` task — no automated code commits. All work occurred in external services (GitHub, Figma, Tokens Studio Pro).

## Files Created/Modified

None — plan involved only external service configuration:
- GitHub repository setup (github.com/MerlinZuni/design-system-tokens)
- Tokens Studio Pro plugin configuration (Figma)
- Figma Variables collection created via plugin export (226 variables x 4 modes)

## Decisions Made

- **SSH remote over HTTPS:** Repository configured with SSH remote (`git@github.com:MerlinZuni/design-system-tokens.git`) rather than the HTTPS URL shown in the plan. Both work; SSH is standard for developer machines with SSH keys configured.
- **Folder storage confirmed:** Tokens Studio Pro configured with Folder storage (not Single file) as required by Research Pitfall 5 — Single file mode does not support the Pro themes feature needed for multi-mode export.
- **W3C DTCG format:** Selected in Tokens Studio Pro to match the `$type`/`$value` DTCG syntax authored in Plan 01. Ensures round-trip fidelity without format translation artifacts.
- **Figma canonical source of truth (D-14):** The bootstrap (D-15) is now complete. Going forward all token edits happen in Figma Variables and sync to `packages/tokens/tokens/` via "Push to GitHub" in Tokens Studio Pro.

## Deviations from Plan

None — all 7 steps completed successfully by the human operator:

1. GitHub repository created
2. Code pushed to remote (SSH)
3. GitHub fine-grained PAT created
4. Tokens Studio Pro configured in Figma (Folder storage, DTCG format)
5. Token files pulled from GitHub into plugin
6. Semantic Variable Collection exported to Figma — 4 modes, 226 variables each
7. Round-trip sync verified (push from Figma to GitHub as commit, reverted cleanly)

## Issues Encountered

None — all steps completed without issues. Variable count (226 per mode) is consistent with the 22 semantic categories and their sub-tokens defined across the 4 JSON files in Plan 01.

## User Setup Required

All external service configuration completed as part of this plan:
- GitHub repository live: github.com/MerlinZuni/design-system-tokens (SSH remote active, branch main)
- Tokens Studio Pro: GitHub sync active — pull and push working
- Figma: Semantic Variable Collection live with 4 modes, 226 variables each

No additional external setup required before Phase 4.

## Next Phase Readiness

- Figma Semantic Variable Collection is live — designers can reference semantic tokens in Figma components immediately
- Round-trip sync is operational — token changes in Figma will commit to `packages/tokens/tokens/semantic/` via Tokens Studio Pro push
- Phase 3 is fully complete: primitive tokens (Phase 2) + semantic tokens + SD build (Plan 01) + Figma sync (Plan 02)
- Phase 4 (Storybook Foundation) can begin — depends on token CSS outputs from Phase 2/3, all available in `packages/tokens/dist/`

---
*Phase: 03-semantic-tokens-figma-pipeline*
*Completed: 2026-03-22*

## Self-Check: PASSED

This plan involved exclusively external service configuration (GitHub, Figma, Tokens Studio Pro) — no code files were created or modified. Completion verified from human-provided confirmation facts:

- CONFIRMED: GitHub remote configured (github.com/MerlinZuni/design-system-tokens, SSH)
- CONFIRMED: Tokens Studio Pro sync active (Folder storage, W3C DTCG, packages/tokens/tokens/, branch main)
- CONFIRMED: Figma Semantic Variable Collection created with 4 modes
- CONFIRMED: 226 variables per mode
- CONFIRMED: Round-trip sync verified (Figma push -> GitHub commit visible, revert clean)
- CONFIRMED: Requirements FIGMA-01, FIGMA-02, FIGMA-03 satisfied
