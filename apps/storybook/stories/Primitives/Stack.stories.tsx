import type { Meta, StoryObj } from '@storybook/react'
import { Stack } from '@design-system-x/primitives'

const Placeholder = ({ label }: { label: string }) => (
  <div style={{ padding: '12px 16px', backgroundColor: 'var(--dsx-color-background-subtle)', border: '1px solid var(--dsx-color-border-default)', borderRadius: 4, fontSize: '14px' }}>
    {label}
  </div>
)

const meta = {
  title: 'Primitives/Stack',
  component: Stack,
  argTypes: {
    gap: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
  },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    gap: 'md',
  },
  render: (args) => (
    <Stack {...args}>
      <Placeholder label="Item 1" />
      <Placeholder label="Item 2" />
      <Placeholder label="Item 3" />
    </Stack>
  ),
}

export const AllGaps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((gap) => (
        <div key={gap}>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--dsx-color-text-muted)', display: 'block', marginBottom: '8px' }}>
            gap="{gap}"
          </span>
          <Stack gap={gap}>
            <Placeholder label="Item 1" />
            <Placeholder label="Item 2" />
          </Stack>
        </div>
      ))}
    </div>
  ),
}

export const WithAlignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '32px', alignItems: 'flex-start' }}>
      {(['start', 'center', 'end'] as const).map((align) => (
        <div key={align} style={{ flex: 1 }}>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--dsx-color-text-muted)', display: 'block', marginBottom: '8px' }}>
            align="{align}"
          </span>
          <Stack gap="sm" align={align}>
            <Placeholder label="Short" />
            <Placeholder label="Medium width item" />
            <Placeholder label="Sm" />
          </Stack>
        </div>
      ))}
    </div>
  ),
}
