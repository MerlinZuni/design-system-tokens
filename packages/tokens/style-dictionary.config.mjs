// style-dictionary.config.mjs
// Auto-built output from this config: dist/css/tokens.css + src/breakpoints.ts
// DO NOT integrate into tsup — runs as separate build:tokens script
import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap } from '@tokens-studio/sd-transforms';

// Register all Tokens Studio transforms on the StyleDictionary instance.
// This MUST be called before `new StyleDictionary(...)`.
register(StyleDictionary);

const sd = new StyleDictionary({
  // Token source files — populated in Wave 2
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
await sd.cleanAllPlatforms();
// buildAllPlatforms() is the correct async JS API method (NOT sd.build())
await sd.buildAllPlatforms();
