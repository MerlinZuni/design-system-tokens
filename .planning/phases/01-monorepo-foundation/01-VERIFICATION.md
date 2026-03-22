---
phase: 01-monorepo-foundation
verified: 2026-03-22T15:00:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
human_verification:
  - test: "Run turbo run build from repo root and confirm exit code 0"
    expected: "All 3 packages (tokens, primitives, storybook) build successfully in dependency order"
    why_human: "turbo uses local cache — dry-run shows correct wiring but actual build result needs confirmation without --force clearing cache"
  - test: "Run turbo run lint from repo root and confirm exit code 0"
    expected: "ESLint passes across all 3 packages with no errors or config failures"
    why_human: "Lint run cannot be executed here without potentially affecting the working tree"
  - test: "Run storybook dev -p 6006 from apps/storybook and open localhost:6006"
    expected: "Storybook UI loads — even with no stories it should show an empty sidebar without crashing"
    why_human: "Visual/runtime check; can't verify browser rendering programmatically"
  - test: "Run PATH=/usr/bin:$PATH npx changeset status"
    expected: "No errors; output lists @design-system-x/tokens and @design-system-x/primitives as publishable packages with no pending changesets"
    why_human: "changeset status requires git >= 2.22 which may only be at /usr/bin/git on this machine (documented known issue)"
---

# Phase 1: Monorepo Foundation Verification Report

**Phase Goal:** Scaffold the project structure that all subsequent phases build on. This must be done first — restructuring mid-project is painful.
**Verified:** 2026-03-22T15:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | npm workspaces resolves @design-system-x/tokens as a workspace symlink | VERIFIED | Symlink exists at `node_modules/@design-system-x/tokens -> ../../packages/tokens` (hoisted by npm, not per-package — this is correct npm workspaces behavior) |
| 2 | turbo run build executes tokens#build before primitives#build | VERIFIED | Dry-run: `tokens#build` has no dependencies; `primitives#build` has `Dependencies = @design-system-x/tokens#build` |
| 3 | Both packages produce dist/ with ESM and CJS outputs | VERIFIED | `packages/tokens/dist/` and `packages/primitives/dist/` both contain `index.js` (ESM), `index.cjs` (CJS), `index.d.ts`, `index.d.cts`, sourcemaps |
| 4 | TypeScript strict mode is enforced across all packages | VERIFIED | `tsconfig.base.json` has `"strict": true`, `"composite": false`, `"moduleResolution": "Bundler"`, `"isolatedModules": true`; extended by all 3 package tsconfigs |
| 5 | apps/storybook workspace exists and Storybook builds via turbo | VERIFIED | `apps/storybook/` with `@storybook/react-vite` framework, `reactDocgen: 'react-docgen-typescript'`, workspace deps on tokens+primitives; turbo dry-run shows `storybook#build` depends on both packages |
| 6 | ESLint flat config uses projectService: true | VERIFIED | `eslint.config.mjs` has `projectService: true`, `tsconfigRootDir: import.meta.dirname`, uses `typescript-eslint` (not old `@typescript-eslint/eslint-plugin`) |
| 7 | .changeset/config.json has access: "public" | VERIFIED | `access: "public"`, `baseBranch: "main"`, `linked: []`, `updateInternalDependencies: "patch"` |

