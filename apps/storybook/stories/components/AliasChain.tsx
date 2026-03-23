import React from 'react'

interface AliasChainProps {
  chain: string[]  // e.g. ['color.background.default', 'color.neutral.0', '#ffffff']
}

export function AliasChain({ chain }: AliasChainProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        fontFamily: "'Google Sans Code', monospace",
        color: 'var(--dsx-color-text-muted)',
        backgroundColor: 'var(--dsx-color-surface-panel)',
        padding: '2px 6px',
        borderRadius: '4px',
      }}
    >
      {chain.map((segment, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span style={{ color: 'var(--dsx-color-action-default)' }}>{' \u2192 '}</span>
          )}
          <span>{segment}</span>
        </React.Fragment>
      ))}
    </span>
  )
}
