import React from 'react'

export type SurfaceElevation = 'none' | 'sm' | 'md' | 'lg'
export type SurfaceBackground = 'default' | 'subtle' | 'card' | 'inverse'

/** Props for the Surface component. */
export interface SurfaceProps {
  /** Elevation level controlling box-shadow. */
  elevation?: SurfaceElevation
  /** Background token variant. */
  background?: SurfaceBackground
  /** Show border. */
  border?: boolean
  /** Override the rendered HTML element. Defaults to 'div'. */
  as?: React.ElementType
  /** Child content. */
  children?: React.ReactNode
  /** Additional CSS class name. */
  className?: string
  /** Inline style overrides. */
  style?: React.CSSProperties
}

const BG_MAP: Record<SurfaceBackground, string> = {
  default: 'var(--dsx-color-background-default)',
  subtle: 'var(--dsx-color-background-subtle)',
  card: 'var(--dsx-color-surface-card)',
  inverse: 'var(--dsx-color-background-inverse)',
}

const SHADOW_MAP: Record<SurfaceElevation, string> = {
  none: 'none',
  sm: 'var(--dsx-shadow-sm)',
  md: 'var(--dsx-shadow-md)',
  lg: 'var(--dsx-shadow-lg)',
}

/**
 * Surface renders a block container with semantic background, optional border, and shadow.
 * Use `elevation` for depth and `background` for semantic surface color.
 */
export function Surface({
  elevation = 'none',
  background = 'default',
  border = false,
  as: Component = 'div',
  children,
  className,
  style,
  ...rest
}: SurfaceProps & Record<string, unknown>) {
  return (
    <Component
      className={className}
      style={{
        backgroundColor: BG_MAP[background],
        boxShadow: SHADOW_MAP[elevation],
        border: border ? '1px solid var(--dsx-color-border-default)' : undefined,
        borderRadius: 4,
        padding: 'var(--dsx-spacing-4)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}