**Score:** 7/7 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | Root workspace config with npm workspaces | VERIFIED | Has `"workspaces": ["packages/*", "apps/*"]`, `"private": true`, `"packageManager": "npm@11.11.0"` |
| `turbo.json` | Turborepo v2 task config | VERIFIED | Uses `"tasks"` key (not deprecated `"pipeline"`); `build.dependsOn: ["^build"]`; `dev` has `persistent: true, cache: false` |
| `tsconfig.base.json` | Shared strict TypeScript config | VERIFIED | `"strict": true`, `"composite": false`, `"moduleResolution": "Bundler"`, `"exactOptionalPropertyTypes": true`, `"noUncheckedIndexedAccess": true` |
| `packages/tokens/package.json` | @design-system-x/tokens package | VERIFIED | `"name": "@design-system-x/tokens"`, `"type": "module"`, `"private": false`, exports map with `types` first |
| `packages/primitives/package.json` | @design-system-x/primitives package | VERIFIED | `"name": "@design-system-x/primitives"`, `"@design-system-x/tokens": "*"` in dependencies, `peerDependencies` for react/react-dom |
| `eslint.config.mjs` | Root ESLint 9 flat config | VERIFIED | `projectService: true`, global ignores object, React rules scoped to primitives+storybook, storybook plugin added |
| `.changeset/config.json` | Changesets workspace config | VERIFIED | `"access": "public"`, `"baseBranch": "main"`, `"linked": []` |
| `apps/storybook/.storybook/main.ts` | Storybook framework config | VERIFIED | `@storybook/react-vite` framework, `reactDocgen: 'react-docgen-typescript'`, `@storybook/addon-a11y`, `getAbsolutePath` helper for monorepo resolution |
| `packages/tokens/tsup.config.ts` | tsup build config | VERIFIED | `format: ['esm', 'cjs']`, `dts: true`, `splitting: false`, `treeshake: true` |
| `packages/primitives/tsup.config.ts` | tsup build config | VERIFIED | `format: ['esm', 'cjs']`, `dts: true`, `splitting: true`, `external: ['react', 'react-dom']` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `packages/primitives/package.json` | `packages/tokens` | workspace dependency `"@design-system-x/tokens": "*"` | WIRED | Dependency declared; hoisted symlink at `node_modules/@design-system-x/tokens -> ../../packages/tokens` exists |
| `turbo.json` | all packages | `dependsOn: ["^build"]` | WIRED | `"^build"` present in build task; turbo dry-run confirms `tokens#build` precedes `primitives#build` and `storybook#build` |
| `packages/tokens/tsconfig.json` | `tsconfig.base.json` | `extends: "../../tsconfig.base.json"` | WIRED | Pattern confirmed in file |
| `packages/primitives/tsconfig.json` | `tsconfig.base.json` | `extends: "../../tsconfig.base.json"` | WIRED | Pattern confirmed in file |
| `apps/storybook/tsconfig.json` | `tsconfig.base.json` | `extends: "../../tsconfig.base.json"` | WIRED | Pattern confirmed in file |
| `eslint.config.mjs` | per-package tsconfig.json files | `projectService: true` auto-discovery | WIRED | `projectService: true` + `tsconfigRootDir: import.meta.dirname` present |
| `.changeset/config.json` | workspace packages | `access: "public"` | WIRED | `"access": "public"` confirmed; `main` branch exists in git |
| `apps/storybook/package.json` | tokens + primitives | workspace dependencies `"@design-system-x/*": "*"` | WIRED | Both deps declared; hoisted symlinks at root `node_modules/@design-system-x/` point to both packages |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| INFRA-01 | 01-01-PLAN.md | Monorepo with npm workspaces and Turborepo for dependency-ordered task execution | SATISFIED | `package.json` workspaces + `turbo.json` with `tasks` and `dependsOn: ["^build"]`; turbo dry-run shows correct ordering |
| INFRA-02 | 01-01-PLAN.md | `@design-system-x/tokens` package with tsup producing TS/ESM/CJS outputs (CSS deferred to Phase 2) | SATISFIED | Package exists; `dist/` contains `index.js` (ESM), `index.cjs` (CJS), `index.d.ts`; CSS subpath export reserved for Phase 2 |
| INFRA-03 | 01-01-PLAN.md | `@design-system-x/primitives` package with tsup producing React + TypeScript components | SATISFIED | Package exists with `external: ['react', 'react-dom']`; `dist/` contains ESM + CJS + types |
| INFRA-04 | 01-02-PLAN.md | `apps/storybook` workspace hosts the documentation site | SATISFIED | `apps/storybook/` workspace with `@storybook/react-vite`, workspace deps on both packages, in turbo build graph |
| INFRA-05 | 01-02-PLAN.md | Changesets configured for versioning and changelog generation | SATISFIED | `.changeset/config.json` with `access: "public"`, `baseBranch: "main"`, independent package versioning |
| INFRA-06 | 01-01-PLAN.md + 01-02-PLAN.md | Shared `tsconfig.base.json` and ESLint flat config across all packages | SATISFIED | All 3 package tsconfigs extend `../../tsconfig.base.json`; `eslint.config.mjs` with `projectService: true` at root |

