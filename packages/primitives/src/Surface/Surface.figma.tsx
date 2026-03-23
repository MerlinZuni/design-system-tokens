// TODO: replace with Figma component node ID from Dev Mode
import figma from '@figma/code-connect/react'
import { Surface } from './Surface'

figma.connect(Surface, 'https://www.figma.com/design/TODO-FILE-KEY/Design-System-X?node-id=TODO-NODE-ID', {
  props: {
    elevation: figma.enum('Elevation', {
      None: 'none',
      Small: 'sm',
      Medium: 'md',
      Large: 'lg',
    }),
    background: figma.enum('Background', {
      Default: 'default',
      Subtle: 'subtle',
      Card: 'card',
      Inverse: 'inverse',
    }),
    border: figma.boolean('Border'),
    children: figma.children('Content'),
  },
  example: ({ elevation, background, border, children }) => (
    <Surface elevation={elevation} background={background} border={border}>
      {children}
    </Surface>
  ),
})
