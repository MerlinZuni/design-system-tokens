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

  const codeTagStyle: React.CSSProperties = {
    backgroundColor: 'var(--dsx-color-background-subtle)',
    border: '1px solid var(--dsx-color-border-default)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontFamily: 'monospace',
    fontSize: '14px',
    color: 'var(--dsx-color-text-default)',
  }

  const detailValueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: 'var(--dsx-color-text-default)',
  }

  const detailLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--dsx-color-text-muted)',
    margin: 0,
    lineHeight: '1.8',
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
        <div style={{ marginBottom: '8px' }}>
          <CopyToClipboard text={name}>
            <code style={codeTagStyle}>{name}</code>
          </CopyToClipboard>
        </div>

        <p style={detailLabelStyle}>
          Font size: <span style={detailValueStyle}>{rawFontSize || '—'}</span>
          {fontSize && (
            <>
              {' '}
              <CopyToClipboard text={fontSize}>
                <code style={codeTagStyle}>{fontSize}</code>
              </CopyToClipboard>
            </>
          )}
        </p>
        <p style={detailLabelStyle}>
          Font weight: <span style={detailValueStyle}>{rawFontWeight || '—'}</span>
        </p>
        <p style={detailLabelStyle}>
          Line height: <span style={detailValueStyle}>{rawLineHeight || '—'}</span>
        </p>
      </div>
    </div>
  )
}
