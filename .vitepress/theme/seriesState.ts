// 連載の記事が「いま公開されているか」を判定する。SeriesNav と SeriesRef が共有する。
//
// 判定はビルド時刻で固定する。new Date() をそのまま使うと、SSRで描いたHTMLと
// ブラウザでの再評価がずれて、まだ配信していない記事へのリンクが出ることがある。
import { series } from '../../series.js'
import { data as posts } from './posts.data.js'

declare const __SERIES_NOW__: number

const jst = (date: string): number => {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/)
  if (!m) return Number.MAX_SAFE_INTEGER
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0) - 9, +(m[5] ?? 0))
}

const dates = new Map<string, number>()
for (const s of series) {
  for (const post of s.posts) dates.set(post.url, jst(post.date))
}

export function isPublished(url: string): boolean {
  const at = dates.get(url)
  // 連載に載っていないURLは普通のリンクとして扱う
  if (at === undefined) return true
  // 下書きはビルドの出力に無いので、リンクしても404になる
  if (!posts.some((p) => p.url === url)) return false
  return at <= __SERIES_NOW__
}
