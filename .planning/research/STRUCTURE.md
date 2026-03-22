# Repository Structure & Developer Conventions

**Project:** Design System X
**Domain:** React + TypeScript design system (tokens + primitives + Storybook docs)
**Researched:** 2026-03-22
**Confidence note:** WebSearch and WebFetch were unavailable during this session. All findings draw from training knowledge (cutoff August 2025) cross-referenced against well-documented, stable tools. Confidence levels are assigned per finding.

---

## 1. Monorepo vs Single-Package

### Recommendation: Minimal monorepo with npm workspaces + Turborepo

**Use a monorepo from day one.** This project has at least two independently-versioned packages that naturally emerge: a `tokens` package (pure CSS/TS output of Style Dictionary) and a `components` (or `primitives`) package (React). These have different release cadences and consumers who may want tokens without React. Keeping them in one repo eliminates the "dual-repo sync" problem that breaks teams repeatedly.

### Why not a single package?

| Problem | What breaks |
|---------|-------------|
| Tokens and components coupled | A consumer who uses only tokens must install React peer deps |
| Impossible to version independently | Token bumps force component version bumps |
| Style Dictionary build step entangled with TSX compilation | Build pipeline becomes fragile |
| Docs package (Storybook) pulling in build config | Dev and production configs bleed together |

### Tool choice: npm workspaces + Turborepo (not Nx)

**Rationale:**

- **npm workspaces** (built into npm >=7) handles linking packages locally with no extra tooling. No Lerna, no Yarn Berry required. Every modern npm install of a workspace package automatically links sibling packages.
- **Turborepo** adds the one thing workspaces lack: intelligent task caching and ordered task execution. `turbo build` knows that `tokens` must build before `components` (dependency graph awareness), and it caches outputs so rebuilds after no changes are instant.
- **Nx** is appropriate for large enterprise monorepos with 20+ packages, code generation pipelines, and teams running distributed CI. For a design system v1 with 2-3 packages, Nx's ceremony exceeds its value. Turborepo has a significantly smaller config surface.

**Confidence: HIGH** — npm workspaces are stable since npm 7 (2020). Turborepo's caching model and design-system applicability are well documented by Vercel.

### What this is NOT

This is not a "polyrepo" where tokens live in one GitHub repo and components in another. Do not do that. Cross-repo version synchronization is a maintenance tax that compounds quickly.

---

## 2. Package Structure

### Recommended layout

```
design-system-x/
├── package.json              # root (private: true, workspaces config)
├── turbo.json                # Turborepo pipeline
├── .npmrc                    # registry config if scoped packages
├── tsconfig.base.json        # shared TS config, extended by packages
├── .eslintrc.js              # root ESLint config
├── .prettierrc               # root Prettier config
├── commitlint.config.js      # commit convention enforcement
├── packages/
│   ├── tokens/               # @design-system-x/tokens
│   │   ├── package.json
│   │   ├── tsconfig.json     # extends ../../tsconfig.base.json
│   │   ├── style-dictionary.config.ts
│   │   ├── src/
│   │   │   └── tokens/       # W3C DTCG JSON from Tokens Studio Pro
│   │   │       ├── primitive/
│   │   │       │   ├── color.json
│   │   │       │   ├── typography.json
│   │   │       │   └── spacing.json
│   │   │       ├── semantic/
│   │   │       │   ├── light.json
│   │   │       │   └── dark.json
│   │   │       └── component/
│   │   └── dist/             # generated, gitignored
│   │       ├── css/          # CSS custom properties
│   │       └── js/           # TypeScript-typed token exports
│   │
│   └── primitives/           # @design-system-x/primitives
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── components/
│           │   └── [ComponentName]/
│           │       ├── index.ts
│           │       ├── ComponentName.tsx
│           │       └── ComponentName.test.tsx
│           └── index.ts      # barrel export
│
├── apps/
│   └── storybook/            # not published to npm
│       ├── package.json
│       ├── .storybook/
│       │   ├── main.ts
│       │   └── preview.ts
│       └── stories/          # mirrors packages/primitives/src structure
│
└── tools/                    # optional: shared build scripts
    └── build-tokens.ts
```

### Package naming convention

Use a scoped package name from the start: `@design-system-x/tokens`, `@design-system-x/primitives`. This makes the npm publish story clean and avoids name conflicts. The scope can be a private npm org or a GitHub Packages registry.

### Why `apps/` for Storybook, not `packages/`

Storybook is an application, not a published library. It has no consumers outside the team. Keeping it in `apps/` (a common Turborepo convention) signals this distinction clearly and prevents accidental publish.

### Why separate `tokens/` and `primitives/`

