import React, { useState } from 'react'

export type ColorSwatchSize = 'sm' | 'md' | 'lg'

/** Props for the ColorSwatch component. */
export interface ColorSwatchProps {
  /** CSS custom property reference, e.g. 'var(--dsx-color-brand-500)'. */
  tokenVar: string
  /** Token name label displayed below the swatch. */
  label?: string
  /** Swatch size variant. */
  size?: ColorSwatchSize
  /** Accessible label for the swatch (token name + resolved value). */
  'aria-label'?: string
}

const SIZE_MAP: Record<ColorSwatchSize, number> = { sm: 32, md: 48, lg: 64 }

/**
 * ColorSwatch displays a color token visually as a square swatch with an optional label.
 * Used in documentation, not production UI.
 */
export function ColorSwatch({
  tokenVar,
  label,
  size = 'md',
  'aria-label': ariaLabel,
}: ColorSwatchProps) {
  const [hovered, setHovered] = useState(false)
  const px = SIZE_MAP[size]
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--dsx-spacing-1)' }}>
      <div
        role="img"
        aria-label={ariaLabel ?? label ?? 'Color swatch'}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: px,
          height: px,
          backgroundColor: tokenVar,
          border: `1px solid ${hovered ? 'var(--dsx-color-action-default)' : 'var(--dsx-color-border-default)'}`,
          borderRadius: 4,
        }}
      />
      {label && (
        <span style={{
          fontSize: 'var(--dsx-typography-text-xs-font-size)',
          fontFamily: 'var(--dsx-typography-text-xs-font-family)',
          fontWeight: 'var(--dsx-typography-text-xs-font-weight)',
          color: 'var(--dsx-color-text-muted)',
        }}>
          {label}
        </span>
      )}
    </div>
  )
}
