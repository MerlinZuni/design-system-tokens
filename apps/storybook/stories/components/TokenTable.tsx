import React from 'react'
import { CopyToClipboard } from './CopyToClipboard'
import { AliasChain } from './AliasChain'
import type { TokenRow, SemanticTokenRow } from './token-data'

interface TokenTableProps {
  tokens: (TokenRow | SemanticTokenRow)[]
  showAliasChain?: boolean
  renderPreview?: (token: TokenRow) => React.ReactNode
}

function isSemanticTokenRow(token: TokenRow | SemanticTokenRow): token is SemanticTokenRow {
  return 'alias' in token && 'primitiveRef' in token
}

export function TokenTable({ tokens, showAliasChain = false, renderPreview }: TokenTableProps) {
  if (tokens.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '32px',
          color: 'var(--dsx-color-text-subtle)',
          fontSize: '14px',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>No tokens in this category</p>
        <p style={{ margin: '8px 0 0', fontSize: '12px' }}>
          This category has no tokens defined. Check the token source files in
          packages/tokens/tokens/.
        </p>
      </div>
    )
  }

  const headerCellStyle: React.CSSProperties = {
    backgroundColor: 'var(--dsx-color-surface-panel)',
    fontWeight: 600,
    fontSize: '12px',
    textAlign: 'left',
    padding: '8px',
    borderBottom: '2px solid var(--dsx-color-border-default)',
    whiteSpace: 'nowrap',
  }

  const rowStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--dsx-color-border-subtle)',
  }

  const cellStyle: React.CSSProperties = {
    padding: '8px',
    verticalAlign: 'middle',
  }

  const codeCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontFamily: "'Google Sans Code', monospace",
  }

  const codeTagStyle: React.CSSProperties = {
    backgroundColor: 'var(--dsx-color-background-subtle)',
    border: '1px solid var(--dsx-color-border-default)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontFamily: "'Google Sans Code', monospace",
    fontSize: '14px',
    color: 'var(--dsx-color-text-default)',
  }

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
      }}
    >
      <thead>
        <tr>
          {renderPreview && <th style={headerCellStyle}>Preview</th>}
          <th style={headerCellStyle}>Token Name</th>
          <th style={headerCellStyle}>CSS Variable</th>
          <th style={headerCellStyle}>Value</th>
          {showAliasChain && <th style={headerCellStyle}>Resolves via</th>}
          <th style={headerCellStyle}>Description</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token, index) => (
          <tr key={token.name} style={rowStyle}>
            {renderPreview && (
              <td style={cellStyle}>{renderPreview(token)}</td>
            )}
            <td style={codeCellStyle}>
              <CopyToClipboard text={token.name}><code style={codeTagStyle}>{token.name}</code></CopyToClipboard>
            </td>
            <td
              style={{
                ...codeCellStyle,
                color: 'var(--dsx-color-text-muted)',
              }}
            >
              <CopyToClipboard text={token.cssVar}><code style={codeTagStyle}>{token.cssVar}</code></CopyToClipboard>
            </td>
            <td style={codeCellStyle}>
              <CopyToClipboard text={token.rawValue}><code style={codeTagStyle}>{token.rawValue}</code></CopyToClipboard>
            </td>
            {showAliasChain && (
              <td style={cellStyle}>
                {isSemanticTokenRow(token) ? (
                  <AliasChain
                    chain={[token.name, token.primitiveRef, token.rawValue]}
                  />
                ) : (
                  <span style={{ color: 'var(--dsx-color-text-subtle)', fontSize: '12px' }}>
                    —
                  </span>
                )}
              </td>
            )}
            <td
              style={{
                ...cellStyle,
                color: 'var(--dsx-color-text-muted)',
                fontSize: '12px',
              }}
            >
              {token.description ?? ''}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
