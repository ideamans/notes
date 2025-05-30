import Dayjs from 'dayjs'
// import { defineConfig } from 'vitepress'
import { defineConfig } from 'vitepress'
import { genFeed } from './genFeed.js'
import { genLLMs } from './genLLMs.js'

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

function articleTwitterImageUrl(slug: string): string {
  const image = new URL('https://alogorithm2.ideamans.com/v2/rect.png')
  image.searchParams.set('seed', [slug, 'notes'].join('@'))
  image.searchParams.set('width', '256')
  image.searchParams.set('height', '256')
  return image.href
}

function indexTwitterImageUrl(): string {
  const image = new URL('https://alogorithm2.ideamans.com/v2/rect.png')
  image.searchParams.set('seed', 'notes')
  image.searchParams.set('width', '256')
  image.searchParams.set('height', '256')
  return image.href
}

export default defineConfig({
  mpa: true,
  title: `ideaman's Notes`,
  description: 'アイデアマンズ株式会社の研究ノート',
  cleanUrls: false,
  ignoreDeadLinks: true,
  rewrites: {},
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
    ],
    [
      'script',
      {
        async: '1',
        src: 'https://free.ranklet4.com/widgets/JEfB8ZpuktdYw2GQ2auB.js'
      }
    ]
  ],
  buildEnd: async (config) => {
    await genFeed(config)
    await genLLMs(config)
  },
  transformHead: ({ head, pageData }) => {
    const ogpBgUrl = 'https://notes.ideamans.com/ogp-background.jpg'

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
          content: indexTwitterImageUrl()
        }
      ])
    } else {
      // 記事ページ
      const title = pageData.frontmatter.title
      const id = pageData.frontmatter.id
      const date = Dayjs(pageData.frontmatter.date).format('YYYY/MM/DD')

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
          content: articleTwitterImageUrl(
            pageData.relativePath ?? pageData.filePath ?? ''
          )
        }
      ])

      // OGP
      head.push([
        'meta',
        {
          property: 'og:image',
          content: articleImageUrl(ogpBgUrl, title, `${date} @${id}`)
        }
      ])
    }
  },
  appearance: false
})
