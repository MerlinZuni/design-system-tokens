import React from 'react'
import { CopyToClipboard } from './CopyToClipboard'

interface SpacingBarProps {
  name: string       // e.g. "spacing.4"
  cssVar: string     // e.g. "--dsx-spacing-4"
  rawValue: string   // e.g. "16px"
}

export function SpacingBar({ name, cssVar, rawValue }: SpacingBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 0',
        borderBottom: '1px solid var(--dsx-color-border-subtle)',
      }}
    >
      {/* Left side — token label */}
      <div
        style={{
          width: '120px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <CopyToClipboard text={name}>
          <span
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: 'var(--dsx-color-text-default)',
              fontWeight: 500,
            }}
          >
            {name}
          </span>
        </CopyToClipboard>
        <CopyToClipboard text={rawValue}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--dsx-color-text-muted)',
            }}
          >
            {rawValue}
          </span>
        </CopyToClipboard>
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
