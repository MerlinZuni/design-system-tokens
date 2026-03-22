# Phase 1: Monorepo Foundation — Research

**Researched:** 2026-03-22
**Domain:** npm workspaces + Turborepo v2 + tsup + ESLint 9 flat config + Changesets + TypeScript strict
**Confidence:** HIGH (stack verified against npm registry live versions; config patterns verified against current official docs)

---

## Summary

Phase 1 scaffolds the structural skeleton that every subsequent phase depends on. The technical domain is mature: npm workspaces, Turborepo, tsup, and Changesets are all stable tools with well-documented patterns. The main risk is getting the ordering and configuration details wrong at setup — these are hard to refactor mid-project because every subsequent package inherits from this foundation.

The key tension to resolve is TypeScript project references vs. path aliases. tsup does NOT natively understand TypeScript project references (it uses esbuild for transpilation, not `tsc --build`). The recommended approach for this stack is: use `composite: false`, use `dts: true` in tsup (which invokes `tsc` behind the scenes for declaration file generation), and rely on npm workspaces symlinks for package resolution — not TypeScript paths. This is the pattern used by Radix, Chakra, and Carbon.

Storybook 8 in a Turborepo workspace requires the `dev` task to be marked `persistent: true` and `cache: false` in turbo.json, or the dev server will terminate immediately after Turborepo considers the task "complete". This is the most commonly reported gotcha for Turborepo + Storybook setups.

ESLint 9 flat config with `projectService: true` (typescript-eslint v8) requires no additional monorepo-specific configuration — it discovers per-package tsconfig.json files automatically. This is a significant simplification over the older `parserOptions.project` array approach.

**Primary recommendation:** Initialize the root workspace first, then add Turborepo, then scaffold packages in build-dependency order (tokens before primitives), and add Changesets last (after the packages are publishing-ready).

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Monorepo scaffolded with npm workspaces and Turborepo for dependency-ordered task execution | Turborepo v2.8.20 task pipeline with `dependsOn: ["^build"]` handles workspace-aware ordering |
| INFRA-02 | `@design-system-x/tokens` package with tsup build producing CSS and TypeScript outputs | tsup v8.5.1 dual ESM+CJS with `dts: true`; CSS output is Style Dictionary output, not tsup-processed |
| INFRA-03 | `@design-system-x/primitives` package with tsup build producing React + TypeScript components | tsup v8.5.1 with `external: ['react', 'react-dom']` and `splitting: true` |
| INFRA-04 | `apps/storybook` workspace hosts documentation site, separate from library packages | Storybook 8.6 with `@storybook/react-vite`; `persistent: true` in turbo.json dev task |
| INFRA-05 | Changesets configured for versioning and changelog generation across workspaces | `@changesets/cli` v2.30.0; `access: "public"` required for scoped public packages |
| INFRA-06 | Shared `tsconfig.base.json` and ESLint flat config used across all packages | ESLint 9 + typescript-eslint v8 `projectService: true`; tsconfig inheritance via `extends` |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| turbo | 2.8.20 | Task runner, caching, dependency-ordered builds | De facto standard for npm/pnpm monorepo task orchestration; Vercel-maintained |
| tsup | 8.5.1 | Library bundler (ESM+CJS+.d.ts) | Minimal config, esbuild speed, designed for publishing libraries |
| @changesets/cli | 2.30.0 | Versioning + changelog across workspaces | Workspace-aware; used by Radix, Chakra, Remix |
| eslint | 10.1.0 | Linting | Current stable; flat config default since v9 |
| typescript | 5.9.3 | Language | Current stable |
| typescript-eslint | 8.57.1 | TypeScript rules for ESLint | Official TS-ESLint integration; `projectService` eliminates monorepo config complexity |
| react | 19.2.4 | Peer dependency for primitives package | Current stable |

> Note: `typescript-eslint` v8 is the unified package that replaces the older `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` pair. Install only `typescript-eslint` — it re-exports both.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| storybook | 10.3.1 | Documentation app (apps/storybook) | Not published to npm; Storybook v8 CLI is `storybook` package |
| @storybook/react-vite | 10.3.1 | Storybook framework + Vite builder | React projects; faster HMR than Webpack builder |
| @storybook/addon-essentials | 8.6.14 | Controls, Actions, Docs, Viewport, Backgrounds | Standard addon bundle |
| @storybook/addon-a11y | 10.3.1 | Accessibility checking | Non-negotiable for a design system |
| vite | 8.0.1 | Required by @storybook/react-vite | Storybook 8 requires Vite ≥ 5 |
| eslint-plugin-react | 7.37.5 | React-specific lint rules | React projects |
| eslint-plugin-react-hooks | 7.0.1 | Hooks rules enforcement | React projects using hooks |
| eslint-plugin-jsx-a11y | 6.10.2 | Accessibility lint rules | Non-negotiable for a design system |

