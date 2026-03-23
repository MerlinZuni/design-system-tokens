// TODO: replace with Figma component node ID from Dev Mode
import figma from '@figma/code-connect/react'
import { Text } from './Text'

figma.connect(Text, 'https://www.figma.com/design/TODO-FILE-KEY/Design-System-X?node-id=TODO-NODE-ID', {
  props: {
    variant: figma.enum('Variant', {
      Display: 'display',
      'Heading XL': 'heading-xl',
      'Heading LG': 'heading-lg',
      'Heading MD': 'heading-md',
      'Heading SM': 'heading-sm',
      'Body LG': 'body-lg',
      'Body MD': 'body-md',
      'Body SM': 'body-sm',
      Label: 'label',
      Caption: 'caption',
      Code: 'code',
    }),
    children: figma.string('Content'),
  },
  example: ({ variant, children }) => (
    <Text variant={variant}>{children}</Text>
  ),
})
