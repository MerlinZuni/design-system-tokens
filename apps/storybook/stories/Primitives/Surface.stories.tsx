import type { Meta, StoryObj } from '@storybook/react'
import { Surface } from '@design-system-x/primitives'

const meta = {
  title: 'Primitives/Surface',
  component: Surface,
  argTypes: {
    elevation: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    background: { control: 'select', options: ['default', 'subtle', 'card', 'inverse'] },
    border: { control: 'boolean' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Surface>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Surface content',
  },
}

export const WithElevation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '24px' }}>
      <Surface elevation="sm">
        <span>Elevation: sm</span>
      </Surface>
      <Surface elevation="md">
        <span>Elevation: md</span>
      </Surface>
      <Surface elevation="lg">
        <span>Elevation: lg</span>
      </Surface>
    </div>
  ),
}

export const Inverse: Story = {
  args: {
    background: 'inverse',
    children: 'Inverse surface',
  },
  render: (args) => (
    <Surface {...args}>
      <span style={{ color: 'var(--dsx-color-text-inverse)' }}>Inverse surface</span>
    </Surface>
  ),
}

export const WithBorder: Story = {
  args: {
    border: true,
    background: 'card',
    children: 'Bordered card surface',
  },
}