**Version verification:** All versions above were verified against the npm registry on 2026-03-22 using `npm view [package] version`.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| turbo | Nx | Nx has 3x configuration surface; appropriate at 20+ packages, not at 2-3 |
| tsup | Rollup | Rollup is more powerful for complex chunk splitting; unnecessary at v1 scope |
| tsup | tsc --build | tsc only, no bundling; requires consumers to have matching TypeScript config. tsup gives you the bundle + tsc-generated .d.ts |
| @changesets/cli | semantic-release | semantic-release is not workspace-aware; in maintenance mode |
| npm workspaces | pnpm workspaces | pnpm is faster but adds a new tool. npm workspaces is sufficient for 2-3 packages |

**Installation (root devDependencies):**
```bash
npm install --save-dev turbo @changesets/cli eslint typescript typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y
```

**Installation (packages/tokens devDependencies):**
```bash
npm install --save-dev tsup typescript
```

**Installation (packages/primitives devDependencies):**
```bash
npm install --save-dev tsup typescript
npm install --save-peer react react-dom
```

**Installation (apps/storybook):**
```bash
npx storybook@latest init
# Choose: React + Vite builder
# Then install additional addons:
npm install --save-dev @storybook/addon-a11y
```

---

## Architecture Patterns

### Recommended Project Structure

```
design-system-x/
├── package.json              # private: true, workspaces: ["packages/*", "apps/*"]
├── turbo.json                # task pipeline (build, dev, lint, test)
├── tsconfig.base.json        # strict TS base, extended by all packages
├── eslint.config.mjs         # ESLint 9 flat config, applies to entire repo
├── .changeset/
│   └── config.json           # Changesets config
├── packages/
│   ├── tokens/               # @design-system-x/tokens
│   │   ├── package.json
│   │   ├── tsconfig.json     # extends ../../tsconfig.base.json
│   │   ├── tsup.config.ts
│   │   └── src/
│   │       └── index.ts      # bare barrel for Phase 1 (token exports come in Phase 2)
│   └── primitives/           # @design-system-x/primitives
│       ├── package.json      # peerDeps: react, react-dom; deps: @design-system-x/tokens
│       ├── tsconfig.json     # extends ../../tsconfig.base.json
│       ├── tsup.config.ts
│       └── src/
│           └── index.ts      # bare barrel for Phase 1
└── apps/
    └── storybook/            # NOT published to npm
        ├── package.json
        ├── .storybook/
        │   ├── main.ts
        │   └── preview.ts
        └── stories/          # empty in Phase 1
```

### Pattern 1: Root turbo.json (Turborepo v2 format)

**What:** The `tasks` key (not `pipeline`) is the v2 format. `pipeline` was the v1 key — using it in v2 will emit deprecation warnings.
**When to use:** Always; this is the v2 API.

```jsonc
// turbo.json
// Source: https://turborepo.dev/repo/docs/reference/configuration
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "inputs": ["src/**", "tsup.config.ts", "tsconfig.json", "package.json"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

Key points:
- `"^build"` means "all workspace dependencies must complete their `build` task first" — this is what makes `primitives#build` wait for `tokens#build` automatically
- `persistent: true` on `dev` is REQUIRED for Storybook (and any long-running dev server). Without it, Turborepo marks the task done immediately and may kill the process
- `cache: false` on `dev` prevents Turborepo from caching a task that never terminates cleanly

### Pattern 2: tsup config for packages/tokens/

**What:** Dual ESM+CJS output with `.d.ts` generation. CSS files are NOT processed by tsup — Style Dictionary outputs them directly to `dist/css/` (Phase 2 concern). Phase 1 scaffold needs only the tsup config to be present.
**When to use:** All publishable library packages.

```typescript
// packages/tokens/tsup.config.ts
// Source: tsup documentation + npm registry (v8.5.1)
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,          // generates .d.ts files via tsc (separate pass from esbuild)
  clean: true,        // clean dist/ before each build
  sourcemap: true,
  splitting: false,   // tokens package: no code splitting needed; single flat export
  treeshake: true,
})
```

