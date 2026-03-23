// TODO: replace with Figma component node ID from Dev Mode
import figma from '@figma/code-connect/react'
import { VisuallyHidden } from './VisuallyHidden'

figma.connect(VisuallyHidden, 'https://www.figma.com/design/TODO-FILE-KEY/Design-System-X?node-id=TODO-NODE-ID', {
  props: {
    children: figma.string('Label'),
  },
  example: ({ children }) => (
    <VisuallyHidden>{children}</VisuallyHidden>
  ),
})
