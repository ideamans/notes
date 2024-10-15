---
title: 自動生成するロゴマークを刷新 "alogorithm2"
id: miyanaga
date: 2024-10-15 12:10:00
---

アイデアマンズ株式会社のロゴマークはプログラムで自動生成している。

この度、ロゴマークの生成プログラムを刷新し、**alogorithm2**としてリリースした。

![ロゴマーク](https://alogorithm2.ideamans.com/v2/inline.svg?seed=notes)

[[toc]]

---

## プログラミングへの強みをロゴに込める

2017年にロゴマークのリニューアルに際して、プログラミング技術が強みであるアイデンティティをどう表現するかを考えた。

そこで思いついたのが「プログラムで自動生成する」というアイデアだ。これなら強みをストレートに表現できて意匠に悩まずに済む。

- [ロゴマークについて](https://www.ideamans.com/alogorithm/)

ただし、ロゴマークを動的・可変にするという発想は真新しいものではない。そのことについても最後に少し触れたい。

### 7年ぶりにリニューアル

先日、[OGPアイキャッチ画像を自動生成するプログラムを作成](https://notes.ideamans.com/posts/2024/banner-generator.html)した。

以前はSVGには苦手意識があったが、少し自信になってロゴマークの刷新を思いついた。

GitHubのプロジェクトはこちら。GPL 3.0ライセンスで公開しているので、興味を持った方は大いに参考いただきたい。

- [ideamans/alogorithm2: アイデアマンズ株式会社のロゴマーク自動生成プログラム v2](https://github.com/ideamans/alogorithm2)

## ランダムシードによってロゴが変化

アイデアマンズのロゴマークには、`seed`というパラメータを渡す。例えば今日が2024年10月15日なら、`seed=2024-10-15`でもいいし、ブログ用のロゴマークなら`seed=blog`とする。

その`seed`のテキストによって宝石のようなマークが変化する。この制御をプログラムが行なっている。

`seed=2024-10-15`の場合は、

![2024-10-15](https://alogorithm2.ideamans.com/v2/inline.svg?seed=2024-10-15&width=256)

翌日の`seed=2024-10-16`の場合は、

![2024-10-16](https://alogorithm2.ideamans.com/v2/inline.svg?seed=2024-10-16&width=256)

このように全く違うマークになる。`seed=blog`の場合は以下だ。

![blog](https://alogorithm2.ideamans.com/v2/inline.svg?seed=blog&width=256)

この仕組みによりロゴマークを日替わりにできたり、サブサービスのロゴを簡単に用意できる。

## ロゴマークのタイプ

ロゴマークには3つのタイプがある。

### インライン

上記で紹介した横長タイプだ。

![横長タイプ](https://alogorithm2.ideamans.com/v2/inline.svg?seed=notes&width=256)

### 矩形タイプ

社名を下に配置し、縦横のサイズを自由に指定できる矩形タイプもある。正方形なら、

![正方形](https://alogorithm2.ideamans.com/v2/rect.svg?seed=notes&width=256&height=256)

少し横長にするなら、

![長方形](https://alogorithm2.ideamans.com/v2/rect.svg?seed=notes&width=256&height=180)

このようにマークが変形して指定した枠に収まるように調整される。

### アイコンタイプ

マークだけの画像も生成できる。これはFaviconなどに使用する。

![アイコン](https://alogorithm2.ideamans.com/v2/icon.svg?seed=notes&width=64)

## 利用技術について

全体としてはNode.jsによるプログラムである。特徴的なライブラリやフォントを紹介したい。

### trianglify

幾何学的ながら表情豊かな美しいパターンを生成するライブラリがある。

- [trianglify - npm](https://www.npmjs.com/package/trianglify)

個人的にこの模様が大好きで、[ロゴ生成プログラムの以前のバージョン](https://www.ideamans.com/alogorithm/)でも利用していた。

### blobs

trianglifyが生成したパターンを、次のライブラリが生成した輪郭で切り抜きをする。

- [blobs - npm](https://www.npmjs.com/package/blobs)

これで宝石のようなマークを自動で生成している。

プログラミング技術により、無数のアイデアの原石を生み出したいというアイデンティティにも合致して大変気に入っている。

### IBM Plex フォント

社名の**ideaman's**には、プログラミング向けのフォント**IBM Plex**を利用させていただいた。

- [オープンソース・フォント「IBM Plex」誕生の経緯 | Think Blog Japan](https://www.ibm.com/blogs/think/jp-ja/how-ibm-plex-an-opensource-font-was-born/)

これもプログラミング技術を強みとするアイデンティティの現れである。

## 動的なビジュアルアイデンティティの例

ロゴマークを自動生成するというアイデア自体は自分で思いついたものではない。

### ソニー

かつてソニーのCMで、同時期に多様なビジュアルアイデンティティが展開されたことがあった。

- [ソニー　ビジュアル・アイデンティティ](https://www.g-mark.org/gallery/winners/9c45544e-803d-11ed-862b-0242ac130002)

![ソニー　ビジュアル・アイデンティティ](https://award-attachments.g-mark.io/winners/2001/9c45544e-803d-11ed-862b-0242ac130002/main.jpg?size=large)

これにシビれたのが自分の中では原体験だった。

### MITメディアラボ

MITメディアラボも動的なビジュアルアイデンティティを採用した時期があった。

- [MITメディアラボのロゴは、いかにして生まれ変わったのか \#WXD \| WIRED\.jp](https://wired.jp/2015/05/22/design-logo-pentagram/)

これは短命に終わったようだが、発想は近い。

### ノルドキン

ノルウェーのノルドキンは、現在の気象情報からマークが動的に変わるという興味深い事例である。

- [Neue Design Studio \- Visit Nordkyn](https://neue.no/work/visit-nordkyn/)

レーダーチャートに基づいてパターンを生成している。

### メルボルン市

オーストラリアのメルボルン市も**M**というロゴマークをアレンジする試みを行なっている。

![メルボルン市の例](https://i.pinimg.com/736x/7b/f7/89/7bf789b9b790147e75ac962a20db6b32.jpg)

以下のpinterestの類似ピンを眺めていると他にも多くの事例があることがわかるだろう。

- [melbourne](https://jp.pinterest.com/pin/melbourne--398076054533912548/)
