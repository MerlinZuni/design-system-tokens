// token-data.ts — Central data layer for all token documentation pages.
// Parses DTCG JSON token files, resolves alias chains, and exports pre-computed
// static data for use by TokenTable, SemanticTokenSection, and all MDX pages.

import primitiveColors from '../../../../packages/tokens/tokens/primitives/color.tokens.json'
import primitiveSpacing from '../../../../packages/tokens/tokens/primitives/spacing.tokens.json'
import primitiveTypography from '../../../../packages/tokens/tokens/primitives/typography.tokens.json'
import primitiveElevation from '../../../../packages/tokens/tokens/primitives/elevation.tokens.json'
import semanticParentLight from '../../../../packages/tokens/tokens/semantic/parent-brand/light.tokens.json'
import semanticParentDark from '../../../../packages/tokens/tokens/semantic/parent-brand/dark.tokens.json'
import semanticChildLight from '../../../../packages/tokens/tokens/semantic/child-brand/light.tokens.json'
import semanticChildDark from '../../../../packages/tokens/tokens/semantic/child-brand/dark.tokens.json'
import {
  GridBreakpointSm,
  GridBreakpointMd,
  GridBreakpointLg,
  GridBreakpointXl,
  GridBreakpoint2xl,
} from '@design-system-x/tokens'

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface TokenRow {
  name: string          // e.g. "color.brand.500" or "color.background.default"
  cssVar: string        // e.g. "--dsx-color-brand-500"
  rawValue: string      // e.g. "#4fc4c4" or "16px"
  description?: string  // from $description field
}

export interface SemanticTokenRow extends TokenRow {
  alias: string           // e.g. "{color.neutral.0}" — the $value from semantic JSON
  primitiveRef: string    // e.g. "color.neutral.0" — extracted from alias braces
  primitiveCssVar: string // e.g. "--dsx-color-neutral-0"
}

export interface TypographyTokenRow {
  name: string          // e.g. "typography.text-base"
  description?: string
  fontFamily: string    // CSS var: --dsx-typography-text-base-font-family
  fontSize: string      // CSS var: --dsx-typography-text-base-font-size
  fontWeight: string    // CSS var: --dsx-typography-text-base-font-weight
  lineHeight: string    // CSS var: --dsx-typography-text-base-line-height
  letterSpacing: string // CSS var: --dsx-typography-text-base-letter-spacing
  rawFontSize: string   // e.g. "16px"
  rawFontWeight: string // e.g. "400"
  rawLineHeight: string // e.g. "24px"
}

export interface ShadowLayer {
  color: string
  offsetX: string
  offsetY: string
  blur: string
  spread: string
}

export interface ElevationTokenRow {
  name: string              // e.g. "elevation.sm"
  cssVarPrefix: string      // e.g. "--dsx-elevation-sm" or "--dsx-elevation-md-1"
  layers: ShadowLayer[]     // raw values for each shadow layer
  description?: string
  boxShadowString: string   // pre-assembled: "0px 1px 2px 0px rgba(0,0,0,0.05)"
}

// ---------------------------------------------------------------------------
// Utility: tokenPathToCssVar
// ---------------------------------------------------------------------------

/**
 * Converts a dot-path token name to a CSS custom property name.
 * e.g. "color.brand.500" -> "--dsx-color-brand-500"
 * e.g. "typography.text-base.font-size" -> "--dsx-typography-text-base-font-size"
 */
export function tokenPathToCssVar(path: string, prefix: string = 'dsx'): string {
  return `--${prefix}-${path.replace(/\./g, '-')}`
}

// ---------------------------------------------------------------------------
// Utility: resolveAliasChain
// ---------------------------------------------------------------------------

type JsonObj = Record<string, unknown>

/**
 * Walk a nested JSON object using a dot-path (e.g. "color.neutral.0").
 * Returns the $value string if found, or undefined.
 */
function walkPath(obj: JsonObj, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as JsonObj)[part]
  }
  if (current !== null && typeof current === 'object' && '$value' in (current as JsonObj)) {
    const val = (current as JsonObj)['$value']
    if (typeof val === 'string') return val
  }
  return undefined
}

/**
 * Given an alias string like "{color.neutral.0}", resolves the full chain:
 * ['color.background.default', 'color.neutral.0', '#ffffff']
 *
 * Strips braces, walks the primitive JSON to find the raw $value.
 * Returns the chain as an array of strings.
 */
export function resolveAliasChain(
  semanticName: string,
  alias: string,
  primitiveData: JsonObj
): string[] {
  const stripped = alias.replace(/^\{|\}$/g, '')
  const rawValue = walkPath(primitiveData, stripped) ?? alias
  return [semanticName, stripped, rawValue]
}

// ---------------------------------------------------------------------------
// Utility: flattenTokens
// ---------------------------------------------------------------------------

/**
 * Recursively walks a DTCG JSON object, collecting leaf nodes (objects with $value).
 * Skips $type and $description at group level.
 * For each leaf: name = full dot path, rawValue = $value, description = $description.
 */
