---
phase: 01-monorepo-foundation
plan: "01"
subsystem: infra
tags: [npm-workspaces, turborepo, tsup, typescript, monorepo]

# Dependency graph
requires: []
provides:
  - npm workspaces root with packages/* and apps/* glob
  - Turborepo v2 build pipeline with dependsOn: [^build] ordering
  - Shared tsconfig.base.json with strict mode and composite: false
  - "@design-system-x/tokens package scaffold with dual ESM+CJS tsup build"
  - "@design-system-x/primitives package scaffold with workspace dependency on tokens"
  - dist/ artifacts for both packages produced by turbo run build
affects: [01-02-PLAN.md, all future phases]

# Tech tracking
tech-stack:
  added:
    - turbo@2.8.20 (root devDependency)
    - typescript@5.9.3 (root devDependency)
    - tsup@8.5.1 (root devDependency)
    - react@19.2.4 (root node_modules via workspace)
    - react-dom@19.2.4 (root node_modules via workspace)
  patterns:
    - npm workspaces hoists all dependencies to root node_modules
    - tsup produces index.js (ESM) + index.cjs (CJS) + index.d.ts when package has type:module
    - exports map: types field must come before import/require for TypeScript resolution
    - packageManager field required in root package.json for Turborepo v2 workspace detection

key-files:
  created:
    - package.json (root workspace config)
    - turbo.json (Turborepo v2 task pipeline)
    - tsconfig.base.json (shared TypeScript config)
    - .gitignore
    - packages/tokens/package.json
    - packages/tokens/tsconfig.json
    - packages/tokens/tsup.config.ts
    - packages/tokens/src/index.ts
    - packages/primitives/package.json
    - packages/primitives/tsconfig.json
    - packages/primitives/tsup.config.ts
    - packages/primitives/src/index.ts
  modified: []

key-decisions:
  - "Turborepo v2 requires packageManager field in root package.json — added npm@11.11.0"
  - "tsup with type:module produces .js (ESM) and .cjs (CJS), not .mjs/.js — exports map corrected"
  - "types field in exports map must come before import/require for TypeScript to resolve declarations"
  - "composite: false in tsconfig.base.json — tsup uses esbuild, not tsc --build"
  - "tsup installed at root so turbo can invoke it via PATH for all packages"

patterns-established:
  - "Package exports pattern: { types, import, require } with .js/.cjs extensions"
  - "Per-package tsconfig.json extends ../../tsconfig.base.json with rootDir/outDir only"
  - "turbo run build: tokens#build executes before primitives#build via dependsOn: [^build]"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03, INFRA-06]

# Metrics
duration: 15min
completed: 2026-03-22
---

# Phase 1 Plan 01: Root workspace + package scaffolding Summary

**npm workspaces monorepo with Turborepo v2 task pipeline, tsup dual ESM+CJS builds for @design-system-x/tokens and @design-system-x/primitives, both producing dist/ artifacts in correct dependency order**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-22T13:25:25Z
- **Completed:** 2026-03-22T13:40:00Z
- **Tasks:** 3/3
- **Files modified:** 12

## Accomplishments

- Root npm workspaces monorepo initialized with Turborepo v2 using `tasks` key (not deprecated `pipeline`)
- Both library packages scaffolded with tsup dual ESM+CJS output — `turbo run build` succeeds in dependency order (tokens before primitives)
- Shared `tsconfig.base.json` with strict mode, `composite: false`, `moduleResolution: Bundler` extended by both packages

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize root workspace** - `f714667` (chore)
2. **Task 2: Scaffold @design-system-x/tokens** - `349abbd` (feat)
3. **Task 3: Scaffold @design-system-x/primitives + verify build** - `fb71c33` (feat)

## Files Created/Modified

- `/Users/merlinzuni/develop/package.json` - Root workspace: npm workspaces, Turborepo scripts, packageManager field
- `/Users/merlinzuni/develop/turbo.json` - Turborepo v2 tasks: build (dependsOn ^build), dev (persistent), lint, test
- `/Users/merlinzuni/develop/tsconfig.base.json` - Strict TS config: strict, composite: false, moduleResolution: Bundler
- `/Users/merlinzuni/develop/.gitignore` - node_modules, dist, .turbo, storybook-static
- `/Users/merlinzuni/develop/packages/tokens/package.json` - @design-system-x/tokens with correct exports map
- `/Users/merlinzuni/develop/packages/tokens/tsconfig.json` - Extends tsconfig.base.json
- `/Users/merlinzuni/develop/packages/tokens/tsup.config.ts` - ESM+CJS, dts: true, splitting: false
- `/Users/merlinzuni/develop/packages/tokens/src/index.ts` - Empty barrel
- `/Users/merlinzuni/develop/packages/primitives/package.json` - @design-system-x/primitives, tokens workspace dep
- `/Users/merlinzuni/develop/packages/primitives/tsconfig.json` - Extends tsconfig.base.json
- `/Users/merlinzuni/develop/packages/primitives/tsup.config.ts` - ESM+CJS, splitting: true, external: [react, react-dom]
- `/Users/merlinzuni/develop/packages/primitives/src/index.ts` - Empty barrel

## Decisions Made

- **packageManager field:** Turborepo v2 requires this field in root package.json to detect workspace manager. Added `"packageManager": "npm@11.11.0"`.
- **tsup file extensions:** With `"type": "module"` in package.json, tsup outputs `.js` for ESM and `.cjs` for CJS (not `.mjs`/`.js` as the plan specified). This is correct tsup behavior.
- **exports map key ordering:** `types` must be the first key in the exports condition map for TypeScript to resolve `.d.ts` declarations. Plan had it last — fixed to come first.
- **tsup at root:** npm workspaces hoists all devDependencies to root `node_modules`. Installing tsup only in each package's local devDeps doesn't create per-package `node_modules` — tsup must be at root so `turbo run build` can invoke it via root `.bin/tsup`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added packageManager field to root package.json**
- **Found during:** Task 3 (turbo run build)
- **Issue:** Turborepo v2 exits with "Could not resolve workspaces. Missing `packageManager` field" without this field
- **Fix:** Added `"packageManager": "npm@11.11.0"` to root package.json
- **Files modified:** package.json
- **Verification:** `turbo run build` succeeds after adding field
- **Committed in:** fb71c33 (Task 3 commit)

**2. [Rule 1 - Bug] Fixed exports map file extensions and types key ordering**
- **Found during:** Task 3 (after turbo run build inspection of dist/)
- **Issue:** Plan specified `"import": "./dist/index.mjs"` and `"require": "./dist/index.js"` but tsup produces `index.js` (ESM) and `index.cjs` (CJS) for `"type": "module"` packages. Also `"types"` key was last — TypeScript requires it first.
- **Fix:** Updated both packages' exports maps to use `./dist/index.js` (ESM), `./dist/index.cjs` (CJS), with `types` as the first condition
- **Files modified:** packages/tokens/package.json, packages/primitives/package.json
- **Verification:** `turbo run build --force` completes with no warnings; dist/ files match exports map
- **Committed in:** fb71c33 (Task 3 commit)

**3. [Rule 3 - Blocking] Installed tsup at root**
- **Found during:** Task 3 (primitives install phase)
- **Issue:** npm workspaces hoists devDependencies to root, but tsup was only declared in per-package devDeps and wasn't being hoisted since packages were installed independently. Root `.bin/tsup` didn't exist.
- **Fix:** Added tsup to root devDependencies via `npm install --save-dev tsup`
- **Files modified:** package.json, package-lock.json
- **Verification:** `/node_modules/.bin/tsup` exists; `turbo run build` invokes it successfully
- **Committed in:** fb71c33 (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking — Turborepo v2 config, 1 bug — exports map, 1 blocking — missing binary)
**Impact on plan:** All auto-fixes required for correct build operation. No scope creep. The exports map fix in particular is important — incorrect file extensions would cause runtime module resolution failures for consumers.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Known Stubs

- `packages/tokens/src/index.ts` - Empty barrel (`export {}`). Intentional: token exports populated in Phase 2 (Style Dictionary pipeline).
- `packages/primitives/src/index.ts` - Empty barrel (`export {}`). Intentional: component exports populated in Phase 6 (primitive components).

These stubs are by design for Phase 1. They will produce valid but empty dist/ artifacts until Phase 2 and Phase 6 populate them.

## Next Phase Readiness

- Root workspace complete — Plan 01-02 (Storybook, ESLint, Changesets) can proceed
- `turbo run build` exits 0 with both packages producing dist/ artifacts
- Workspace symlinks active: `node_modules/@design-system-x/tokens` and `node_modules/@design-system-x/primitives`
- No blockers for Plan 01-02

---
*Phase: 01-monorepo-foundation*
*Completed: 2026-03-22*
