import React from 'react'
import type { Preview } from '@storybook/react'

// Primitive tokens (--dsx-color-*, --dsx-spacing-*, etc.) — must import first
import '@design-system-x/tokens/css'
// Default semantic layer — Phase 5 will replace this static import with dynamic switcher
import '@design-system-x/tokens/parent-brand/light'

const preview: Preview = {
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--dsx-color-background-default)', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
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
          'Styles',
          'Primitives',
        ],
      },
    },
  },
}

export default preview
