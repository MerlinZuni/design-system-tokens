import React from 'react'
import { CopyToClipboard } from './CopyToClipboard'
import type { ElevationTokenRow, ShadowLayer } from './token-data'

interface ElevationCardProps {
  token: ElevationTokenRow
}

/**
 * Derives the CSS var name for a shadow sub-property.
 * Single-layer tokens (none, sm): --dsx-elevation-sm-color
 * Multi-layer tokens (md, lg, xl): --dsx-elevation-md-1-color, --dsx-elevation-md-2-color
 */
function getShadowSubVarName(cssVarPrefix: string, layerIndex: number, totalLayers: number, prop: string): string {
  if (totalLayers === 1) {
    return `${cssVarPrefix}-${prop}`
  }
  return `${cssVarPrefix}-${layerIndex + 1}-${prop}`
}

interface LayerRowProps {
  layer: ShadowLayer
  layerIndex: number
  totalLayers: number
  cssVarPrefix: string
}

function LayerRow({ layer, layerIndex, totalLayers, cssVarPrefix }: LayerRowProps) {
  const props: Array<{ prop: string; label: string; value: string }> = [
    { prop: 'color', label: 'Color', value: layer.color },
    { prop: 'offset-x', label: 'Offset X', value: layer.offsetX },
    { prop: 'offset-y', label: 'Offset Y', value: layer.offsetY },
    { prop: 'blur', label: 'Blur', value: layer.blur },
    { prop: 'spread', label: 'Spread', value: layer.spread },
  ]

  return (
    <div style={{ marginBottom: 8 }}>
      {totalLayers > 1 && (
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--dsx-color-text-muted)',
          marginBottom: 4,
        }}>
          Layer {layerIndex + 1}
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <tbody>
          {props.map(({ prop, label, value }) => {
            const cssVar = getShadowSubVarName(cssVarPrefix, layerIndex, totalLayers, prop)
            return (
              <tr key={prop}>
                <td style={{
                  padding: '2px 8px 2px 0',
                  fontWeight: 600,
                  color: 'var(--dsx-color-text-muted)',
                  whiteSpace: 'nowrap',
                  width: 72,
                }}>
                  {label}
                </td>
                <td style={{ padding: '2px 8px 2px 0' }}>
                  <CopyToClipboard text={cssVar}>
                    <code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--dsx-color-text-default)' }}>
                      {cssVar}
                    </code>
                  </CopyToClipboard>
                </td>
                <td style={{ padding: '2px 0', color: 'var(--dsx-color-text-muted)', fontFamily: 'monospace', fontSize: 11 }}>
                  {value}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ElevationCard({ token }: ElevationCardProps) {
  const levelLabel = token.name.replace('elevation.', '')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 24,
      borderBottom: '1px solid var(--dsx-color-border-subtle)',
      maxWidth: 560,
      width: '100%',
    }}>
      {/* Visual shadow preview */}
      <div style={{
        width: 200,
        minHeight: 96,
        backgroundColor: 'var(--dsx-color-background-surface)',
        borderRadius: 8,
        boxShadow: token.boxShadowString || undefined,
        margin: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        fontWeight: 600,
        color: 'var(--dsx-color-text-default)',
      }}>
        {levelLabel}
      </div>

      {/* Detail panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Token name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CopyToClipboard text={token.name}>
            <code style={{
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--dsx-color-text-default)',
            }}>
              {token.name}
            </code>
          </CopyToClipboard>
        </div>

        {/* CSS var prefix */}
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--dsx-color-text-muted)' }}>
          {token.cssVarPrefix}-*
        </div>

        {/* Description */}
        {token.description && (
          <div style={{ fontSize: 13, color: 'var(--dsx-color-text-muted)', marginBottom: 4 }}>
            {token.description}
          </div>
        )}

        {/* Shadow layers breakdown */}
        {token.layers.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {token.layers.map((layer, idx) => (
              <LayerRow
                key={idx}
                layer={layer}
                layerIndex={idx}
                totalLayers={token.layers.length}
                cssVarPrefix={token.cssVarPrefix}
              />
            ))}
          </div>
        )}

        {/* Full box-shadow string */}
        {token.boxShadowString && (
          <div style={{ marginTop: 8 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--dsx-color-text-muted)',
              marginBottom: 4,
            }}>
              box-shadow
            </div>
            <CopyToClipboard text={token.boxShadowString}>
              <code style={{
                display: 'block',
                fontFamily: 'monospace',
                fontSize: 11,
                padding: '6px 8px',
                backgroundColor: 'var(--dsx-color-surface-panel)',
                borderRadius: 4,
                wordBreak: 'break-all',
                color: 'var(--dsx-color-text-default)',
              }}>
                {token.boxShadowString}
              </code>
            </CopyToClipboard>
          </div>
        )}
      </div>
    </div>
  )
}
