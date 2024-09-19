import { defineConfig } from 'vitepress'
import { genNotesFeed } from './genFeed.js'

export default defineConfig({
  title: `ideaman's Notes`,
  description: 'アイデアマンズ株式会社の研究ノート',
  cleanUrls: true,
  head: [
    ['meta', { name: 'twitter:site', content: '@ideamans' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    [
      'meta',
      {
        name: 'twitter:image',
        content: 'https://logo.ideamans.com/ogp.svg?width=800&phrase=notes'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/notes.svg'
      }
    ],
    // [
    //   'script',
    //   {
    //     src: 'https://cdn.usefathom.com/script.js',
    //     'data-site': 'NYHGSGQV',
    //     'data-spa': 'auto',
    //     defer: ''
    //   }
    // ]
    [
      'script',
      {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-YQBLSY0PKS',
        async: '1'
      }
    ],
    [
      'script',
      {},
      `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-YQBLSY0PKS');
`
    ]
  ],
  buildEnd: genNotesFeed,
  appearance: false
})
