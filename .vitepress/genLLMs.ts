import path from 'path'
import { writeFileSync } from 'fs'
import Dayjs from 'dayjs'
import { createContentLoader, type SiteConfig } from 'vitepress'
import { authors } from '../authors.js'

export async function genLLMs(config: SiteConfig) {
  const authorsMap = new Map(authors.map((author) => [author.username, author]))

  const posts = await createContentLoader('posts/**/*.md', {
    excerpt: true,
    render: true
  }).load()

  // 日付で降順にソート
  const sorted = posts.sort(
    (a, b) => +Dayjs(b.frontmatter?.date) - +Dayjs(a.frontmatter?.date)
  )

  let output = ''

  for (const { frontmatter, html } of sorted) {
    const author = authorsMap.get(frontmatter.id)

    output += `# ${frontmatter.title}\n\n`
    output += `- 公開日: ${frontmatter.date}\n`
    output += `- 著者: ${author?.username || frontmatter.author}\n`
    if (frontmatter.categories) {
      output += `- カテゴリー: ${frontmatter.categories.join(', ')}\n`
    }
    output += '\n'

    // HTMLからテキストを抽出
    const text = (html || '')
      .replaceAll(/<[^>]*>/g, '')
      .replaceAll('&ZeroWidthSpace;', '')

    output += text + '\n\n'
    output += '---\n\n'
  }

  writeFileSync(path.join(config.outDir, 'llms-full.txt'), output)
}