The token package's build pipeline is entirely different from the component package's:

- `tokens` runs Style Dictionary → outputs CSS files and a typed TS barrel
- `primitives` compiles TSX → outputs ESM + CJS + `.d.ts` files

Merging them into one package creates a build step that is impossible to cache cleanly and confusing to maintain.

**Confidence: HIGH** — This layout mirrors patterns used by Radix UI, Adobe Spectrum, and Primer React, all of which separate token generation from component compilation.

---

## 3. TypeScript Configuration

### Strategy: base config extended per package

**Root `tsconfig.base.json`** — strict settings, shared across all packages:

```json
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
    "isolatedModules": true
  }
}
```

**Key decisions:**

| Option | Value | Rationale |
|--------|-------|-----------|
| `moduleResolution` | `"Bundler"` | Correct for tsup/Vite builds; avoids `.js` extension requirements |
| `exactOptionalPropertyTypes` | `true` | Catches `undefined` being passed where `T \| undefined` was meant |
| `noUncheckedIndexedAccess` | `true` | Forces safe array/object access — important for token lookup functions |
| `declaration` + `declarationMap` | `true` | Consumers get type definitions and source map navigation |
| `isolatedModules` | `true` | Required compatibility for tsup's esbuild transpilation |
| `jsx` | `"react-jsx"` | Modern JSX transform; no `import React` needed in every file |

**Per-package `tsconfig.json`** in `packages/tokens/`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Per-package `tsconfig.json`** in `packages/primitives/`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "references": [{ "path": "../tokens" }]
}
```

The `references` field enables TypeScript project references — incremental builds, and correct cross-package type checking without needing to build first.

### What NOT to do

- Do not put `paths` aliases in `tsconfig.base.json` for cross-package imports. Use the actual published package names (`@design-system-x/tokens`) even locally. npm workspaces symlinks handle resolution; `paths` aliases create a second source of truth that diverges from production behavior.
- Do not set `composite: true` unless you are using `tsc --build` as the primary build tool (not the case with tsup).

**Confidence: HIGH** — TypeScript project references and monorepo tsconfig patterns are stable and well-documented in the TypeScript handbook.

---

## 4. Build Tooling

### Recommendation: tsup for both packages

**tsup** (built on esbuild) is the correct choice for a design system library in 2025-2026. Here is why it wins over Rollup and Vite for this use case:

| Criterion | tsup | Rollup | Vite (lib mode) |
|-----------|------|--------|-----------------|
| Config verbosity | Minimal (~10 lines) | High (plugins for TS, CSS) | Medium |
| Build speed | Fastest (esbuild) | Slow | Fast (esbuild) |
| ESM + CJS dual output | One flag | Requires separate configs | Supported |
| `.d.ts` generation | Built-in | Needs `rollup-plugin-dts` | Needs separate `tsc` call |
| Tree-shaking | Via esbuild | Excellent (native) | Via Rollup internally |
| CSS handling | Limited | Rollup plugins | Good |
| Active maintenance | Yes (Egoist) | Yes | Yes (Vite core team) |
| Designed for libraries | Yes | Yes | Originally app-focused |

**Rollup** is still appropriate for complex library scenarios where you need advanced code splitting, fine-grained chunk control, or plugin ecosystem features. For a tokens + primitives package, that complexity is not needed.

**Vite lib mode** is best when your library has CSS modules or complex asset processing needs. The tokens package outputs plain CSS files (not CSS modules), and the primitives package — at v1 scope — won't have complex asset requirements.

### tsup config for `packages/tokens/`

```typescript
// packages/tokens/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
})
```

The Style Dictionary build step is a separate `prebuild` script that runs before tsup. CSS output from Style Dictionary is not processed by tsup — it is copied directly to `dist/css/`.

### tsup config for `packages/primitives/`

```typescript
// packages/primitives/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,   // enables per-component code splitting for tree-shaking
  treeshake: true,
  external: ['react', 'react-dom'],  // never bundle peer deps
})
```

### package.json `exports` field (critical)

Both packages must use the `exports` field, not just `main`. Without it, bundlers using ESM resolution will fall back to the CJS bundle, defeating tree-shaking:

```json
{
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
  "types": "./dist/index.d.ts"
}
```

The `./css` export subpath lets consumers do `import '@design-system-x/tokens/css'` directly — a clean, intentional API.

**Confidence: HIGH** — tsup's design for library builds and the `exports` field requirement for dual ESM/CJS are well established. The Vite/Rollup comparison is based on the stable feature set of all three tools as of 2025.

---

## 5. Linting, Formatting, and Commit Conventions

### ESLint

Use **flat config** (`eslint.config.js`) — ESLint deprecated the `.eslintrc.*` format and flat config is the default from ESLint v9 onward.

Recommended rule set for a design system:

```
eslint (core)
@typescript-eslint/eslint-plugin + parser
eslint-plugin-react
eslint-plugin-react-hooks
eslint-plugin-jsx-a11y        ← accessibility is non-negotiable for a design system
eslint-plugin-import          ← enforce import ordering and no circular deps
```

Do NOT use `eslint-config-airbnb` in 2026. It conflicts with modern ESLint flat config, is slow to update, and many of its rules are superseded by TypeScript strict mode. Use `@typescript-eslint/recommended-type-checked` instead — it is stricter where it matters and removes noise where it doesn't.

### Prettier

Use Prettier for all formatting. Do not configure ESLint to format code — use `eslint-config-prettier` to disable any ESLint rules that conflict with Prettier, then run them as separate tools.

`.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

