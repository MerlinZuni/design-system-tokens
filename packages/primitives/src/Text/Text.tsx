import React from 'react'

export type TextVariant =
  | 'display'
  | 'heading-xl'
  | 'heading-lg'
  | 'heading-md'
  | 'heading-sm'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'label'
  | 'caption'
  | 'code'

/** Props for the Text component. */
export interface TextProps {
  /** Typography variant — selects a type scale step. */
  variant?: TextVariant
  /** Override the rendered HTML element (e.g. 'h1', 'p', 'label'). Defaults to 'span'. */
  as?: React.ElementType
  /** Text content. */
  children?: React.ReactNode
  /** Additional CSS class name. */
  className?: string
  /** Inline style overrides. */
  style?: React.CSSProperties
}

const VARIANT_TO_STEP: Record<TextVariant, string> = {
  display: 'text-9xl',
  'heading-xl': 'text-4xl',
  'heading-lg': 'text-3xl',
  'heading-md': 'text-2xl',
  'heading-sm': 'text-xl',
  'body-lg': 'text-lg',
  'body-md': 'text-base',
  'body-sm': 'text-sm',
  label: 'text-sm',
  caption: 'text-xs',
  code: 'text-sm',
}

/**
 * Text renders typographically styled text using the design system type scale.
 * Use `variant` to select a typography step. Use `as` to render the
 * semantically correct HTML element (h1-h6, p, span, label, etc.).
 */
export function Text({
  variant = 'body-md',
  as: Component = 'span',
  children,
  style,
  className,
  ...rest
}: TextProps & Record<string, unknown>) {
  const step = VARIANT_TO_STEP[variant]
  const fontFamily = variant === 'code' ? 'monospace' : `var(--dsx-typography-${step}-font-family)`
  return (
    <Component
      className={className}
      style={{
        fontFamily,
        fontSize: `var(--dsx-typography-${step}-font-size)`,
        fontWeight: `var(--dsx-typography-${step}-font-weight)`,
        lineHeight: `var(--dsx-typography-${step}-line-height)`,
        letterSpacing: `var(--dsx-typography-${step}-letter-spacing)`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}
