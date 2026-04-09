import Dayjs from 'dayjs'
// import { defineConfig } from 'vitepress'
import { defineConfig } from 'vitepress'
import { genFeed } from './genFeed.js'
import { genLLMs } from './genLLMs.js'
import { crosslinkPlugin } from './crosslink-plugin.js'
import { adPlugin } from './ad-plugin.js'

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
  lang: 'ja',
  title: `ideaman's Notes`,
  description: 'アイデアマンズ株式会社の研究ノート',
  cleanUrls: false,
  ignoreDeadLinks: true,
  srcExclude: ['CLAUDE.md'],
  rewrites: {},
  sitemap: {
    hostname: 'https://notes.ideamans.com',
    transformItems: (items) => {
      return items.filter((item) => {
        const url = item.url
        return (
          url === '' ||
          url === 'index.html' ||
          url.startsWith('posts/') ||
          url.startsWith('categories/')
        )
      })
    }
  },
  markdown: {
    math: true,
    config: (md) => {
      md.use(crosslinkPlugin, {
        getSlug: (env) => {
          // posts/2025/example.md → example
          const match = env.relativePath?.match(/\/([^/]+)\.md$/)
          return match ? match[1] : 'unknown'
        }
      })
      md.use(adPlugin)
    }
  },
  vite: {
    assetsInclude: ['**/*.mp4']
  },
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
        type: 'image/svg+xml',
        href: '/notes.svg'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png'
      }
    ],
    [
      'script',
      {
        src: 'https://tags.ideamans.com/scripts/notes.js',
        async: ''
      }
    ],
    [
      'script',
      {
        async: '1',
        src: 'https://free.ranklet4.com/widgets/JEfB8ZpuktdYw2GQ2auB.js'
      }
    ],
    [
      'script',
      {
        src: '/zoomable.js',
        defer: ''
      }
    ]
  ],
  buildEnd: async (config) => {
    await genFeed(config)
    await genLLMs(config)
  },
  transformHead: ({ head, pageData }) => {
    const ogpBgUrl = 'https://notes.ideamans.com/ogp-background.jpg'
    const siteUrl = 'https://notes.ideamans.com'

    // ページURLの構築
    const relativePath = pageData.relativePath ?? ''
    const pagePath = relativePath.replace(/\.md$/, '.html').replace(/index\.html$/, '')
    const pageUrl = `${siteUrl}/${pagePath}`

    // canonical URL
    head.push(['link', { rel: 'canonical', href: pageUrl }])

    // og:url
    head.push(['meta', { property: 'og:url', content: pageUrl }])

    // og:title（全ページ共通）
    const pageTitle = pageData.frontmatter?.title || `ideaman's Notes`
    head.push(['meta', { property: 'og:title', content: pageTitle }])

    if (pageData.frontmatter?.index || !pageData.frontmatter?.title) {
      // インデックスページ
      const subTitle = pageData.frontmatter.subtext
      const description =
        pageData.frontmatter.description || pageData.frontmatter.subtext || 'アイデアマンズ株式会社の研究ノート'

      head.push(['meta', { property: 'og:type', content: 'website' }])
      head.push(['meta', { property: 'og:description', content: description }])
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
      const customOgp = pageData.frontmatter.ogp
      const description = pageData.frontmatter.description || pageData.description || ''

      head.push(['meta', { property: 'og:type', content: 'article' }])

      if (description) {
        head.push(['meta', { property: 'og:description', content: description }])
      }

      // Twitter Card
      head.push([
        'meta',
        {
          name: 'twitter:title',
          content: title
        }
      ])

      // OGP画像
      let ogImage: string

      // カスタムOGP画像が指定されている場合
      if (customOgp) {
        ogImage = `${siteUrl}${customOgp}`
        head.push(['meta', { property: 'og:image', content: ogImage }])
        head.push(['meta', { property: 'twitter:image', content: ogImage }])
        // Twitter Cardをsummary_large_imageに変更
        head.push(['meta', { name: 'twitter:card', content: 'summary_large_image' }])
      } else {
        ogImage = articleImageUrl(ogpBgUrl, title, `${date} @${id}`)
        head.push([
          'meta',
          {
            property: 'twitter:image',
            content: articleTwitterImageUrl(
              pageData.relativePath ?? pageData.filePath ?? ''
            )
          }
        ])
        head.push(['meta', { property: 'og:image', content: ogImage }])
      }

      // 構造化データ (JSON-LD) - Article
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        datePublished: Dayjs(pageData.frontmatter.date).format('YYYY-MM-DD'),
        author: {
          '@type': 'Person',
          name: '宮永 邦彦',
          url: 'https://www.ideamans.com/'
        },
        publisher: {
          '@type': 'Organization',
          name: 'アイデアマンズ株式会社',
          url: 'https://www.ideamans.com/',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/notes.svg`
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl
        },
        ...(ogImage ? { image: ogImage } : {}),
        ...(description ? { description } : {})
      }

      head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify(jsonLd)
      ])
    }
  },
  appearance: false
})
