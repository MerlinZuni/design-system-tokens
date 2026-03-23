import React from 'react'

export type SpacingKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch'

/** Props for the Stack component. */
export interface StackProps {
  /** Vertical gap between children, mapped to spacing tokens. */
  gap?: SpacingKey
  /** Cross-axis alignment. */
  align?: StackAlign
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

const ALIGN_MAP: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
}

/**
 * Stack arranges children vertically with consistent spacing from the design token scale.
 * Use `gap` to control spacing and `align` for cross-axis alignment.
 */
export function Stack({
  gap = 'md',
  align = 'stretch',
  as: Component = 'div',
  children,
  className,
  style,
  ...rest
}: StackProps & Record<string, unknown>) {
  return (
    <Component
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: GAP_MAP[gap],
        alignItems: ALIGN_MAP[align],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}
