#!/usr/bin/env node
/**
 * 記事中の ```mermaid を SVG に焼いて .vitepress/mermaid/ に貯める。
 *
 * ビルドでは回さない。mermaid はレイアウトに文字幅の実測を要するので
 * ブラウザが要り、CI（ubuntu-latest + yarn build）には無い。
 * 焼いた SVG をコミットし、ビルドは同期的に読むだけにしてある
 * （.vitepress/mermaid-static.ts）。
 *
 *   yarn mermaid          # 足りないものだけ焼く
 *   yarn mermaid --force  # 全部焼き直す
 *
 * 記事に図を足したら実行して、SVG も一緒にコミットすること。
 * 忘れるとビルドが「どの図が足りないか」を名指しして落ちる。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CACHE_DIR, collectDiagrams } from '../.vitepress/mermaid-source.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORCE = process.argv.includes('--force')

async function main() {
  const diagrams = collectDiagrams(ROOT)
  if (diagrams.length === 0) {
    console.log('mermaid の図は見つからなかった')
    return
  }

  const cacheDir = path.join(ROOT, CACHE_DIR)
  fs.mkdirSync(cacheDir, { recursive: true })

  const wanted = new Map()
  for (const d of diagrams) wanted.set(d.digest, d)

  const todo = [...wanted.values()].filter(
    (d) => FORCE || !fs.existsSync(path.join(cacheDir, `${d.digest}.svg`))
  )

  console.log(`図 ${wanted.size} 個（${diagrams.length} 箇所）のうち ${todo.length} 個を焼く`)

  if (todo.length > 0) {
    await render(todo, cacheDir)
  }

  // 記事から消えた図は残さない（どれが生きているか分からなくなる）
  let pruned = 0
  for (const name of fs.readdirSync(cacheDir)) {
    const m = name.match(/^(.+)\.(svg|css)$/)
    if (!m) continue
    if (wanted.has(m[1])) continue
    fs.unlinkSync(path.join(cacheDir, name))
    pruned++
  }
  if (pruned > 0) console.log(`使われなくなったファイルを ${pruned} 個消した`)

  writeAggregateCss(cacheDir, wanted)

  console.log('完了。生成物を git に足すのを忘れないこと')
}

/**
 * 各図の CSS を1枚にまとめて theme/mermaid.css に書く。
 *
 * mermaid のセレクタは図ごとの id（#mXXXXXXXX）で閉じているので、
 * 全部を1枚に並べても混ざらない。数式で同じことをしている
 * （scripts/gen-math-css.mjs → theme/math.css）。
 */
function writeAggregateCss(cacheDir, wanted) {
  const parts = []
  for (const digest of [...wanted.keys()].sort()) {
    const file = path.join(cacheDir, `${digest}.css`)
    if (fs.existsSync(file)) parts.push(fs.readFileSync(file, 'utf8').trim())
  }

  const out = `/*
 * mermaid の図のスタイル。scripts/render-mermaid.mjs で生成（手で編集しない）。
 *
 * SVG の中のインライン <style> は Vue のテンプレートコンパイラが
 * 「Tags with side effect」として捨ててしまうので、焼くときに抜き出して
 * ここに集めている。セレクタは図ごとの id で閉じているので混ざらない。
 */
.mermaid-figure {
  margin: 1.75rem 0;
  overflow-x: auto;
}
.mermaid-figure svg {
  max-width: 100%;
  height: auto;
}

${parts.join('\n\n')}
`
  fs.writeFileSync(path.join(ROOT, '.vitepress/theme/mermaid.css'), out)
  console.log(`theme/mermaid.css を書いた（図 ${parts.length} 個分）`)
}

async function render(todo, cacheDir) {
  // playwright は devDependency。CI では入らないので、ここで初めて読む
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
  } catch {
    console.error(
      'playwright が無い。`yarn install` するか、ブラウザが未取得なら\n' +
        '`npx playwright install chromium` を実行すること'
    )
    process.exit(1)
  }

  const bundle = path.join(ROOT, 'node_modules/mermaid/dist/mermaid.min.js')
  if (!fs.existsSync(bundle)) {
    console.error(`mermaid のバンドルが無い: ${bundle}`)
    process.exit(1)
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()
  // 図の外で 404 を出さないよう、実体のあるページは開かない
  await page.setContent('<!doctype html><html><body></body></html>')
  await page.addScriptTag({ content: fs.readFileSync(bundle, 'utf8') })

  await page.evaluate(() => {
    window.mermaid.initialize({
      startOnLoad: false,
      // 記事は白背景に固定（サイトは appearance: false でライト固定）
      theme: 'default',
      securityLevel: 'strict',
      // 図の中の日本語がサイト本文と揃うように
      fontFamily:
        'system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", sans-serif'
    })
  })

  for (const d of todo) {
    process.stdout.write(`  ${d.digest.slice(0, 8)} ${d.where} ... `)
    const result = await page.evaluate(async ([id, code]) => {
      try {
        const { svg } = await window.mermaid.render(id, code)
        return { svg }
      } catch (e) {
        return { error: String((e && e.message) || e) }
      }
    }, [`m${d.digest.slice(0, 8)}`, d.code])

    if (result.error) {
      console.log('失敗')
      console.error(`\n${d.where} の図が mermaid で解釈できない:\n${result.error}\n`)
      await browser.close()
      process.exit(1)
    }

    const { svg, css } = split(result.svg)
    fs.writeFileSync(path.join(cacheDir, `${d.digest}.svg`), svg)
    fs.writeFileSync(path.join(cacheDir, `${d.digest}.css`), css)
    console.log('OK')
  }

  await browser.close()
}

/**
 * mermaid.render の出力を、記事に貼れる SVG と 1枚にまとめる CSS に分ける。
 *
 * - インライン `<style>` **タグ** は抜く。Vue のテンプレートコンパイラが
 *   「Tags with side effect (<script> and <style>) are ignored」で捨てるため。
 *   style **属性** は捨てられないので、mermaid が付ける `max-width`
 *   （＝図の原寸。これが無いと広い画面で引き伸ばされる）はそのまま残す
 * - 末尾の `<br>` は mermaid が付ける余分な改行
 */
function split(raw) {
  const styles = []
  const svg = raw
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
      styles.push(css.trim())
      return ''
    })
    .replace(/<br\s*\/?>\s*$/i, '')
    .trim()

  return { svg: svg + '\n', css: styles.join('\n') + '\n' }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