export function flattenTokens(obj: JsonObj, parentPath: string = ''): TokenRow[] {
  const rows: TokenRow[] = []

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue // skip $type, $description at group level
    if (value === null || typeof value !== 'object') continue

    const path = parentPath ? `${parentPath}.${key}` : key
    const node = value as JsonObj

    if ('$value' in node) {
      // Leaf token node
      const rawVal = node['$value']
      const rawValue = typeof rawVal === 'string' ? rawVal : JSON.stringify(rawVal)
      rows.push({
        name: path,
        cssVar: tokenPathToCssVar(path),
        rawValue,
        description: typeof node['$description'] === 'string' ? node['$description'] : undefined,
      })
    } else {
      // Group node — recurse
      rows.push(...flattenTokens(node, path))
    }
  }

  return rows
}

// ---------------------------------------------------------------------------
// Utility: flattenSemanticTokens
// ---------------------------------------------------------------------------

/**
 * Recursively walks a DTCG semantic JSON object and returns SemanticTokenRow[].
 * Resolves aliases against the provided primitive data.
 */
function flattenSemanticTokens(
  obj: JsonObj,
  primitiveData: JsonObj,
  parentPath: string = ''
): SemanticTokenRow[] {
  const rows: SemanticTokenRow[] = []

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue
    if (value === null || typeof value !== 'object') continue

    const path = parentPath ? `${parentPath}.${key}` : key
    const node = value as JsonObj

    if ('$value' in node) {
      const rawAlias = node['$value']
      if (typeof rawAlias !== 'string') continue // skip complex values (shadow aliases etc.)

      const alias = rawAlias
      const stripped = alias.replace(/^\{|\}$/g, '')
      const rawValue = walkPath(primitiveData, stripped) ?? alias
      const primitiveRef = stripped

      rows.push({
        name: path,
        cssVar: tokenPathToCssVar(path),
        rawValue,
        description: typeof node['$description'] === 'string' ? node['$description'] : undefined,
        alias,
        primitiveRef,
        primitiveCssVar: tokenPathToCssVar(primitiveRef),
      })
    } else {
      // Group node — recurse
      rows.push(...flattenSemanticTokens(node, primitiveData, path))
    }
  }

  return rows
}

// ---------------------------------------------------------------------------
// SEMANTIC_TOKEN_SETS
// ---------------------------------------------------------------------------

export const SEMANTIC_TOKEN_SETS: Record<
  'parent-light' | 'parent-dark' | 'child-light' | 'child-dark',
  JsonObj
> = {
  'parent-light': semanticParentLight as unknown as JsonObj,
  'parent-dark': semanticParentDark as unknown as JsonObj,
  'child-light': semanticChildLight as unknown as JsonObj,
  'child-dark': semanticChildDark as unknown as JsonObj,
}

// Combined primitive data for alias resolution (color + spacing)
const PRIMITIVE_DATA: JsonObj = {
  ...(primitiveColors as unknown as JsonObj),
  ...(primitiveSpacing as unknown as JsonObj),
  ...(primitiveElevation as unknown as JsonObj),
}

// ---------------------------------------------------------------------------
// getPrimitiveColorTokens
// ---------------------------------------------------------------------------

/**
 * Returns flattened color primitive tokens with cssVar and rawValue for each shade.
 */
export function getPrimitiveColorTokens(): TokenRow[] {
  return flattenTokens(primitiveColors as unknown as JsonObj)
}

// ---------------------------------------------------------------------------
// getPrimitiveSpacingTokens
// ---------------------------------------------------------------------------

/**
 * Returns flattened spacing primitives sorted numerically (0, 0.5, 1, 1.5, 2, ..., 96).
 */
export function getPrimitiveSpacingTokens(): TokenRow[] {
  const rows = flattenTokens(primitiveSpacing as unknown as JsonObj)
  return rows.sort((a, b) => {
    // Extract numeric key from name like "spacing.0.5" -> 0.5
    const aNum = parseFloat(a.name.replace('spacing.', ''))
    const bNum = parseFloat(b.name.replace('spacing.', ''))
    return aNum - bNum
  })
}

// ---------------------------------------------------------------------------
// getPrimitiveTypographyTokens
// ---------------------------------------------------------------------------

const TYPOGRAPHY_STEPS = [
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
  'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl',
  'text-7xl', 'text-8xl', 'text-9xl',
]

/**
 * Returns one TypographyTokenRow per scale step (text-xs through text-9xl).
 * 13 steps total, with all 5 sub-property CSS var names and raw values.
 */