### Pattern 3: tsup config for packages/primitives/

**What:** Same dual output but with React peer deps externalized and code splitting enabled for tree-shaking.
**When to use:** React component packages.

```typescript
// packages/primitives/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,    // per-component chunks for tree-shaking by consumers
  treeshake: true,
  external: ['react', 'react-dom'],  // NEVER bundle peer deps — consumers provide them
})
```

### Pattern 4: package.json exports field

**What:** The `exports` field is mandatory for correct ESM/CJS dual resolution. Without it, bundlers fall back to the `main` field (CJS) even when the consumer is ESM.
**When to use:** Both packages/tokens and packages/primitives.

```json
// packages/tokens/package.json
{
  "name": "@design-system-x/tokens",
  "version": "0.0.0",
  "private": false,
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./css": "./dist/css/tokens.css"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

```json
// packages/primitives/package.json
{
  "name": "@design-system-x/primitives",
  "version": "0.0.0",
  "private": false,
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "@design-system-x/tokens": "*"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

The `"@design-system-x/tokens": "*"` dependency with `*` version specifier is correct for workspace packages — npm workspaces resolves it to the local package automatically.

### Pattern 5: tsconfig.base.json

**What:** Strict TypeScript base config extended by all packages. `composite: false` because tsup — not `tsc --build` — drives compilation.
**When to use:** Root of the monorepo; each package's tsconfig.json uses `extends`.

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "composite": false
  }
}
```

Key options explained:
- `moduleResolution: "Bundler"` — correct for esbuild/Vite based toolchains; avoids requiring `.js` extensions on imports
- `isolatedModules: true` — required for tsup's esbuild transpilation (each file compiled independently)
- `exactOptionalPropertyTypes: true` — catches `undefined` assigned to `T | undefined` (catches token lookup bugs)
- `noUncheckedIndexedAccess: true` — forces safe array/object access (important for token map lookups)
- `composite: false` — do NOT set to `true`; tsup manages builds, not `tsc --build`

**Per-package tsconfig.json:**

```json
// packages/tokens/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

```json
// packages/primitives/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

> Do NOT use TypeScript `references` array in the package tsconfigs when using tsup. Project references require `composite: true`, which conflicts with tsup's esbuild pipeline for transpilation. npm workspaces symlinks handle cross-package resolution at build time.

### Pattern 6: ESLint 9 flat config

**What:** Single root `eslint.config.mjs` that covers all packages. ESLint 9's file-discovery model searches up from each file — one root config covers everything. `projectService: true` (typescript-eslint v8) discovers per-package tsconfig.json files automatically.
**When to use:** Entire monorepo from a single root config file.

```javascript
// eslint.config.mjs
// Source: https://typescript-eslint.io/troubleshooting/typed-linting/monorepos/
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'

export default tseslint.config(
  // Global ignores — no other keys in this object
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.storybook/**',
      '**/storybook-static/**',
      '**/*.config.ts',
      '**/*.config.mjs',
    ],
  },
  // Base rules for all TS/TSX files
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,                // discovers per-package tsconfig.json automatically
        tsconfigRootDir: import.meta.dirname, // absolute path anchor for discovery
      },
    },
  },
  // React-specific rules for packages/primitives and apps/storybook
  {
    files: ['packages/primitives/**/*.{ts,tsx}', 'apps/storybook/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // not needed with react-jsx transform
    },
    settings: {
      react: { version: 'detect' },
    },
  },
)
```

### Pattern 7: Changesets config

**What:** Changesets generates changelogs and version bumps per-package, understanding workspace inter-dependencies. `access: "public"` is required to publish scoped npm packages (`@design-system-x/...`) without the `--access=public` flag on every publish.
**When to use:** After packages are scaffolded.

```bash
# Run at repo root
npx changeset init
```

Then edit `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

Key settings:
- `"access": "public"` — required for `@scoped/package` names on public npm (default `"restricted"` will reject publish)
- `"linked": []` — tokens and primitives should version INDEPENDENTLY; do not link them
- `"updateInternalDependencies": "patch"` — when tokens bumps, primitives' dependency range auto-updates to match
- `"commit": false` — prefer manual commits with conventional commit messages

### Pattern 8: Root package.json

