import path from 'path'
import { writeFileSync } from 'fs'
import { Feed } from 'feed'
import { createContentLoader, type SiteConfig } from 'vitepress'

const baseUrl = `https://blog.vuejs.org`

export async function genFeed(config: SiteConfig) {
  const feed = new Feed({
    title: 'The Vue Point',
    description: 'The official blog for the Vue.js project',
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    image: 'https://vuejs.org/images/logo.png',
    favicon: `${baseUrl}/notes.svg`,
    copyright:
      'Copyright (c) 2021-present, Yuxi (Evan) You and blog contributors'
  })

  const posts = await createContentLoader('posts/*.md', {
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
      id: `${baseUrl}${url}`,
      link: `${baseUrl}${url}`,
      description: excerpt,
      content: html?.replaceAll('&ZeroWidthSpace;', ''),
      author: [
        {
          name: frontmatter.author,
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

const notesUrl = 'https://notes.ideamans.com'

export async function genNotesFeed(config: SiteConfig) {
  const feed = new Feed({
    title: `ideaman's Notes`,
    description: 'アイデアマンズ株式会社の研究ノート',
    id: notesUrl,
    link: notesUrl,
    language: 'ja',
    image: 'https://logo.ideamans.com/ogp.svg?width=800&phrase=notesg',
    favicon: `${baseUrl}/notes.svg`,
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
      id: `${baseUrl}${url}`,
      link: `${baseUrl}${url}`,
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
