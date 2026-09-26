/**
 * ```mermaid を、焼いておいた SVG に置き換える markdown-it プラグイン。
 *
 * mermaid を**クライアントで描かない**ための仕掛け。描画をやめたので
 * このサイトは mpa: true に戻せる（mpa はクライアントJSを配信しない）。
 *
 * SVG を焼くのは `yarn mermaid`（scripts/render-mermaid.mjs）。
 * ここは同期的に読むだけなので、CI にブラウザは要らない。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type MarkdownIt from 'markdown-it'

// @ts-ignore 焼く側と規則を共有している
import { CACHE_DIR, digestOf, normalizeCode } from './mermaid-source.mjs'

const SRC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function mermaidStaticPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token.info.trim().split(/\s+/)[0] !== 'mermaid') {
      return fence(tokens, idx, options, env, self)
    }

    const code = normalizeCode(token.content)
    const digest = digestOf(code)
    const file = path.join(SRC_DIR, CACHE_DIR, `${digest}.svg`)

    if (!fs.existsSync(file)) {
      const where = env?.relativePath ?? '（ファイル不明）'
      throw new Error(
        `${where} の mermaid の図が焼かれていない（${digest}）。\n` +
          `\`yarn mermaid\` を実行して、生成された ` +
          `${CACHE_DIR}/${digest}.svg も一緒にコミットすること。`
      )
    }

    const svg = fs.readFileSync(file, 'utf8')

    // Vue のテンプレートコンパイラに解釈させない。SVG の中の <style> は
    // 「Tags with side effect are ignored」になり、{{ }} があれば式として
    // 評価されてしまう（数式で同じ問題を踏んでいる。config.ts の stripMathStyle 参照）
    return `<div class="mermaid-figure" v-pre>${svg}</div>\n`
  }
}