```json
// package.json (root)
{
  "name": "design-system-x",
  "version": "0.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build && changeset publish"
  },
  "devDependencies": {
    "turbo": "2.8.20",
    "@changesets/cli": "2.30.0",
    "eslint": "10.1.0",
    "typescript": "5.9.3",
    "typescript-eslint": "8.57.1",
    "eslint-plugin-react": "7.37.5",
    "eslint-plugin-react-hooks": "7.0.1",
    "eslint-plugin-jsx-a11y": "6.10.2"
  }
}
```

### Pattern 9: Storybook workspace setup

**What:** Storybook 8 is initialized in `apps/storybook/` as an app workspace. It depends on the packages in `packages/` but is NOT published.

```typescript
// apps/storybook/.storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript', // REQUIRED for full TypeScript prop inference
  },
}

export default config
```

```json
// apps/storybook/package.json
{
  "name": "storybook",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "storybook build",
    "lint": "eslint ."
  },
  "devDependencies": {
    "@storybook/react-vite": "10.3.1",
    "@storybook/addon-essentials": "8.6.14",
    "@storybook/addon-a11y": "10.3.1",
    "storybook": "10.3.1",
    "vite": "8.0.1"
  },
  "dependencies": {
    "@design-system-x/tokens": "*",
    "@design-system-x/primitives": "*"
  }
}
```

> The `storybook dev` script maps to Turborepo's `dev` task. With `persistent: true` in turbo.json, Turborepo will keep the process alive correctly.

### Anti-Patterns to Avoid

- **Using `paths` in tsconfig for cross-package resolution:** npm workspaces symlinks handle this. `paths` create a second resolution mechanism that diverges from how consumers experience the package. Use `@design-system-x/tokens` by its actual name.
- **Setting `composite: true` in tsconfig.base.json with tsup:** tsup uses esbuild for transpilation and invokes tsc separately for `.d.ts` generation. `composite: true` is only for `tsc --build` workflows; mixing them causes confusing errors.
- **Forgetting `persistent: true` on the `dev` turbo task:** Without it, `turbo run dev` kills the Storybook dev server after starting it.
- **Using `"pipeline"` key instead of `"tasks"` in turbo.json:** `pipeline` is the Turborepo v1 key. In v2, `tasks` is correct. Using `pipeline` will still work but emits deprecation warnings.
- **Setting `"access": "restricted"` (the default) with scoped public packages:** Changesets init sets `"restricted"` by default. You must change it to `"public"` for `@design-system-x/...` packages.
- **Installing `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` separately:** These are now unified in the `typescript-eslint` package (v8). Installing both the old and new packages causes rule conflicts.
- **Putting stories inside packages/primitives/:** Keep stories in `apps/storybook/`. Stories in library packages create cache confusion in turbo.json (a story change would invalidate the library build cache).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Workspace dependency ordering | Custom build scripts with topological sort | Turborepo `dependsOn: ["^build"]` | Turborepo walks the dependency graph automatically; hand-rolled scripts miss transitive deps |
| Dual ESM+CJS output | Custom Rollup config with separate ESM and CJS passes | tsup `format: ['esm', 'cjs']` | tsup handles the format variants, conditional exports, and .d.ts generation in a single config |
| TypeScript declarations for published packages | `tsc --emitDeclarationOnly` as a separate script step | tsup `dts: true` | tsup invokes tsc for .d.ts in the correct context; manual tsc-only runs can miss tsup's entry resolution |
| Changelog generation | Custom scripts reading git log | Changesets `changeset add` + `changeset version` | Changesets understands workspace graph; generates per-package CHANGELOG.md with correct dep update entries |
| Package linking in development | `npm link` per package | npm workspaces `"*"` version specifier | npm install at root automatically symlinks all workspace packages; npm link is error-prone and doesn't survive clean installs |

**Key insight:** Every tool in this stack was built specifically to solve the problem it's solving. The hand-rolled alternatives consistently miss edge cases around caching, incremental builds, and workspace dependency graphs.

---

## Common Pitfalls

### Pitfall 1: `turbo run dev` kills Storybook immediately

**What goes wrong:** Running `turbo run dev` starts the Storybook dev server, which then exits immediately with no error message.
**Why it happens:** Turborepo marks a task "complete" when the process exits with code 0. `storybook dev` is a long-running server process. Without `persistent: true`, Turborepo treats process termination as task completion and may kill it.
**How to avoid:** Set `persistent: true` and `cache: false` on the `dev` task in turbo.json (see Pattern 1 above).
**Warning signs:** `turbo run dev` exits cleanly within 1-2 seconds with no port bound.

