---
id: miyanaga
title: '実例に学ぶサイトスピード改善(1) LCP画像は最優先で読み込ませる'
description: LCPを左右する共通手法の第一弾。ファーストビューの最大画像にloading="lazy"が付いていると、JSが実行されるまで画像ダウンロードが始まらずLCPが数秒単位で悪化する。lazysizesやカルーセルライブラリの利用時に頻発するこの問題を、実在4サイトの数値とともに解説し、loading="eager"とfetchpriority="high"による対処法を示す。
date: 2026-07-02 06:30:00
ogp: /ogp/2026/lcp-image-priority-loading.jpg
categories:
  - sitespeed
  - technology
draft: true
---

「LCPが遅い」と聞いて、画像の圧縮や次世代フォーマットへの変換を考える人は多い。もちろんそれも有効だが、そもそもブラウザがその画像を「あとで読んでいい」と判断して後回しにしていたとしたら、軽量化だけでは問題を根本から解決できない。

弊社の[表示速度ボトルネックの実例研究](https://vigilante.sitespeed.info/)では、ファーストビューの最大画像、つまりLCP要素に遅延読み込みが適用されているケースを何度も観測している。LCP 3秒超という値が、HTML属性を数文字変えるだけで0.2秒台まで下がる例がある。

この記事では、LCP画像の優先読み込みがなぜ重要か、そして実際のサイトでどれほどの差が生まれているかを、実在サイトのデータとともに解説する。これは「指標改善に効く共通手法」シリーズの第1回だ。

[[toc]]

---

## LCPとは、ページの「顔」が現れるまでの時間

LCP（Largest Contentful Paint）は、ビューポート内で最も大きなコンテンツが画面に描画されるまでの時間を示す指標だ。通常はファーストビューに配置されたメイン画像やヒーローバナーがLCP要素になる。Googleは2.5秒以内を「良好」、4秒以上を「改善が必要」と定義しており、Core Web Vitalsの主要指標のひとつでもある。

ユーザーが感じる「ページが表示されたかどうか」の感覚に最も近い指標がLCPだと言っていい。ECサイトならトップのバナー画像、ニュースサイトならヒーロー画像、コスメブランドのLPならメインビジュアル。これらが遅ければ、ユーザーはページが読み込まれていないと感じ、離脱する。

## lazyloadは万能ではない。LCP画像に付けると逆効果になる

画像の遅延読み込み（lazy load）は、スクロールしなければ見えない画像の読み込みを後回しにし、初期表示に使える帯域を節約する有効な手法だ。`<img loading="lazy">` という標準属性や、lazysizes・jQuery Lazy・SplideなどのJavaScriptライブラリで広く使われている。

問題は、この仕組みをLCP画像へ適用した場合に起きる。

### ブラウザのプリロードスキャナーが働かなくなる

ブラウザはHTMLを受信すると、並行して「プリロードスキャナー」と呼ばれる先読み処理を走らせる。CSSやJavaScriptの解析を待たずに `src` 属性の画像URLを検出し、ダウンロードを前倒しで開始するための仕組みだ。

ところがJavaScriptライブラリを使ったlazyloadでは、画像の実URLを `data-src` などの独自属性に格納し、`src` 属性にはプレースホルダー画像や空文字列を置くことが多い。ブラウザのプリロードスキャナーは `data-src` を見ない。**結果として、JSの実行後にIntersectionObserverが判定を完了するまで、実際の画像のダウンロードは一切始まらない。**

<!-- TODO: 図版：プリロードスキャナーがsrc属性を検出してすぐにダウンロードを開始するフローと、data-src+JSで遅延されるフローを並べた比較図 -->

標準の `loading="lazy"` 属性でも同様の問題が起きる。こちらは実際のURLが `src` に入っているためプリロードスキャナーには検出されうるが、ブラウザは `loading="lazy"` が指定された画像を意図的に低優先度にキューイングする。視覚的にファーストビューに収まっていても、判定のタイミングによってはリクエストが大きく遅れる。

### そもそもLCP画像はlazyloadの対象外

lazyloadは「ビューポートに入ったら読み込む」という仕組みだ。LCP要素はページを開いた瞬間からビューポートに表示されている。つまり、**lazyloadをかける理由がそもそもない画像**だ。

宅配便で例えるなら、すでに玄関の前に荷物が届いているのに「不在票を確認してからでないと受け取れない」と決まっているようなものだ。荷物はそこにあるのに、手順のせいで受け取りが遅れる。

## 実例で確認するLCP画像lazyloadの影響

弊社の[表示速度ボトルネック実例研究（vigilante）](https://vigilante.sitespeed.info/)では、サイトごとに個別のボトルネックを一つずつ解消するシミュレーションを実施し、before/afterの数値を記録している。LCP画像へのlazyload適用という問題は、ECサイト・メディアサイトを問わず繰り返し出てきたパターンだ。

### タマチャンショップ：LCPが3.1秒から0.2秒へ（92.5%短縮）

<img src="/posts/2026/lcp-image-priority-loading/tamachanshop1-thumbnail.png" alt="タマチャンショップ トップページのスクリーンショット" width="260" height="260" />

宮崎県の自然食品ECサイト[タマチャンショップ](https://vigilante.sitespeed.info/2026/tamachanshop1.html)では、ファーストビューのFlickityスライダー第1画像がlazysizesによるlazyloadの対象になっていた。`src` 属性にはSVGプレースホルダーが設定され、実際の画像URLは `data-src` 属性に格納された状態だった。

JavaScriptが実行されるまで画像ダウンロードが始まらないため、この遅延は約1,425msにのぼっていた。解消の方法はシンプルだ。`src` 属性に実際の画像URLを直接設定し、`loading="eager"` と `fetchpriority="high"` を付与するだけだ。

| 指標 | 解消前 | 解消後 | 変化量 |
|------|:---:|:---:|:---:|
| `LCP` | 3.1秒 | 0.2秒 | **-2.9秒（92.5%）** |
| `SI` | 1.8秒 | 1.3秒 | **-0.5秒** |
| `総合スコア` | 94 | 100 | **+6** |

HTML属性の変更だけで `LCP` が92.5%短縮された。詳細は[タマチャンショップのボトルネック研究](https://vigilante.sitespeed.info/2026/tamachanshop1.html)にまとめている。

### FABIUS：Load Delayが全体の33%を占めていた

<img src="/posts/2026/lcp-image-priority-loading/myfabius1-thumbnail.png" alt="FABIUS トップページのスクリーンショット" width="260" height="260" />

美容・健康食品EC[FABIUS](https://vigilante.sitespeed.info/2026/myfabius1.html)でも、メインビジュアルのカルーセル1枚目（`kv_cellplus_sp.jpg`、72.9KB）に `loading="lazy"` が設定されていた。

Lighthouseの `LCP` 内訳分析を確認すると、**Load Delay（リクエスト開始までの遅延）が999msでLCP全体の33%**を占めていた。画像そのものは72.9KBと決して重くない。ところがLCPの3分の1は「リクエストを開始するまでの待ち時間」に費やされていた。

`loading="eager"` + `fetchpriority="high"` に変更するだけで、このLoad Delayは解消された。

| 指標 | 解消前 | 解消後 | 変化量 |
|------|:---:|:---:|:---:|
| `LCP` | 3.0秒 | 1.2秒 | **-1.8秒（60%）** |
| `総合スコア` | 94 | 100 | **+6** |

詳細は[FABIUSのボトルネック研究](https://vigilante.sitespeed.info/2026/myfabius1.html)にまとめている。

### ワコールウェブストア：非LCP画像との帯域の奪い合い

<img src="/posts/2026/lcp-image-priority-loading/storewacoal1-thumbnail.png" alt="ワコールウェブストア トップページのスクリーンショット" width="260" height="260" />

[ワコールウェブストア](https://vigilante.sitespeed.info/2026/storewacoal1.html)のケースは、「LCP画像を優先する」原則を別の角度から示す例だ。

LCP要素のバナー画像はアニメーションGIF（180フレーム、約1.4MB）で配信されていた。CloudflareのPolish機能でWebPへの自動変換が行われていたが、アニメーション情報を保持したままの変換のため、ファイルサイズはほぼ変わっていなかった。この画像を静止画WebP（30KB）に変換するだけでLCPが半分以下に縮んだ。

| 指標 | 解消前 | 解消後 | 変化量 |
|------|:---:|:---:|:---:|
| `LCP` | 2.6秒 | 1.2秒 | **-1.4秒（54.8%）** |
| `SI` | 1.9秒 | 1.4秒 | **-0.5秒** |
| `総合スコア` | 97 | 100 | **+3** |

さらに問題があった。カルーセルの2〜10枚目（初期表示に不要なスライド）が `loading="lazy"` なしでページ読み込みと同時に一斉ダウンロードされており、LCP画像と帯域を奪い合っていた。これらに `loading="lazy"` を付与し、LCP画像は `loading="eager"` + `fetchpriority="high"` を明示したところ、さらなる改善が得られた。

| 指標 | 解消前 | 解消後 | 変化量 |
|------|:---:|:---:|:---:|
| `LCP` | 1.2秒 | 1.0秒 | **-0.2秒（16.0%）** |

**LCP画像を速くするためには、lazyloadを付けるべき画像と外すべき画像を正しく使い分けることが重要だ。** 詳細は[ワコールウェブストアのボトルネック研究](https://vigilante.sitespeed.info/2026/storewacoal1.html)を参照してほしい。

### ねとらぼ：数値は小さくてもLighthouseが明示的に警告するパターン

<img src="/posts/2026/lcp-image-priority-loading/nlab1-thumbnail.png" alt="ねとらぼ トップページのスクリーンショット" width="260" height="260" />

ITmediaのニュースサイト[ねとらぼ](https://vigilante.sitespeed.info/2026/nlab1.html)でも、ヒーロー画像（`puma-1024x768.jpeg`）に `loading="lazy"` が設定されていた。

このケースでは、シミュレーション環境における数値変化は計測誤差の範囲に収まった。これはサードパーティータグ除去後のサイト自体がAstroフレームワークによる非常に効率的な構成であり、ネットワーク環境をある程度コントロールできるシミュレーション上ではブラウザが適切に優先度をつけられていたためと考えられる。

| 指標 | 解消前 | 解消後 | 変化量 |
|------|:---:|:---:|:---:|
| `LCP` | 1.6秒 | 1.6秒 | -（計測誤差の範囲） |

ただし、`loading="lazy"` がLCP画像に設定されているのはLighthouseが明示的に警告するパターンそのものだ。帯域に余裕のあるシミュレーション環境では差が出にくい。しかし実際のモバイルネットワークは帯域が逼迫していることも多い。リクエストの優先度を明示しなければ、読み込みの開始が遅れるリスクは高まる。「シミュレーションで差が出なかったから問題なし」とは言えない。

詳細は[ねとらぼのボトルネック研究](https://vigilante.sitespeed.info/2026/nlab1.html)にまとめている。

## 自分のサイトで対処するには

LCP画像の優先読み込みを確認・改善するのは、一般的に難易度が低い部類の施策だ。ツールで確認し、HTML属性を書き換える、または `<head>` にpreloadヒントを追加するだけで対処できる。

### ステップ1：LCP要素を特定する

Chrome DevTools の [Performance タブ]や[Lighthouse]を使い、LCP要素を確認する。Lighthouseのレポートには「Avoid chaining critical requests」「Preload LCP element」などの指摘が表示されることもある。ほとんどの場合、ファーストビューで最も大きい画像がLCP要素だ。

### ステップ2：lazyloadが適用されていないか確認する

LCP要素として特定した画像の `<img>` タグを確認し、以下のいずれかに該当しないかチェックする。

- `loading="lazy"` が設定されている
- `src` がプレースホルダーで実URLが `data-src` などに格納されている（lazysizesなどのライブラリによるlazyload）

### ステップ3：属性を修正してブラウザに最優先を伝える

対処のコードは以下のとおりだ。

```html
<!-- 問題: loading="lazy"がLCP画像に設定されている -->
<img src="hero.jpg" loading="lazy" alt="メインビジュアル">

<!-- 解決: loading="eager" + fetchpriority="high"に変更 -->
<img src="hero.jpg" loading="eager" fetchpriority="high" alt="メインビジュアル">
```

```html
<!-- 問題: lazysizesなどによるdata-src形式 -->
<img src="placeholder.svg" data-src="hero.jpg" class="lazyload" alt="メインビジュアル">

<!-- 解決: src属性に実URLを設定し、fetchpriority="high"を付与 -->
<img src="hero.jpg" loading="eager" fetchpriority="high" alt="メインビジュアル">
```

さらに念を押したい場合は、`<head>` 内にpreloadヒントを追加する方法もある。

```html
<link rel="preload" as="image" href="/images/hero.jpg" fetchpriority="high">
```

`fetchpriority="high"` はモダンブラウザで対応済みだ。未対応のブラウザでは単に無視されるため、後方互換性を気にせず安全に追加できる。

### カルーセルでは「1枚目だけ優先、2枚目以降はlazy」が原則

カルーセルを使っている場合の対処法はワコールウェブストアの例で示したとおりだ。

```html
<!-- 1枚目のスライド：LCP画像として最優先で読み込む -->
<img src="slide1.jpg" loading="eager" fetchpriority="high" alt="春のキャンペーン">

<!-- 2枚目以降：初期表示に不要なのでlazyloadでOK -->
<img src="slide2.jpg" loading="lazy" alt="...">
<img src="slide3.jpg" loading="lazy" alt="...">
```

SlickやSplide、Swiperなどのカルーセルライブラリは、初期化処理の中で全スライドに一律でlazyload設定を施すものも多い。ライブラリ経由でlazyloadを使っている場合は、LCP要素となる1枚目だけ設定を上書きするか、ライブラリのオプションで除外する必要がある。

### ReactやVue.jsでのSPAを使っている場合

SPAではJSが実行されるまでLCP画像がDOMに存在しないケースがある。この場合、サーバーサイドレンダリング（SSR）やHTMLに初期状態のLCP画像を静的に埋め込む実装を検討したい。JavaScriptが動いてから初めて画像が描画される構成では、プリロードスキャナーが機能しないだけでなく、LCPそのものが根本的に遅くなりやすい。

## まとめ

- **LCP画像にlazyloadは付けない。** `loading="lazy"` や `data-src` を使ったJSライブラリによる遅延読み込みをLCP要素に適用すると、リクエスト開始が大幅に遅れてLCPが悪化する。
- **解消策は `loading="eager"` + `fetchpriority="high"` の明示。** lazysizesなどのライブラリ経由の場合は `src` 属性への実URLの設定も必要だ。preloadヒントを `<head>` に追加するとさらに確実になる。
- 実在サイトでのインパクトは大きい。タマチャンショップでは `LCP` が92.5%短縮（3.1秒→0.2秒）、FABIUSでは60%短縮（3.0秒→1.2秒）という数値が得られた。
- **非LCP画像にはlazyloadを積極的に使う**こともセットで考えたい。ワコールウェブストアの例のように、カルーセルの非表示スライドが帯域を奪ってLCPへ影響を与えるケースもある。LCPとそれ以外の画像で読み込み戦略を分けることが重要だ。
- lazysizesやSlick、Splide、Swiperなどのライブラリを使っている場合は、最初のスライドがlazyload対象になっていないかを必ず確認してほしい。

LCPを改善しようとしてフレームワークや配信インフラに手を入れる前に、まずLCP画像の属性を確認することをすすめる。数文字の変更が、秒単位の改善につながることがある。

---

自社サイトのLCP画像や他のボトルネックを体系的に調べたい場合は、弊社の[表示速度ボトルネック研究 vigilante](https://vigilante.sitespeed.info/) の事例が参考になる。より詳しい調査が必要な場合はアイデアマンズまでご相談いただきたい。
