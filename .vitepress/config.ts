import Dayjs from 'dayjs'
import markdownItCjkFriendly from 'markdown-it-cjk-friendly'
// import { defineConfig } from 'vitepress'
import { withMachineReadability } from 'vitepress-machine-readability'
import { defineConfig } from 'vitepress'
import { genLLMs } from './genLLMs.js'
import { crosslinkPlugin } from './crosslink-plugin.js'
import { adPlugin } from './ad-plugin.js'
import { categories as categoryList } from '../categories.js'
import { getCategoryLabel } from '../categories.js'
// @ts-ignore ビルド済みの単一ファイル（services/knowledge が配布元）
import { readFile } from 'node:fs/promises'

import { buildKnowledgePackage } from './knowledge-indexer.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const categoryNameByBasename = new Map(categoryList.map((c) => [c.basename, c.name]))

// 下書き機構: frontmatter に `draft: true` を持つ記事は本番ビルドから除外する。
// dev サーバーでは除外しないため、通常のURL・レイアウトのままプレビューできる。
// 判定は「本番ビルドなら除外」に倒す（NODE_ENV か build コマンドを検出）。
export const isProductionBuild = process.env.NODE_ENV === 'production' || process.argv.includes('build')

const NOTES_SRC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function collectDraftPaths(dir: string): string[] {
  const result: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      result.push(...collectDraftPaths(full))
    } else if (entry.name.endsWith('.md')) {
      const head = fs.readFileSync(full, 'utf8').slice(0, 1000)
      const fm = head.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      if (fm && /(^|\n)draft:\s*true\s*(\r?\n|$)/.test(fm[1])) {
        result.push(path.relative(NOTES_SRC_DIR, full).split(path.sep).join('/'))
      }
    }
  }
  return result
}

const draftExcludes = isProductionBuild ? collectDraftPaths(path.join(NOTES_SRC_DIR, 'posts')) : []

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

