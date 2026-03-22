---
phase: 1
slug: monorepo-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Phase 1 is a greenfield scaffold phase — "tests" are structural verification steps, not unit tests. No application logic exists yet.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — scaffold phase only |
| **Config file** | None yet — Wave 0 creates `scripts/verify-scaffold.sh` |
| **Quick run command** | `turbo run build --dry-run` |
| **Full suite command** | `turbo run build && turbo run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** `turbo run build --dry-run` (verify dependency graph without executing)
- **After every plan wave:** `turbo run build && turbo run lint`
- **Before `/gsd:verify-work`:** Full suite green + `npx changeset status` exits 0

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| Root workspace init | 01-01 | 1 | INFRA-01 | smoke | `cat package.json \| jq '.workspaces'` → `["packages/*","apps/*"]` | ⬜ pending |
| Turborepo task graph | 01-01 | 1 | INFRA-01 | smoke | `turbo run build --dry-run 2>&1 \| grep -E "(tokens\|primitives)"` | ⬜ pending |
| Workspace symlinks | 01-01 | 1 | INFRA-01 | smoke | `ls -la packages/primitives/node_modules/@design-system-x/tokens` (symlink) | ⬜ pending |
| tokens build | 01-01 | 1 | INFRA-02 | smoke | `ls packages/tokens/dist/ \| grep -E "(index\.mjs\|index\.js\|index\.d\.ts)"` | ⬜ pending |
| primitives build | 01-01 | 1 | INFRA-03 | smoke | `ls packages/primitives/dist/ \| grep -E "(index\.mjs\|index\.js\|index\.d\.ts)"` | ⬜ pending |
| TypeScript strict | 01-01 | 1 | INFRA-06 | smoke | `npx tsc --noEmit -p packages/tokens/tsconfig.json && npx tsc --noEmit -p packages/primitives/tsconfig.json` | ⬜ pending |
| ESLint flat config | 01-02 | 2 | INFRA-06 | smoke | `turbo run lint` (exits 0) | ⬜ pending |
| Storybook workspace | 01-02 | 2 | INFRA-04 | manual | `turbo run dev` then `curl -s http://localhost:6006 \| head -5` | ⬜ pending |
| Changesets | 01-02 | 2 | INFRA-05 | smoke | `npx changeset status` (exits 0, lists both packages) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/verify-scaffold.sh` — shell script automating all smoke checks (INFRA-01 through INFRA-06)

```bash
#!/bin/bash
# Phase 1 scaffold verification script
set -e
echo "Checking workspace symlinks..."
ls -la packages/primitives/node_modules/@design-system-x/tokens
echo "Checking build outputs..."
ls packages/tokens/dist/ | grep -E "(index\.mjs|index\.js|index\.d\.ts)"
ls packages/primitives/dist/ | grep -E "(index\.mjs|index\.js|index\.d\.ts)"
echo "Checking Turborepo task graph..."
turbo run build --dry-run 2>&1 | grep -E "(tokens|primitives)"
echo "Checking TypeScript..."
npx tsc --noEmit -p packages/tokens/tsconfig.json
npx tsc --noEmit -p packages/primitives/tsconfig.json
echo "Checking Changesets..."
npx changeset status
echo "All checks passed ✓"
```

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Storybook dev server starts | INFRA-04 | Requires browser or curl against running server | Run `turbo run dev`, open `http://localhost:6006`, verify Storybook UI loads |

---

## Phase Gate Criteria

Before marking Phase 1 complete, ALL of the following must be green:

- [ ] `turbo run build` exits 0 across all packages
- [ ] `turbo run lint` exits 0 across all packages
- [ ] `npx changeset status` exits 0 and lists `@design-system-x/tokens` and `@design-system-x/primitives`
- [ ] `packages/tokens/dist/` contains `index.mjs`, `index.js`, `index.d.ts`
- [ ] `packages/primitives/dist/` contains `index.mjs`, `index.js`, `index.d.ts`
- [ ] `packages/primitives/node_modules/@design-system-x/tokens` is a symlink (workspace link)
- [ ] Storybook dev server starts on port 6006 (manual check)
