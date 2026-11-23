import { defineConfig } from 'vitepress';

const REPO = 'https://github.com/tabkram/ai-icon-studio';

export default defineConfig({
  title: 'AI Icon Studio',
  description: 'A generic icon generator: line, tinted, colour and animated SVG, an icon font and a catalogue.',
  lang: 'en-US',
  base: '/ai-icon-studio/',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/ai-icon-studio/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#14b8a6' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Manual', link: '/manual' },
      { text: 'Guide', link: '/guide/what-is-ai-icon-studio', activeMatch: '/guide/' },
      { text: 'Examples', link: '/examples' },
      { text: 'Reference', link: '/reference/icon-format', activeMatch: '/reference/' },
      { text: 'Gallery', link: '/gallery/catalogue/index.html', target: '_blank' }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is AI Icon Studio?', link: '/guide/what-is-ai-icon-studio' },
          { text: 'User manual', link: '/manual' },
          { text: 'Step by step', link: '/guide/workflow' },
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Examples', link: '/examples' }
        ]
      },
      {
        text: 'Guide',
        items: [
          { text: 'Draw your own icons', link: '/guide/draw-icons' },
          { text: 'Render variants', link: '/guide/variants' },
          { text: 'Proposals', link: '/guide/proposals' },
          { text: 'Icon variants (badges)', link: '/guide/variants-badges' },
          { text: 'Animations', link: '/guide/animations' },
          { text: 'Icon font', link: '/guide/font' },
          { text: 'Use with an AI agent', link: '/guide/ai-skill' },
          { text: 'Publishing', link: '/guide/publishing' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Icon format', link: '/reference/icon-format' },
          { text: 'CLI', link: '/reference/cli' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: REPO }],
    search: { provider: 'local' }
  }
})