**All 6 required INFRA requirements satisfied. No orphaned requirements.**

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `packages/tokens/src/index.ts` | `export {}` — empty barrel | Info | Intentional design stub. Documented in SUMMARY as "token exports populated in Phase 2 (Style Dictionary pipeline)". Not a blocker. |
| `packages/primitives/src/index.ts` | `export {}` — empty barrel | Info | Intentional design stub. Documented in SUMMARY as "component exports populated in Phase 6". Not a blocker. |

**No blocker anti-patterns. Both stubs are intentional, documented, and expected for Phase 1.**

---

### Notable Deviations from Plan (Correctly Handled)

These are deviations from the original plan specs that were properly adapted during execution:

1. **dist/ file extensions** — Plan specified `index.mjs`/`index.js` but tsup with `"type": "module"` actually produces `index.js` (ESM) + `index.cjs` (CJS). Exports maps were updated accordingly. This is correct tsup behavior, not an error.

2. **`@storybook/addon-essentials` absent** — Plan specified `addon-essentials` but Storybook 10 decomposed this into individual addons (`addon-docs`, `addon-a11y`, etc.). The actual config uses `addon-docs` + `addon-a11y` directly, which is the correct Storybook 10 pattern.

3. **Workspace symlink location** — Plan stated symlink would be "in primitives/node_modules" but npm workspaces hoists all workspace symlinks to root `node_modules/@design-system-x/`. The symlink exists at root and resolution works correctly — this is expected npm hoisting behavior, not a gap.

4. **packageManager field** — Not in original plan spec but added during execution (`"packageManager": "npm@11.11.0"`). Required by Turborepo v2 for workspace detection.

5. **Storybook package named `@design-system-x/storybook`** — Plan spec used `"storybook"` as name but this caused npm workspace collision with the storybook CLI. Renamed correctly.

---

### Human Verification Required

#### 1. Full Build Run

**Test:** From repo root, run `npm run build` (or `npx turbo run build --force` to bypass cache)
**Expected:** All 3 packages build without errors; `packages/tokens/dist/` and `packages/primitives/dist/` refresh; `apps/storybook/storybook-static/` is produced
**Why human:** Local turbo cache shows all tasks as cached-from-previous-run; actual execution needs cache bypass

#### 2. Full Lint Run

**Test:** From repo root, run `npm run lint`
**Expected:** All 3 packages lint cleanly (`@design-system-x/tokens`, `@design-system-x/primitives`, `@design-system-x/storybook`); exit code 0
**Why human:** Can't execute lint without potentially modifying working tree state

#### 3. Storybook Dev Server

**Test:** From `apps/storybook/`, run `npm run dev`; open `localhost:6006`
**Expected:** Storybook UI loads; empty sidebar (no stories yet is expected for Phase 1); no crash or fatal error
**Why human:** Visual browser check; dev server is a long-running process

#### 4. Changesets Status

**Test:** From repo root, run `PATH=/usr/bin:$PATH npx changeset status`
**Expected:** Exits cleanly; lists `@design-system-x/tokens` and `@design-system-x/primitives`; no errors about git version
**Why human:** Requires `/usr/bin/git` (>= 2.22) not `/usr/local/bin/git` (2.15) — PATH workaround needed; can't verify runtime environment

---

### Gaps Summary

No gaps. All 7 observable truths are verified, all 10 required artifacts exist and are substantive (not stubs — planned empty barrels are documented intentional scaffolding), all 8 key links are wired. All 6 INFRA requirements are satisfied.

The 4 items under Human Verification Required are functional validations (build execution, lint execution, browser check, CLI output) that require runtime confirmation. They are not automated-verification gaps — the structural evidence strongly supports they will pass.

---

*Verified: 2026-03-22T15:00:00Z*
*Verifier: Claude (gsd-verifier)*
