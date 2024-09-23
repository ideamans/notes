import Dayjs from 'dayjs'
// import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { genNotesFeed } from './genFeed.js'

export default withMermaid({
  title: `ideaman's Notes`,
  description: 'アイデアマンズ株式会社の研究ノート',
  cleanUrls: false,
  head: [
    ['meta', { name: 'twitter:site', content: '@ideamans' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    // [
    //   'meta',
    //   {
    //     name: 'twitter:image',
    //     content: 'https://logo.ideamans.com/ogp.svg?width=800&phrase=notes'
    //   }
    // ],
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
  transformHead: ({ head, pageData }) => {
    const ogp = new URL('https://banners.ideamans.com/banners/type-a')
    ogp.searchParams.set(
      'bgUrl',
      'https://notes.ideamans.com/ogp-background.jpg'
    )
    ogp.searchParams.set('text0', `ideaman's Notes`)
    ogp.searchParams.set('text0width', '60%')

    if (pageData.frontmatter.index) {
      // トップページ
      ogp.searchParams.set('text1', pageData.frontmatter.subtext)
      ogp.searchParams.set('text1width', '60%')
    } else {
      // 記事ページ
      const title = pageData.frontmatter.title
      const id = pageData.frontmatter.id
      const date = Dayjs(pageData.frontmatter.date).format('YYYY-MM-DD')

      ogp.searchParams.set('text1', title)
      ogp.searchParams.set('texts[1].fontSize', '5%')
      ogp.searchParams.set('texts[1].minWidth', '60%')
      ogp.searchParams.set('texts[1].maxWidth', '90%')
      ogp.searchParams.set('text2', `${date} @${id}`)
      ogp.searchParams.set(`text[2].fontSize`, '3%')
      ogp.searchParams.set(`text[2].minWidth`, '30%')
      ogp.searchParams.set(`text[2].maxWidth`, '40%')
    }

    head.push(['meta', { property: 'og:image', content: ogp.href }])
  },
  appearance: false
})