export default defineConfig(
  withMachineReadability({
  mpa: true,
  lang: 'ja',
  title: `ideaman's Notes`,
  description: 'アイデアマンズ株式会社の研究ノート',
  cleanUrls: false,
  ignoreDeadLinks: true,
  srcExclude: ['CLAUDE.md', ...draftExcludes],
  rewrites: {},
  sitemap: {
    hostname: 'https://notes.ideamans.com',
    transformItems: (items) => {
      // リダイレクト用スタブページ（旧URLを維持しつつ新URLへ転送するページ）
      const redirectStubs = new Set<string>([
        'posts/2024/core-web-vitals-in-actino-inp.html'
      ])
      return items.filter((item) => {
        const url = item.url
        if (redirectStubs.has(url)) return false
        return (
          url === '' ||
          url === 'index.html' ||
          url === 'categories.html' ||
          url.startsWith('posts/') ||
          url.startsWith('categories/') ||
          url.startsWith('monthly/')
        )
      })
    }
  },
  markdown: {
    math: true,
    config: (md) => {
      // CJK句読点の隣で **太字** が機能しない CommonMark の問題を回避
      md.use(markdownItCjkFriendly)
      md.use(crosslinkPlugin, {
        getSlug: (env) => {
          // posts/2025/example.md → example
          const match = env.relativePath?.match(/\/([^/]+)\.md$/)
          return match ? match[1] : 'unknown'
        }
      })
      md.use(adPlugin)

      // markdown-it-mathjax3 / mathxyjax3 は数式ごとに <span><style>…</style>SVG</span> を出力する。
      // このインライン <style> は VitePress(dev) の Vue クライアントコンパイルで
      // 「Tags with side effect (<script> and <style>) are ignored」エラーになるため除去する。
      // 同等のCSSは theme/math.css でページに一度だけ適用（scripts/gen-math-css.mjs で生成）。
      const stripMathStyle = (html: string) => html.replace(/<style>[\s\S]*?<\/style>/g, '')
      for (const rule of ['math_inline', 'math_block'] as const) {
        const orig = md.renderer.rules[rule]
        if (orig) {
          md.renderer.rules[rule] = (...args) => stripMathStyle(orig(...args))
        }
      }
    }
  },
  vue: {
    template: {
      compilerOptions: {
        // MathJax の <mjx-container> 等をコンポーネント解決させずカスタム要素として扱う
        isCustomElement: (tag) => tag.startsWith('mjx-')
      }
    }
  },
  vite: {
    assetsInclude: ['**/*.mp4']
  },
  head: [
    ['meta', { name: 'twitter:site', content: '@ideamans' }],
    // OGP画像を持っているので大きい方。summary だと小さいサムネイルになる
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: ''
      }
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Klee+One:wght@400;600&family=Noto+Sans+JP:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap'
      }
    ],
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
        // ナレッジ基盤の検索UI。MPAなのでVueのハンドラは使えず素のJSで動く。
        // 本体（InstantSearch）は検索を始めた人だけが読む遅延ロード。
        src: '/knowledge-search.js',
        defer: ''
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
    await genLLMs(config)

    // 画像インデックス。knowledge/images.json があれば載せる。
    //
    // **中身を作るのはビルドではない。** 画像の説明づけは課金が発生し
    // 数分かかるので、`yarn images` で別に走らせてコミットしておく
    // （このビルドは出来上がったものを読むだけ）。
    let images
    try {
      images = JSON.parse(await readFile('knowledge/images.json', 'utf8'))
    } catch {
      images = undefined // 無ければ従来どおり記事だけの zip になる
    }

    // ナレッジパッケージ。deploy.sh が knowledge.ideamans.com へ送る。
    const pkg = await buildKnowledgePackage(config, {
      images,
      id: 'notes',
      title: "ideaman's Notes",
      description: 'アイデアマンズ株式会社の研究ノート。調査と実測にもとづく技術メモ',
      origin: 'https://notes.ideamans.com',
      include: 'posts/**/*.md',
      out: 'knowledge/notes.zip',
      outline: { group_by: 'date' },
      search: { facets: ['category_labels', 'category_path', 'author', 'year'] },
      map: (page) => {
        const fm = page.frontmatter
        if (fm.draft) return null
        // OGP画像の一覧ページ。画像の羅列で文章としての知識が無い
        if (fm.pageType === 'ogps') return null

        const categories: string[] = Array.isArray(fm.categories) ? fm.categories : []
        return {
          title: fm.title,
          summary: fm.description ?? page.excerpt,
          published_at: fm.date,
          category_path: categories,
          category_labels: categories.map(getCategoryLabel),
          // このサイトは著者IDを id で持つ（authorId ではない）
          author: fm.id,
          image: fm.ogp ?? fm.image,
        }
      },
    })
    console.log(
      `[knowledge] ${pkg.out} (${pkg.documents}件` +
        (pkg.images ? ` / 画像${pkg.images}件` : '') +
        ` / ${(pkg.bytes / 1024).toFixed(1)}KB / ${pkg.generation})`
    )
  },
  // 月別・カテゴリは動的ルートで、テンプレートの frontmatter がそのまま
  // title になる（41ページが揃って同じ <title> だった）。params から作る。
  transformPageData: (pageData) => {
    const params = pageData.params as Record<string, string> | undefined
    if (!params) return
    if (params.year && params.month) {
      const month = Number(params.month)
      return {
        title: `${params.year}年${month}月の記事`,
        description: `${params.year}年${month}月にアイデアマンズの研究ノートで公開した記事の一覧です。サイトスピードや画像最適化について、公開データと社内の実測にもとづく調査メモをまとめています。`
      }
    }
    if (params.category) {
      const label = getCategoryLabel(params.category)
      return {
        title: `${label}の記事`,
        description: `${label}に関する記事の一覧です。アイデアマンズの研究ノートでは、サイトスピードや画像最適化について、公開データと社内の実測にもとづく調査メモをまとめています。`
      }
    }
  },

  transformHead: ({ head, pageData }) => {
    const ogpBgUrl = 'https://notes.ideamans.com/ogp-background.jpg'
    const siteUrl = 'https://notes.ideamans.com'

    // リダイレクト専用ページは独自のhead(frontmatter)のみを使用し、
    // 共通のOGP/JSON-LDは付与しない（noindex + meta refreshのみが有効）
    if (pageData.frontmatter?.redirect) {
      return
    }

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

      // 構造化データ (JSON-LD) - BreadcrumbList
      // ホーム > (カテゴリ) > 記事タイトル
      const firstCatBasename = Array.isArray(pageData.frontmatter.categories)
        ? pageData.frontmatter.categories[0]
        : undefined
      const firstCatName = firstCatBasename ? categoryNameByBasename.get(firstCatBasename) : undefined

      const breadcrumbItems: Array<{
        '@type': 'ListItem'
        position: number
        name: string
        item: string
      }> = [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${siteUrl}/` }
      ]
      if (firstCatBasename && firstCatName) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 2,
          name: firstCatName,
          item: `${siteUrl}/categories/${firstCatBasename}.html`
        })
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 3,
          name: title,
          item: pageUrl
        })
      } else {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 2,
          name: title,
          item: pageUrl
        })
      }

      const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems
      }

      head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify(breadcrumbLd)
      ])
    }
  },
  appearance: false
},
  // 検索エンジンとAIから読める状態にする。既存の transformHead / buildEnd は潰さない
  {
    hostname: 'https://notes.ideamans.com/',
    organization: {
      name: 'アイデアマンズ株式会社',
      url: 'https://www.ideamans.com/'
    },
    map: { description: ['description','excerpt'] },
    feed: { pattern: 'posts/**/*.md', title: "ideaman's Notes" },
    // Markdown の原本も配る（LLMがHTMLから本文を復元しなくて済む）
    markdownSource: true,
    lint: {
      level: 'warn',
      // URLのタイポを救うためのスタブ。canonical が正しいURLを指すのが
      // 正しい姿なので、自ページを指していないことを指摘させない
      exclude: ['posts/2024/core-web-vitals-in-actino-inp.html']
    }
  })
)
