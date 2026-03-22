---
phase: 01-monorepo-foundation
plan: "02"
subsystem: infra
tags: [eslint, storybook, changesets, typescript-eslint, eslint-9, storybook-10, react-vite]

# Dependency graph
requires:
  - phase: 01-monorepo-foundation/01-01
    provides: tsconfig.base.json, npm workspaces with packages/tokens and packages/primitives, turbo.json with lint/dev/build tasks

provides:
  - ESLint 9 flat config (eslint.config.mjs) with typescript-eslint v8 projectService across all packages
  - Storybook 10.3.1 in apps/storybook with @storybook/react-vite framework, addon-docs, addon-a11y, react-docgen-typescript
  - Changesets configured with access: public, baseBranch: main, independent versioning for tokens and primitives

affects:
  - Phase 2 token implementation (all packages linted, versioned, and Storybook ready for token stories)
  - Phase 4 Storybook documentation (apps/storybook stories/ dir ready for content)
  - Release pipeline (changeset publish with public access for @design-system-x/* scoped packages)

# Tech tracking
tech-stack:
  added:
    - eslint@9.39.4 (flat config, not eslint@10 — plugin ecosystem not fully ESLint 10 compatible)
    - typescript-eslint@8.57.1 (unified v8 package with projectService)
    - "@eslint/js@^9.0.0"
    - eslint-plugin-react@7.37.5
    - eslint-plugin-react-hooks@7.0.1
    - eslint-plugin-jsx-a11y@6.10.2
    - storybook@10.3.1 (CLI, hoisted to root)
    - "@storybook/react-vite@10.3.1"
    - "@storybook/addon-docs@10.3.1"
    - "@storybook/addon-a11y@10.3.1"
    - "@chromatic-com/storybook@5.x"
    - eslint-plugin-storybook@10.3.1
    - "@changesets/cli@2.30.x"
  patterns:
    - "ESLint projectService: true replaces old project: [...] array — auto-discovers per-package tsconfig.json"
    - "Global ignores in standalone object (only ignores key) before all other ESLint config objects"
    - "React ESLint rules scoped to files globs (packages/primitives and apps/storybook) not applied globally"
    - "npm workspaces hoists workspace symlinks to root node_modules/@design-system-x/ (not per-package)"
    - "Storybook package named @design-system-x/storybook to avoid npm namespace collision with storybook CLI"
    - "storybook CLI hoisted to root devDependencies so hoisted @storybook/* addons can resolve it"

key-files:
  created:
    - eslint.config.mjs (root ESLint 9 flat config with typescript-eslint v8 projectService)
    - apps/storybook/package.json (Storybook workspace, named @design-system-x/storybook)
    - apps/storybook/.storybook/main.ts (react-vite framework, addon-docs, addon-a11y, reactDocgen)
    - apps/storybook/.storybook/preview.ts (Controls color/date matchers)
    - apps/storybook/tsconfig.json (extends ../../tsconfig.base.json)
    - apps/storybook/stories/ (empty directory, clean slate for Phase 4)
    - .changeset/config.json (access: public, baseBranch: main, linked: [])
    - .changeset/README.md
  modified:
    - package.json (added eslint, typescript-eslint, eslint-plugin-*, storybook, @changesets/cli devDependencies)
    - turbo.json (added storybook-static/** to build outputs)

key-decisions:
  - "ESLint 9 not ESLint 10 — eslint-plugin-react@7.37.5 calls context.getFilename() removed in ESLint 10; stay on ESLint 9 until plugin ecosystem catches up"
  - "apps/storybook package named @design-system-x/storybook — using plain 'storybook' caused npm workspace symlink to shadow the storybook CLI package"
  - "storybook CLI installed at root devDependencies — hoisted addons like @storybook/addon-docs need to resolve storybook from root, not just from apps/storybook"
  - "changeset status requires git >= 2.22 for --no-relative flag; system has git 2.15.0 at /usr/local/bin (changesets-git incompatible) and 2.39.5 at /usr/bin (compatible); run changeset commands with PATH=/usr/bin:$PATH until /usr/local/bin/git is updated"
  - "Changesets access: public set explicitly — default 'restricted' causes 402 errors on npm publish for @scoped packages"
  - "main branch created from master for Changesets baseBranch compatibility"

patterns-established:
  - "Lint scope: packages/tokens and packages/primitives use eslint .; apps/storybook uses eslint stories/**/*.{ts,tsx} --no-error-on-unmatched-pattern (avoids error when stories dir is empty)"
  - "Storybook addons resolved via getAbsolutePath helper (required in npm workspaces monorepo)"

requirements-completed: [INFRA-04, INFRA-05, INFRA-06]

# Metrics
duration: 45min
completed: 2026-03-22
---

# Phase 1 Plan 02: Storybook, ESLint, and Changesets Setup Summary

**ESLint 9 flat config with typescript-eslint v8 projectService, Storybook 10.3.1 react-vite with addon-a11y + react-docgen-typescript, and Changesets with public scoped package access**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-22T13:32:17Z
- **Completed:** 2026-03-22T14:30:00Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments

- ESLint 9 flat config with `projectService: true` for automatic tsconfig discovery across all packages — no per-package ESLint config needed
- Storybook 10.3.1 workspace in apps/storybook with react-vite framework, Autodocs, a11y addon, and TypeScript prop inference via react-docgen-typescript
- Changesets initialized with `access: "public"` (critical for @design-system-x/* scoped packages) and `baseBranch: "main"` with independent versioning
- Full monorepo build + lint + type-check all pass: 3/3 packages in turbo pipeline

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure ESLint 9 flat config** - `a04b2b3` (chore)
2. **Task 2: Initialize Storybook 8 in apps/storybook** - `a1392e5` (feat)
3. **Task 3: Initialize Changesets and run full verification** - `0059b20` (chore)

## Files Created/Modified

- `eslint.config.mjs` — Root ESLint 9 flat config; global ignores, typescript-eslint recommendedTypeChecked, React rules scoped to primitives/storybook, storybook plugin
- `apps/storybook/package.json` — Storybook workspace (named @design-system-x/storybook to avoid npm namespace collision)
- `apps/storybook/.storybook/main.ts` — StorybookConfig with @storybook/react-vite framework, addon-docs, addon-a11y, reactDocgen: 'react-docgen-typescript'
- `apps/storybook/.storybook/preview.ts` — Preview with Controls color/date regex matchers
- `apps/storybook/tsconfig.json` — Extends ../../tsconfig.base.json, includes stories and .storybook
- `apps/storybook/stories/` — Empty directory (example stories removed)
- `.changeset/config.json` — access: public, baseBranch: main, linked: [], updateInternalDependencies: patch
- `package.json` — Added ESLint, storybook, changesets devDependencies; storybook hoisted to root
- `turbo.json` — Added storybook-static/** to build outputs

## Decisions Made

- **ESLint 9 not 10:** `eslint-plugin-react@7.37.5` calls `context.getFilename()` which was removed in ESLint 10. Downgraded from accidentally-installed ESLint 10 to ESLint 9 as the plan specified.
- **@design-system-x/storybook package name:** Naming the workspace package "storybook" caused npm workspaces to create a symlink at root `node_modules/storybook` pointing to the workspace, shadowing the actual `storybook` CLI package. Renamed to `@design-system-x/storybook` to resolve.
- **storybook CLI at root:** After fixing the name conflict, `@storybook/addon-docs` and other addons hoisted to root still couldn't resolve `storybook/internal/...` because the CLI was only in `apps/storybook/node_modules`. Added `storybook@^10.3.1` to root devDependencies.
- **main branch created:** `baseBranch: "main"` requires `main` to exist as a git ref. Created `main` branch from `master`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Downgraded ESLint from 10 to 9**
- **Found during:** Task 1 (Configure ESLint 9 flat config)
- **Issue:** npm installed ESLint 10 (`eslint@"*"` resolves to latest). `eslint-plugin-react@7.37.5` uses `context.getFilename()` removed in ESLint 10 — `turbo run lint` exited 2 with `TypeError: contextOrFilename.getFilename is not a function`
- **Fix:** Pinned `eslint@9` explicitly with `npm install --save-dev eslint@9`; also downgraded `@eslint/js` from `^10.0.1` to `^9.0.0`
- **Files modified:** package.json, package-lock.json
- **Verification:** `turbo run lint` exits 0 across all 3 packages
- **Committed in:** a04b2b3 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed Storybook package name collision with npm CLI**
- **Found during:** Task 2 (Initialize Storybook)
- **Issue:** Workspace package named `"name": "storybook"` caused npm to symlink `node_modules/storybook -> ../../apps/storybook` (the workspace, v0.0.0), shadowing the actual `storybook` CLI (v10.3.1). Addons loaded from root couldn't find `storybook/internal/node-logger`.
- **Fix:** Renamed workspace package to `@design-system-x/storybook`; added `storybook@^10.3.1` to root devDependencies so hoisted addons resolve it correctly
- **Files modified:** apps/storybook/package.json, package.json
- **Verification:** `turbo run build` exits 0 with "Storybook build completed successfully"
- **Committed in:** a1392e5 (Task 2 commit)

**3. [Rule 2 - Missing Critical] Added storybook-static/** to turbo build outputs**
- **Found during:** Task 2 (Storybook build)
- **Issue:** Turbo warned "no output files found for task @design-system-x/storybook#build" — turbo.json only tracked `dist/**` but Storybook outputs to `storybook-static/`
- **Fix:** Added `storybook-static/**` to turbo.json build outputs array
- **Files modified:** turbo.json
- **Verification:** Warning removed; turbo caches storybook-static correctly
- **Committed in:** a1392e5 (Task 2 commit)

**4. [Rule 3 - Blocking] Fixed storybook lint script for empty stories directory**
- **Found during:** Task 2 (ESLint in storybook workspace)
- **Issue:** `eslint .` in storybook workspace fails with "all files matching '.' are ignored" because `.storybook/**` is in global ignores and `stories/` is empty
- **Fix:** Changed lint script to `eslint stories/**/*.{ts,tsx} --no-error-on-unmatched-pattern`
- **Files modified:** apps/storybook/package.json
- **Verification:** `turbo run lint` exits 0 across all 3 packages
- **Committed in:** a1392e5 (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (2 bugs, 1 missing critical, 1 blocking)
**Impact on plan:** All auto-fixes required for correctness. ESLint version issue was caused by npm resolving `"*"` to latest (10) instead of stable (9). Package naming and storybook hoisting were monorepo workspace resolution issues not covered in the research. No scope creep.

## Issues Encountered

- **git 2.15.0 at /usr/local/bin incompatible with @changesets/git:** The `@changesets/git` package uses `git diff --name-only --no-relative` which requires Git >= 2.22. The system has Git 2.39.5 at `/usr/bin/git` but the PATH puts `/usr/local/bin/git` (2.15.0) first. Workaround: `PATH=/usr/bin:$PATH npx changeset status` works correctly. This is an environment configuration issue, not a changeset config issue. Team members with current Git versions will not encounter this.

## User Setup Required

None — no external service configuration required. The git PATH issue above is an existing environment quirk, not a new configuration step.

## Next Phase Readiness

- Phase 1 complete: all INFRA requirements (01-06) addressed
- Phase 2 (Token Implementation) can begin: packages/tokens is ready for Style Dictionary configuration
- Storybook is ready for token stories in Phase 2/4
- Changesets ready for first version bump after Phase 2 ships publishable packages
- Known: `changeset status` requires running with `/usr/bin/git` in PATH on this machine until `/usr/local/bin/git` is updated to >= 2.22

---
*Phase: 01-monorepo-foundation*
*Completed: 2026-03-22*
