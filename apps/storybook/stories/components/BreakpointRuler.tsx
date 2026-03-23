import React from 'react'
import { CopyToClipboard } from './CopyToClipboard'

interface BreakpointRulerProps {
  breakpoints: Record<string, string> // { sm: '640px', md: '768px', ... }
}

/** Maps breakpoint names to their TypeScript constant export names */
const TS_CONSTANT_NAMES: Record<string, string> = {
  sm: 'GridBreakpointSm',
  md: 'GridBreakpointMd',
  lg: 'GridBreakpointLg',
  xl: 'GridBreakpointXl',
  '2xl': 'GridBreakpoint2xl',
}

/** Alternating colors for ruler segments */
const SEGMENT_COLORS = [
  'var(--dsx-color-action-default)',
  'var(--dsx-color-secondary-300)',
]

export function BreakpointRuler({ breakpoints }: BreakpointRulerProps) {
  // Parse px values to numbers and sort by value
  const sorted = Object.entries(breakpoints)
    .map(([name, value]) => ({ name, pxValue: parseInt(value, 10), rawValue: value }))
    .sort((a, b) => a.pxValue - b.pxValue)

  const maxValue = sorted.length > 0 ? sorted[sorted.length - 1].pxValue : 1536

  // Build segments: each segment spans from the previous breakpoint to the current
  const segments = sorted.map((bp, idx) => {
    const prev = idx === 0 ? 0 : sorted[idx - 1].pxValue
    const width = ((bp.pxValue - prev) / maxValue) * 100
    return {
      ...bp,
      widthPercent: width,
      color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
    }
  })

  return (
    <div>
      {/* Ruler container */}
      <div style={{
        minWidth: 640,
        overflowX: 'auto',
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
          {segments.map((seg) => (
            <div
              key={seg.name}
              style={{
                width: `${seg.widthPercent}%`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Breakpoint name label above bar */}
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 4,
                color: 'var(--dsx-color-text-default)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {seg.name}
              </div>

              {/* Color segment bar */}
              <div style={{
                width: '100%',
                height: 40,
                backgroundColor: seg.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }} />

              {/* px value label below bar */}
              <div style={{
                fontSize: 12,
                fontFamily: "'Google Sans Code', monospace",
                color: 'var(--dsx-color-text-muted)',
                marginTop: 4,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {seg.rawValue}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reference table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{
              textAlign: 'left',
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--dsx-color-text-muted)',
              borderBottom: '1px solid var(--dsx-color-border-subtle)',
            }}>
              Breakpoint
            </th>
            <th style={{
              textAlign: 'left',
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--dsx-color-text-muted)',
              borderBottom: '1px solid var(--dsx-color-border-subtle)',
            }}>
              TS Constant
            </th>
            <th style={{
              textAlign: 'left',
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--dsx-color-text-muted)',
              borderBottom: '1px solid var(--dsx-color-border-subtle)',
            }}>
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((bp, idx) => {
            const tsConstant = TS_CONSTANT_NAMES[bp.name] ?? `GridBreakpoint${bp.name}`
            return (
              <tr
                key={bp.name}
                style={{
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--dsx-color-surface-panel)',
                }}
              >
                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{bp.name}</td>
                <td style={{ padding: '8px 12px' }}>
                  <CopyToClipboard text={tsConstant}>
                    <code style={{ fontFamily: "'Google Sans Code', monospace", fontSize: 13 }}>{tsConstant}</code>
                  </CopyToClipboard>
                </td>
                <td style={{ padding: '8px 12px', fontFamily: "'Google Sans Code', monospace", fontSize: 13 }}>{bp.rawValue}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