**Confidence: HIGH** — ESLint v9 flat config is stable and the migration from `.eslintrc` is well-documented.

### Commit Conventions

Use **Conventional Commits** enforced by `commitlint` + `husky`.

This matters for a design system because:
1. Automated changelog generation (`standard-version` or `changesets`) reads commit types
2. It signals to consumers whether a token change is breaking (`feat!:` / `BREAKING CHANGE:`)
3. It makes PR review faster — reviewers immediately know if a commit is a fix vs a feature

**Minimal setup:**

```
husky          ← git hooks manager
commitlint     ← validates commit messages
lint-staged    ← runs ESLint + Prettier only on changed files (fast)
```

`commitlint.config.js`:
```javascript
module.exports = { extends: ['@commitlint/config-conventional'] }
```

**Conventional commit types relevant to a design system:**

| Type | When to use |
|------|-------------|
| `feat:` | New token, new component |
| `fix:` | Token value correction, bug fix |
| `docs:` | Storybook story changes only |
| `refactor:` | Renaming a token (non-breaking if alias added) |
| `chore:` | Build config, CI, dependency updates |
| `BREAKING CHANGE:` | Token removed or renamed without alias |

### Versioning strategy

Use **Changesets** (`@changesets/cli`) rather than `standard-version`. Changesets is workspace-aware — it understands that bumping `tokens` should suggest bumping `primitives` if primitives depends on tokens. `standard-version` operates on a single package root and is in maintenance mode.

**Confidence: HIGH** — Changesets is the established standard for monorepo versioning (used by Radix, Chakra, Remix, many others). `standard-version` deprecation is documented on its GitHub.

---

## 6. Lessons from Leading Design Systems

### Radix UI Primitives

- **Structure:** Monorepo (pnpm workspaces). Each primitive is its own npm package (`@radix-ui/react-dialog`, `@radix-ui/react-button`). This is extremely granular — appropriate for Radix's zero-dependency, unstyled philosophy where consumers install only what they use.
- **Lesson for DSX:** Do NOT replicate per-component packages at v1. The overhead of maintaining 20+ package.json files, versioning each independently, and managing peer-dep declarations across all of them is a significant maintenance burden. Start with a single `primitives` package. Split if package size becomes a real consumer problem.
- **Build:** tsup per package.

### Chakra UI

- **Structure:** Monorepo, scoped packages. Chakra v2 used a `packages/` layout with distinct packages for `@chakra-ui/theme`, `@chakra-ui/components`, `@chakra-ui/system`. This maps cleanly to the tokens/primitives separation recommended here.
- **Lesson for DSX:** The `system` or `tokens` package should be independently consumable — teams should be able to pull in tokens without the component layer. Chakra validated this pattern.
- **Docs:** Storybook was used internally; the public docs site was a separate Next.js app. At v1, do not build a custom docs site — Storybook is sufficient and is what the PROJECT.md already states.

### Material UI (MUI)

- **Structure:** Single repo, multiple packages (`@mui/material`, `@mui/system`, `@mui/icons-material`). Uses a custom build pipeline (Babel + Rollup). The `@mui/system` package handles design tokens and theming independently of components.
- **Lesson for DSX:** MUI's build pipeline is one of the most complex in the React ecosystem — they have custom Babel plugins and a multi-step process. Do not copy it. MUI's complexity exists to support IE11 (historical), CJS/ESM/UMD, and a sprawling plugin ecosystem. tsup handles the 90% case with 10% of the config.
- **Critical lesson:** MUI's `sx` prop pattern (runtime CSS-in-JS token application) causes performance issues at scale. Design System X is using CSS custom properties instead — this is the right call. CSS custom properties are resolved by the browser natively, not at JavaScript runtime.

