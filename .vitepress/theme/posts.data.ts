import { createContentLoader } from 'vitepress'
import Dayjs from 'dayjs'

export interface Post {
  url: string

  title: string
  excerpt: string
  id: string
  date: string
  categories?: string[]
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
        excerpt: excerpt || '',
        url
      }))
      .sort((a, b) => +Dayjs(b.date) - +Dayjs(a.date))
  }
})