### Pitfall 2: tsup `dts: true` fails in monorepo with "TS6307: File is not under rootDir"

**What goes wrong:** tsup builds the JS output successfully but fails when generating .d.ts files, with error `TS6307: File is not listed within the file list of project`.
**Why it happens:** tsup's dts generation invokes `tsc` in a context where the tsconfig's `include` doesn't match the files tsup is trying to type-check. Common in monorepos when the tsconfig.json has a restrictive `include: ["src"]` but tsup tries to resolve types from sibling packages.
**How to avoid:** In each package tsconfig.json, do NOT set `rootDir` in the base config — set it only in the per-package tsconfig. Keep `include: ["src"]` per package. Ensure peer dependencies are in `peerDependencies`, not `dependencies`, and that the workspace package is installed (npm install at root).
**Warning signs:** Build output has `.js` and `.mjs` files but no `.d.ts` files, or build fails with TS6307.

### Pitfall 3: Scoped packages fail to publish with "payment required"

**What goes wrong:** `changeset publish` fails with npm error 402 "You must sign up for private packages".
**Why it happens:** npm treats scoped packages (`@org/package`) as private by default. Private packages require a paid npm Organization plan. The fix is to set `"access": "public"` in `.changeset/config.json`.
**How to avoid:** Set `"access": "public"` immediately after `changeset init`. Alternatively, add `"publishConfig": { "access": "public" }` to each package's package.json — this takes precedence over the Changesets config.
**Warning signs:** This only manifests at publish time; everything else (versioning, changelogs) works correctly.

### Pitfall 4: `moduleResolution: "Bundler"` causes issues with tools that expect Node resolution

**What goes wrong:** Some tools (older ESLint plugins, jest without configuration) cannot resolve imports when `moduleResolution: "Bundler"` is set.
**Why it happens:** `"Bundler"` resolution expects a bundler (esbuild, Vite, Webpack) to handle final resolution. Tools that use Node's require() directly don't understand this mode.
**How to avoid:** Use `"Bundler"` in the main tsconfig.base.json (for tsup/Vite builds). If a tool requires Node resolution, override it in a tool-specific tsconfig (e.g., `tsconfig.eslint.json` with `moduleResolution: "Node16"`). For this project with ESLint 9 + typescript-eslint `projectService`, this is unlikely to be an issue.
**Warning signs:** ESLint errors like "Cannot find module" that don't appear during the tsup build.

### Pitfall 5: Changeset `baseBranch` mismatch

**What goes wrong:** `changeset status` reports no changes even though you've added changesets, or fails with "Could not find commit in branch".
**Why it happens:** The default `baseBranch` in `changeset init` is `"master"`. If your repo uses `"main"`, Changesets compares against the wrong branch.
**How to avoid:** Set `"baseBranch": "main"` in `.changeset/config.json` immediately after init.
**Warning signs:** `changeset status` output mentions no packages changed even when changesets exist.

### Pitfall 6: `eslint-plugin-react-hooks` v7 has a different import path

**What goes wrong:** Importing react-hooks plugin with the old `eslint-plugin-react-hooks` package name works but using the `configs.recommended` property fails.
**Why it happens:** `eslint-plugin-react-hooks` v5+ changed the config exports for ESLint 9 flat config. The `configs.recommended` property now exports a flat config compatible object.
**How to avoid:** Use `reactHooksPlugin.configs.recommended.rules` and spread into the `rules` object (as shown in Pattern 6 above), not `...reactHooksPlugin.configs.recommended` directly.
**Warning signs:** ESLint config errors about "property rules is not an array".

---

## Code Examples

### Root package.json workspace declaration
```json
{
  "name": "design-system-x",
  "private": true,
  "workspaces": ["packages/*", "apps/*"]
}
```

### Minimal tokens package index (Phase 1 bare scaffold)
```typescript
// packages/tokens/src/index.ts
// Empty barrel for Phase 1 — token exports populated in Phase 2
export {}
```

### Minimal primitives package index (Phase 1 bare scaffold)
```typescript
// packages/primitives/src/index.ts
// Empty barrel for Phase 1 — component exports populated in Phase 3
export {}
```

### Verify workspace linkage after npm install
```bash
# At repo root after npm install
ls -la packages/primitives/node_modules/@design-system-x/tokens
# Should show a symlink pointing to ../../tokens
```

