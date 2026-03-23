import type { Meta, StoryObj } from '@storybook/react'
import { VisuallyHidden } from '@design-system-x/primitives'

const meta = {
  title: 'Primitives/VisuallyHidden',
  component: VisuallyHidden,
} satisfies Meta<typeof VisuallyHidden>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div>
      <span>Visible label</span>
      <VisuallyHidden>This text is only for screen readers</VisuallyHidden>
    </div>
  ),
}

export const Focusable: Story = {
  render: () => (
    <button
      type="button"
      style={{
        padding: '8px',
        border: '1px solid var(--dsx-color-border-default)',
        borderRadius: 4,
        background: 'var(--dsx-color-background-default)',
        cursor: 'pointer',
      }}
    >
      <span aria-hidden="true">X</span>
      <VisuallyHidden>Close dialog</VisuallyHidden>
    </button>
  ),
}
