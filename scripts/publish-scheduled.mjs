#!/usr/bin/env node
// 予約公開: draft: true の記事のうち、date の日付が今日（日本時間）以前のものから
// draft の行を外して公開状態にする。
//
// 毎朝 GitHub Actions（.github/workflows/publish-scheduled.yml）から呼ばれる。
// 手元では `node scripts/publish-scheduled.mjs --dry-run` で対象だけ確かめられる。
//
// 下書きの判定は .vitepress/config.ts の collectDraftPaths と同じ正規表現にそろえている。
// 片方だけ変えると「ビルドからは外れるのに公開されない」記事ができる。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = path.join(ROOT, 'posts')
const DRAFT_LINE = /^draft:\s*true\s*$/
const dryRun = process.argv.includes('--dry-run')

// 日本時間の今日（YYYY-MM-DD）。ランナーのタイムゾーンに依らない。
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date())

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else if (entry.name.endsWith('.md')) files.push(full)
  }
  return files
}

const published = []
for (const file of walk(POSTS_DIR)) {
  const src = fs.readFileSync(file, 'utf8')
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!fm) continue

  const lines = fm[1].split(/\r?\n/)
  if (!lines.some((line) => DRAFT_LINE.test(line))) continue

  const rel = path.relative(ROOT, file)
  const date = fm[1].match(/(?:^|\n)date:\s*['"]?(\d{4}-\d{2}-\d{2})/)
  if (!date) {
    console.warn(`日付がないので飛ばす: ${rel}`)
    continue
  }
  if (date[1] > today) continue

  published.push(`${rel} (${date[1]})`)
  if (dryRun) continue

  const newFrontmatter = lines.filter((line) => !DRAFT_LINE.test(line)).join('\n')
  fs.writeFileSync(file, src.replace(fm[0], `---\n${newFrontmatter}\n---`))
}

const label = dryRun ? '公開する予定の記事' : '公開した記事'
console.log(`今日（日本時間）: ${today}`)
console.log(published.length ? `${label}:\n${published.map((p) => `  ${p}`).join('\n')}` : `${label}はない`)

// GitHub Actions では、後続のステップが記事の変化を見て動けるように出力する
if (process.env.GITHUB_OUTPUT && !dryRun) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${published.length > 0}\n`)
}
