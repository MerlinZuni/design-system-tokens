import React, { useEffect } from 'react'
import type { Preview, Decorator } from '@storybook/react'

// Primitive tokens (--dsx-color-*, --dsx-spacing-*, etc.) — always loaded
import '@design-system-x/tokens/css'
// All four semantic theme files — data-attribute selectors control which one applies
import '@design-system-x/tokens/parent-brand/light'
import '@design-system-x/tokens/parent-brand/dark'
import '@design-system-x/tokens/child-brand/light'
import '@design-system-x/tokens/child-brand/dark'

// Docs page typography — Archivo Black headers matching Figma page styles
import './docs-theme.css'

// Set initial theme attributes so docs-only pages get themed CSS vars on first load
document.documentElement.setAttribute('data-brand', 'parent')
document.documentElement.setAttribute('data-theme', 'light')

const withThemeAttributes: Decorator = (Story, context) => {
  const { brand = 'parent', mode = 'light' } = context.globals

  useEffect(() => {
    document.documentElement.setAttribute('data-brand', brand)
    document.documentElement.setAttribute('data-theme', mode)
  }, [brand, mode])

  return (
    <div style={{ background: 'var(--dsx-color-background-default)', color: 'var(--dsx-color-text-default)', fontFamily: 'var(--dsx-font-family-default)', padding: '2rem' }}>
      <Story />
    </div>
  )
}

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Brand token set',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: [
          { value: 'parent', title: 'Parent Brand' },
          { value: 'child', title: 'Child Brand' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    brand: 'parent',
    mode: 'light',
  },
  beforeEach: (context) => {
    const { brand = 'parent', mode = 'light' } = context.globals
    document.documentElement.setAttribute('data-brand', brand)
    document.documentElement.setAttribute('data-theme', mode)
  },
  decorators: [withThemeAttributes],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          ['Design Purpose', 'Design Principles'],
          'Tokens',
          ['Colors', 'Typography', 'Spacing', 'Elevation', 'Grid'],
          'Styles',
          ['Headings', 'Body Text', 'Surfaces', 'Interactive States', 'Feedback'],
          'Primitives',
        ],
      },
    },
  },
}

export default preview
