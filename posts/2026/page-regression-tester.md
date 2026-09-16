---
title: AIにWebフロントエンドの見た目に関する回帰テストの目を与えるOSS page-regression-tester
description: フロントエンド改変の副作用を機械的に検出するビジュアルリグレッションテストツール page-regression-tester の紹介。動的な変化を抑制したキャプチャとSSIMによる比較で、AIエージェントの試行錯誤に気まぐれにならない検査の目を持たせる。
id: miyanaga
date: 2026-09-17 06:52:00
categories:
  - development
  - technology
ogp: /ogp/2026/page-regression-tester.jpg
ads:
  - id: pagespeed-rehearsal
---

弊社ではページスピード改善について、主にフロントエンドの改善提案を行っている。

フロントエンドに変更を加えるが、当然、見た目が変わってしまうと都合が悪い。速くなっても表示が崩れるのでは意味がない。

以前はこういった確認を目視で行っていた。しかしAIに試行錯誤を任せるようになって、人間が目で確認していたのでは追いつかない。

そこでAIに目を与えることにした。フロントエンドの変更の前後で見た目の変更がないことを、キャプチャ結果の比較で機械的に行えるようにしたのだ。

それが page-regression-tester である。MITライセンスのオープンソースとして公開しており、npmから導入できる。

- [ideamans/page-regression-tester](https://github.com/ideamans/page-regression-tester)

[[toc]]

---

## キャプチャと比較の2つの機能

このツールは、あるページの表示結果をキャプチャする機能と、複数のキャプチャ結果を比較する機能を備えている。

```bash
npm install -g page-regression-tester
npx playwright install chromium
```

```bash
# 改変前のキャプチャ
page-regression-tester capture https://example.com -o before.png

# 改変後のキャプチャ
page-regression-tester capture https://example.com -o after.png

# 2つを比較
page-regression-tester compare before.png after.png -o ./diff/
```

フロントエンドの改変前後でキャプチャを取得し、それらの比較を行う。これによりAIによる改変が副作用をもたらしていないか検査できるというわけだ。

## なぜ検査までLLMに任せないのか

この判断自体をLLMに任せてみたこともあった。しかし揺らぎが大きく、「誤差の範囲です」と重要な副作用を見逃してしまうことがある。

検査は機械的なアプローチにした方がよい。

## 素朴な実装が使えない理由

シンプルにキャプチャして比較、と説明したが、そのままの実装では使いものにならない。

WebページにはJavaScriptやCSSアニメーションによる動きがある。またアンチエイリアス処理などにより、毎回ピクセルパーフェクトなキャプチャ結果が得られるとも限らない。

そこで2つの工夫が要る。

- キャプチャではスクリーン上の動的な変化を抑制する
- 比較では多少の「遊び」を持たせる

## 動きを止めたキャプチャ

抑制の手法は以前、[static-webshotの記事](/posts/2026/static-webshot.html)で書いた。完璧ではないものの、次のようなアプローチで多くのアニメーションを抑制できる。

- CSSのアニメーションとトランジションを `!important` ですべて無効化する
- テキストカーソルの点滅とスムーズスクロールも止める
- `Date.now()` `Math.random()` `performance.now()` を固定値にする
- 動画と音声の自動再生を無効化し、再生位置を0秒に戻す
- `IntersectionObserver` を上書きし、遅延読み込みを即座に発火させる
- 主要なカルーセルライブラリごとに自動再生を止め、最初のスライドで固定する

これでファーストビューにカルーセルスライダーがあるページでも、毎回同じようなキャプチャ結果を得ることができる。

## 揺らぎを許すSSIMの比較

続いてキャプチャ結果の間で、若干の遊びを持たせた比較を行うためにSSIMを用いている。

SSIM（構造類似性指標）は、人間の視覚認知に近い感覚で2つの画像の差分の大きさを定量化するアルゴリズムだ。画像の軽量化による劣化度合いを測る上でも弊社では大いに活用している。

```bash
page-regression-tester compare before.png after.png --method pixel,ssim -o ./diff/
```

SSIMを用いると、アンチエイリアスの揺らぎは見逃しつつ、大きな構造の不一致があると検出してくれるというわけだ。

ピクセル単位の比較も併用できる。どこが違うかはピクセル比較のヒートマップで見て、どのくらい違うかはSSIMのスコアで見るとよい。

## まとめ

- 速くなっても表示が崩れては意味がないので、フロントエンド改変の前後で見た目を検査している
- AIに試行錯誤を任せると目視では追いつかないため、キャプチャの比較で機械的に行うようにした
- 検査自体をLLMに任せると「誤差の範囲です」と見逃すことがある
- キャプチャでは動的な変化を抑制し、比較ではSSIMで遊びを持たせる

こうしてAIエージェントは、気まぐれにならない検査の目を持つことができる。

- [ideamans/page-regression-tester](https://github.com/ideamans/page-regression-tester)
