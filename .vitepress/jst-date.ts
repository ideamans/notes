// frontmatter の date は「日本時間の壁時計」で書いている（例: 2026-11-18 16:15:00）。
//
// ところが YAML は時刻付きの値を UTC の Date として読む。そのまま dayjs や new Date に渡すと
// 9時間進んで、15時以降に書いた記事が翌日の日付で出る（2026-11 に22本で起きていた）。
// どこで日付を扱うときも、まずここで壁時計の文字列に戻してから使う。

const pad = (n: number) => String(n).padStart(2, '0')

const fromUtcParts = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
  `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`

/** 日本時間の壁時計 'YYYY-MM-DD HH:mm:ss'。解釈できなければ '' */
export function jstWall(value: unknown): string {
  if (value instanceof Date) return isNaN(+value) ? '' : fromUtcParts(value)
  if (typeof value !== 'string' || !value) return ''
  const s = value.trim()
  // Date を JSON にした形（末尾 Z）は YAML 由来なので、UTC の成分がそのまま壁時計
  if (/T.*Z$/.test(s)) return fromUtcParts(new Date(s))
  // 時差を明示した形は、その瞬間を日本時間に直す
  if (/T.*[+-]\d{2}:?\d{2}$/.test(s)) {
    const d = new Date(s)
    return isNaN(+d) ? '' : fromUtcParts(new Date(+d + 9 * 3600 * 1000))
  }
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (!m) return ''
  return `${m[1]}-${pad(+m[2])}-${pad(+m[3])} ${pad(+(m[4] ?? 0))}:${m[5] ?? '00'}:${m[6] ?? '00'}`
}

/** ISO 8601（+09:00 付き）。sitemap・構造化データ・ナレッジのように瞬間が要る所で使う */
export function jstIso(value: unknown): string {
  const w = jstWall(value)
  return w ? `${w.replace(' ', 'T')}+09:00` : ''
}
