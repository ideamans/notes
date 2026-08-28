/**
 * **404ページを `not-found.md` から作る。**
 *
 * VitePress は `404.html` の本文を必ず空で出す。
 * （`<div id="app">${page === "404.md" ? "" : content}</div>`）
 * SPAならクライアント側のルーターが中身を描くので気づかないが、
 * **MPAはJSを配信しないので白紙のまま**になる。`404.md` を置いても
 * 同じ判定で潰されるので、ソース側では直せない。
 *
 * そこで `not-found.md` を普通のページとして描かせ、ビルドの最後に
 * `404.html` へ写す。写したら元の `not-found.html` は消す。
 * 消すことで、ナレッジのインデクサ（出力にあるページだけを採る）からも
 * 自動的に外れる。
 *
 * **MPAの全サイトへ同じ内容を配っている配布物。** 直すときは1サイトだけに
 * 手を入れず、全サイトへ配り直すこと。本来は vitepress-machine-readability に
 * 入れるべきもので、npm へ出すときはそちらへ移す。
 *
 * ```ts
 * import { writeNotFoundPage, excludeNotFoundFromSitemap } from './not-found.js'
 *
 * sitemap: { transformItems: excludeNotFoundFromSitemap },
 * buildEnd(config) {
 *   writeNotFoundPage(config.outDir)
 * },
 * ```
 */
import fs from "node:fs";
import path from "node:path";

/** ソースのファイル名（拡張子なし）。`404` は使えない（VitePress が潰す） */
const SOURCE = "not-found";

/** `not-found.html` を `404.html` として書き出し、元は消す。戻り値はバイト数 */
export function writeNotFoundPage(outDir: string): number {
  const src = path.join(outDir, `${SOURCE}.html`);
  if (!fs.existsSync(src)) {
    throw new Error(`[404] ${SOURCE}.html が出力されていません。${SOURCE}.md はありますか`);
  }

  // URLを指す3箇所（canonical / og:url / JSON-LD）を写した先に合わせる。
  // cleanUrls のサイトは拡張子なしで書かれているので、両方の形を拾う。
  const html = fs
    .readFileSync(src, "utf-8")
    .replaceAll(`/${SOURCE}.html`, "/404.html")
    .replaceAll(`/${SOURCE}"`, '/404.html"');

  fs.writeFileSync(path.join(outDir, "404.html"), html);
  fs.rmSync(src);
  return html.length;
}

/**
 * sitemap から `not-found` を外す。404の中身であって、それ自体は入口ではない。
 * sitemap の生成は buildEnd より前なので、消すだけでは間に合わない。
 */
export function excludeNotFoundFromSitemap<T extends { url: string }>(items: T[]): T[] {
  const re = new RegExp(`^/?${SOURCE}(\\.html)?$`);
  return items.filter((item) => !re.test(item.url));
}
