import type { Meta, StoryObj } from '@storybook/react'
import { Inline } from '@design-system-x/primitives'

const Placeholder = ({ label }: { label: string }) => (
  <div style={{ padding: '8px 12px', backgroundColor: 'var(--dsx-color-background-subtle)', border: '1px solid var(--dsx-color-border-default)', borderRadius: 4, fontSize: '14px', whiteSpace: 'nowrap' }}>
    {label}
  </div>
)

const meta = {
  title: 'Primitives/Inline',
  component: Inline,
  argTypes: {
    gap: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
  },
} satisfies Meta<typeof Inline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    gap: 'sm',
  },
  render: (args) => (
    <Inline {...args}>
      <Placeholder label="Item 1" />
      <Placeholder label="Item 2" />
      <Placeholder label="Item 3" />
      <Placeholder label="Item 4" />
    </Inline>
  ),
}

export const Wrapping: Story = {
  render: () => (
    <div style={{ maxWidth: '480px' }}>
      <Inline gap="sm">
        <Placeholder label="Tag one" />
        <Placeholder label="Tag two" />
        <Placeholder label="Tag three" />
        <Placeholder label="Tag four" />
        <Placeholder label="Tag five" />
        <Placeholder label="Tag six" />
        <Placeholder label="Tag seven" />
        <Placeholder label="Tag eight" />
        <Placeholder label="Tag nine" />
      </Inline>
    </div>
  ),
}

export const Justified: Story = {
  args: {
    justify: 'between',
  },
  render: (args) => (
    <Inline {...args}>
      <Placeholder label="Left" />
      <Placeholder label="Center" />
      <Placeholder label="Right" />
    </Inline>
  ),
}