### Verify turbo build runs in dependency order
```bash
turbo run build --dry-run
# Output should show: tokens#build → primitives#build → storybook#build
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pipeline` key in turbo.json | `tasks` key | Turborepo v2 (2024) | Using `pipeline` still works but emits deprecation warnings |
| `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` (separate) | `typescript-eslint` (unified package) | typescript-eslint v8 (2024) | Simpler install; installing both old+new causes conflicts |
| `parserOptions.project: [...]` for typed linting | `parserOptions.projectService: true` | typescript-eslint v8 (2024) | Eliminates need to list tsconfig paths; auto-discovers per-package configs |
| `.eslintrc.js` / `.eslintrc.json` | `eslint.config.mjs` (flat config) | ESLint v9 (2024) | Old format is deprecated; flat config is now default |
| `eslint-config-airbnb` | `typescript-eslint` recommended + typed rules | 2023-2024 | Airbnb config doesn't support ESLint v9 flat config cleanly |
| Turborepo v1 `outputs` included intermediate files | Only final artifacts in `outputs` | v2 | Cleaner cache; don't include `tsconfig.tsbuildinfo` in outputs when not using tsc --build |

**Deprecated/outdated:**
- `standard-version`: In maintenance mode, not workspace-aware. Replaced by Changesets.
- `.eslintrc.*` config format: Deprecated in ESLint v9, removed in v10.
- `eslint-plugin-react-hooks` `configs.recommended` as a spread (v4 pattern): Changed in v5/v7 for flat config.
- `turbo.json` `"pipeline"` key: Deprecated in Turborepo v2, replaced by `"tasks"`.

---

## Open Questions

1. **npm registry: public npm vs GitHub Packages vs internal registry**
   - What we know: `access: "public"` in Changesets config handles public npm. GitHub Packages requires an `.npmrc` with `//npm.pkg.github.com/:_authToken=` and different registry URL.
   - What's unclear: Team's registry choice. Affects `.npmrc` setup and the `publishConfig` in each package.json.
   - Recommendation: If unknown, default to public npm — it's the simplest. Add GitHub Packages config only if required by org policy. This should be resolved before the first actual publish (Phase 6), but the `.npmrc` configuration should be considered in Phase 1 package setup.

2. **Storybook version alignment**
   - What we know: The npm registry shows `storybook` at 10.3.1 and `@storybook/addon-essentials` at 8.6.14. These version numbers suggest a possible major version split between the CLI and framework packages.
   - What's unclear: Whether `storybook@10` is a Storybook 10 release or a versioning artifact. The Storybook 8 framework is currently documented at storybook.js.org as the stable v8 release.
   - Recommendation: Run `npx storybook@latest init` in `apps/storybook/` and let the CLI install matching peer versions. Do NOT manually pin mismatched major versions. Verify output of init before committing package.json.

3. **React version: 18 vs 19**
   - What we know: React 19.2.4 is current on npm. React 19 introduced breaking changes to the type definitions.
   - What's unclear: Whether the team targets React 18 or 19 consumers.
   - Recommendation: Set `peerDependencies` in primitives to `"react": ">=18.0.0"` to support both. This is the current pattern for new component libraries.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — this is a greenfield scaffold phase |
| Config file | None yet — Wave 0 must create it |
| Quick run command | `turbo run build --dry-run` (structure verification, no test runner yet) |
| Full suite command | `turbo run build` (all packages build successfully) |

For Phase 1, the "tests" are structural verification steps, not unit tests. There is no application logic to test — only scaffold correctness to verify.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | npm workspaces resolves cross-package symlinks | smoke | `ls -la packages/primitives/node_modules/@design-system-x/tokens` (should be symlink) | ❌ Wave 0: document in verification script |
| INFRA-01 | Turborepo executes builds in topological order | smoke | `turbo run build --dry-run \| grep -E "(tokens\|primitives)"` | ❌ Wave 0 |
| INFRA-02 | tokens package builds dual ESM+CJS+.d.ts | smoke | `ls packages/tokens/dist/ \| grep -E "(index\.mjs\|index\.js\|index\.d\.ts)"` | ❌ Wave 0 |
| INFRA-03 | primitives package builds and references tokens | smoke | `ls packages/primitives/dist/` (should contain index.mjs, index.js, index.d.ts) | ❌ Wave 0 |
| INFRA-04 | Storybook dev server starts on port 6006 | manual | `turbo run dev` then `curl -s http://localhost:6006 \| head -5` | ❌ Wave 0 |
| INFRA-05 | Changesets status runs without error | smoke | `npx changeset status` (exits 0, lists packages) | ❌ Wave 0 |
| INFRA-06 | ESLint lints all packages without config errors | smoke | `turbo run lint` | ❌ Wave 0 |
| INFRA-06 | TypeScript type-checks all packages | smoke | `npx tsc --noEmit -p packages/tokens/tsconfig.json && npx tsc --noEmit -p packages/primitives/tsconfig.json` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `turbo run build --dry-run` (verify dependency graph without executing)
- **Per wave merge:** `turbo run build && turbo run lint`
- **Phase gate:** `turbo run build` green + `npx changeset status` exits 0 + `turbo run lint` green before marking Phase 1 complete

