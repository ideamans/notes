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
  categories?: string[]
  ogp?: string
}

declare const data: Post[]
export { data }

export default createContentLoader('posts/**/*.md', {
  excerpt: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title,
        id: frontmatter.id,
        date: frontmatter.date,
        categories: frontmatter.categories || [],
        ogp: frontmatter.ogp,
        excerpt: excerpt || '',
        url
      }))
      .sort((a, b) => +parseJstDate(b.date) - +parseJstDate(a.date))
  }
})
