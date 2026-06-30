---
id: miyanaga
title: '実例に学ぶサイトスピード改善(1) LCP画像は最優先で読み込ませる'
description: ファーストビューの最大画像にlazyloadが残っていると、JavaScriptが動くまで画像のダウンロードが始まらず、LCPが数秒単位で悪化する。多くはJS lazyloadの名残や設定の見落としによるものだろう。実在サイトの数値とともに、lazyを外して遅延を取り除く対処法を解説する。preloadは発見されにくい画像向けで、素のimg srcには基本不要という弊社の整理も示す。
date: 2026-07-01 06:30:00
ogp: /ogp/2026/lcp-image-priority-loading.jpg
categories:
  - sitespeed
  - technology
draft: false
---

「LCPが遅い」と聞いて、画像の圧縮や次世代フォーマットへの変換を考える人は多い。もちろんそれは有効な場合もあるが、**そもそもブラウザがその画像を「あとで読んでいい」と判断して後回し**にしていたとしたら、軽量化だけでは問題を根本から解決できない。

弊社の[表示速度ボトルネックの実例研究](https://vigilante.sitespeed.info/)では、ファーストビューの最大画像、つまりLCP要素に遅延読み込みが適用されているケースを何度も観測している。LCP 3秒超という値が、HTML属性を数文字変えるだけで0.2秒台まで下がる例がある。

この記事では、なぜLCP画像が「あとで読む」扱いになってしまうのか、そしてどう直せばよいのかを、実在サイトのデータとともに解説する。

[[toc]]

---

## LCPはページの「顔」が現れるまでの時間

LCP（Largest Contentful Paint）は、ビューポート内で最も大きなコンテンツが画面に描画されるまでの時間を示す指標だ。通常はファーストビューに配置されたメイン画像やヒーローバナーがLCP要素になる。Googleは2.5秒以内を「良好」、4秒以上を「改善が必要」と定義しており、Core Web Vitalsの主要指標のひとつでもある。

ユーザーが感じる「ページが表示されたかどうか」の感覚に最も近い指標がLCPだと言っていい。ECサイトでいえば、商品のメイン画像や商品詳細ページの商品画像を思い浮かべると分かりやすい。一番見たいコンテンツがなかなか表示されないのは、ユーザーにとって離脱を招く大きなストレスになる。

## JavaScriptによるlazyloadはもう役目を終えている

画像の遅延読み込み（lazyload）には、世代の違いというより歴史的な経緯がある。一昔前は、JavaScriptでスクロール位置を監視し、表示領域に近づいた画像から読み込む方式が一般的だった。画像は重いリソースなので、画面外の画像を無駄にダウンロードしない。この発想で、lazysizesやjQuery Lazyといったライブラリが広く使われた。

だが今となっては、このJavaScript方式は明確な悪手だ。そもそもJavaScriptの実行は、ブラウザや端末に負荷をかける。`<img loading="lazy">` という標準属性をモダンブラウザがほぼすべてサポートしている今、わざわざ負荷の大きいJavaScriptで同じことをする意味はほとんどない。むしろページ全体の負荷を増やすだけの要因になりやすい。読み込みにメリハリをつけたいなら、JavaScriptではなく標準の `loading` 属性を使う。これが今の前提だ。

### LCP画像にlazyloadが残るのはたいてい見落とし

そのうえで本題はもっと初歩的な話だ。冷静に考えれば、できる限り早く読み込ませたいLCP画像に読み込みを遅らせる制御がわざわざ入っている。これは高度なチューニングの失敗ではなく、単なるケアレスミスだと思われる。

あるいは「lazyloadをすべきだ」という発想だけが一人歩きし、本来いちばん早く読み込ませたいLCP画像にまでうっかり付けてしまったのだろう。実例研究でも、このパターンは繰り返し見つかった。かつて全画像へ一律でJavaScript lazyloadをかけた名残が、LCP画像にも残っている。標準の `loading="lazy"` をファーストビュー画像にまでうっかり付けている例もある。だからこそ、数文字の修正でLCPが大きく改善する。

### なぜそれでLCPが致命的に遅れるのか

ブラウザはHTMLを受信すると、並行して「プリロードスキャナー」と呼ばれる先読み処理が走る。CSSやJavaScriptの解析を待たずに `src` 属性の画像URLを検出し、ダウンロードを前倒しで始める仕組みだ。

ところがJavaScript lazyloadでは、画像の実URLを `data-src` などの独自属性に格納し、`src` にはプレースホルダーや空文字列を置くことが多い。プリロードスキャナーは `data-src` を見ない。**結果として、JSの実行後にIntersectionObserverが判定を終えるまで、画像のダウンロードは一切始まらない。**

![プリロードスキャナーがsrc属性を検出して即ダウンロードするフローと、data-src+JSで遅延するフローの比較](/posts/2026/lcp-image-priority-loading/preload-scanner.png)

標準の `loading="lazy"` でも遅れは起きる。実URLが `src` にあるためプリロードスキャナーには見えるが、ブラウザは `loading="lazy"` の画像を意図的に低優先度として後回しにする。視覚的にファーストビューへ収まっていても、判定のタイミングしだいでリクエストは大きく遅れる。

宅配便で例えるなら、すでに玄関の前へ届いている荷物を「不在票を確認してからでないと受け取れない」と決めてしまうようなものだ。荷物はそこにあるのに、手順のせいで受け取りが遅れる。

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

## 自分のサイトで対処するには

LCP画像の遅延を取り除くのは、一般的に難易度が低い部類の施策だ。ツールでLCP要素を確認し、HTML属性を数文字書き換えるだけで対処できる。

### ステップ1：LCP要素を特定する

Chrome DevTools の [Performance タブ]や[Lighthouse]を使い、LCP要素を確認する。Lighthouseのレポートには「Avoid chaining critical requests」「Preload LCP element」などの指摘が表示されることもある。ほとんどの場合、ファーストビューで最も大きい画像がLCP要素だ。

### ステップ2：lazyloadが適用されていないか確認する

LCP要素として特定した画像の `<img>` タグを確認し、以下のいずれかに該当しないかチェックする。

- `loading="lazy"` が設定されている
- `src` がプレースホルダーで実URLが `data-src` などに格納されている（lazysizesなどのライブラリによるlazyload）

### ステップ3：属性を直してLCP画像を遅延させない

対処はシンプルで、LCP画像から `loading="lazy"` を外す。JavaScript lazyloadなら、`src` 属性に実際の画像URLを戻す。

```html
<!-- 問題: loading="lazy"がLCP画像に付いている -->
<img src="hero.jpg" loading="lazy" alt="メインビジュアル">

<!-- 解決: lazyを外す（必要なら loading="eager" を明示） -->
<img src="hero.jpg" loading="eager" alt="メインビジュアル">
```

```html
<!-- 問題: lazysizesなどによるdata-src形式 -->
<img src="placeholder.svg" data-src="hero.jpg" class="lazyload" alt="メインビジュアル">

<!-- 解決: src属性に実URLを戻し、LCP画像はlazyloadの対象から外す -->
<img src="hero.jpg" loading="eager" alt="メインビジュアル">
```

あわせて `fetchpriority="high"` を付けると、ブラウザに「この画像は重要だ」と明示できる。web.devも推奨する仕上げの一手だ。ただし土台になるのは、あくまでlazyを外すことにある。

### 素のimg srcならpreloadは基本不要

web.devは、LCP画像に `<link rel="preload">` と `fetchpriority="high"` を付けて先読みすることを推奨している。preloadしたLCP画像はそうでない場合よりLCPが速いというデータもある。

ただし大きく効くのは、おもにLCP画像が早期に発見されにくいケースだ。CSSの背景画像やJavaScriptで後から挿入される画像は、プリロードスキャナーに発見されない。こうした画像にはpreloadで存在を知らせる価値がある。

一方で、HTMLに素の `<img src="…">` として書かれた画像は、プリロードスキャナーがそのまま発見して早期に読み込む。この場合はlazyさえ外れていれば、preloadを足さなくても十分に早い。むしろpreloadを多用すると優先度のヒントが薄まり、本当に優先したいリソースを埋もれさせることもある。だから素のimg srcのLCP画像については、preloadは基本的に不要だというのが弊社の整理だ。

本質的に大事なのは、LCP画像を「不自然に最速で」読ませることではない。**lazyloadなどで不必要に遅延させないこと**だ。余計な遅延さえ取り除けば、ブラウザは自然な読み込み順序の中でLCP画像を十分に早く扱う。タイムライン上で、LCP画像が画像群の中で早い読み込み順位を確保できているか。そこを保証するだけでよい。

### カルーセルは1枚目だけ優先し2枚目以降はlazy

カルーセルを使っている場合の対処法はワコールウェブストアの例で示したとおりだ。

```html
<!-- 1枚目のスライド：LCP画像なのでlazyを外す -->
<img src="slide1.jpg" loading="eager" fetchpriority="high" alt="春のキャンペーン">

<!-- 2枚目以降：初期表示に不要なのでlazyloadでOK -->
<img src="slide2.jpg" loading="lazy" alt="...">
<img src="slide3.jpg" loading="lazy" alt="...">
```

SlickやSplide、Swiperなどのカルーセルライブラリは、初期化処理の中で全スライドに一律でlazyload設定を施すものも多い。ライブラリ経由でlazyloadを使っている場合は、LCP要素となる1枚目だけ設定を上書きするか、ライブラリのオプションで除外する必要がある。

### ReactやVue.jsでのSPAを使っている場合

SPAではJSが実行されるまでLCP画像がDOMに存在しないケースがある。この場合、サーバーサイドレンダリング（SSR）やHTMLに初期状態のLCP画像を静的に埋め込む実装を検討したい。JavaScriptが動いてから初めて画像が描画される構成では、プリロードスキャナーが機能しないだけでなく、LCPそのものが根本的に遅くなりやすい。

## まとめ

- **LCP画像へのlazyloadはたいてい見落としによるもの。** `loading="lazy"` やJavaScript lazyload（lazysizes等）がファーストビューの最大画像に残っていると、リクエスト開始が大幅に遅れてLCPが悪化する。冷静に見れば気づけるはずの取りこぼしだろう。
- **JavaScriptによるlazyloadはもう不要。** 読み込みにメリハリをつけたいなら、標準の `loading` 属性を使う。JS方式は速やかに置き換えたい。
- **直し方は「遅延を取り除く」こと。** LCP画像から `loading="lazy"` を外し、JS lazyloadなら `src` に実URLを戻すだけでよい。素の `<img src>` ならプリロードスキャナーに発見されるため、`<link rel="preload">` を足さなくても十分に早い。web.devもpreloadを推奨しているが、大きく効くのはおもに発見されにくい画像のケースだ。
- 実在サイトでのインパクトは大きい。タマチャンショップでは `LCP` が92.5%短縮（3.1秒→0.2秒）、FABIUSでは60%短縮（3.0秒→1.2秒）という数値が得られた。
- **ファーストビュー外の画像にはlazyloadを使う。** ワコールウェブストアの例のように、初期表示で不要なカルーセル画像が帯域を奪ってLCPに響くこともある。LCP画像とそれ以外で読み込み戦略を分けるのが要点だ。
- lazysizesやSlick、Splide、Swiperなどのライブラリを使っている場合は、最初のスライドがlazyload対象になっていないかを必ず確認してほしい。

LCPを改善しようとしてフレームワークや配信インフラに手を入れる前に、まずLCP画像の属性を確認することをすすめる。数文字の変更が、秒単位の改善につながることがある。

---

自社サイトのLCP画像や他のボトルネックを体系的に調べたい場合は、弊社の[表示速度ボトルネック研究 vigilante](https://vigilante.sitespeed.info/) の事例が参考になる。より詳しい調査が必要な場合はアイデアマンズまでご相談いただきたい。
