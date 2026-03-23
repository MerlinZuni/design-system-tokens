import React from 'react'
import { CopyToClipboard } from './CopyToClipboard'

interface SpacingBarProps {
  name: string       // e.g. "spacing.4"
  cssVar: string     // e.g. "--dsx-spacing-4"
  rawValue: string   // e.g. "16px"
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

export function SpacingBar({ name, cssVar, rawValue }: SpacingBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid var(--dsx-color-border-subtle)',
      }}
    >
      {/* Left side — token label */}
      <div
        style={{
          width: '280px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <CopyToClipboard text={name}>
          <code style={codeTagStyle}>{name}</code>
        </CopyToClipboard>
        <span
          style={{
            fontSize: '14px',
            fontFamily: 'monospace',
            color: 'var(--dsx-color-text-muted)',
          }}
        >
          {rawValue}
        </span>
      </div>

      {/* Right side — horizontal bar */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          title={cssVar}
          style={{
            height: '16px',
            width: `var(${cssVar})`,
            maxWidth: '100%',
            backgroundColor: 'var(--dsx-color-action-default)',
            borderRadius: '2px',
            minWidth: rawValue === '0px' ? '2px' : undefined,
            opacity: rawValue === '0px' ? 0.3 : 1,
          }}
        />
      </div>
    </div>
  )
}
