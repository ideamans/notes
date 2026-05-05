import { createContentLoader } from 'vitepress'
import Dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

Dayjs.extend(utc)
Dayjs.extend(timezone)

// frontmatterの日付は日本時間（JST）として扱う
const parseJstDate = (dateStr: string) => {
  return Dayjs.tz(dateStr, 'Asia/Tokyo')
}

export interface Post {
  url: string

  title: string
  excerpt: string
  id: string
  date: string
  categories: string[]
  tags: string[]
  ogp?: string
}

declare const data: Post[]
export { data }

function normalizeExcerpt(rawExcerpt: string | undefined, fmExcerpt?: string): string {
  const source = (fmExcerpt && fmExcerpt.trim()) || rawExcerpt || ''
  if (!source) return ''
  const text = source
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  const MAX = 160
  if (text.length <= MAX) return text
  return text.slice(0, MAX).replace(/\s+\S*$/, '') + '…'
}

export default createContentLoader('posts/**/*.md', {
  excerpt: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title,
        id: frontmatter.id,
        date: frontmatter.date,
        categories: Array.isArray(frontmatter.categories) ? frontmatter.categories : [],
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        ogp: frontmatter.ogp,
        excerpt: normalizeExcerpt(excerpt, frontmatter.excerpt),
        url
      }))
      .sort((a, b) => +parseJstDate(b.date) - +parseJstDate(a.date))
  }
})
