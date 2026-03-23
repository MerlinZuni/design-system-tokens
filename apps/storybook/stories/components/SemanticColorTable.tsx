import React from 'react'
import { TokenTable } from './TokenTable'
import { getSemanticTokensForTheme } from './token-data'
import type { SemanticTokenRow } from './token-data'

// useGlobals is used to read brand/mode from the Storybook global toolbar.
// If the import fails at build time (monorepo resolution issue), the component
// falls back to accepting brand and mode as props.
let useGlobals: (() => [Record<string, string>]) | undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const previewApi = require('@storybook/preview-api') as { useGlobals?: () => [Record<string, string>] }
  useGlobals = previewApi.useGlobals
} catch {
  useGlobals = undefined
}

interface SemanticColorTableProps {
  /** Fallback brand when not using Storybook globals */
  brand?: string
  /** Fallback mode when not using Storybook globals */
  mode?: string
}

const COLOR_CATEGORIES = [
  'background',
  'surface',
  'text',
  'link',
  'action',
  'focus',
  'border',
  'divider',
  'icon',
  'status',
  'skeleton',
  'highlight',
] as const

type ColorCategory = (typeof COLOR_CATEGORIES)[number]

function groupByCategory(tokens: SemanticTokenRow[]): Map<ColorCategory, SemanticTokenRow[]> {
  const map = new Map<ColorCategory, SemanticTokenRow[]>()
  for (const cat of COLOR_CATEGORIES) {
    map.set(cat, [])
  }
  for (const token of tokens) {
    // token.name is like "color.background.default" or "color.text.default"
    const parts = token.name.split('.')
    // parts[0] = "color", parts[1] = category
    const cat = parts[1] as ColorCategory | undefined
    if (cat && map.has(cat)) {
      map.get(cat)!.push(token)
    }
  }
  return map
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function SemanticColorTable({ brand: brandProp, mode: modeProp }: SemanticColorTableProps = {}) {
  const resolvedBrand = brandProp ?? 'parent'
  const resolvedMode = modeProp ?? 'light'

  let brand = resolvedBrand
  let mode = resolvedMode

  if (useGlobals) {
    try {
      const [globals] = useGlobals()
      brand = globals['brand'] ?? resolvedBrand
      mode = globals['mode'] ?? resolvedMode
    } catch {
      // Globals not available (e.g. running outside Storybook) — use fallback
    }
  }

  const allSemanticTokens = getSemanticTokensForTheme(brand, mode)
  const colorTokens = allSemanticTokens.filter((t) => t.name.startsWith('color.'))
  const grouped = groupByCategory(colorTokens)

  return (
    <div>
      {COLOR_CATEGORIES.map((cat) => {
        const tokens = grouped.get(cat) ?? []
        if (tokens.length === 0) return null
        return (
          <div key={cat} style={{ marginBottom: '32px' }}>
            <h4
              style={{
                fontSize: '16px',
                fontWeight: 600,
                margin: '0 0 8px 0',
                padding: '8px 0',
                borderBottom: '1px solid var(--dsx-color-border-default)',
                color: 'var(--dsx-color-text-default)',
              }}
            >
              {capitalize(cat)}
            </h4>
            <TokenTable
              tokens={tokens}
              showAliasChain={true}
              renderPreview={(token) => (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    border: '1px solid var(--dsx-color-border-default)',
                    backgroundColor: `var(${token.cssVar})`,
                  }}
                />
              )}
            />
          </div>
        )
      })}
    </div>
  )
}
