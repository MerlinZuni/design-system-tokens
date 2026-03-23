# Release Checklist — Design System X v1.0

## Pre-release

1. Ensure all packages build cleanly:
   ```bash
   turbo run build
   ```

2. Run linting across all packages:
   ```bash
   turbo run lint
   ```

3. Verify Storybook builds and renders correctly:
   ```bash
   npm run build --workspace=apps/storybook
   ```

## Versioning

4. Create a changeset describing the release:
   ```bash
   npx changeset
   ```
   Select `@design-system-x/tokens` and `@design-system-x/primitives`. Choose version bump (major for v1.0).

5. Apply the changeset to bump versions and generate changelogs:
   ```bash
   npx changeset version
   ```

6. Review generated CHANGELOG.md files in each package.

## Build

7. Rebuild all packages with updated versions:
   ```bash
   turbo run build
   ```

## Figma Code Connect

8. Replace TODO placeholder node IDs in all `.figma.tsx` files with real Figma component node IDs from Dev Mode:
   - `packages/primitives/src/Text/Text.figma.tsx`
   - `packages/primitives/src/ColorSwatch/ColorSwatch.figma.tsx`
   - `packages/primitives/src/Surface/Surface.figma.tsx`
   - `packages/primitives/src/Stack/Stack.figma.tsx`
   - `packages/primitives/src/Inline/Inline.figma.tsx`
   - `packages/primitives/src/VisuallyHidden/VisuallyHidden.figma.tsx`

9. Publish Code Connect to Figma:
   ```bash
   cd packages/primitives && npx @figma/code-connect publish
   ```

10. Verify in Figma Dev Mode that component code snippets appear.

## npm Publish

11. Publish packages to npm:
    ```bash
    cd packages/tokens && npm publish --access public
    cd packages/primitives && npm publish --access public
    ```

## Post-release

12. Commit version bumps and changelogs:
    ```bash
    git add -A && git commit -m "chore: release v1.0.0"
    ```

13. Create a git tag:
    ```bash
    git tag v1.0.0 && git push origin main --tags
    ```
