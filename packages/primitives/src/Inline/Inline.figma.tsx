// TODO: replace with Figma component node ID from Dev Mode
import figma from '@figma/code-connect/react'
import { Inline } from './Inline'

figma.connect(Inline, 'https://www.figma.com/design/TODO-FILE-KEY/Design-System-X?node-id=TODO-NODE-ID', {
  props: {
    gap: figma.enum('Gap', {
      XS: 'xs',
      SM: 'sm',
      MD: 'md',
      LG: 'lg',
      XL: 'xl',
    }),
    justify: figma.enum('Justify', {
      Start: 'start',
      Center: 'center',
      End: 'end',
      Between: 'between',
    }),
    children: figma.children('Items'),
  },
  example: ({ gap, justify, children }) => (
    <Inline gap={gap} justify={justify}>{children}</Inline>
  ),
})
