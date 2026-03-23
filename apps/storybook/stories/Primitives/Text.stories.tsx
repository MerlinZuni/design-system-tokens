import type { Meta, StoryObj } from '@storybook/react'
import { Text } from '@design-system-x/primitives'

const meta = {
  title: 'Primitives/Text',
  component: Text,
  argTypes: {
    variant: {
      control: 'select',
      options: ['display', 'heading-xl', 'heading-lg', 'heading-md', 'heading-sm', 'body-lg', 'body-md', 'body-sm', 'label', 'caption', 'code'],
    },
    as: { control: 'text' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'body-md',
    children: 'The quick brown fox jumps over the lazy dog',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['display', 'heading-xl', 'heading-lg', 'heading-md', 'heading-sm', 'body-lg', 'body-md', 'body-sm', 'label', 'caption', 'code'] as const).map((v) => (
        <div key={v} style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontFamily: "'Google Sans Code', monospace", color: 'var(--dsx-color-text-muted)', minWidth: '100px' }}>{v}</span>
          <Text variant={v}>The quick brown fox</Text>
        </div>
      ))}
    </div>
  ),
}

export const WithSemanticElement: Story = {
  args: {
    variant: 'heading-lg',
    as: 'h2',
    children: 'Section Heading',
  },
}

export const Truncated: Story = {
  args: {
    variant: 'body-md',
    children: 'This is a very long piece of text that will be truncated when it exceeds the maximum width of its container element',
    style: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: 300,
    },
  },
}
