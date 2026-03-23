import React from 'react'

/** Props for the VisuallyHidden component. */
export interface VisuallyHiddenProps {
  /** Content hidden visually but accessible to screen readers. */
  children: React.ReactNode
}

const VISUALLY_HIDDEN_STYLES: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
}

/**
 * VisuallyHidden renders content that is invisible to sighted users
 * but accessible to screen readers. Use for accessible labels, skip links,
 * and other screen-reader-only content.
 */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span style={VISUALLY_HIDDEN_STYLES}>{children}</span>
}