### Wave 0 Gaps

- [ ] `scripts/verify-scaffold.sh` — shell script automating the smoke checks above (INFRA-01 through INFRA-06)
- [ ] No test framework needed in Phase 1 — application logic tests begin in Phase 2 (Style Dictionary transforms)
- [ ] Framework install: None required — all tooling is configured, not tested

---

## Sources

### Primary (HIGH confidence)

- npm registry (`npm view [package] version`) — all package versions verified 2026-03-22
- [Turborepo v2 configuration reference](https://turborepo.dev/repo/docs/reference/configuration) — `tasks` key, `persistent`, `cache: false`, `dependsOn` syntax
- [typescript-eslint typed linting monorepos](https://typescript-eslint.io/troubleshooting/typed-linting/monorepos/) — `projectService: true` config
- [typescript-eslint getting started](https://typescript-eslint.io/getting-started/typed-linting) — `recommendedTypeChecked`, `projectService`
- [ESLint flat config documentation](https://eslint.org/docs/latest/use/configure/configuration-files) — global ignores, file patterns, monorepo model
- [Storybook react-vite framework docs](https://storybook.js.org/docs/get-started/frameworks/react-vite) — `main.ts` config shape, `reactDocgen: 'react-docgen-typescript'`
- [Changesets config file options](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md) — `access`, `linked`, `updateInternalDependencies`, `baseBranch`
- [Turborepo + Storybook guide](https://turborepo.dev/docs/guides/tools/storybook) — `persistent: true`, `storybook-static/**` output

### Secondary (MEDIUM confidence)

- WebSearch: "tsup typescript project references monorepo 2024 2025" — confirmed tsup does NOT support project references natively; tsc --build is needed for composite builds
- WebSearch: "turborepo storybook 8 monorepo known issues persistent" — confirmed `persistent: true` requirement for dev server tasks; no major v8-specific conflicts found
- WebSearch: "ESLint 9 flat config typescript monorepo eslint.config.mjs" — confirmed single root config covers entire repo via ESLint's upward file search
- WebSearch: "changesets npm workspaces access public scoped package" — confirmed `"access": "public"` requirement for `@scoped` packages

### Tertiary (LOW confidence — verify before implementing)

- Storybook version alignment between `storybook@10.3.1` CLI and `@storybook/addon-essentials@8.6.14`: version numbers appear inconsistent between packages. Run `npx storybook@latest init` to let CLI install consistent matched versions rather than manually pinning from these numbers.

---

## Metadata

**Confidence breakdown:**
- Standard stack versions: HIGH — verified against npm registry live on 2026-03-22
- Turborepo v2 config format: HIGH — verified against official turborepo.dev documentation
- tsup config: HIGH — patterns consistent across training data and community sources; `dts: true` behavior verified via WebSearch for known issues
- TypeScript config: HIGH — `composite: false` with tsup verified as correct; `moduleResolution: "Bundler"` is stable TypeScript handbook guidance
- ESLint 9 flat config: HIGH — verified against eslint.org and typescript-eslint.io official docs
- Changesets config: HIGH — verified against GitHub source docs
- Storybook setup: MEDIUM — init command and main.ts structure verified; addon version numbers should be confirmed with `npx storybook@latest init` rather than manual pinning

**Research date:** 2026-03-22
**Valid until:** 2026-06-22 (90 days — stable tooling; tsup, Turborepo, and Changesets have slow release cadences)
**Re-verify if:** Any package major version bumps (especially Turborepo v3, ESLint v11, typescript-eslint v9)
