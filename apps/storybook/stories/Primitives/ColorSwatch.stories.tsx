import type { Meta, StoryObj } from '@storybook/react'
import { ColorSwatch } from '@design-system-x/primitives'

const meta = {
  title: 'Primitives/ColorSwatch',
  component: ColorSwatch,
  argTypes: {
    tokenVar: { control: 'text' },
    label: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof ColorSwatch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tokenVar: 'var(--dsx-color-brand-500)',
    label: 'brand.500',
    size: 'md',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'flex-end' }}>
      <ColorSwatch tokenVar="var(--dsx-color-brand-500)" label="sm" size="sm" />
      <ColorSwatch tokenVar="var(--dsx-color-brand-500)" label="md" size="md" />
      <ColorSwatch tokenVar="var(--dsx-color-brand-500)" label="lg" size="lg" />
    </div>
  ),
}

export const SemanticToken: Story = {
  args: {
    tokenVar: 'var(--dsx-color-background-default)',
    label: 'background.default',
  },
}

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
      {(['100', '200', '300', '400', '500', '600', '700', '800', '900'] as const).map((step) => (
        <ColorSwatch
          key={step}
          tokenVar={`var(--dsx-color-brand-${step})`}
          label={`brand.${step}`}
          size="md"
        />
      ))}
    </div>
  ),
}
