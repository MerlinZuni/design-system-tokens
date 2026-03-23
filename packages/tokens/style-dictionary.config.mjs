// style-dictionary.config.mjs
// Auto-built outputs from this config:
//   dist/css/tokens.css          — primitive CSS vars (Phase 2)
//   dist/parent-brand/light.css  — semantic vars, parent-brand light mode
//   dist/parent-brand/dark.css   — semantic vars, parent-brand dark mode
//   dist/child-brand/light.css   — semantic vars, child-brand light mode
//   dist/child-brand/dark.css    — semantic vars, child-brand dark mode
//   src/breakpoints.ts           — TypeScript breakpoint constants
// DO NOT integrate into tsup — runs as separate build:tokens script
import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap } from '@tokens-studio/sd-transforms';

// Register all Tokens Studio transforms on the StyleDictionary instance.
// This MUST be called before `new StyleDictionary(...)`.
register(StyleDictionary);

const BRANDS = ['parent-brand', 'child-brand'];
const MODES = ['light', 'dark'];

// --- Instance 1: Primitives CSS (unchanged from Phase 2) ---
// Outputs all primitive tokens as CSS custom properties and TS breakpoint constants.
const sdPrimitives = new StyleDictionary({
  // Token source files — primitives only
  source: ['tokens/primitives/**/*.tokens.json'],

  // REQUIRED: normalizes Tokens Studio Pro export format to DTCG standard.
  // Not auto-applied since sd-transforms v0.16.0 — must be explicit.
  preprocessors: ['tokens-studio'],

  expand: {
    // Maps Tokens Studio boxShadow x/y → DTCG shadow offsetX/offsetY
    typesMap: expandTypesMap,
  },

  platforms: {
    // CSS custom properties platform
    // Output: dist/css/tokens.css (LOCKED — matches package.json ./css export)
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      prefix: 'dsx',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,  // per D-23: preserve alias chain as var() in Phase 3
            selector: ':root',
          },
          // Exclude breakpoints from CSS output (per D-17: breakpoints cannot be used in @media via var())
          filter: (token) => !(token.path[0] === 'grid' && token.path[1] === 'breakpoint'),
        },
      ],
    },

    // TypeScript constants platform for breakpoints only (per D-17, TOKEN-03)
    // Output: src/breakpoints.ts — tsup then compiles this into dist/index.js
    ts: {
      transformGroup: 'js',
      buildPath: 'src/',
      files: [
        {
          destination: 'breakpoints.ts',
          format: 'javascript/es6',
          filter: (token) =>
            token.path[0] === 'grid' && token.path[1] === 'breakpoint',
        },
      ],
    },
  },
});

// cleanAllPlatforms removes stale outputs before rebuilding
await sdPrimitives.cleanAllPlatforms();
// buildAllPlatforms() is the correct async JS API method (NOT sd.build())
await sdPrimitives.buildAllPlatforms();

// --- Instances 2–5: One per brand × mode combination (TOKEN-10) ---
// Each instance:
//   - `include` loads primitives for alias resolution but does NOT output them
//   - `source` loads the brand+mode semantic file — ONLY these tokens appear in output
// This ensures each semantic CSS file contains only semantic tokens (e.g. --dsx-color-background-default),
// with alias chains preserved as var(--dsx-color-*) pointing back to primitive vars in tokens.css.
// Consumers load tokens.css (primitives) + {brand}/{mode}.css (semantics) in that order.
//
// CRITICAL: Do NOT use Promise.all() here — sequential execution prevents buildPath overlap issues.
for (const brand of BRANDS) {
  for (const mode of MODES) {
    const selector = `[data-brand="${brand.replace('-brand', '')}"][data-theme="${mode}"]`;

    const sd = new StyleDictionary({
      // Primitives loaded as 'include' so they are available for alias resolution
      // but are NOT written to the output file (only tokens from 'source' are output)
      include: ['tokens/primitives/**/*.tokens.json'],
      // Brand+mode semantic tokens are the 'source' — these ARE written to output
      source: [`tokens/semantic/${brand}/${mode}.tokens.json`],

      // REQUIRED: normalizes Tokens Studio Pro export format to DTCG standard.
      preprocessors: ['tokens-studio'],

      expand: {
        typesMap: expandTypesMap,
      },

      platforms: {
        // CSS platform only — no TS platform for semantic instances
        css: {
          transformGroup: 'tokens-studio',
          transforms: ['name/kebab'],
          prefix: 'dsx',
          buildPath: `dist/${brand}/`,
          files: [
            {
              destination: `${mode}.css`,
              format: 'css/variables',
              options: {
                outputReferences: true,  // preserve alias chains as var(--dsx-*) references
                selector,
              },
              // Only output tokens from the semantic source file — exclude primitives (from include)
              // isSource: true means the token came from the 'source' array, not 'include'
              filter: (token) => token.isSource,
            },
          ],
        },
      },
    });

    await sd.cleanAllPlatforms();
    await sd.buildAllPlatforms();
  }
}
