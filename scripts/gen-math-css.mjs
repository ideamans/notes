/*
 * .vitepress/theme/math.css を生成するスクリプト。
 *
 * markdown-it-mathjax3 / mathxyjax3 は数式ごとに <span id="mjx-..."><style>…</style>SVG</span>
 * を出力する。このインライン <style> は VitePress(dev) の Vue クライアントコンパイルで
 * 「Tags with side effect (<script> and <style>) are ignored」エラーになる。
 *
 * 対策として .vitepress/config.ts のレンダラ側で各数式から <style> だけを除去し、
 * 同等のCSS（MathJax公式のSVGスタイルシート）を math.css としてページに一度だけ適用する。
 * このスクリプトはそのCSSを MathJax 本体から正確に書き出す。
 *
 * 使い方:  node scripts/gen-math-css.mjs
 * markdown-it-mathjax3 / mathxyjax3 を更新したら再実行すること。
 */
import { tex2svgHtml } from 'mathxyjax3'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// MathJax の初期化（副作用で globalThis.MathJax がセットされる）
tex2svgHtml('x', { display: false })

const adaptor = globalThis.MathJax.startup.adaptor
const sheet = adaptor.textContent(globalThis.MathJax.svgStylesheet())

const header = `/*
 * MathJax (SVG) のスタイルシート。scripts/gen-math-css.mjs で生成（手で編集しない）。
 * 数式ごとのインライン <style> は config.ts のレンダラで除去し、同等のCSSをここで一度だけ当てる。
 */
/* 各数式を包む <span id="mjx-..."> を透過させる（元は #mjx-xxx{display:contents}） */
span[id^="mjx-"] { display: contents; }
/* assistive MML を選択・コピー可能にしつつ視覚的には透明に保つ */
span[id^="mjx-"] mjx-assistive-mml {
  user-select: text !important;
  clip: auto !important;
  color: rgba(0, 0, 0, 0);
}

`

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../.vitepress/theme/math.css')
writeFileSync(out, header + sheet + '\n')
console.log('wrote', out, '(', (header + sheet).length, 'bytes )')
