import path from 'path'
import { writeFileSync } from 'fs'
import { Feed } from 'feed'
import { createContentLoader, type SiteConfig } from 'vitepress'

const notesUrl = 'https://notes.ideamans.com'

export async function genNotesFeed(config: SiteConfig) {
  const feed = new Feed({
    title: `ideaman's Notes`,
    description: 'アイデアマンズ株式会社の研究ノート',
    id: notesUrl,
    link: notesUrl,
    language: 'ja',
    image: 'https://alogorithm2.ideamans.com/v2/rect.svg?width=800&seed=notes',
    favicon: `${notesUrl}/notes.svg`,
    copyright: `Copyright (c) 2024-present, ideaman's Inc.`
  })

  const posts = await createContentLoader('posts/**/*.md', {
    excerpt: true,
    render: true
  }).load()

  posts.sort(
    (a, b) =>
      +new Date(b.frontmatter.date as string) -
      +new Date(a.frontmatter.date as string)
  )

  for (const { url, excerpt, frontmatter, html } of posts) {
    feed.addItem({
      title: frontmatter.title,
      id: `${notesUrl}${url}`,
      link: `${notesUrl}${url}`,
      description: excerpt,
      content: excerpt, // html?.replaceAll('&ZeroWidthSpace;', ''),
      author: [
        {
          name: frontmatter.author || frontmatter.id,
          link: frontmatter.twitter
            ? `https://twitter.com/${frontmatter.twitter}`
            : undefined
        }
      ],
      date: frontmatter.date
    })
  }

  writeFileSync(path.join(config.outDir, 'feed.rss'), feed.rss2())
}
