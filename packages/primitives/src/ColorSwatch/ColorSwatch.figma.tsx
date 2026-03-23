// TODO: replace with Figma component node ID from Dev Mode
import figma from '@figma/code-connect/react'
import { ColorSwatch } from './ColorSwatch'

figma.connect(ColorSwatch, 'https://www.figma.com/design/TODO-FILE-KEY/Design-System-X?node-id=TODO-NODE-ID', {
  props: {
    size: figma.enum('Size', {
      Small: 'sm',
      Medium: 'md',
      Large: 'lg',
    }),
    label: figma.string('Label'),
  },
  example: ({ size, label }) => (
    <ColorSwatch tokenVar="var(--dsx-color-brand-500)" size={size} label={label} />
  ),
})
