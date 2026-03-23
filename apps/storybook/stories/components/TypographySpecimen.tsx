import React from 'react'
import { CopyToClipboard } from './CopyToClipboard'

interface TypographySpecimenProps {
  name: string          // e.g. "typography.text-base"
  fontFamily: string    // CSS var name: "--dsx-typography-text-base-font-family"
  fontSize: string      // CSS var name: "--dsx-typography-text-base-font-size"
  fontWeight: string    // CSS var name: "--dsx-typography-text-base-font-weight"
  lineHeight: string    // CSS var name: "--dsx-typography-text-base-line-height"
  letterSpacing: string // CSS var name: "--dsx-typography-text-base-letter-spacing"
  rawFontSize: string   // e.g. "16px"
  rawFontWeight: string // e.g. "400"
  rawLineHeight: string // e.g. "24px"
  description?: string
}

export function TypographySpecimen({
  name,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  rawFontSize,
  rawFontWeight,
  rawLineHeight,
}: TypographySpecimenProps) {
  // Extract the scale step from the full token name e.g. "typography.text-base" -> "text-base"
  const step = name.replace('typography.', '')

  const specimenStyle: React.CSSProperties = {
    fontFamily: `var(--dsx-typography-${step}-font-family)`,
    fontSize: `var(${fontSize})`,
    fontWeight: `var(${fontWeight})`,
    lineHeight: `var(${lineHeight})`,
    letterSpacing: `var(${letterSpacing})`,
    margin: 0,
    wordBreak: 'break-word',
    overflow: 'hidden',
  }

  const detailLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: 'var(--dsx-color-text-muted)',
    fontFamily: 'monospace',
    margin: 0,
    lineHeight: '1.6',
  }

  const detailValueStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--dsx-color-text-default)',
    fontFamily: 'monospace',
    fontWeight: 500,
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '24px',
        padding: '16px 0',
        borderBottom: '1px solid var(--dsx-color-border-subtle)',
      }}
    >
      {/* Left column — specimen text */}
      <div style={{ flex: '0 0 60%', minWidth: 0 }}>
        <p style={specimenStyle}>The quick brown fox jumps over the lazy dog</p>
      </div>

      {/* Right column — token details */}
      <div style={{ flex: '0 0 40%', minWidth: 0, paddingTop: '4px' }}>
        <div style={{ marginBottom: '6px' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--dsx-color-text-default)',
            }}
          >
            <CopyToClipboard text={name}>{name}</CopyToClipboard>
          </span>
        </div>

        <p style={detailLabelStyle}>
          Font size:{' '}
          <span style={detailValueStyle}>{rawFontSize || '—'}</span>
          {fontSize && (
            <span style={{ color: 'var(--dsx-color-text-subtle)', marginLeft: '6px' }}>
              <CopyToClipboard text={fontSize}>{fontSize}</CopyToClipboard>
            </span>
          )}
        </p>
        <p style={detailLabelStyle}>
          Font weight:{' '}
          <span style={detailValueStyle}>{rawFontWeight || '—'}</span>
        </p>
        <p style={detailLabelStyle}>
          Line height:{' '}
          <span style={detailValueStyle}>{rawLineHeight || '—'}</span>
        </p>
      </div>
    </div>
  )
}
