import type { StorybookConfig } from '@storybook/react-vite'

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-designs'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite') as '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@design-system-x/primitives': resolve(__dirname, '../../../packages/primitives/src/index.ts'),
    }
    return config
  },
  docs: {
    autodocs: 'tag',
  },
  previewHead: (head) => `${head}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&family=Google+Sans+Code:wght@400;500;700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
<script>
  // Sync Brand/Mode toolbar globals to data attributes on pure MDX pages
  // (decorator only fires on pages with stories)
  (function() {
    var poll = setInterval(function() {
      var ch = window.__STORYBOOK_ADDONS_CHANNEL__;
      if (ch) {
        clearInterval(poll);
        ch.on('updateGlobals', function(e) {
          var g = e.globals;
          if (g.mode !== undefined) document.documentElement.setAttribute('data-theme', g.mode);
          if (g.brand !== undefined) document.documentElement.setAttribute('data-brand', g.brand);
        });
      }
    }, 100);
  })();
</script>
`,
  typescript: {
    reactDocgen: 'react-docgen',
  },
}

export default config
