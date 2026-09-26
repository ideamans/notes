/**
 * ```mermaid の在処と、図から SVG のファイル名を決める規則。
 *
 * 焼く側（scripts/render-mermaid.mjs）と貼る側（mermaid-static.ts）で
 * 同じ規則を使う必要があるので、1ファイルに寄せてある。
 */
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

/** 焼いた SVG の置き場（srcDir からの相対） */
export const CACHE_DIR = '.vitepress/mermaid'

/**
 * 図の中身から名前を決める。
 *
 * 中身が変われば名前も変わるので、「直したのに古い SVG が出る」が起きない。
 * 逆に同じ図を複数の記事に貼ったときは1枚で済む。
 */
export function digestOf(code) {
  return createHash('sha256').update(normalizeCode(code), 'utf8').digest('hex').slice(0, 16)
}

/** 末尾の空白や改行の違いで焼き直しにならないように揃える */
export function normalizeCode(code) {
  return code.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim()
}

const FENCE = /^[ \t]*```+[ \t]*mermaid[^\n]*\n([\s\S]*?)^[ \t]*```+[ \t]*$/gm

/**
 * srcDir 以下の .md を走査して ```mermaid を全部拾う。
 *
 * 下書き（draft: true）の記事も拾う。下書きのまま図を書いて、公開日に
 * ビルドが「SVG が無い」で落ちるのを避けるため。
 */
export function collectDiagrams(srcDir) {
  const found = []
  walk(srcDir, (file) => {
    if (!file.endsWith('.md')) return
    const text = fs.readFileSync(file, 'utf8')
    if (!text.includes('```mermaid')) return
    const rel = path.relative(srcDir, file).split(path.sep).join('/')
    let m
    FENCE.lastIndex = 0
    let n = 0
    while ((m = FENCE.exec(text)) !== null) {
      n++
      const code = normalizeCode(m[1])
      found.push({ code, digest: digestOf(code), where: `${rel} の ${n} 個目` })
    }
  })
  return found
}

const SKIP = new Set(['node_modules', '.git', '.vitepress', 'dist', 'knowledge'])

function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, fn)
    else fn(full)
  }
}
