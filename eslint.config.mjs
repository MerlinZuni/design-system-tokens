import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import storybook from 'eslint-plugin-storybook'

export default tseslint.config(
  // Global ignores -- no other keys in this object
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
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
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
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  // Storybook-specific rules for story files
  storybook.configs['flat/recommended'],
)