### IBM Carbon Design System

- **Structure:** Monorepo (`packages/`). Separates `@carbon/colors`, `@carbon/type`, `@carbon/layout` (token primitives) from `@carbon/react` (components). This is the closest analogue to Design System X's architecture.
- **Lesson for DSX:** Carbon proves that the token/component split at the package level is the right long-term structure. Their token packages have shipped breaking changes independently from the component package, which protected consumers who adopted Carbon's tokens but used custom components.
- **Build:** Carbon uses a mix of Rollup and custom scripts for token generation. For DSX, Style Dictionary + tsup simplifies this considerably.
- **Lesson:** Carbon's documentation tooling (Storybook + a custom docs site) is overkill for v1. Their storybook setup is the relevant reference.

### Key cross-cutting lessons

1. **CSS custom properties beat CSS-in-JS for tokens.** Every modern design system (Carbon, Spectrum, Primer) has moved away from runtime token injection. CSS custom properties with cascade for theming (`:root[data-theme="dark"]`) is the standard pattern in 2025.
2. **Separate token versioning from component versioning.** Every mature system eventually regrets not doing this from the start. Do it at package level from day one.
3. **Storybook Autodocs removes the documentation maintenance problem.** The leading systems that manually wrote component docs have uniformly shifted to Autodocs. Do not write MDX component docs by hand unless they contain narrative content that types cannot express.
4. **Per-component packages are a premature optimization.** Only Radix, which has an explicit zero-bloat philosophy and 40+ primitives, justifies that granularity. At v1 with ~10 primitives, a single `primitives` package is correct.

**Confidence: MEDIUM** — Radix, Chakra, MUI, Carbon structure observations are based on training data (repos observed as of mid-2025). Individual packages or build configs may have changed. Verify by inspecting their GitHub repos directly before adopting any specific detail.

---

## 7. Recommended v1 Repository Setup Sequence

This is the order that avoids rework:

1. **Initialize root `package.json`** with `"private": true` and `"workspaces": ["packages/*", "apps/*"]`
2. **Add `tsconfig.base.json`** at root with strict settings
3. **Add `turbo.json`** with build pipeline: `tokens` → `primitives` → `storybook`
4. **Scaffold `packages/tokens/`** with Style Dictionary config and tsup build
5. **Scaffold `packages/primitives/`** with tsup build, referencing tokens
6. **Scaffold `apps/storybook/`** with Storybook 8.x, pointing to primitives
7. **Add Prettier + ESLint** at root, shared via extends in each package
8. **Add husky + commitlint + lint-staged**
9. **Add Changesets** for versioning

Do not add Changesets until packages are publishing (step 5+). Installing it before you have packages to version creates confusion.

---

## 8. What to Explicitly Avoid at v1

| Temptation | Why to resist |
|------------|---------------|
| Per-component npm packages | Maintenance overhead dwarfs benefit until 10+ components are stable |
| Nx instead of Turborepo | Config surface is 3x larger; features not needed until the repo has 10+ packages |
| Yarn Berry (PnP) | Phantom dependencies are a real problem; npm workspaces works reliably for this package count |
| CSS Modules in the tokens package | Tokens output plain CSS custom property files — no module scoping needed or appropriate |
| Storybook 7.x | Storybook 8.x (released 2024) is significantly faster and has first-class Vite builder support |
| Runtime theming via JS | Use CSS custom property swapping at `:root` level — far simpler, zero runtime cost |
| Automatic semantic versioning without Changesets | Tools like `semantic-release` don't understand workspace relationships; Changesets does |

---

## Sources

All findings are based on training knowledge (August 2025 cutoff). External verification was unavailable during this session. The following should be consulted for verification before implementation decisions are finalized:

- Turborepo documentation: https://turbo.build/repo/docs
- tsup documentation: https://tsup.egoist.dev
- Style Dictionary v4 docs: https://styledictionary.style
- TypeScript project references: https://www.typescriptlang.org/docs/handbook/project-references.html
- Changesets: https://github.com/changesets/changesets
- Radix UI Primitives repo: https://github.com/radix-ui/primitives
- Carbon Design System repo: https://github.com/carbon-design-system/carbon
- ESLint flat config migration: https://eslint.org/docs/latest/use/configure/migration-guide
- W3C DTCG token format: https://tr.designtokens.org/format/

**Overall confidence: MEDIUM-HIGH.** The structural recommendations (monorepo, tsup, tsconfig patterns, Changesets, conventional commits) are based on stable, well-documented tools with broad community consensus. The "lessons from leading design systems" section reflects repo structures as of mid-2025 and should be spot-checked against their current GitHub state.
