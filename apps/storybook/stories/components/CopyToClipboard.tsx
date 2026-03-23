import React, { useState, useCallback } from 'react'

interface CopyToClipboardProps {
  text: string
  children: React.ReactNode
}

export function CopyToClipboard({ text, children }: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 300)
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
      }}
    >
      {children}
      {copied && (
        <span className="sr-only" aria-live="polite">
          Copied to clipboard
        </span>
      )}
    </span>
  )
}
