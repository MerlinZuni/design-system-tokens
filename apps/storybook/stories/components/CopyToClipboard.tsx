import React, { useState, useCallback } from 'react'

interface CopyToClipboardProps {
  text: string
  children: React.ReactNode
}

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
        fill="currentColor"
      />
    </svg>
  )
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CopyToClipboard({ text, children }: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [text])

  return (
    <span
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Copy ${text}`}
      style={{
        cursor: 'pointer',
        padding: '2px 4px',
        borderRadius: '3px',
        transition: 'background-color 0.15s',
        backgroundColor: copied ? 'var(--dsx-color-highlight-selected)' : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {children}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: copied ? 'var(--dsx-color-text-default)' : 'var(--dsx-color-text-muted)',
          transition: 'color 0.15s',
          flexShrink: 0,
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
      {copied && (
        <span className="sr-only" aria-live="polite">
          Copied to clipboard
        </span>
      )}
    </span>
  )
}
