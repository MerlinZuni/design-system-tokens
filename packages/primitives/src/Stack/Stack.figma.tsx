// TODO: replace with Figma component node ID from Dev Mode
import figma from '@figma/code-connect/react'
import { Stack } from './Stack'

figma.connect(Stack, 'https://www.figma.com/design/TODO-FILE-KEY/Design-System-X?node-id=TODO-NODE-ID', {
  props: {
    gap: figma.enum('Gap', {
      XS: 'xs',
      SM: 'sm',
      MD: 'md',
      LG: 'lg',
      XL: 'xl',
    }),
    align: figma.enum('Align', {
      Start: 'start',
      Center: 'center',
      End: 'end',
      Stretch: 'stretch',
    }),
    children: figma.children('Items'),
  },
  example: ({ gap, align, children }) => (
    <Stack gap={gap} align={align}>{children}</Stack>
  ),
})
