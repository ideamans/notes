import Dayjs from 'dayjs'
// import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { genNotesFeed } from './genFeed.js'

function indexImageUrl(bgUrl: string, subTitle: string): string {
  const ogp = new URL('https://banners.ideamans.com/banners/type-a')
  ogp.searchParams.set('bgUrl', bgUrl)

  ogp.searchParams.set('text0', `ideaman's Notes`)
  ogp.searchParams.set('text0width', '60%')

  ogp.searchParams.set('text1', subTitle)
  ogp.searchParams.set('text1width', '60%')

  return ogp.href
}

function articleImageUrl(bgUrl: string, title: string, meta: string): string {
  const ogp = new URL('https://banners.ideamans.com/banners/type-a')
  ogp.searchParams.set('bgUrl', bgUrl)

  ogp.searchParams.set('text0', `ideaman's Notes`)
  ogp.searchParams.set('text0width', '60%')

  ogp.searchParams.set('text1', title)
  ogp.searchParams.set('texts[1].fontSize', '5%')
  ogp.searchParams.set('texts[1].minWidth', '60%')
  ogp.searchParams.set('texts[1].maxWidth', '90%')
  ogp.searchParams.set('text2', meta)
  ogp.searchParams.set(`text[2].fontSize`, '3%')
  ogp.searchParams.set(`text[2].minWidth`, '30%')
  ogp.searchParams.set(`text[2].maxWidth`, '40%')

  return ogp.href
}

export default withMermaid({
  title: `ideaman's Notes`,
  description: 'アイデアマンズ株式会社の研究ノート',
  cleanUrls: false,
  head: [
    ['meta', { name: 'twitter:site', content: '@ideamans' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
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
    const ogpBgUrl = 'https://notes.ideamans.com/ogp-background.jpg'
    const xBgUrl = 'https://notes.ideamans.com/x-background.jpg'

    if (pageData.frontmatter?.index || !pageData.frontmatter?.title) {
      // インデックスページ
      const subTitle = pageData.frontmatter.subtext

      head.push([
        'meta',
        {
          property: 'og:image',
          content: indexImageUrl(ogpBgUrl, subTitle)
        }
      ])
      head.push([
        'meta',
        {
          property: 'twitter:image',
          content: indexImageUrl(xBgUrl, subTitle)
        }
      ])
    } else {
      // 記事ページ
      const title = pageData.frontmatter.title
      const id = pageData.frontmatter.id
      const date = Dayjs(pageData.frontmatter.date).format('YYYY-MM-DD')

      // Twitter Card
      head.push([
        'meta',
        {
          name: 'twitter:title',
          content: title
        }
      ])
      head.push([
        'meta',
        {
          property: 'twitter:image',
          content:
            'https://banners.ideamans.com/banners/type-a?bgUrl=https%3A%2F%2Fnotes.ideamans.com%2Fogp-background.jpg&_b=G1YBABwJNk5yI9fAkW1gni0NZJKyT4eWqZMD5j8sTAIKviDIip7Bc75og4FOcY%2FkexXQrycJ0rduU3BP7BCPMis7%2Fe8X9XlrLK%2FX4wXgHIAN4R46IatV7rr95YZ2YnNYHIlQ5ykScMOMXjsBrHTB2p088%2F4XE%2BlUoM7E3eV67rDexd42Lv83NT4VRfH%2F4p%2F7RsdeJlFp6mHLCyC4DCD4ZA3d7rsDAWAFa3arfZtthap7UmXGsjQrELQ7ZzCAp3erV7fvFh33gOCyKQlnYbKUszBZwAM%3D'
          // content: articleImageUrl(xBgUrl, title, `${date} @${id}`)
        }
      ])

      // OGP
      head.push([
        'meta',
        {
          property: 'og:image',
          content:
            'https://banners.ideamans.com/banners/type-a?bgUrl=https%3A%2F%2Fnotes.ideamans.com%2Fogp-background.jpg&_b=G1YBABwJNk5yI9fAkW1gni0NZJKyT4eWqZMD5j8sTAIKviDIip7Bc75og4FOcY%2FkexXQrycJ0rduU3BP7BCPMis7%2Fe8X9XlrLK%2FX4wXgHIAN4R46IatV7rr95YZ2YnNYHIlQ5ykScMOMXjsBrHTB2p088%2F4XE%2BlUoM7E3eV67rDexd42Lv83NT4VRfH%2F4p%2F7RsdeJlFp6mHLCyC4DCD4ZA3d7rsDAWAFa3arfZtthap7UmXGsjQrELQ7ZzCAp3erV7fvFh33gOCyKQlnYbKUszBZwAM%3D'
          // content: articleImageUrl(ogpBgUrl, title, `${date} @${id}`)
        }
      ])
    }
  },
  appearance: false
})
