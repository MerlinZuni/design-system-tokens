import React from 'react'
import { TokenTable } from './TokenTable'
import { getSemanticTokensForTheme } from './token-data'

// useGlobals is used to read brand/mode from the Storybook global toolbar.
// If the import fails at build time (monorepo resolution issue), the component
// falls back to accepting brand/mode as optional props.
let useGlobals: (() => [Record<string, string>]) | undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const previewApi = require('@storybook/preview-api') as { useGlobals?: () => [Record<string, string>] }
  useGlobals = previewApi.useGlobals
} catch {
  useGlobals = undefined
}

interface SemanticTokenSectionProps {
  /** Filter prefix — e.g. "color.", "space.", "shadow." */
  prefix: string
  /** Fallback brand when not using Storybook globals */
  brand?: string
  /** Fallback mode when not using Storybook globals */
  mode?: string
}

export function SemanticTokenSection({ prefix, brand: brandProp, mode: modeProp }: SemanticTokenSectionProps) {
  const resolvedBrand = brandProp ?? 'parent'
  const resolvedMode = modeProp ?? 'light'

  // Try to read from Storybook globals at runtime
  let brand = resolvedBrand
  let mode = resolvedMode

  if (useGlobals) {
    try {
      // This hook call is conditional — safe here because useGlobals is set once
      // at module load time, so the call is consistent across renders.
      const [globals] = useGlobals()
      brand = globals['brand'] ?? resolvedBrand
      mode = globals['mode'] ?? resolvedMode
    } catch {
      // Globals not available (e.g. running outside Storybook) — use fallback
    }
  }

  const tokens = getSemanticTokensForTheme(brand, mode).filter((t) =>
    t.name.startsWith(prefix)
  )

  return <TokenTable tokens={tokens} showAliasChain={true} />
}
