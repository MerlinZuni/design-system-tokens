import React from 'react'
import { TokenTable } from './TokenTable'
import { getSemanticTokensForTheme } from './token-data'
import type { SemanticTokenRow } from './token-data'

// useGlobals is used to read brand/mode from the Storybook global toolbar.
// Same try/catch require() pattern as SemanticTokenSection for Storybook 10 monorepo compatibility.
let useGlobals: (() => [Record<string, string>]) | undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const previewApi = require('@storybook/preview-api') as { useGlobals?: () => [Record<string, string>] }
  useGlobals = previewApi.useGlobals
} catch {
  useGlobals = undefined
}

interface StylesTokenTableProps {
  /** Semantic token names to display, e.g. ['color.surface.card', 'color.border.default'] */
  tokenNames: string[]
}

export function StylesTokenTable({ tokenNames }: StylesTokenTableProps) {
  let brand = 'parent'
  let mode = 'light'
  if (useGlobals) {
    try {
      const [globals] = useGlobals()
      brand = globals['brand'] ?? brand
      mode = globals['mode'] ?? mode
    } catch {
      // fallback to defaults
    }
  }
  const allTokens = getSemanticTokensForTheme(brand, mode)
  const tokens: SemanticTokenRow[] = tokenNames
    .map((name) => allTokens.find((t) => t.name === name))
    .filter((t): t is SemanticTokenRow => t !== undefined)

  return <TokenTable tokens={tokens} showAliasChain />
}
