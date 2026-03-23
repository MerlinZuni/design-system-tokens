import React from 'react'

export type SpacingKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
export type InlineAlign = 'start' | 'center' | 'end' | 'stretch'
export type InlineJustify = 'start' | 'center' | 'end' | 'between'

/** Props for the Inline component. */
export interface InlineProps {
  /** Horizontal gap between children, mapped to spacing tokens. */
  gap?: SpacingKey
  /** Cross-axis alignment. */
  align?: InlineAlign
  /** Main-axis justification. */
  justify?: InlineJustify
  /** Override the rendered HTML element. Defaults to 'div'. */
  as?: React.ElementType
  /** Child content. */
  children?: React.ReactNode
  /** Additional CSS class name. */
  className?: string
  /** Inline style overrides. */
  style?: React.CSSProperties
}

const GAP_MAP: Record<SpacingKey, string> = {
  xs: 'var(--dsx-spacing-1)',
  sm: 'var(--dsx-spacing-2)',
  md: 'var(--dsx-spacing-4)',
  lg: 'var(--dsx-spacing-6)',
  xl: 'var(--dsx-spacing-8)',
  '2xl': 'var(--dsx-spacing-12)',
  '3xl': 'var(--dsx-spacing-16)',
}

const ALIGN_MAP: Record<InlineAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
}

const JUSTIFY_MAP: Record<InlineJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
}

/**
 * Inline arranges children horizontally with wrapping and consistent spacing.
 * Use `gap` for spacing, `align` for cross-axis, and `justify` for main-axis layout.
 */
export function Inline({
  gap = 'sm',
  align = 'center',
  justify = 'start',
  as: Component = 'div',
  children,
  className,
  style,
  ...rest
}: InlineProps & Record<string, unknown>) {
  return (
    <Component
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP_MAP[gap],
        alignItems: ALIGN_MAP[align],
        justifyContent: JUSTIFY_MAP[justify],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}