export function getPrimitiveTypographyTokens(): TypographyTokenRow[] {
  const typo = (primitiveTypography as unknown as JsonObj)['typography'] as JsonObj

  return TYPOGRAPHY_STEPS.map((step) => {
    const node = typo[step] as JsonObj | undefined
    if (!node) {
      // Fallback row if step is missing
      const cssBase = `--dsx-typography-${step}`
      return {
        name: `typography.${step}`,
        fontFamily: `${cssBase}-font-family`,
        fontSize: `${cssBase}-font-size`,
        fontWeight: `${cssBase}-font-weight`,
        lineHeight: `${cssBase}-line-height`,
        letterSpacing: `${cssBase}-letter-spacing`,
        rawFontSize: '',
        rawFontWeight: '',
        rawLineHeight: '',
      }
    }

    const val = node['$value'] as Record<string, string>
    const desc = node['$description']
    const cssBase = `--dsx-typography-${step}`

    return {
      name: `typography.${step}`,
      description: typeof desc === 'string' ? desc : undefined,
      fontFamily: `${cssBase}-font-family`,
      fontSize: `${cssBase}-font-size`,
      fontWeight: `${cssBase}-font-weight`,
      lineHeight: `${cssBase}-line-height`,
      letterSpacing: `${cssBase}-letter-spacing`,
      rawFontSize: val['fontSize'] ?? '',
      rawFontWeight: val['fontWeight'] ?? '',
      rawLineHeight: val['lineHeight'] ?? '',
    }
  })
}

// ---------------------------------------------------------------------------
// getPrimitiveElevationTokens
// ---------------------------------------------------------------------------

type RawShadowLayer = {
  color: string
  offsetX: string
  offsetY: string
  blur: string
  spread: string
}

function shadowLayerToString(layer: RawShadowLayer): string {
  return `${layer.offsetX} ${layer.offsetY} ${layer.blur} ${layer.spread} ${layer.color}`
}

function buildBoxShadow(layers: RawShadowLayer[]): string {
  return layers.map(shadowLayerToString).join(', ')
}

/**
 * Returns elevation tokens: sm (1 layer), md (2 layers), lg (2 layers), xl (2 layers).
 * Each row includes a pre-assembled boxShadowString.
 */
export function getPrimitiveElevationTokens(): ElevationTokenRow[] {
  const elev = (primitiveElevation as unknown as JsonObj)['elevation'] as JsonObj
  const levels = ['none', 'sm', 'md', 'lg', 'xl'] as const

  return levels.map((level) => {
    const node = elev[level] as JsonObj | undefined
    if (!node) return {
      name: `elevation.${level}`,
      cssVarPrefix: `--dsx-elevation-${level}`,
      layers: [],
      boxShadowString: '',
    }

    const description = typeof node['$description'] === 'string' ? node['$description'] : undefined
    const rawValue = node['$value']
    const layers: RawShadowLayer[] = Array.isArray(rawValue)
      ? (rawValue as RawShadowLayer[])
      : [rawValue as RawShadowLayer]

    const shadowLayers: ShadowLayer[] = layers.map((l) => ({
      color: l.color,
      offsetX: l.offsetX,
      offsetY: l.offsetY,
      blur: l.blur,
      spread: l.spread,
    }))

    return {
      name: `elevation.${level}`,
      cssVarPrefix: `--dsx-elevation-${level}`,
      layers: shadowLayers,
      description,
      boxShadowString: buildBoxShadow(layers),
    }
  })
}

// ---------------------------------------------------------------------------
// getSemanticTokensForTheme
// ---------------------------------------------------------------------------

/**
 * Returns flattened semantic tokens for a brand/mode combination.
 * Alias chains are resolved against primitive data.
 *
 * @param brand - "parent" | "child"
 * @param mode  - "light" | "dark"
 */
export function getSemanticTokensForTheme(brand: string, mode: string): SemanticTokenRow[] {
  const key = `${brand}-${mode}` as keyof typeof SEMANTIC_TOKEN_SETS
  const semanticData = SEMANTIC_TOKEN_SETS[key] ?? SEMANTIC_TOKEN_SETS['parent-light']
  return flattenSemanticTokens(semanticData, PRIMITIVE_DATA)
}

// ---------------------------------------------------------------------------
// BREAKPOINTS
// ---------------------------------------------------------------------------

/**
 * Breakpoint constants sourced from @design-system-x/tokens package exports.
 * These are TypeScript constants only — CSS var() cannot be used in @media queries.
 */
export const BREAKPOINTS: Record<string, string> = {
  sm: GridBreakpointSm,
  md: GridBreakpointMd,
  lg: GridBreakpointLg,
  xl: GridBreakpointXl,
  '2xl': GridBreakpoint2xl,
}

// ---------------------------------------------------------------------------
// PRIMITIVE_SPACING (static export for direct access)
// ---------------------------------------------------------------------------

export const PRIMITIVE_SPACING = getPrimitiveSpacingTokens()

// ---------------------------------------------------------------------------
// PRIMITIVE_TYPOGRAPHY (static export)
// ---------------------------------------------------------------------------

export const PRIMITIVE_TYPOGRAPHY = getPrimitiveTypographyTokens()

// ---------------------------------------------------------------------------
// SHADOW_LAYERS (static export)
// ---------------------------------------------------------------------------

export const SHADOW_LAYERS = getPrimitiveElevationTokens()
